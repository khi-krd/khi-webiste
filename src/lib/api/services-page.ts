import "server-only";

import type { Service } from "@/types/service";
import type { ServicesPageSettings } from "@/types/services-page";

/** Reserved marker — matches dashboard CMS hero record. */
export const SERVICES_PAGE_HERO_ANCHOR = "page-hero"
export const PAGE_HERO_SERVICE_TYPE = "page-hero"

export function isServicesPageHeroRecord(
	service: Pick<Service, "navAnchorId" | "serviceType">,
): boolean {
	const anchor = service.navAnchorId?.trim()
	if (anchor === SERVICES_PAGE_HERO_ANCHOR || anchor === "__page_hero__") {
		return true
	}
	return service.serviceType?.trim() === PAGE_HERO_SERVICE_TYPE
}

export function findServicesPageHeroRecord(
	records: Service[],
): Service | undefined {
	return records.find(isServicesPageHeroRecord);
}

export function serviceRecordToPageSettings(
	service: Service,
): ServicesPageSettings {
	const ckb = service.contents.find((c) => c.languageCode === "CKB");
	const kmr = service.contents.find((c) => c.languageCode === "KMR");
	const heroImageUrl =
		service.heroPosterUrl?.trim() ||
		service.galleryMedia?.find((g) => g.url?.trim())?.url?.trim() ||
		null;

	return {
		id: service.id,
		heroImageUrl,
		eyebrowCkb: service.featureImageUrls?.[0]?.trim() ?? null,
		eyebrowKmr: service.location ?? null,
		titleCkb: ckb?.title ?? null,
		titleKmr: kmr?.title ?? null,
		subtitleCkb: ckb?.description ?? null,
		subtitleKmr: kmr?.description ?? null,
	};
}

export function resolveServicesHeroCopy(
	locale: string,
	settings: ServicesPageSettings | null,
	fallback: { eyebrow: string; title: string; intro: string },
) {
	const isCkb = locale === "ckb";
	const title = isCkb
		? settings?.titleCkb?.trim()
		: settings?.titleKmr?.trim();
	const intro = isCkb
		? settings?.subtitleCkb?.trim()
		: settings?.subtitleKmr?.trim();
	const eyebrow = isCkb
		? settings?.eyebrowCkb?.trim()
		: settings?.eyebrowKmr?.trim();

	return {
		eyebrow: eyebrow || fallback.eyebrow,
		title: title || fallback.title,
		intro: intro || fallback.intro,
	};
}

export function resolveServicesHeroImage(
	settings: ServicesPageSettings | null,
	fallbackUrl: string,
	fallbackAlt: string,
) {
	const url = settings?.heroImageUrl?.trim();
	if (url) {
		return { url, alt: settings?.titleCkb?.trim() || fallbackAlt };
	}
	return { url: fallbackUrl, alt: fallbackAlt };
}

export function filterContentServiceRecords(records: Service[]): Service[] {
	return records.filter((record) => !isServicesPageHeroRecord(record));
}
