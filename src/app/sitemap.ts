import type { MetadataRoute } from "next";
import { routing } from "@/i18n/routing";
import { getSitemapPaths } from "@/lib/api/sitemap";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
	const siteUrl = process.env.NEXT_PUBLIC_SITE_URL?.trim();
	if (!siteUrl) {
		return [];
	}

	const entries: MetadataRoute.Sitemap = [];
	const lastModified = new Date();

	for (const locale of routing.locales) {
		const paths = await getSitemapPaths(locale);
		for (const path of paths) {
			entries.push({
				url: new URL(path, siteUrl).toString(),
				lastModified,
			});
		}
	}

	return entries;
}
