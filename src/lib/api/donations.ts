import "server-only";
import { apiFetch, apiPost, DEFAULT_REVALIDATE } from "@/lib/api/client";
import { getApiBaseUrl } from "@/lib/api/config";
import {
	type DonateHeroMedia,
	type DonatePaymentDetails,
	type DonateTypeCardData,
	type DonateTypeItem,
	getDonateTypeItems,
} from "@/lib/donate/content";
import {
	type DonateVisibility,
	filterDonateTypeItems,
	resolveDonateVisibility,
} from "@/lib/donate/resolve";
import {
	ArchiveDonationResponseSchema,
	type ArchiveDonationSubmission,
	DonationSettingsSchema,
	type DonationTypeCard,
	DonationTypeCardListSchema,
	DonationTypeListSchema,
	FinancialDonationResponseSchema,
	type FinancialDonationSubmission,
} from "@/types/donation";

const DONATIONS_SETTINGS_ENDPOINT = "/api/v1/donations/settings";
const DONATIONS_TYPES_ENDPOINT = "/api/v1/donations/types";
const DONATIONS_TYPE_CARDS_ENDPOINT = "/api/v1/donations/type-cards";
const DONATIONS_FINANCIAL_ENDPOINT = "/api/v1/donations/financial";
const DONATIONS_ARCHIVE_ENDPOINT = "/api/v1/donations/archive";
const DONATIONS_TAG = "donations";

export type DonatePageData = {
	heroMedia: DonateHeroMedia;
	heroCopy: DonateHeroCopy;
	/** CMS cards — when non-empty, the page draws these and nothing else. */
	typeCards: DonateTypeCardData[];
	/** Hardcoded fallback set, drawn only while `typeCards` is empty. */
	typeItems: DonateTypeItem[];
	payment: DonatePaymentDetails;
	visibility: DonateVisibility;
};

/**
 * Prefer the active language, then the other one — a record written in only
 * one language is still the editor's words, and showing them beats hiding the
 * card or falling back to generic translated copy.
 */
function preferLocaleText(
	isCkb: boolean,
	ckb: string | null | undefined,
	kmr: string | null | undefined,
): string | null {
	return (
		(isCkb ? ckb?.trim() || kmr?.trim() : kmr?.trim() || ckb?.trim()) || null
	);
}

export async function getDonationSettings() {
	if (!getApiBaseUrl()) {
		return null;
	}

	return apiFetch(DONATIONS_SETTINGS_ENDPOINT, {
		schema: DonationSettingsSchema,
		tags: [DONATIONS_TAG, "donation-settings"],
		revalidate: DEFAULT_REVALIDATE,
	});
}

export async function getDonationTypes() {
	if (!getApiBaseUrl()) {
		return [];
	}

	const types = await apiFetch(DONATIONS_TYPES_ENDPOINT, {
		schema: DonationTypeListSchema,
		tags: [DONATIONS_TAG, "donation-types"],
		revalidate: DEFAULT_REVALIDATE,
	});

	return types ?? [];
}

export async function getDonationTypeCards(): Promise<DonationTypeCard[]> {
	if (!getApiBaseUrl()) {
		return [];
	}

	const cards = await apiFetch(DONATIONS_TYPE_CARDS_ENDPOINT, {
		schema: DonationTypeCardListSchema,
		tags: [DONATIONS_TAG, "donation-type-cards"],
		revalidate: DEFAULT_REVALIDATE,
	});

	// A missing endpoint (not deployed yet), a failed request and an empty table
	// all resolve to [] — the page then falls back to the hardcoded card set.
	return cards ?? [];
}

/**
 * CMS card records → drawable cards in the active locale, sorted by
 * displayOrder. A record without a picture or without a title in either
 * language cannot be drawn and is skipped rather than rendered broken.
 */
export function resolveDonateTypeCards(
	locale: string,
	records: DonationTypeCard[],
): DonateTypeCardData[] {
	const isCkb = locale === "ckb";

	return records
		.filter((record) => record.active !== false)
		.map((record) => ({
			record,
			title: preferLocaleText(isCkb, record.titleCkb, record.titleKmr),
			imageUrl: record.imageUrl?.trim() || null,
		}))
		.filter(
			(entry): entry is typeof entry & { title: string; imageUrl: string } =>
				Boolean(entry.title && entry.imageUrl),
		)
		.sort(
			(a, b) =>
				(a.record.displayOrder ?? 0) - (b.record.displayOrder ?? 0) ||
				a.record.id - b.record.id,
		)
		.map(({ record, title, imageUrl }, position) => ({
			id: record.id,
			index: position + 1,
			title,
			description:
				preferLocaleText(isCkb, record.descriptionCkb, record.descriptionKmr) ??
				"",
			image: { url: imageUrl, alt: title },
		}));
}

export async function submitFinancialDonation(
	body: FinancialDonationSubmission,
) {
	if (!getApiBaseUrl()) {
		return null;
	}

	return apiPost(DONATIONS_FINANCIAL_ENDPOINT, body, {
		schema: FinancialDonationResponseSchema,
		tags: [DONATIONS_TAG],
	});
}

export async function submitArchiveDonation(body: ArchiveDonationSubmission) {
	if (!getApiBaseUrl()) {
		return null;
	}

	return apiPost(DONATIONS_ARCHIVE_ENDPOINT, body, {
		schema: ArchiveDonationResponseSchema,
		tags: [DONATIONS_TAG],
	});
}

function resolveHeroMedia(
	settings: Awaited<ReturnType<typeof getDonationSettings>>,
): DonateHeroMedia {
	// Featuring the donation page IS the act of choosing its hero picture, so
	// `featureImageUrl` outranks the standing `heroImageUrl` — the same rule the
	// About page follows. Only WHILE featured, though: the backend deliberately
	// keeps the picture on unfeature, so an ungated check would make the choice
	// permanent and leave no way back to `heroImageUrl`.
	const featureImage = settings?.featured
		? settings.featureImageUrl?.trim()
		: undefined;
	const url = featureImage || settings?.heroImageUrl?.trim() || "";
	const apiValue = url ? { url, alt: "" } : null;

	return apiValue ?? { url: "", alt: "" };
}

export type DonateHeroCopy = {
	title: string | null;
	intro: string | null;
};

/**
 * The donation page's own words, when the CMS holds them.
 *
 * `titleCkb` / `descriptionCkb` have been parsed for a long time and read by
 * nobody — the hero was entirely translation-driven, so an editor could rewrite
 * the donation page in the dashboard and see nothing change on the site.
 */
export function resolveDonateHeroCopy(
	locale: string,
	settings: Awaited<ReturnType<typeof getDonationSettings>>,
): DonateHeroCopy {
	const isCkb = locale === "ckb";

	return {
		title: preferLocaleText(isCkb, settings?.titleCkb, settings?.titleKmr),
		intro: preferLocaleText(
			isCkb,
			settings?.descriptionCkb,
			settings?.descriptionKmr,
		),
	};
}

function resolvePaymentDetails(
	settings: Awaited<ReturnType<typeof getDonationSettings>>,
): DonatePaymentDetails {
	const apiValue = settings
		? {
				fibAccount: settings.accountNumber ?? "",
				fastpayNumber: settings.iban ?? "",
			}
		: null;

	return apiValue ?? { fibAccount: "", fastpayNumber: "" };
}

function resolveTypeItems(
	settings: Awaited<ReturnType<typeof getDonationSettings>>,
	types: Awaited<ReturnType<typeof getDonationTypes>>,
	visibility: DonateVisibility,
): DonateTypeItem[] {
	if (!settings && types.length === 0) {
		return [];
	}

	return filterDonateTypeItems(getDonateTypeItems(), visibility);
}

export async function getDonatePageDataFromApi(
	locale: string,
): Promise<DonatePageData> {
	const [settings, types, cardRecords] = await Promise.all([
		getDonationSettings(),
		getDonationTypes(),
		getDonationTypeCards(),
	]);
	const visibility = resolveDonateVisibility(settings, types);

	return {
		heroMedia: resolveHeroMedia(settings),
		heroCopy: resolveDonateHeroCopy(locale, settings),
		typeCards: resolveDonateTypeCards(locale, cardRecords),
		typeItems: resolveTypeItems(settings, types, visibility),
		payment: resolvePaymentDetails(settings),
		visibility,
	};
}
