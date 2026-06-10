import type { Locale } from "@/i18n/routing";

/**
 * Site-wide static configuration. Plain data only (NO JSX) so it can be imported
 * from both Server and Client Components. Item labels are i18n KEYS resolved per
 * locale through the "Nav" namespace — never literal UI copy.
 */

/** A secondary link shown in the overlay right panel. */
export type NavSubLink = {
	/** Key under the "Nav" message namespace (e.g. Nav.booksSubLiterature). */
	key: string;
	/** Locale-relative route — may 404 until pages exist. */
	href: string;
};

/** A primary-navigation item. */
export type NavItem = {
	/** Key under the "Nav" message namespace (e.g. Nav.books). */
	key: string;
	/**
	 * Locale-RELATIVE route. The locale prefix is added by the locale-aware Link,
	 * so paths here are unprefixed.
	 */
	href: string;
	/** Key for the section description (e.g. Nav.booksDescription). */
	descriptionKey: string;
	/** Full-bleed background from /public/menu. */
	imageSrc: string;
	children: NavSubLink[];
};

const MENU_IMAGE = (file: string) => `/menu/${file}`;

export const NAV_DEFAULT_IMAGE = MENU_IMAGE("1.jpg");

/** Provisional catalog taxonomy — labels via i18n; routes may 404 until pages ship. */
export const NAV_ITEMS: NavItem[] = [
	{
		key: "books",
		href: "/books",
		descriptionKey: "booksDescription",
		imageSrc: MENU_IMAGE("1.jpg"),
		children: [
			{ key: "booksSubLiterature", href: "/books/literature" },
			{ key: "booksSubHistory", href: "/books/history" },
			{ key: "booksSubPoetry", href: "/books/poetry" },
			{ key: "booksSubManuscripts", href: "/books/manuscripts" },
		],
	},
	{
		key: "songs",
		href: "/songs",
		descriptionKey: "songsDescription",
		imageSrc: MENU_IMAGE("2.jpg"),
		children: [
			{ key: "songsSubFolk", href: "/songs/folk" },
			{ key: "songsSubWedding", href: "/songs/wedding" },
			{ key: "songsSubLament", href: "/songs/lament" },
			{ key: "songsSubModern", href: "/songs/modern" },
		],
	},
	{
		key: "audio",
		href: "/audio",
		descriptionKey: "audioDescription",
		imageSrc: MENU_IMAGE("3.jpg"),
		children: [
			{ key: "audioSubOralHistory", href: "/audio/oral-history" },
			{ key: "audioSubInterviews", href: "/audio/interviews" },
			{ key: "audioSubRadio", href: "/audio/radio-archives" },
		],
	},
	{
		key: "video",
		href: "/video",
		descriptionKey: "videoDescription",
		imageSrc: MENU_IMAGE("4.jpg"),
		children: [
			{ key: "videoSubDocumentaries", href: "/video/documentaries" },
			{ key: "videoSubPerformances", href: "/video/performances" },
			{ key: "videoSubLectures", href: "/video/lectures" },
			{ key: "videoSubNewsreels", href: "/video/newsreels" },
		],
	},
	{
		key: "news",
		href: "/news",
		descriptionKey: "newsDescription",
		imageSrc: MENU_IMAGE("5.jpg"),
		children: [
			{ key: "newsSubCulture", href: "/news?category=culture" },
			{ key: "newsSubHistory", href: "/news?category=history" },
			{ key: "newsSubLanguage", href: "/news?category=language" },
			{ key: "newsSubSociety", href: "/news?category=society" },
			{ key: "newsSubHeritage", href: "/news?category=heritage" },
		],
	},
	{
		key: "gallery",
		href: "/gallery",
		descriptionKey: "galleryDescription",
		imageSrc: MENU_IMAGE("6.jpg"),
		children: [
			{ key: "gallerySubPhotography", href: "/gallery/photography" },
			{ key: "gallerySubDress", href: "/gallery/traditional-dress" },
			{ key: "gallerySubCrafts", href: "/gallery/crafts" },
		],
	},
	{
		key: "archive",
		href: "/archive",
		descriptionKey: "archiveDescription",
		imageSrc: MENU_IMAGE("7.jpg"),
		children: [
			{ key: "archiveSubManuscripts", href: "/archive/manuscripts" },
			{ key: "archiveSubMaps", href: "/archive/maps" },
			{ key: "archiveSubPhotographs", href: "/archive/photographs" },
			{ key: "archiveSubRecords", href: "/archive/records" },
		],
	},
	{
		key: "about",
		href: "/about",
		descriptionKey: "aboutDescription",
		imageSrc: MENU_IMAGE("7.jpg"),
		children: [
			{ key: "aboutSubMission", href: "/about/mission" },
			{ key: "aboutSubTeam", href: "/about/team" },
			{ key: "aboutSubContact", href: "/contact" },
		],
	},
];

export const SEARCH_SUGGESTION_KEYS = [
	"books",
	"songs",
	"news",
	"archive",
	"about",
] as const;

export const SERVICES_HREF = "/services";

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

/** Compact locale codes for grouped toggle UI (CKB · KU · EN). */
export const LOCALE_SHORT_LABELS: Record<Locale, string> = {
	ckb: "CKB",
	ku: "KU",
	en: "EN",
};
