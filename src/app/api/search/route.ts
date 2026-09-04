import { type NextRequest, NextResponse } from "next/server";
import { parseSearchLocale } from "@/lib/search/request";
import { searchSiteWithFallback } from "@/lib/search/site-search";
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

export async function GET(request: NextRequest) {
	const { searchParams } = request.nextUrl;
	const q = (searchParams.get("q") ?? "").slice(0, MAX_QUERY_LENGTH);
	const locale = parseSearchLocale(searchParams.get("locale"));
	const type = parseSearchType(searchParams.get("type"));
	const page = clamp(searchParams.get("page"), 0, MAX_PAGE);
	const size = Math.max(1, clamp(searchParams.get("size"), 10, MAX_PAGE_SIZE));

	const result = await searchSiteWithFallback(locale, { q, type, page, size });

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
