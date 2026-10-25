import "server-only";

import { apiFetch, DEFAULT_REVALIDATE } from "@/lib/api/client";
import { getApiBaseUrl } from "@/lib/api/config";
import { type SiteFont, SiteFontListSchema } from "@/types/site-font";

export type { SiteFont } from "@/types/site-font";

const SITE_FONTS_ENDPOINT = "/api/v1/site-fonts";
export const SITE_FONTS_TAG = "site-fonts";

/**
 * The whole typeface library (`GET /api/v1/site-fonts`), not just the two
 * activated faces: rich text authored in the dashboard may name any uploaded
 * font (`font-family: "Rabar"`), so every one needs an @font-face on the
 * site. Cached under its own tag; an unreachable API yields an empty list.
 */
export async function getSiteFonts(): Promise<SiteFont[]> {
	if (!getApiBaseUrl()) {
		return [];
	}
	const fonts = await apiFetch(SITE_FONTS_ENDPOINT, {
		schema: SiteFontListSchema,
		tags: [SITE_FONTS_TAG],
		revalidate: DEFAULT_REVALIDATE,
	});
	return fonts ?? [];
}
