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
		collection && `--site-band-bg:${collection}`,
	]
		.filter(Boolean)
		.join(";");

	return `:root{${declarations}}`;
}

const SCALE_MIN = 50;
const SCALE_MAX = 200;

/**
 * Percent string ("115") → CSS multiplier ("1.15"), clamped to a sane band so
 * a stray value cannot make text unreadably small or enormous. Non-numeric
 * input is dropped, never emitted.
 */
function sanitizeScale(value: string | null | undefined): string | null {
	const percent = Number(value?.trim() ?? "");
	if (!Number.isFinite(percent)) {
		return null;
	}
	const clamped = Math.min(SCALE_MAX, Math.max(SCALE_MIN, Math.round(percent)));
	return (clamped / 100).toString();
}

/**
 * Dashboard-picked type scales → :root multiplier overrides. globals.css
 * defines every --text-* token as `calc(base * var(--site-scale-*, 1))`, so
 * the multiplier flows through the responsive breakpoints unchanged.
 */
export function buildSiteSizeCss(settings: SiteSettings | null): string {
	if (!settings) {
		return "";
	}

	const title = sanitizeScale(settings.titleFontScale);
	const body = sanitizeScale(settings.bodyFontScale);
	const caption = sanitizeScale(settings.captionFontScale);
	if (!title && !body && !caption) {
		return "";
	}

	const declarations = [
		title && `--site-scale-title:${title}`,
		body && `--site-scale-body:${body}`,
		caption && `--site-scale-caption:${caption}`,
	]
		.filter(Boolean)
		.join(";");

	return `:root{${declarations}}`;
}
