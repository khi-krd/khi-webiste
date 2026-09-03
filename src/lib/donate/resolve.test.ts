import { describe, expect, it } from "vitest";
import { resolveDonateVisibility } from "@/lib/donate/resolve";
import type { DonationSettings, DonationType } from "@/types/donation";

describe("resolveDonateVisibility", () => {
	it("shows both paths when settings and types are absent", () => {
		expect(resolveDonateVisibility(null, [])).toEqual({
			archive: true,
			financial: true,
		});
	});

	it("respects settings enable flags", () => {
		const settings: DonationSettings = {
			archiveDonationsEnabled: false,
			financialDonationsEnabled: true,
		};

		expect(resolveDonateVisibility(settings, [])).toEqual({
			archive: false,
			financial: true,
		});
	});

	it("respects disabled type codes when types are present", () => {
		const types: DonationType[] = [
			{ code: "ARCHIVE", enabled: true },
			{ code: "FINANCIAL", enabled: false },
		];

		expect(resolveDonateVisibility(null, types)).toEqual({
			archive: true,
			financial: false,
		});
	});
});
