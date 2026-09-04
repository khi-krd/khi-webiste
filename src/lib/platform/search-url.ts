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

/** Default source when `?source=` is absent — the platform is the flagship. */
export const DEFAULT_SEARCH_SOURCE: SearchScope = "archive";

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
	source: SearchScope;
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

function parseSource(value: string | null): SearchScope {
	if (value === "main" || value === "archive" || value === "library") {
		return value;
	}
	return DEFAULT_SEARCH_SOURCE;
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
		source: parseSource(first(params.source)),
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
	if (state.source && state.source !== DEFAULT_SEARCH_SOURCE) {
		params.set("source", state.source);
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

/** Website detail route for one platform item. */
export function platformDetailHref(type: string, code: string): string {
	return `/archive/${encodeURIComponent(type)}/${encodeURIComponent(code)}`;
}
