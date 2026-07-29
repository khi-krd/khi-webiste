import "server-only";
import { getAboutPartners } from "@/lib/api/about";
import {
	apiFetchPage,
	BULK_FETCH_SIZE,
	DEFAULT_REVALIDATE,
} from "@/lib/api/client";
import { getApiBaseUrl, shouldUseMockData } from "@/lib/api/config";
import { normalizeServiceRecord } from "@/lib/api/normalize";
import {
	filterContentServiceRecords,
	findServicesPageHeroRecord,
	serviceRecordToPageSettings,
} from "@/lib/api/services-page";
import type { PartnerItem } from "@/lib/mock/about";
import {
	getServices as getMockServices,
	getServicesBottomCards,
	getServicesHeroMedia,
	type ServiceItem,
} from "@/lib/mock/services";
import {
	buildApiOnlyServiceSections,
	type MergedServiceSection,
	resolveServicesHeroMedia,
} from "@/lib/services/resolve";
import { type Service, ServiceSchema } from "@/types/service";

const SERVICES_ENDPOINT = "/api/v1/services/all";
const SERVICES_TAG = "services";

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

	return page.content
		.filter((record) => record.active !== false)
		.sort((a, b) => {
			const ao =
				typeof a.sortOrder === "number"
					? a.sortOrder
					: Number.POSITIVE_INFINITY;
			const bo =
				typeof b.sortOrder === "number"
					? b.sortOrder
					: Number.POSITIVE_INFINITY;
			if (ao !== bo) return ao - bo;
			const ap = a.publishedAt ? Date.parse(a.publishedAt) : 0;
			const bp = b.publishedAt ? Date.parse(b.publishedAt) : 0;
			return bp - ap;
		});
}

function mockOnlyServiceSections(locale: string): MergedServiceSection[] {
	return getMockServices(locale).map((service) => ({
		mockId: service.id,
		service,
		title: null,
		body: null,
		partnerIds: [],
	}));
}

export async function getMergedServiceSections(
	locale: string,
): Promise<MergedServiceSection[]> {
	if (shouldUseMockData()) {
		return mockOnlyServiceSections(locale);
	}

	const records = await getServiceRecords();
	const contentRecords = filterContentServiceRecords(records);

	if (contentRecords.length > 0) {
		const apiSections = buildApiOnlyServiceSections(locale, contentRecords, {
			useMockMediaFallback: true,
		});
		if (apiSections.length > 0) {
			return apiSections;
		}
	}

	// API empty or unavailable — local dev fallback only
	return mockOnlyServiceSections(locale);
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

	return getServicesHeroMedia();
}

export async function getServicePartnerCards(
	locale: string,
): Promise<PartnerItem[]> {
	const partners = await getAboutPartners(locale);
	const records = filterContentServiceRecords(await getServiceRecords());
	const sections =
		records.length > 0
			? buildApiOnlyServiceSections(locale, records, {
					useMockMediaFallback: true,
				})
			: shouldUseMockData()
				? mockOnlyServiceSections(locale)
				: [];
	const partnerIds = new Set(sections.flatMap((section) => section.partnerIds));

	if (partnerIds.size === 0) {
		return getServicesBottomCards(locale);
	}

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
export { getMockServices as getServicesLayout };
