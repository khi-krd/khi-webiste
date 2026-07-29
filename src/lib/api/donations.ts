import "server-only";
import { apiFetch, apiPost, DEFAULT_REVALIDATE } from "@/lib/api/client";
import { getApiBaseUrl } from "@/lib/api/config";
import { applyMockPolicyNullable } from "@/lib/api/mock-policy";
import {
	type DonateVisibility,
	filterDonateTypeItems,
	resolveDonateVisibility,
} from "@/lib/donate/resolve";
import {
	type DonateHeroMedia,
	type DonatePaymentDetails,
	type DonateTypeItem,
	getDonateHeroMedia,
	getDonatePaymentDetails,
	getDonateTypeItems,
} from "@/lib/mock/donate";
import {
	ArchiveDonationResponseSchema,
	type ArchiveDonationSubmission,
	DonationSettingsSchema,
	DonationTypeListSchema,
	FinancialDonationResponseSchema,
	type FinancialDonationSubmission,
} from "@/types/donation";

const DONATIONS_SETTINGS_ENDPOINT = "/api/v1/donations/settings";
const DONATIONS_TYPES_ENDPOINT = "/api/v1/donations/types";
const DONATIONS_FINANCIAL_ENDPOINT = "/api/v1/donations/financial";
const DONATIONS_ARCHIVE_ENDPOINT = "/api/v1/donations/archive";
const DONATIONS_TAG = "donations";

export type DonatePageData = {
	heroMedia: DonateHeroMedia;
	typeItems: DonateTypeItem[];
	payment: DonatePaymentDetails;
	visibility: DonateVisibility;
};

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
	const apiValue = settings?.heroImageUrl
		? {
				url: settings.heroImageUrl,
				alt: "",
			}
		: null;

	return (
		applyMockPolicyNullable({
			apiValue,
			getMockValue: () => getDonateHeroMedia(),
		}) ?? { url: "", alt: "" }
	);
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

	return (
		applyMockPolicyNullable({
			apiValue,
			getMockValue: () => getDonatePaymentDetails(),
		}) ?? { fibAccount: "", fastpayNumber: "" }
	);
}

function resolveTypeItems(
	settings: Awaited<ReturnType<typeof getDonationSettings>>,
	types: Awaited<ReturnType<typeof getDonationTypes>>,
	visibility: DonateVisibility,
): DonateTypeItem[] {
	if (!settings && types.length === 0) {
		return (
			applyMockPolicyNullable({
				apiValue: null,
				getMockValue: () => getDonateTypeItems(),
			}) ?? []
		);
	}

	return filterDonateTypeItems(getDonateTypeItems(), visibility);
}

export async function getDonatePageDataFromApi(): Promise<DonatePageData> {
	const [settings, types] = await Promise.all([
		getDonationSettings(),
		getDonationTypes(),
	]);
	const visibility = resolveDonateVisibility(settings, types);

	return {
		heroMedia: resolveHeroMedia(settings),
		typeItems: resolveTypeItems(settings, types, visibility),
		payment: resolvePaymentDetails(settings),
		visibility,
	};
}
