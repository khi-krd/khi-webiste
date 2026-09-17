import "server-only";

import type { SiteSettings } from "@/types/site-settings";

/** #rgb, #rgba, #rrggbb, #rrggbbaa — anything else is dropped, never emitted. */
const HEX_RE =
	/^#(?:[0-9a-fA-F]{3}|[0-9a-fA-F]{4}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})$/;

function sanitizeHex(value: string | null | undefined): string | null {
	const trimmed = value?.trim() ?? "";
	return HEX_RE.test(trimmed) ? trimmed : null;
}

/**
 * Dashboard-picked surface colors → :root token overrides.
 *
 * Every mapping is `null`-skipped: an unset field simply keeps the bundled
 * token, which is also how the dashboard's "reset" works ("" → null → nothing
 * emitted → default). The injected sheet is unlayered and sits after the
 * stylesheet link, so it wins over the defaults in globals.css.
 */
export function buildSiteColorCss(settings: SiteSettings | null): string {
	if (!settings) {
		return "";
	}

	const body = sanitizeHex(settings.bodyColor);
	const navbar = sanitizeHex(settings.navbarColor);
	const footer = sanitizeHex(settings.footerColor);
	const collection = sanitizeHex(settings.collectionColor);
	if (!body && !navbar && !footer && !collection) {
		return "";
	}

	const declarations = [
		body && `--color-background:${body}`,
		navbar && `--site-header-bg:${navbar}`,
		footer && `--site-footer-bg:${footer}`,
		collection && `--site-collection-bg:${collection}`,
	]
		.filter(Boolean)
		.join(";");

	return `:root{${declarations}}`;
}
