import "server-only";
import { apiFetch, apiPost, DEFAULT_REVALIDATE } from "@/lib/api/client";
import { getApiBaseUrl } from "@/lib/api/config";
import { applyMockPolicyNullable } from "@/lib/api/mock-policy";
import {
	getDonateHeroMedia,
	getDonatePaymentDetails,
	getDonateTypeItems,
	type DonateHeroMedia,
	type DonatePaymentDetails,
	type DonateTypeItem,
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

export async function submitFinancialDonation(body: FinancialDonationSubmission) {
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

export async function getDonateHeroMediaFromApi(): Promise<DonateHeroMedia> {
	const settings = await getDonationSettings();
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

export async function getDonatePaymentDetailsFromApi(): Promise<DonatePaymentDetails> {
	const settings = await getDonationSettings();
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

export async function getDonateTypeItemsFromApi(): Promise<DonateTypeItem[]> {
	const [settings, types] = await Promise.all([
		getDonationSettings(),
		getDonationTypes(),
	]);

	if (!settings && types.length === 0) {
		return applyMockPolicyNullable({
			apiValue: null,
			getMockValue: () => getDonateTypeItems(),
		}) ?? [];
	}

	const mockItems = getDonateTypeItems();
	const enabledCodes = new Set(
		types.filter((type) => type.enabled).map((type) => type.code),
	);

	return mockItems.filter((item) => {
		if (item.id === "financial") {
			return (
				(enabledCodes.size === 0 || enabledCodes.has("FINANCIAL")) &&
				settings?.financialDonationsEnabled !== false
			);
		}

		if (
			item.id === "visualArchive" ||
			item.id === "documents" ||
			item.id === "oralHeritage" ||
			item.id === "scientific"
		) {
			return (
				(enabledCodes.size === 0 || enabledCodes.has("ARCHIVE")) &&
				settings?.archiveDonationsEnabled !== false
			);
		}

		return true;
	});
}
