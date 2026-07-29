import type { Metadata } from "next";
import { routing } from "@/i18n/routing";

/**
 * Canonical + hreflang alternates for a locale-prefixed route.
 *
 * Every page is served at `/ckb/<path>` and `/ku/<path>`; without explicit
 * alternates search engines treat the two as duplicate content and pick one
 * arbitrarily. `metadataBase` (set in the root layout from NEXT_PUBLIC_SITE_URL)
 * turns these relative values into absolute URLs.
 *
 * @param locale  the current locale
 * @param path    route below the locale prefix, leading slash, "" for the
 *                locale root. E.g. "/news", "/news/my-post".
 */
export function localeAlternates(
	locale: string,
	path = "",
): NonNullable<Metadata["alternates"]> {
	const suffix = path === "/" ? "" : path;

	// A plain record, because `ckb` is not in Next's BCP-47 union type; the tags
	// are emitted verbatim.
	const languages: Record<string, string> = {};
	for (const supported of routing.locales) {
		languages[supported] = `/${supported}${suffix}`;
	}
	languages["x-default"] = `/${routing.defaultLocale}${suffix}`;

	return {
		canonical: `/${locale}${suffix}`,
		languages,
	};
}
