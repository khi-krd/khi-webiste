import {
	type ContactOffice,
	OFFICE_IMAGES,
	type OfficeId,
} from "@/lib/mock/contact";
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

/**
 * `officeType` is free text. The CMS writes "HQ", older docs say "HEADQUARTERS",
 * and an editor may type either — match on a normalised prefix rather than one
 * exact spelling, and treat everything else as a regional office.
 */
function isHeadquarters(officeType: string | null | undefined): boolean {
	const normalized = officeType?.trim().toUpperCase();
	if (!normalized) {
		return false;
	}
	return normalized === "HQ" || normalized.startsWith("HEADQUARTER");
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
		/** From the CMS only — the bundled fallback copy has no opening hours. */
		workingHours?: string;
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
	const lat = page.latitude;
	const lng = page.longitude;
	const title = content?.title?.trim();
	if (!title) {
		return null;
	}

	const officeId = resolveOfficeId(page, index);

	return {
		id: officeId,
		index: (index + 1) as ContactOffice["index"],
		badge: isHeadquarters(page.officeType) ? "hq" : "regional",
		phone: page.phone ?? "",
		secondaryPhone: page.secondaryPhone?.trim() || undefined,
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
		// The office photo is `heroImageUrl`, uploaded per office in the dashboard.
		// Until an editor sets one, fall back to that office's bundled photo rather
		// than to a single shared placeholder — two identical pictures side by side
		// read as a rendering bug, not as "no photo yet".
		image: {
			url: page.heroImageUrl?.trim() || OFFICE_IMAGES[officeId],
			alt: title,
		},
		localizedCopy: {
			name: title,
			nameLatin: oppositeContent?.title?.trim() ?? title,
			workingHours: content?.workingHours?.trim() || undefined,
			// `description` is Tiptap HTML and this slot renders as plain text —
			// using it would print literal <p> tags. `subtitle` is the plain-text
			// field the card actually wants.
			subtitle: content?.subtitle?.trim() || undefined,
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
