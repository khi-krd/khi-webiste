import type { DonateTypeId, DonateTypeItem } from "@/lib/donate/content";
import type { DonationSettings, DonationType } from "@/types/donation";

export type DonateVisibility = {
	archive: boolean;
	financial: boolean;
};

const ARCHIVE_TYPE_IDS = new Set<DonateTypeId>([
	"visualArchive",
	"documents",
	"oralHeritage",
	"scientific",
]);

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

export function filterDonateTypeItems(
	items: DonateTypeItem[],
	visibility: DonateVisibility,
): DonateTypeItem[] {
	return items.filter((item) => {
		if (item.id === "financial") {
			return visibility.financial;
		}

		if (ARCHIVE_TYPE_IDS.has(item.id)) {
			return visibility.archive;
		}

		return true;
	});
}
