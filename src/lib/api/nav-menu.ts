import "server-only";
import { z } from "zod";
import { apiFetch } from "@/lib/api/client";

/**
 * CMS-managed hamburger menu — see NAV_MENU_BACKEND.md.
 *
 * The CMS is an OVERLAY, not a replacement: `NAV_ITEMS` in `@/config/site`
 * stays the source of the section list and its i18n labels, and whatever the
 * CMS holds for a matching `itemKey` wins field by field. That way a
 * half-filled table (or an unreachable API) still renders a complete menu.
 */

const NAV_MENU_ENDPOINT = "/api/v1/nav-menu";
const NAV_MENU_TAG = "nav-menu";

/** Null-ish because the backend omits null fields rather than sending them. */
const NavMenuLinkSchema = z.object({
	id: z.number().nullish(),
	labelCkb: z.string().nullish(),
	labelKmr: z.string().nullish(),
	href: z.string().nullish(),
	displayOrder: z.number().nullish(),
	active: z.boolean().nullish(),
});

const NavMenuItemSchema = z.object({
	id: z.number().nullish(),
	itemKey: z.string().min(1),
	labelCkb: z.string().nullish(),
	labelKmr: z.string().nullish(),
	descriptionCkb: z.string().nullish(),
	descriptionKmr: z.string().nullish(),
	href: z.string().nullish(),
	imageUrl: z.string().nullish(),
	displayOrder: z.number().nullish(),
	active: z.boolean().nullish(),
	links: z.array(NavMenuLinkSchema).nullish(),
});

const NavMenuSchema = z.array(NavMenuItemSchema);

/** One secondary link, already resolved to the active locale. */
export type NavMenuOverrideLink = {
	id: string;
	href: string;
	label: string;
};

/** A menu section's CMS content, already resolved to the active locale. */
export type NavMenuOverride = {
	itemKey: string;
	label?: string;
	description?: string;
	href?: string;
	imageSrc?: string;
	displayOrder?: number;
	links: NavMenuOverrideLink[];
};

function clean(value: string | null | undefined): string | undefined {
	const trimmed = value?.trim();
	return trimmed ? trimmed : undefined;
}

/** The site's `ku` locale is the backend's `KMR`; CKB is the fallback. */
function localized(
	ckb: string | null | undefined,
	kmr: string | null | undefined,
	isKmr: boolean,
): string | undefined {
	return isKmr ? (clean(kmr) ?? clean(ckb)) : (clean(ckb) ?? clean(kmr));
}

export async function getNavMenuOverrides(
	locale: string,
): Promise<NavMenuOverride[]> {
	const payload = await apiFetch(NAV_MENU_ENDPOINT, {
		schema: NavMenuSchema,
		tags: [NAV_MENU_TAG],
	});

	if (!payload) {
		return [];
	}

	const isKmr = locale !== "ckb";

	return payload
		.filter((item) => item.active !== false)
		.map((item) => {
			const override: NavMenuOverride = {
				itemKey: item.itemKey.trim().toLowerCase(),
				links: (item.links ?? [])
					.filter((link) => link.active !== false)
					.map((link, index) => {
						const label = localized(link.labelCkb, link.labelKmr, isKmr);
						const href = clean(link.href);
						if (!label || !href) {
							return null;
						}
						return {
							id: String(link.id ?? `${item.itemKey}-${index}`),
							href,
							label,
						};
					})
					.filter((link): link is NavMenuOverrideLink => link != null),
			};

			const label = localized(item.labelCkb, item.labelKmr, isKmr);
			if (label) override.label = label;

			const description = localized(
				item.descriptionCkb,
				item.descriptionKmr,
				isKmr,
			);
			if (description) override.description = description;

			const href = clean(item.href);
			if (href) override.href = href;

			const imageSrc = clean(item.imageUrl);
			if (imageSrc) override.imageSrc = imageSrc;

			if (item.displayOrder != null) override.displayOrder = item.displayOrder;

			return override;
		});
}
