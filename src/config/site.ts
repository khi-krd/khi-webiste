import type { Locale } from "@/i18n/routing";

/**
 * Site-wide static configuration. Plain data only (NO JSX) so it can be imported
 * from both Server and Client Components. Item labels are i18n KEYS resolved per
 * locale through the "Nav" namespace — never literal UI copy.
 */

/** A primary-navigation item. */
export type NavItem = {
	/** Key under the "Nav" message namespace (e.g. Nav.books). */
	key: string;
	/**
	 * Locale-RELATIVE route. The locale prefix is added by the locale-aware Link,
	 * so paths here are unprefixed.
	 */
	href: string;
};

// TODO(nav): provisional catalog taxonomy. The labels + routes below are
// placeholders pending the real content taxonomy; only the values should change
// later — the flat-list structure must not need to.
export const NAV_ITEMS: NavItem[] = [
	{ key: "books", href: "/books" },
	{ key: "songs", href: "/songs" },
	{ key: "audio", href: "/audio" },
	{ key: "video", href: "/video" },
	{ key: "articles", href: "/articles" },
	{ key: "gallery", href: "/gallery" },
	{ key: "archive", href: "/archive" },
	{ key: "about", href: "/about" },
];

// TODO(services): placeholder label (Nav.services) + route until the Services
// section exists.
export const SERVICES_HREF = "/services";

// TODO(donate): placeholder route until the donation flow exists.
export const DONATE_HREF = "/donate";

/**
 * Language self-names (autonyms). Intentionally IDENTICAL across every UI locale
 * — a language is always shown in its own script so any reader can find it,
 * regardless of the current interface language — so this belongs in config, not
 * duplicated across the per-locale message files.
 */
export const LOCALE_LABELS: Record<Locale, string> = {
	ckb: "کوردیی ناوەندی",
	ku: "Kurmancî",
	en: "English",
};
