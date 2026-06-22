import { defineRouting } from "next-intl/routing";

export const routing = defineRouting({
	// ckb = Sorani (Arabic, RTL), ku = Kurmanji (Latin, LTR).
	locales: ["ckb", "ku"],
	defaultLocale: "ckb",
});

export type Locale = (typeof routing.locales)[number];
