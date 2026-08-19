import "server-only";
import { getAboutPartners } from "@/lib/api/about";
import {
	apiFetch,
	apiFetchPage,
	BULK_FETCH_SIZE,
	DEFAULT_REVALIDATE,
} from "@/lib/api/client";
import { getApiBaseUrl } from "@/lib/api/config";
import { normalizeServiceRecord } from "@/lib/api/normalize";
import {
	filterContentServiceRecords,
	findServicesPageHeroRecord,
	PAGE_HERO_SERVICE_TYPE,
	serviceRecordToPageSettings,
} from "@/lib/api/services-page";
import type { PartnerItem } from "@/lib/mock/about";
import type { ServiceItem } from "@/lib/mock/services";
import {
	buildApiOnlyServiceSections,
	buildServiceHighlights,
	type MergedServiceSection,
	resolveServicesHeroMedia,
	type ServiceHighlight,
} from "@/lib/services/resolve";
import {
	type Service,
	ServiceSchema,
	type ServiceTypeOption,
	ServiceTypesSchema,
} from "@/types/service";

const SERVICES_ENDPOINT = "/api/v1/services/all";
const SERVICES_FILTER_ENDPOINT = "/api/v1/services";
const SERVICES_SEARCH_ENDPOINT = "/api/v1/services/search";
const SERVICES_TYPES_ENDPOINT = "/api/v1/services/types";
const SERVICES_TAG = "services";

/**
 * Page size for the filtered/searched routes.
 *
 * `BULK_FETCH_SIZE` (200) is only tolerated by `/services/all`; the paginated
 * routes are documented to accept at most 100.
 */
const SERVICES_FILTER_PAGE_SIZE = 100;

/** CMS order: `sortOrder` ascending with unset last, then newest published. */
function sortServiceRecords(records: Service[]): Service[] {
	return [...records].sort((a, b) => {
		const ao =
			typeof a.sortOrder === "number" ? a.sortOrder : Number.POSITIVE_INFINITY;
		const bo =
			typeof b.sortOrder === "number" ? b.sortOrder : Number.POSITIVE_INFINITY;
		if (ao !== bo) return ao - bo;
		const ap = a.publishedAt ? Date.parse(a.publishedAt) : 0;
		const bp = b.publishedAt ? Date.parse(b.publishedAt) : 0;
		return bp - ap;
	});
}

function publishedServiceRecords(records: Service[]): Service[] {
	return sortServiceRecords(
		records.filter((record) => record.active !== false),
	);
}

export async function getServiceRecords(): Promise<Service[]> {
	if (!getApiBaseUrl()) {
		return [];
	}

	const page = await apiFetchPage(SERVICES_ENDPOINT, {
		itemSchema: ServiceSchema,
		tags: [SERVICES_TAG],
		revalidate: DEFAULT_REVALIDATE,
		searchParams: { page: 0, size: BULK_FETCH_SIZE },
		normalizeItem: normalizeServiceRecord,
	});

	if (!page?.content.length) {
		return [];
	}

	return publishedServiceRecords(page.content);
}

function serviceTypeOptionToLabel(option: ServiceTypeOption): string {
	if (typeof option === "string") {
		return option.trim();
	}
	return "name" in option ? option.name.trim() : option.serviceType.trim();
}

/**
 * The type values the CMS actually publishes — the only values ever allowed
 * into `?type=`, so an unknown type can never reach the backend.
 */
export async function getServiceTypes(): Promise<string[]> {
	if (!getApiBaseUrl()) {
		return [];
	}

	const options = await apiFetch(SERVICES_TYPES_ENDPOINT, {
		schema: ServiceTypesSchema,
		tags: [SERVICES_TAG],
		revalidate: DEFAULT_REVALIDATE,
	});

	if (!options?.length) {
		return [];
	}

	const seen = new Set<string>();
	const types: string[] = [];
	for (const option of options) {
		const type = serviceTypeOptionToLabel(option);
		// The hero record's reserved type is not a browsable facet: filtering by
		// it leaves exactly the record the sections drop, so the page would look
		// permanently empty with no way to tell why.
		if (!type || type === PAGE_HERO_SERVICE_TYPE) {
			continue;
		}
		const key = type.toLocaleLowerCase();
		if (seen.has(key)) {
			continue;
		}
		seen.add(key);
		types.push(type);
	}

	return types;
}

/**
 * Active services of one type, already ordered by the backend.
 *
 * `null` means the call could not be answered — distinct from `[]`, which is
 * the CMS saying nothing matches.
 */
export async function getServiceRecordsByType(
	type: string,
): Promise<Service[] | null> {
	const trimmed = type.trim();
	if (!trimmed || !getApiBaseUrl()) {
		return null;
	}

	const page = await apiFetchPage(SERVICES_FILTER_ENDPOINT, {
		itemSchema: ServiceSchema,
		tags: [SERVICES_TAG],
		revalidate: DEFAULT_REVALIDATE,
		searchParams: { type: trimmed, page: 0, size: SERVICES_FILTER_PAGE_SIZE },
		normalizeItem: normalizeServiceRecord,
	});

	return page ? publishedServiceRecords(page.content) : null;
}

/** Free-text service search. A blank term is a 400 upstream, so never sent. */
export async function searchServiceRecords(
	q: string,
): Promise<Service[] | null> {
	const trimmed = q.trim();
	if (!trimmed || !getApiBaseUrl()) {
		return null;
	}

	const page = await apiFetchPage(SERVICES_SEARCH_ENDPOINT, {
		itemSchema: ServiceSchema,
		tags: [SERVICES_TAG],
		revalidate: DEFAULT_REVALIDATE,
		searchParams: { q: trimmed, page: 0, size: SERVICES_FILTER_PAGE_SIZE },
		normalizeItem: normalizeServiceRecord,
	});

	return page ? publishedServiceRecords(page.content) : null;
}

/** The backend compares `type` case-insensitively; `===` would drop matches. */
function matchesServiceType(record: Service, type: string): boolean {
	return (
		record.serviceType?.trim().toLocaleLowerCase() === type.toLocaleLowerCase()
	);
}

/** Mirrors the upstream bilingual `LIKE %term%` over the readable fields. */
function matchesServiceQuery(record: Service, q: string): boolean {
	const term = q.toLocaleLowerCase();
	const haystack = [
		record.serviceType,
		record.location,
		record.navAnchorId,
		...record.contents.flatMap((content) => [
			content.title,
			content.description,
			content.featureDescription,
		]),
	];

	return haystack.some((value) => value?.toLocaleLowerCase().includes(term));
}

export type ServiceRecordsFilter = {
	type?: string | null;
	q?: string | null;
};

/**
 * Filtered service records, server-first.
 *
 * There is no combined type+query route, so the search endpoint runs and the
 * type is narrowed here rather than being silently dropped. An upstream that
 * cannot answer the filtered call degrades to the bulk catalogue refined in
 * memory, which still yields the right empty state when nothing matches.
 */
export async function getFilteredServiceRecords({
	type,
	q,
}: ServiceRecordsFilter = {}): Promise<Service[]> {
	const activeType = type?.trim() || null;
	const activeQuery = q?.trim() || null;

	if (!activeType && !activeQuery) {
		return getServiceRecords();
	}

	if (activeQuery) {
		const searched = await searchServiceRecords(activeQuery);
		if (searched) {
			return activeType
				? searched.filter((record) => matchesServiceType(record, activeType))
				: searched;
		}
	} else if (activeType) {
		const byType = await getServiceRecordsByType(activeType);
		if (byType) {
			return byType;
		}
	}

	return (await getServiceRecords()).filter(
		(record) =>
			(!activeType || matchesServiceType(record, activeType)) &&
			(!activeQuery || matchesServiceQuery(record, activeQuery)),
	);
}

/**
 * Service sections straight from the CMS.
 *
 * An empty or unavailable API renders no sections rather than demo ones, so the
 * page always reflects what the CMS actually holds. Passing a filter narrows
 * the sections only — the hero, highlights and partner cards keep reading the
 * whole catalogue.
 */
export async function getMergedServiceSections(
	locale: string,
	filter?: ServiceRecordsFilter,
): Promise<MergedServiceSection[]> {
	const records = filter
		? await getFilteredServiceRecords(filter)
		: await getServiceRecords();
	return buildApiOnlyServiceSections(
		locale,
		filterContentServiceRecords(records),
	);
}

/**
 * Featured services for the highlight band at the top of `/services`.
 *
 * `featured` on a service means "highlight it on its own page" — the backend no
 * longer feeds these into the homepage hero, so this is the only consumer.
 */
export async function getServiceHighlights(
	locale: string,
): Promise<ServiceHighlight[]> {
	const records = await getServiceRecords();
	return buildServiceHighlights(locale, filterContentServiceRecords(records));
}

export async function getServicesHeroMediaFromApi(locale: string) {
	const records = await getServiceRecords();
	const heroRecord = findServicesPageHeroRecord(records);
	if (heroRecord) {
		const settings = serviceRecordToPageSettings(heroRecord);
		const url = settings.heroImageUrl?.trim();
		if (url) {
			const isCkb = locale === "ckb";
			const title = isCkb
				? settings.titleCkb?.trim()
				: settings.titleKmr?.trim();
			return { url, alt: title ?? "" };
		}
	}

	if (records.length > 0) {
		const apiMedia = resolveServicesHeroMedia(
			filterContentServiceRecords(records),
			locale,
			{
				url: "",
				alt: "",
			},
		);
		if (apiMedia.url) {
			return apiMedia;
		}
	}

	// No CMS artwork — the hero renders its copy on a plain ground.
	// No CMS artwork — the hero renders its copy on a plain ground.
	return { url: "", alt: "" };
}

export async function getServicePartnerCards(
	locale: string,
): Promise<PartnerItem[]> {
	const partners = await getAboutPartners(locale);
	const records = filterContentServiceRecords(await getServiceRecords());
	const sections = buildApiOnlyServiceSections(locale, records);
	const partnerIds = new Set(sections.flatMap((section) => section.partnerIds));

	// No service links a partner yet — show no cards rather than demo ones.
	return partners.filter((partner) => partnerIds.has(Number(partner.id)));
}

export type ServiceSection = {
	id: string;
	title: string;
	body: string;
};

/** @deprecated Use getMergedServiceSections — kept for callers expecting title/body only. */
export async function getServiceSections(
	locale: string,
): Promise<ServiceSection[]> {
	const merged = await getMergedServiceSections(locale);
	return merged
		.filter((section) => section.title && section.body)
		.map((section) => ({
			id: section.service.id,
			title: section.title as string,
			body: section.body as string,
		}));
}

export type { ServiceItem };
