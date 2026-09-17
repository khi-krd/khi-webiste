import { z } from "zod";

/**
 * Branding and global site settings (`GET /api/v1/site-settings`).
 *
 * Every field is nullish: the endpoint returns defaults rather than 404ing when
 * nothing has been saved, and the API omits null keys entirely. A schema miss
 * would make `apiFetch` return null, which the header and footer could not tell
 * apart from "no logo chosen" — so nothing here is required.
 */
export const SiteSettingsSchema = z.object({
	id: z.number().nullish(),
	/** Header and footer logo. Transparent PNG — it sits on cream and near-black. */
	logoUrl: z.string().nullish(),
	/** Photograph for the donate band above the footer. */
	donateImageUrl: z.string().nullish(),
	/**
	 * Uploaded typefaces picked in the dashboard. `null`/absent → the bundled
	 * faces keep rendering. `*FontName` is a dashboard display label; the
	 * website always declares fixed @font-face families.
	 */
	ckbFontUrl: z.string().nullish(),
	ckbFontName: z.string().nullish(),
	kmrFontUrl: z.string().nullish(),
	kmrFontName: z.string().nullish(),
	/**
	 * Admin-picked surface colors, hex strings. Sanitized again before they
	 * reach the injected stylesheet — a non-hex value is dropped, never
	 * emitted into CSS.
	 */
	bodyColor: z.string().nullish(),
	navbarColor: z.string().nullish(),
	footerColor: z.string().nullish(),
	collectionColor: z.string().nullish(),
	maxFeaturedSlides: z.number().nullish(),
	updatedAt: z.string().nullish(),
});

export type SiteSettings = z.infer<typeof SiteSettingsSchema>;
