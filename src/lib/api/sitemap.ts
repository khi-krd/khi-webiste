import "server-only";
import { apiFetch, DEFAULT_REVALIDATE } from "@/lib/api/client";
import { getApiBaseUrl } from "@/lib/api/config";
import { SitemapResponseSchema } from "@/types/sitemap";

const SITEMAP_ENDPOINT = "/api/v1/sitemap";
const SITEMAP_TAG = "sitemap";

export async function getSitemapPaths(locale: string): Promise<string[]> {
	if (!getApiBaseUrl()) {
		return [];
	}

	const response = await apiFetch(SITEMAP_ENDPOINT, {
		schema: SitemapResponseSchema,
		tags: [SITEMAP_TAG, `sitemap-${locale}`],
		revalidate: DEFAULT_REVALIDATE,
		searchParams: { locale },
	});

	return response?.paths ?? [];
}
