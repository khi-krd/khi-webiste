import "server-only";
import {
	apiFetch,
	BULK_FETCH_SIZE,
	DEFAULT_REVALIDATE,
} from "@/lib/api/client";
import { getApiBaseUrl, shouldUseMockData } from "@/lib/api/config";
import { applyMockPolicy, applyMockPolicyNullable } from "@/lib/api/mock-policy";
import { getAboutPartners } from "@/lib/api/about";
import {
	getServices as getMockServices,
	getServicesBottomCards,
	getServicesHeroMedia,
	type ServiceItem,
} from "@/lib/mock/services";
import type { PartnerItem } from "@/lib/mock/about";
import {
	buildApiOnlyServiceSections,
	type MergedServiceSection,
	mergeServiceSections,
	resolveServicesHeroMedia,
} from "@/lib/services/resolve";
import { type Service, ServicesPageSchema } from "@/types/service";

const SERVICES_ENDPOINT = "/api/v1/services/all";
const SERVICES_TAG = "services";

export async function getServiceRecords(): Promise<Service[]> {
	if (!getApiBaseUrl()) {
		return [];
	}

	const page = await apiFetch(SERVICES_ENDPOINT, {
		schema: ServicesPageSchema,
		tags: [SERVICES_TAG],
		revalidate: DEFAULT_REVALIDATE,
		searchParams: { page: 0, size: BULK_FETCH_SIZE },
	});

	return page?.content ?? [];
}

function mockOnlyServiceSections(
	locale: string,
): MergedServiceSection[] {
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
	const records = await getServiceRecords();

	if (shouldUseMockData() || !getApiBaseUrl()) {
		if (records.length === 0) {
			return mockOnlyServiceSections(locale);
		}

		return mergeServiceSections(locale, getMockServices(locale), records);
	}

	if (records.length === 0) {
		return [];
	}

	return buildApiOnlyServiceSections(locale, records);
}

export async function getServicesHeroMediaFromApi(locale: string) {
	const records = await getServiceRecords();
	if (records.length > 0) {
		const apiMedia = resolveServicesHeroMedia(records, locale, {
			url: "",
			alt: "",
		});
		if (apiMedia.url) {
			return apiMedia;
		}
	}

	return (
		applyMockPolicyNullable({
			apiValue: null,
			getMockValue: () => getServicesHeroMedia(),
		}) ?? { url: "", alt: "" }
	);
}

export async function getServicePartnerCards(
	locale: string,
): Promise<PartnerItem[]> {
	const partners = await getAboutPartners(locale);
	const records = await getServiceRecords();
	const merged =
		shouldUseMockData() || !getApiBaseUrl()
			? mergeServiceSections(locale, getMockServices(locale), records)
			: buildApiOnlyServiceSections(locale, records);
	const partnerIds = new Set(
		merged.flatMap((section) => section.partnerIds),
	);

	if (partnerIds.size === 0) {
		return applyMockPolicy({
			context: "global",
			apiItems: [],
			getMockItems: () => getServicesBottomCards(locale),
		});
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

export { getMockServices as getServicesLayout };
export type { ServiceItem };
