import type { ContactOffice, OfficeId } from "@/lib/mock/contact";
import type { ContactPage } from "@/types/contact-page";

function firstNonBlank(
	...values: (string | null | undefined)[]
): string | null {
	for (const value of values) {
		if (value && value.trim().length > 0) {
			return value;
		}
	}
	return null;
}

function mapsLinkUrl(lat: number, lng: number): string {
	return `https://www.google.com/maps?q=${lat},${lng}`;
}

const OFFICE_ID_ALIASES: Record<string, OfficeId> = {
	sulaymaniyah: "sulaymaniyah",
	slemani: "sulaymaniyah",
	erbil: "sulaymaniyah",
	hq: "sulaymaniyah",
	duhok: "duhok",
};

function resolveOfficeId(page: ContactPage, index: number): OfficeId {
	const slug = firstNonBlank(page.slugCkb, page.slugKmr)?.toLowerCase();
	if (slug) {
		for (const [needle, id] of Object.entries(OFFICE_ID_ALIASES)) {
			if (slug.includes(needle)) {
				return id;
			}
		}
	}

	return index === 0 ? "sulaymaniyah" : "duhok";
}

export type ResolvedContactOffice = ContactOffice & {
	localizedCopy?: {
		name: string;
		nameLatin: string;
		subtitle?: string;
		address: string;
	};
};

export function resolveContactOffice(
	locale: string,
	page: ContactPage,
	index: number,
): ResolvedContactOffice | null {
	const content =
		locale === "ckb"
			? (page.ckbContent ?? page.kmrContent)
			: (page.kmrContent ?? page.ckbContent);
	const oppositeContent =
		locale === "ckb"
			? (page.kmrContent ?? page.ckbContent)
			: (page.ckbContent ?? page.kmrContent);
	const badgeLabel =
		locale === "ckb"
			? firstNonBlank(page.badgeCkb, page.badgeKmr)
			: firstNonBlank(page.badgeKmr, page.badgeCkb);
	const lat = page.latitude;
	const lng = page.longitude;
	const title = content?.title?.trim();
	if (!title) {
		return null;
	}

	return {
		id: resolveOfficeId(page, index),
		index: (index + 1) as ContactOffice["index"],
		badge: page.officeType === "HEADQUARTERS" ? "hq" : "regional",
		phone: page.phone ?? "",
		email: page.email ?? "",
		mapEmbedUrl: page.mapEmbedUrl ?? "",
		mapLinkUrl:
			lat != null && lng != null
				? mapsLinkUrl(lat, lng)
				: (page.mapEmbedUrl ?? ""),
		coordinates: {
			lat: lat ?? 0,
			lng: lng ?? 0,
		},
		image: {
			url: page.heroImageUrl ?? "/about/services-bg.jpg",
			alt: badgeLabel ?? title,
		},
		localizedCopy: {
			name: title,
			nameLatin: oppositeContent?.title?.trim() ?? title,
			subtitle: content?.description?.trim() || undefined,
			address: content?.address?.trim() ?? "",
		},
	};
}

export function resolveContactOffices(
	locale: string,
	pages: ContactPage[],
): ResolvedContactOffice[] {
	return pages
		.map((page, index) => resolveContactOffice(locale, page, index))
		.filter((office): office is ResolvedContactOffice => office != null);
}
