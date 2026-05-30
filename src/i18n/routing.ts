import { defineRouting } from "next-intl/routing";

export const routing = defineRouting({
	locales: ["ckb", "ku"],
	defaultLocale: "ckb",
});

export type Locale = (typeof routing.locales)[number];
