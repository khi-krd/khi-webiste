import "server-only";
import {
	apiFetch,
	BULK_FETCH_SIZE,
	DEFAULT_REVALIDATE,
} from "@/lib/api/client";
import { getApiBaseUrl } from "@/lib/api/config";
import { getAboutPartners } from "@/lib/api/about";
import {
	getServices as getMockServices,
	getServicesBottomCards,
	getServicesHeroMedia,
	type ServiceItem,
} from "@/lib/mock/services";
import type { PartnerItem } from "@/lib/mock/about";
import {
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

export async function getMergedServiceSections(
	locale: string,
): Promise<MergedServiceSection[]> {
	const mockServices = getMockServices(locale);
	const records = await getServiceRecords();

	if (records.length === 0) {
		return mockServices.map((service) => ({
			mockId: service.id,
			service,
			title: null,
			body: null,
			partnerIds: [],
		}));
	}

	return mergeServiceSections(locale, mockServices, records);
}

export async function getServicesHeroMediaFromApi(locale: string) {
	const fallback = getServicesHeroMedia();
	const records = await getServiceRecords();
	if (records.length === 0) {
		return fallback;
	}

	return resolveServicesHeroMedia(records, locale, fallback);
}

export async function getServicePartnerCards(
	locale: string,
): Promise<PartnerItem[]> {
	const partners = await getAboutPartners(locale);
	if (partners.length === 0) {
		return getServicesBottomCards(locale);
	}

	const records = await getServiceRecords();
	const merged = mergeServiceSections(locale, getMockServices(locale), records);
	const partnerIds = new Set(
		merged.flatMap((section) => section.partnerIds),
	);

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

export { getMockServices as getServicesLayout };
export type { ServiceItem };
