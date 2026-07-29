import { routing } from "@/i18n/routing";

/**
 * Constrains a caller-supplied `?locale=` to the locales the site actually
 * serves. The value is forwarded to the upstream CMS, so it must not be passed
 * through unchecked.
 */
export function parseSearchLocale(value: string | null): string {
	const normalized = value?.trim().toLowerCase() ?? "";
	return routing.locales.includes(
		normalized as (typeof routing.locales)[number],
	)
		? normalized
		: routing.defaultLocale;
}
