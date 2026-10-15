import "server-only";

import { z } from "zod";
import { apiFetch, DEFAULT_REVALIDATE } from "@/lib/api/client";
import { getApiBaseUrl } from "@/lib/api/config";

const SITE_FONTS_ENDPOINT = "/api/v1/site-fonts";
export const SITE_FONTS_TAG = "site-fonts";

export const SiteFontSchema = z.object({
	id: z.number(),
	language: z.string().nullish(),
	name: z.string(),
	url: z.string(),
});
export type SiteFont = z.infer<typeof SiteFontSchema>;

const SiteFontListSchema = z.array(SiteFontSchema);

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
