import { type NextRequest, NextResponse } from "next/server";
import {
	type ResolvedGlobalSearchResponse,
	searchGlobal,
} from "@/lib/api/search";
import { parseSearchLocale } from "@/lib/search/request";
import type { SearchType } from "@/types/search";

export const dynamic = "force-dynamic";

const SEARCH_TYPES: SearchType[] = [
	"ALL",
	"PROJECT",
	"NEWS",
	"VIDEO",
	"WRITING",
	"SOUNDTRACK",
	"IMAGE",
];

/** Bounds so a crafted query cannot be amplified against the upstream CMS. */
const MAX_QUERY_LENGTH = 200;
const MAX_PAGE_SIZE = 50;
const MAX_PAGE = 1000;

function parseSearchType(value: string | null): SearchType {
	const normalized = (value ?? "ALL").trim().toUpperCase();
	return SEARCH_TYPES.includes(normalized as SearchType)
		? (normalized as SearchType)
		: "ALL";
}

function clamp(raw: string | null, fallback: number, max: number): number {
	const parsed = Number.parseInt(raw ?? "", 10);
	if (!Number.isFinite(parsed) || parsed < 0) {
		return fallback;
	}
	return Math.min(parsed, max);
}

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

export async function GET(request: NextRequest) {
	const { searchParams } = request.nextUrl;
	const q = (searchParams.get("q") ?? "").slice(0, MAX_QUERY_LENGTH);
	const locale = parseSearchLocale(searchParams.get("locale"));
	const type = parseSearchType(searchParams.get("type"));
	const page = clamp(searchParams.get("page"), 0, MAX_PAGE);
	const size = Math.max(1, clamp(searchParams.get("size"), 10, MAX_PAGE_SIZE));

	let result = await searchGlobal(locale, { q, type, page, size });

	if (!result && type === "ALL") {
		result = await searchAllWithFanout(locale, { q, page, size });
	}

	if (!result) {
		return NextResponse.json(
			{
				success: false,
				message: "Search unavailable",
				data: null,
			},
			{
				status: 503,
				headers: {
					"Cache-Control": "private, no-cache, no-store, must-revalidate",
				},
			},
		);
	}

	return NextResponse.json(
		{
			success: true,
			message: "Search completed",
			data: result,
		},
		{
			headers: {
				"Cache-Control": "private, no-cache, no-store, must-revalidate",
			},
		},
	);
}
