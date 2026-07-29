import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
	const siteUrl = process.env.NEXT_PUBLIC_SITE_URL?.trim();

	return {
		rules: {
			userAgent: "*",
			allow: "/",
			// Route handlers return JSON/PDF proxies, never indexable pages.
			disallow: ["/api/"],
		},
		// Without this the sitemap is generated but never advertised to crawlers.
		...(siteUrl
			? { sitemap: new URL("/sitemap.xml", siteUrl).toString() }
			: {}),
	};
}
