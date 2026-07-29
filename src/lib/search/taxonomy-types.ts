import type { SearchScope } from "@/config/site";

export type ClientSearchSectionKey =
	| "projects"
	| "news"
	| "videos"
	| "writings"
	| "soundTracks"
	| "imageCollections";

export type SearchTaxonomyKind =
	| "category"
	| "tag"
	| "topic"
	| "genre"
	| "type";

export type SearchTaxonomyItem = {
	id: string;
	label: string;
	kind: SearchTaxonomyKind;
	sectionKey: ClientSearchSectionKey;
	href: string;
	searchText: string;
};

const SECTION_NAV_KEYS: Record<ClientSearchSectionKey, string> = {
	projects: "projects",
	news: "news",
	videos: "video",
	writings: "writings",
	soundTracks: "sound",
	imageCollections: "gallery",
};

const NAV_KEY_TO_SECTION: Record<string, ClientSearchSectionKey> = {
	projects: "projects",
	news: "news",
	video: "videos",
	writings: "writings",
	sound: "soundTracks",
	gallery: "imageCollections",
};

/** Max secondary links shown per mega-menu section. */
export const NAV_MENU_MAX_ITEMS = 8;

/** Kinds shown as mega-menu secondary links per section. */
const NAV_MENU_KINDS: Record<
	ClientSearchSectionKey,
	ReadonlySet<SearchTaxonomyKind>
> = {
	news: new Set(["category"]),
	writings: new Set(["category"]),
	videos: new Set(["topic", "type"]),
	soundTracks: new Set(["topic", "type"]),
	projects: new Set(["tag"]),
	imageCollections: new Set(["tag"]),
};

type NavMenuLinkLike = {
	label: string;
	href: string;
};

/**
 * Drops duplicate labels/hrefs (case-insensitive) and caps length for mega-menu panels.
 */
export function limitNavMenuLinks<T extends NavMenuLinkLike>(
	links: T[],
	max = NAV_MENU_MAX_ITEMS,
): T[] {
	const seenLabels = new Set<string>();
	const seenHrefs = new Set<string>();
	const unique: T[] = [];

	for (const link of links) {
		const labelKey = normalizeTaxonomyQuery(link.label);
		const hrefKey = normalizeTaxonomyQuery(link.href);
		if (seenLabels.has(labelKey) || seenHrefs.has(hrefKey)) {
			continue;
		}
		seenLabels.add(labelKey);
		seenHrefs.add(hrefKey);
		unique.push(link);
		if (unique.length >= max) {
			break;
		}
	}

	return unique;
}

const ARCHIVE_SECTION_KEYS = new Set<ClientSearchSectionKey>([
	"projects",
	"news",
	"videos",
	"soundTracks",
	"imageCollections",
]);

export function isTaxonomyInScope(
	sectionKey: ClientSearchSectionKey,
	scope: SearchScope,
): boolean {
	if (scope === "main") {
		return true;
	}
	if (scope === "archive") {
		return ARCHIVE_SECTION_KEYS.has(sectionKey);
	}
	return sectionKey === "writings";
}

export function getTaxonomySectionNavKey(
	sectionKey: ClientSearchSectionKey,
): string {
	return SECTION_NAV_KEYS[sectionKey];
}

/** Maps a primary nav key (`video`, `sound`, …) to its search section, if any. */
export function getSectionKeyForNavKey(
	navKey: string,
): ClientSearchSectionKey | null {
	return NAV_KEY_TO_SECTION[navKey] ?? null;
}

/**
 * Taxonomy links for a mega-menu secondary panel / nav search children.
 * Returns [] for Services/About (no section) or when the catalog has no matches.
 * Dedupes by label/href and caps at {@link NAV_MENU_MAX_ITEMS}.
 */
export function getNavMenuTaxonomyItems(
	navKey: string,
	catalog: SearchTaxonomyItem[],
): SearchTaxonomyItem[] {
	const sectionKey = getSectionKeyForNavKey(navKey);
	if (!sectionKey) {
		return [];
	}

	const kinds = NAV_MENU_KINDS[sectionKey];
	const filtered = catalog.filter(
		(item) => item.sectionKey === sectionKey && kinds.has(item.kind),
	);
	return limitNavMenuLinks(filtered);
}

export function normalizeTaxonomyQuery(value: string): string {
	return value.trim().toLocaleLowerCase();
}

export function filterTaxonomyItems(
	items: SearchTaxonomyItem[],
	query: string,
	scope: SearchScope,
): SearchTaxonomyItem[] {
	const normalizedQuery = normalizeTaxonomyQuery(query);
	if (!normalizedQuery) {
		return [];
	}

	return items.filter((item) => {
		if (!isTaxonomyInScope(item.sectionKey, scope)) {
			return false;
		}

		return normalizeTaxonomyQuery(item.searchText).includes(normalizedQuery);
	});
}

export function groupTaxonomyItems(
	items: SearchTaxonomyItem[],
): { key: ClientSearchSectionKey; items: SearchTaxonomyItem[] }[] {
	const order: ClientSearchSectionKey[] = [
		"news",
		"projects",
		"videos",
		"soundTracks",
		"imageCollections",
		"writings",
	];
	const groups = new Map<ClientSearchSectionKey, SearchTaxonomyItem[]>();

	for (const item of items) {
		const existing = groups.get(item.sectionKey) ?? [];
		existing.push(item);
		groups.set(item.sectionKey, existing);
	}

	return order
		.map((key) => ({ key, items: groups.get(key) ?? [] }))
		.filter((group) => group.items.length > 0);
}
