import { type NextRequest, NextResponse } from "next/server";
import { searchGlobal } from "@/lib/api/search";
import type { SearchType } from "@/types/search";

const SEARCH_TYPES: SearchType[] = [
	"ALL",
	"PROJECT",
	"NEWS",
	"VIDEO",
	"WRITING",
	"SOUNDTRACK",
	"IMAGE",
];

function parseSearchType(value: string | null): SearchType {
	const normalized = (value ?? "ALL").trim().toUpperCase();
	return SEARCH_TYPES.includes(normalized as SearchType)
		? (normalized as SearchType)
		: "ALL";
}

export async function GET(request: NextRequest) {
	const { searchParams } = request.nextUrl;
	const q = searchParams.get("q") ?? "";
	const locale = searchParams.get("locale") ?? "ckb";
	const type = parseSearchType(searchParams.get("type"));
	const page = Number.parseInt(searchParams.get("page") ?? "0", 10);
	const size = Number.parseInt(searchParams.get("size") ?? "10", 10);

	const result = await searchGlobal(locale, {
		q,
		type,
		page: Number.isFinite(page) ? page : 0,
		size: Number.isFinite(size) && size > 0 ? size : 10,
	});

	if (!result) {
		return NextResponse.json(
			{
				success: false,
				message: "Search unavailable",
				data: null,
			},
			{ status: 503 },
		);
	}

	return NextResponse.json({
		success: true,
		message: "Search completed",
		data: result,
	});
}
