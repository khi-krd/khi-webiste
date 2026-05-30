import type { MetadataRoute } from "next";
import { routing } from "@/i18n/routing";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

// Locale-agnostic routes. As content pages land, fetch their slugs and append.
const staticPaths = ["", "/library", "/archive", "/about", "/donate"];

export default function sitemap(): MetadataRoute.Sitemap {
	return staticPaths.flatMap((path) =>
		routing.locales.map((locale) => ({
			url: `${siteUrl}/${locale}${path}`,
			// hreflang alternates so crawlers see the locale pair.
			alternates: {
				languages: Object.fromEntries(
					routing.locales.map((l) => [l, `${siteUrl}/${l}${path}`]),
				),
			},
		})),
	);
}
