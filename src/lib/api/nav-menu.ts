import "server-only";
import { z } from "zod";
import { apiFetch } from "@/lib/api/client";

/**
 * CMS-managed hamburger menu backgrounds.
 *
 * The CMS supplies ONLY the full-screen photo behind each section: `NAV_ITEMS`
 * in `@/config/site` owns the section list, its i18n labels and its hrefs, and
 * a CMS row whose `itemKey` matches a section key overlays just `imageSrc`.
 * Anything else the API may return (labels, hrefs, links) is ignored, so a
 * stray or half-filled row can never leak into the rendered menu.
 */

const NAV_MENU_ENDPOINT = "/api/v1/nav-menu";
const NAV_MENU_TAG = "nav-menu";

/** Null-ish because the backend omits null fields rather than sending them. */
const NavMenuItemSchema = z.object({
	itemKey: z.string().min(1),
	imageUrl: z.string().nullish(),
	active: z.boolean().nullish(),
});

const NavMenuSchema = z.array(NavMenuItemSchema);

/** A section's CMS content — just the background photo, keyed by itemKey. */
export type NavMenuOverride = {
	itemKey: string;
	imageSrc?: string;
};

function clean(value: string | null | undefined): string | undefined {
	const trimmed = value?.trim();
	return trimmed ? trimmed : undefined;
}

export async function getNavMenuOverrides(): Promise<NavMenuOverride[]> {
	const payload = await apiFetch(NAV_MENU_ENDPOINT, {
		schema: NavMenuSchema,
		tags: [NAV_MENU_TAG],
	});

	if (!payload) {
		return [];
	}

	return payload
		.filter((item) => item.active !== false)
		.map((item) => {
			const override: NavMenuOverride = {
				itemKey: item.itemKey.trim().toLowerCase(),
			};
			const imageSrc = clean(item.imageUrl);
			if (imageSrc) override.imageSrc = imageSrc;
			return override;
		});
}
