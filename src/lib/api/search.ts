import "server-only";
import { unwrapApiPayload } from "@/lib/api/client";
import { getApiBaseUrl } from "@/lib/api/config";
import { audioDetailHref } from "@/lib/audio/resolve";
import { galleryDetailHref, newsDetailHref } from "@/lib/content/href";
import { projectDetailHref } from "@/lib/content/project-href";
import { videoDetailHref } from "@/lib/video/resolve";
import {
	GlobalSearchResponseSchema,
	type SearchItem,
	type SearchItemType,
	type SearchType,
} from "@/types/search";

const SEARCH_ENDPOINT = "/api/v1/search";

export type SearchGlobalOptions = {
	q?: string;
	type?: SearchType;
	page?: number;
	size?: number;
};

export type ResolvedSearchItem = SearchItem & {
	title: string;
	description: string;
	href: string;
};

export type ResolvedSearchSection = {
	items: ResolvedSearchItem[];
	totalElements: number;
	totalPages: number;
	currentPage: number;
	size: number;
};

export type ResolvedGlobalSearchResponse = {
	query: string;
	page: number;
	size: number;
	type: SearchType;
	projects: ResolvedSearchSection | null;
	news: ResolvedSearchSection | null;
	videos: ResolvedSearchSection | null;
	writings: ResolvedSearchSection | null;
	soundTracks: ResolvedSearchSection | null;
	imageCollections: ResolvedSearchSection | null;
};

function firstNonBlank(
	...values: (string | null | undefined)[]
): string | null {
	for (const value of values) {
		if (value && value.trim().length > 0) {
			return value;
		}
	}
	return null;
}

function normalizeSearchType(type?: string): SearchType {
	const normalized = (type ?? "ALL").trim().toUpperCase();
	const allowed: SearchType[] = [
		"ALL",
		"PROJECT",
		"NEWS",
		"VIDEO",
		"WRITING",
		"SOUNDTRACK",
		"IMAGE",
	];
	return allowed.includes(normalized as SearchType)
		? (normalized as SearchType)
		: "ALL";
}

function resolveSearchItemHref(type: SearchItemType, id: number): string {
	switch (type) {
		case "PROJECT":
			return projectDetailHref(String(id));
		case "NEWS":
			return newsDetailHref(String(id));
		case "VIDEO":
			return videoDetailHref(id);
		case "WRITING":
			return `/writings/${id}`;
		case "SOUNDTRACK":
			return audioDetailHref(id);
		case "IMAGE":
			return galleryDetailHref(String(id));
		default:
			return "/";
	}
}

function resolveSearchItem(
	locale: string,
	item: SearchItem,
): ResolvedSearchItem {
	const title =
		(locale === "ckb"
			? firstNonBlank(item.titleCkb, item.titleKmr)
			: firstNonBlank(item.titleKmr, item.titleCkb)) ?? "";
	const description =
		locale === "ckb"
			? (firstNonBlank(item.descriptionCkb, item.descriptionKmr) ?? "")
			: (firstNonBlank(item.descriptionKmr, item.descriptionCkb) ?? "");

	return {
		...item,
		title,
		description,
		href: resolveSearchItemHref(item.type, item.id),
	};
}

function resolveSearchSection(
	locale: string,
	section:
		| {
				items: SearchItem[];
				totalElements: number;
				totalPages: number;
				currentPage: number;
				size: number;
		  }
		| null
		| undefined,
): ResolvedSearchSection | null {
	if (!section) {
		return null;
	}

	return {
		...section,
		items: section.items.map((item) => resolveSearchItem(locale, item)),
	};
}

export async function searchGlobal(
	locale: string,
	{ q = "", type = "ALL", page = 0, size = 10 }: SearchGlobalOptions = {},
): Promise<ResolvedGlobalSearchResponse | null> {
	const apiBaseUrl = getApiBaseUrl();
	if (!apiBaseUrl) {
		return null;
	}

	const normalizedType = normalizeSearchType(type);
	const endpoint = new URL(SEARCH_ENDPOINT, apiBaseUrl);
	endpoint.searchParams.set("q", q.trim());
	endpoint.searchParams.set("locale", locale);
	endpoint.searchParams.set("type", normalizedType);
	endpoint.searchParams.set("page", String(page));
	endpoint.searchParams.set("size", String(size));

	// Upstream trouble is reported as a WARNING, not an error: the CMS's
	// search endpoint is known to answer 500 for type=ALL, NEWS and IMAGE
	// (see site-search.ts), the caller already falls back, and console.error
	// would surface every expected refusal as a "Console Error" in the Next
	// dev overlay. Contract violations below stay errors — those are ours.
	let response: Response;
	try {
		response = await fetch(endpoint, { cache: "no-store" });
	} catch (error) {
		if (process.env.NODE_ENV === "development") {
			console.warn(
				"[searchGlobal] fetch failed",
				`type=${normalizedType}`,
				error,
			);
		}
		return null;
	}

	if (!response.ok) {
		if (process.env.NODE_ENV === "development") {
			const body = await response.text();
			const traceId = /"traceId"\s*:\s*"([^"]+)"/.exec(body)?.[1];
			console.warn(
				`[searchGlobal] upstream ${response.status} for type=${normalizedType}${traceId ? ` (traceId ${traceId})` : ""}`,
			);
		}
		return null;
	}

	const payload: unknown = await response.json();
	const data = unwrapApiPayload(payload);
	if (data == null) {
		if (process.env.NODE_ENV === "development") {
			console.error("[searchGlobal] envelope unwrap failed", payload);
		}
		return null;
	}

	const parsed = GlobalSearchResponseSchema.safeParse(data);
	if (!parsed.success) {
		if (process.env.NODE_ENV === "development") {
			console.error(
				"[searchGlobal] schema validation failed",
				parsed.error.flatten(),
			);
		}
		return null;
	}

	const searchData = parsed.data;

	return {
		query: searchData.query,
		page: searchData.page,
		size: searchData.size,
		type: searchData.type,
		projects: resolveSearchSection(locale, searchData.projects),
		news: resolveSearchSection(locale, searchData.news),
		videos: resolveSearchSection(locale, searchData.videos),
		writings: resolveSearchSection(locale, searchData.writings),
		soundTracks: resolveSearchSection(locale, searchData.soundTracks),
		imageCollections: resolveSearchSection(locale, searchData.imageCollections),
	};
}
