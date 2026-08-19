import type { SearchScope } from "@/config/site";
import type { ResolvedGlobalSearchResponse } from "@/lib/api/search";
import type { SearchType } from "@/types/search";

export type ClientSearchSectionKey =
	| "projects"
	| "news"
	| "videos"
	| "writings"
	| "soundTracks"
	| "imageCollections";

export type ClientSearchItem = {
	id: string;
	href: string;
	label: string;
	description: string;
	sectionKey: ClientSearchSectionKey;
};

const ARCHIVE_SECTION_KEYS = new Set<ClientSearchSectionKey>([
	"projects",
	"news",
	"videos",
	"soundTracks",
	"imageCollections",
]);

const SECTION_ENTRIES: {
	key: ClientSearchSectionKey;
	field: keyof Pick<
		ResolvedGlobalSearchResponse,
		| "projects"
		| "news"
		| "videos"
		| "writings"
		| "soundTracks"
		| "imageCollections"
	>;
}[] = [
	{ key: "projects", field: "projects" },
	{ key: "news", field: "news" },
	{ key: "videos", field: "videos" },
	{ key: "writings", field: "writings" },
	{ key: "soundTracks", field: "soundTracks" },
	{ key: "imageCollections", field: "imageCollections" },
];

export function scopeToSearchType(scope: SearchScope): SearchType {
	if (scope === "library") {
		return "WRITING";
	}
	return "ALL";
}

export function flattenSearchResponse(
	response: ResolvedGlobalSearchResponse,
	scope: SearchScope,
): ClientSearchItem[] {
	const items: ClientSearchItem[] = [];

	for (const { key, field } of SECTION_ENTRIES) {
		if (scope === "archive" && !ARCHIVE_SECTION_KEYS.has(key)) {
			continue;
		}
		if (scope === "library" && key !== "writings") {
			continue;
		}

		const section = response[field];
		if (!section?.items.length) {
			continue;
		}

		for (const item of section.items) {
			items.push({
				id: `${key}-${item.id}`,
				href: item.href,
				label: item.title,
				description: stripHtml(item.description),
				sectionKey: key,
			});
		}
	}

	return items;
}

export function groupSearchItems(
	items: ClientSearchItem[],
): { key: ClientSearchSectionKey; items: ClientSearchItem[] }[] {
	const groups = new Map<ClientSearchSectionKey, ClientSearchItem[]>();

	for (const item of items) {
		const existing = groups.get(item.sectionKey) ?? [];
		existing.push(item);
		groups.set(item.sectionKey, existing);
	}

	return SECTION_ENTRIES.map(({ key }) => ({
		key,
		items: groups.get(key) ?? [],
	})).filter((group) => group.items.length > 0);
}

export function stripHtml(value: string): string {
	return value
		.replace(/<[^>]*>/g, " ")
		.replace(/\s+/g, " ")
		.trim();
}

export type GlobalSearchFetchResult = {
	items: ClientSearchItem[];
	unavailable: boolean;
};

export async function fetchGlobalSearch(
	query: string,
	locale: string,
	scope: SearchScope,
): Promise<GlobalSearchFetchResult> {
	const params = new URLSearchParams({
		q: query.trim(),
		locale,
		type: scopeToSearchType(scope),
		page: "0",
		size: "10",
	});

	const response = await fetch(`/api/search?${params.toString()}`);
	if (!response.ok) {
		return { items: [], unavailable: true };
	}

	const payload: {
		success: boolean;
		data: ResolvedGlobalSearchResponse | null;
	} = await response.json();

	if (!payload.success || !payload.data) {
		return { items: [], unavailable: !payload.success };
	}

	return {
		items: flattenSearchResponse(payload.data, scope),
		unavailable: false,
	};
}
