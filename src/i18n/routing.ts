import { defineRouting } from "next-intl/routing";

/**
 * Locale routing config. Single source of truth for locales, default,
 * and text direction. Imported by request config, navigation, and proxy.
 */
export const routing = defineRouting({
	// ckb = Kurdish Sorani (Arabic script, RTL), ku = Kurmanji (Latin/Hawar, LTR)
	locales: ["ckb", "ku"],
	defaultLocale: "ckb",
	// Always prefix the locale in the URL — crawlable, unambiguous URLs for SEO.
	localePrefix: "always",
});

export type Locale = (typeof routing.locales)[number];

/** Text direction per locale, used to set `dir` on <html>. */
export const localeDirection: Record<Locale, "rtl" | "ltr"> = {
	ckb: "rtl",
	ku: "ltr",
};
