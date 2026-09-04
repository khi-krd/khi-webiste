import "server-only";
import {
	type ResolvedGlobalSearchResponse,
	searchGlobal,
} from "@/lib/api/search";
import type { SearchType } from "@/types/search";

const FANOUT_TYPES: Exclude<SearchType, "ALL">[] = [
	"PROJECT",
	"NEWS",
	"VIDEO",
	"WRITING",
	"SOUNDTRACK",
	"IMAGE",
];

/**
 * Fallback for the upstream CMS bug where `type=ALL` (and currently NEWS and
 * IMAGE) responds 500: query every type in parallel and merge whatever
 * succeeds, so one broken type can't blank the whole search. Runs only when
 * the single ALL request has already failed; drop this once the CMS is fixed.
 */
async function searchAllWithFanout(
	locale: string,
	options: { q: string; page: number; size: number },
): Promise<ResolvedGlobalSearchResponse | null> {
	const results = await Promise.all(
		FANOUT_TYPES.map((type) => searchGlobal(locale, { ...options, type })),
	);

	const succeeded = results.filter(
		(result): result is ResolvedGlobalSearchResponse => result != null,
	);
	if (succeeded.length === 0) {
		return null;
	}

	const merged: ResolvedGlobalSearchResponse = {
		query: options.q,
		page: options.page,
		size: options.size,
		type: "ALL",
		projects: null,
		news: null,
		videos: null,
		writings: null,
		soundTracks: null,
		imageCollections: null,
	};

	for (const result of succeeded) {
		merged.projects = result.projects ?? merged.projects;
		merged.news = result.news ?? merged.news;
		merged.videos = result.videos ?? merged.videos;
		merged.writings = result.writings ?? merged.writings;
		merged.soundTracks = result.soundTracks ?? merged.soundTracks;
		merged.imageCollections =
			result.imageCollections ?? merged.imageCollections;
	}

	return merged;
}

/**
 * The site-CMS search with the fanout fallback applied — shared between the
 * /api/search proxy (the overlay) and the /search results page.
 */
export async function searchSiteWithFallback(
	locale: string,
	options: { q: string; type: SearchType; page: number; size: number },
): Promise<ResolvedGlobalSearchResponse | null> {
	let result = await searchGlobal(locale, options);
	if (!result && options.type === "ALL") {
		result = await searchAllWithFanout(locale, options);
	}
	return result;
}
