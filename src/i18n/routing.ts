import { defineRouting } from "next-intl/routing";

export const routing = defineRouting({
	// ckb = Sorani (Arabic, RTL), ku = Kurmanji (Latin, LTR), en = English (LTR).
	locales: ["ckb", "ku", "en"],
	defaultLocale: "ckb",
});

export type Locale = (typeof routing.locales)[number];
