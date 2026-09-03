import type { DonationSettings, DonationType } from "@/types/donation";

export type DonateVisibility = {
	archive: boolean;
	financial: boolean;
};

export function resolveDonateVisibility(
	settings: DonationSettings | null,
	types: DonationType[],
): DonateVisibility {
	const enabledCodes = new Set(
		types.filter((type) => type.enabled).map((type) => type.code),
	);
	const typesFallback = types.length === 0;

	const archiveFromTypes = typesFallback || enabledCodes.has("ARCHIVE");
	const financialFromTypes = typesFallback || enabledCodes.has("FINANCIAL");

	return {
		archive: settings?.archiveDonationsEnabled !== false && archiveFromTypes,
		financial:
			settings?.financialDonationsEnabled !== false && financialFromTypes,
	};
}
