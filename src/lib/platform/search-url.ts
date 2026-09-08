import type { SearchScope } from "@/config/site";
import {
	PLATFORM_MEDIA_KINDS,
	PLATFORM_SORTS,
	type PlatformMediaKind,
	type PlatformSort,
} from "@/lib/platform/constants";

/**
 * URL state for the /search results page. The URL is the single source of
 * truth — every tab, sort, facet and page is a real link, so results are
 * shareable, crawlable and survive a refresh.
 */

export const SEARCH_PAGE_PATH = "/search";

/**
 * The three sources in display order — the platform leads, it is this page's
 * flagship. A search runs against every CHECKED source; all three are checked
 * by default and at least one always stays on.
 */
export const SEARCH_SOURCE_ORDER: readonly SearchScope[] = [
	"archive",
	"main",
	"library",
];

/** What the page renders for a given selection of sources. */
export type SearchMode = "platform" | "site" | "library" | "mixed";

export type PlatformFilterState = {
	language: string | null;
	dialect: string | null;
	region: string | null;
	decade: string | null;
	personCode: string | null;
	projectCode: string | null;
	subject: string[];
	genre: string[];
	tag: string[];
	keyword: string[];
};

export type SearchPageState = {
	/** Checked sources, in display order; never empty. */
	sources: SearchScope[];
	q: string;
	/** Active kind tab; null = هەموو (all four). */
	kind: PlatformMediaKind | null;
	/** null = the endpoint's own default (relevance with q, newest without). */
	sort: PlatformSort | null;
	/** 1-based in the URL; the API is 0-based. */
	page: number;
	filters: PlatformFilterState;
};

export const EMPTY_FILTERS: PlatformFilterState = {
	language: null,
	dialect: null,
	region: null,
	decade: null,
	personCode: null,
	projectCode: null,
	subject: [],
	genre: [],
	tag: [],
	keyword: [],
};

export type RawSearchParams = Record<string, string | string[] | undefined>;

function first(value: string | string[] | undefined): string | null {
	const raw = Array.isArray(value) ? value[0] : value;
	const trimmed = raw?.trim();
	return trimmed ? trimmed : null;
}

function many(value: string | string[] | undefined): string[] {
	const list = Array.isArray(value) ? value : value != null ? [value] : [];
	const seen = new Set<string>();
	const result: string[] = [];
	for (const entry of list) {
		const trimmed = entry.trim();
		if (trimmed && !seen.has(trimmed)) {
			seen.add(trimmed);
			result.push(trimmed);
		}
	}
	return result;
}

function isSearchScope(value: string): value is SearchScope {
	return value === "main" || value === "archive" || value === "library";
}

/**
 * `?source=` may be absent (all three), comma-joined (`archive,main`) or
 * repeated; unknown values are dropped and an empty selection means all.
 * The result is always in display order, whatever the URL said.
 */
function parseSources(value: string | string[] | undefined): SearchScope[] {
	const raw = many(value).flatMap((entry) => entry.split(","));
	const chosen = new Set(
		raw.map((entry) => entry.trim()).filter(isSearchScope),
	);
	const ordered = SEARCH_SOURCE_ORDER.filter((scope) => chosen.has(scope));
	return ordered.length > 0 ? ordered : [...SEARCH_SOURCE_ORDER];
}

/** The one checked source, or null when several are. */
export function singleSource(
	state: Pick<SearchPageState, "sources">,
): SearchScope | null {
	return state.sources.length === 1 ? state.sources[0] : null;
}

export function searchMode(
	state: Pick<SearchPageState, "sources">,
): SearchMode {
	const single = singleSource(state);
	if (single === "archive") {
		return "platform";
	}
	if (single === "main") {
		return "site";
	}
	if (single === "library") {
		return "library";
	}
	return "mixed";
}

export function isAllSources(sources: readonly SearchScope[]): boolean {
	return SEARCH_SOURCE_ORDER.every((scope) => sources.includes(scope));
}

function parseKind(value: string | null): PlatformMediaKind | null {
	return PLATFORM_MEDIA_KINDS.includes(value as PlatformMediaKind)
		? (value as PlatformMediaKind)
		: null;
}

function parseSort(value: string | null): PlatformSort | null {
	return PLATFORM_SORTS.includes(value as PlatformSort)
		? (value as PlatformSort)
		: null;
}

function parsePage(value: string | null): number {
	const parsed = Number.parseInt(value ?? "", 10);
	return Number.isInteger(parsed) && parsed > 1 ? Math.min(parsed, 1000) : 1;
}

export function parseSearchPageState(params: RawSearchParams): SearchPageState {
	return {
		sources: parseSources(params.source),
		q: first(params.q) ?? "",
		kind: parseKind(first(params.type)),
		sort: parseSort(first(params.sort)),
		page: parsePage(first(params.page)),
		filters: {
			language: first(params.language),
			dialect: first(params.dialect),
			region: first(params.region),
			decade: first(params.decade),
			personCode: first(params.personCode),
			projectCode: first(params.projectCode),
			subject: many(params.subject),
			genre: many(params.genre),
			tag: many(params.tag),
			keyword: many(params.keyword),
		},
	};
}

const SINGLE_FILTER_PARAMS = [
	"language",
	"dialect",
	"region",
	"decade",
	"personCode",
	"projectCode",
] as const;

const REPEATED_FILTER_PARAMS = ["subject", "genre", "tag", "keyword"] as const;

export type SingleFilterParam = (typeof SINGLE_FILTER_PARAMS)[number];
export type RepeatedFilterParam = (typeof REPEATED_FILTER_PARAMS)[number];

export function buildSearchHref(state: Partial<SearchPageState>): string {
	const params = new URLSearchParams();

	if (state.q?.trim()) {
		params.set("q", state.q.trim());
	}
	// Absent = every source; a partial selection travels comma-joined.
	if (
		state.sources &&
		state.sources.length > 0 &&
		!isAllSources(state.sources)
	) {
		params.set(
			"source",
			SEARCH_SOURCE_ORDER.filter((scope) =>
				state.sources?.includes(scope),
			).join(","),
		);
	}
	if (state.kind) {
		params.set("type", state.kind);
	}
	if (state.sort) {
		params.set("sort", state.sort);
	}
	if (state.page && state.page > 1) {
		params.set("page", String(state.page));
	}

	const filters = state.filters;
	if (filters) {
		for (const key of SINGLE_FILTER_PARAMS) {
			const value = filters[key]?.trim();
			if (value) {
				params.set(key, value);
			}
		}
		for (const key of REPEATED_FILTER_PARAMS) {
			for (const value of filters[key]) {
				if (value.trim()) {
					params.append(key, value.trim());
				}
			}
		}
	}

	const qs = params.toString();
	return qs ? `${SEARCH_PAGE_PATH}?${qs}` : SEARCH_PAGE_PATH;
}

export function countActiveFilters(filters: PlatformFilterState): number {
	let count = 0;
	for (const key of SINGLE_FILTER_PARAMS) {
		if (filters[key]) {
			count += 1;
		}
	}
	for (const key of REPEATED_FILTER_PARAMS) {
		count += filters[key].length;
	}
	return count;
}

/** Immutable single-value filter set/clear — page resets to 1. */
export function withSingleFilter(
	state: SearchPageState,
	param: SingleFilterParam,
	value: string | null,
): SearchPageState {
	return {
		...state,
		page: 1,
		filters: { ...state.filters, [param]: value },
	};
}

/** Immutable repeated-value toggle — page resets to 1. */
export function withToggledFilter(
	state: SearchPageState,
	param: RepeatedFilterParam,
	value: string,
): SearchPageState {
	const current = state.filters[param];
	const next = current.includes(value)
		? current.filter((entry) => entry !== value)
		: [...current, value];
	return {
		...state,
		page: 1,
		filters: { ...state.filters, [param]: next },
	};
}

export function withClearedFilters(state: SearchPageState): SearchPageState {
	return { ...state, page: 1, filters: EMPTY_FILTERS };
}

/**
 * Check or uncheck one source. The last checked source cannot be removed —
 * the call is then a no-op. A different selection describes a different
 * result set, so everything but the query starts over (kind, sort,
 * refinements, page all belong to the single-platform view).
 */
export function withToggledSource(
	state: SearchPageState,
	scope: SearchScope,
): SearchPageState {
	const on = state.sources.includes(scope);
	if (on && state.sources.length === 1) {
		return state;
	}
	const next = on
		? state.sources.filter((entry) => entry !== scope)
		: SEARCH_SOURCE_ORDER.filter(
				(entry) => entry === scope || state.sources.includes(entry),
			);
	return {
		...state,
		sources: next,
		kind: null,
		sort: null,
		page: 1,
		filters: EMPTY_FILTERS,
	};
}

/** Website detail route for one platform item. */
export function platformDetailHref(type: string, code: string): string {
	return `/archive/${encodeURIComponent(type)}/${encodeURIComponent(code)}`;
}
