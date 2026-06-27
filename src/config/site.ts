import type { Locale } from "@/i18n/routing";

/**
 * Site-wide static configuration. Plain data only (NO JSX) so it can be imported
 * from both Server and Client Components. Item labels are i18n KEYS resolved per
 * locale through the "Nav" namespace — never literal UI copy.
 */

/** A secondary link shown in the overlay right panel. */
export type NavSubLink = {
	/** Key under the "Nav" message namespace (e.g. Nav.writingsSubLiterature). */
	key: string;
	/** Locale-relative route — may 404 until pages exist. */
	href: string;
};

/** A primary-navigation item. */
export type NavItem = {
	/** Key under the "Nav" message namespace (e.g. Nav.writings). */
	key: string;
	/**
	 * Locale-RELATIVE route. The locale prefix is added by the locale-aware Link,
	 * so paths here are unprefixed.
	 */
	href: string;
	/** Key for the section description (e.g. Nav.writingsDescription). */
	descriptionKey: string;
	/** Full-bleed background from /public/menu. */
	imageSrc: string;
	children: NavSubLink[];
};

const MENU_IMAGE = (file: string) => `/menu/${file}`;

export const NAV_DEFAULT_IMAGE = MENU_IMAGE("1.jpg");

/** Primary nav — order mirrors the external API catalogue. */
export const NAV_ITEMS: NavItem[] = [
	{
		key: "news",
		href: "/news",
		descriptionKey: "newsDescription",
		imageSrc: MENU_IMAGE("2.jpg"),
		children: [
			{ key: "newsSubCulture", href: "/news?category=culture" },
			{ key: "newsSubHistory", href: "/news?category=history" },
			{ key: "newsSubLanguage", href: "/news?category=language" },
			{ key: "newsSubSociety", href: "/news?category=society" },
			{ key: "newsSubHeritage", href: "/news?category=heritage" },
		],
	},
	{
		key: "projects",
		href: "/projects",
		descriptionKey: "projectsDescription",
		imageSrc: MENU_IMAGE("1.jpg"),
		children: [
			{
				key: "projectsSubOralHistory",
				href: "/projects/1",
			},
			{
				key: "projectsSubManuscripts",
				href: "/projects/2",
			},
			{
				key: "projectsSubFolkMusic",
				href: "/projects/3",
			},
			{
				key: "projectsSubDress",
				href: "/projects/4",
			},
		],
	},
	{
		key: "sound",
		href: "/audio",
		descriptionKey: "soundDescription",
		imageSrc: MENU_IMAGE("3.jpg"),
		children: [
			{ key: "soundSubOralHistory", href: "/audio?type=speech" },
			{ key: "soundSubInterviews", href: "/audio?type=interview" },
			{ key: "soundSubRadio", href: "/audio?type=radio" },
		],
	},
	{
		key: "video",
		href: "/videos",
		descriptionKey: "videoDescription",
		imageSrc: MENU_IMAGE("4.jpg"),
		children: [
			{ key: "videoSubShortFilms", href: "/videos/shortfilms" },
			{ key: "videoSubDocumentaries", href: "/videos?topic=2" },
			{ key: "videoSubPerformances", href: "/videos?topic=3" },
			{ key: "videoSubLectures", href: "/videos?topic=4" },
			{ key: "videoSubNewsreels", href: "/videos?topic=5" },
		],
	},
	{
		key: "gallery",
		href: "/gallery",
		descriptionKey: "galleryDescription",
		imageSrc: MENU_IMAGE("5.jpg"),
		children: [
			{ key: "gallerySubPhotography", href: "/gallery/the-mountain-keeps-us" },
			{ key: "gallerySubDress", href: "/gallery/threads-of-identity" },
			{ key: "gallerySubCrafts", href: "/gallery/made-by-hand" },
		],
	},
	{
		key: "writings",
		href: "/writings",
		descriptionKey: "writingsDescription",
		imageSrc: MENU_IMAGE("6.jpg"),
		children: [
			{ key: "writingsSubLiterature", href: "/writings/literature" },
			{ key: "writingsSubHistory", href: "/writings/history" },
			{ key: "writingsSubPoetry", href: "/writings/poetry" },
			{ key: "writingsSubManuscripts", href: "/writings/manuscripts" },
		],
	},
	{
		key: "services",
		href: "/services",
		descriptionKey: "servicesDescription",
		imageSrc: MENU_IMAGE("7.jpg"),
		children: [
			{ key: "servicesSubInstituteHall", href: "/services#institute-hall" },
			{ key: "servicesSubStudio", href: "/services#studio" },
			{
				key: "servicesSubResearch",
				href: "/services#research-publishing",
			},
			{ key: "servicesSubLibrary", href: "/services#library" },
		],
	},
	{
		key: "about",
		href: "/about",
		descriptionKey: "aboutDescription",
		imageSrc: MENU_IMAGE("7.jpg"),
		children: [
			{ key: "aboutSubMission", href: "/about" },
			{ key: "aboutSubTeam", href: "/about" },
			{ key: "aboutSubContact", href: "/contact" },
		],
	},
];

export const SEARCH_SUGGESTION_KEYS = [
	"news",
	"projects",
	"sound",
	"video",
	"writings",
	"services",
	"about",
] as const;

export const SERVICES_HREF = "/services";

export const DONATE_HREF = "/donate";

/** A footer navigation link — label resolved via the "Footer" message namespace. */
export type FooterLink = {
	/** Key under Footer.* when navKey is unset. */
	labelKey?: string;
	/** Key under Nav.* for sub-links shared with the mega menu. */
	navKey?: string;
	href: string;
	external?: boolean;
};

export type FooterColumn = {
	titleKey: string;
	links: FooterLink[];
};

/** Footer columns — only routes that exist under `[locale]` today. */
export const FOOTER_COLUMNS: FooterColumn[] = [
	{
		titleKey: "collections",
		links: [
			{ labelKey: "news", href: "/news" },
			{ labelKey: "projects", href: "/projects" },
			{ labelKey: "sound", href: "/audio" },
			{ labelKey: "video", href: "/videos" },
			{ labelKey: "shortFilms", href: "/videos/shortfilms" },
			{ labelKey: "gallery", href: "/gallery" },
			{ labelKey: "writings", href: "/writings" },
		],
	},
	{
		titleKey: "institute",
		links: [
			{ labelKey: "services", href: "/services" },
			{ labelKey: "about", href: "/about" },
			{ labelKey: "donate", href: DONATE_HREF },
			{ labelKey: "contact", href: "/contact" },
		],
	},
];

export const FOOTER_SOCIAL_LINKS: FooterLink[] = [
	{ labelKey: "x", href: "https://x.com", external: true },
	{ labelKey: "instagram", href: "https://instagram.com", external: true },
	{ labelKey: "facebook", href: "https://facebook.com", external: true },
	{ labelKey: "linkedin", href: "https://linkedin.com", external: true },
];

/**
 * Language self-names (autonyms). Intentionally IDENTICAL across every UI locale
 * — a language is always shown in its own script so any reader can find it,
 * regardless of the current interface language — so this belongs in config, not
 * duplicated across the per-locale message files.
 */
export const LOCALE_LABELS: Record<Locale, string> = {
	ckb: "سۆرانی",
	ku: "Kurmancî",
};

/** Compact locale codes for grouped toggle UI (CKB · KU). */
export const LOCALE_SHORT_LABELS: Record<Locale, string> = {
	ckb: "CKB",
	ku: "KU",
};
