import "server-only";

import { apiFetch, DEFAULT_REVALIDATE } from "@/lib/api/client";
import { getApiBaseUrl } from "@/lib/api/config";
import { type SiteSettings, SiteSettingsSchema } from "@/types/site-settings";

const SITE_SETTINGS_ENDPOINT = "/api/v1/site-settings";
export const SITE_SETTINGS_TAG = "site-settings";

/**
 * Branding and global site settings (`GET /api/v1/site-settings`).
 *
 * Read on every page — it supplies the header/footer logo and the donate band
 * picture — so it is cached under its own tag.
 *
 * The endpoint never 404s: with no row stored it returns defaults. `null` here
 * therefore means the API is unreachable, not "nothing configured", and every
 * consumer falls back to the bundled artwork either way.
 */
export async function getSiteSettings(): Promise<SiteSettings | null> {
	if (!getApiBaseUrl()) {
		return null;
	}

	return apiFetch(SITE_SETTINGS_ENDPOINT, {
		schema: SiteSettingsSchema,
		tags: [SITE_SETTINGS_TAG],
		revalidate: DEFAULT_REVALIDATE,
	});
}

/** The header/footer logo, or null to use the bundled one. */
export async function getSiteLogoUrl(): Promise<string | null> {
	const settings = await getSiteSettings();
	return settings?.logoUrl?.trim() || null;
}

/** The photograph in the donate band above the footer. */
export async function getDonateBandImageUrl(): Promise<string | null> {
	const settings = await getSiteSettings();
	return settings?.donateImageUrl?.trim() || null;
}
