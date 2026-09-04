import { type NextRequest, NextResponse } from "next/server";
import { getPlatformSuggestions } from "@/lib/api/platform";

export const dynamic = "force-dynamic";

/** Bounds so a crafted query cannot be amplified against the platform. */
const MAX_QUERY_LENGTH = 200;
const MAX_LIMIT = 20;

/**
 * Browser-facing proxy for the platform's autocomplete
 * (`GET /api/guest/suggest`). The platform's CORS allowlist is exact-match and
 * does not include this site's origins, so the dropdown fetches same-origin
 * and the server makes the cross-origin hop.
 */
export async function GET(request: NextRequest) {
	const { searchParams } = request.nextUrl;
	const q = (searchParams.get("q") ?? "").slice(0, MAX_QUERY_LENGTH).trim();

	const parsedLimit = Number.parseInt(searchParams.get("limit") ?? "", 10);
	const limit =
		Number.isInteger(parsedLimit) && parsedLimit > 0
			? Math.min(parsedLimit, MAX_LIMIT)
			: 8;

	if (!q) {
		return NextResponse.json(
			{ success: true, data: [] },
			{
				headers: {
					"Cache-Control": "private, no-cache, no-store, must-revalidate",
				},
			},
		);
	}

	const data = await getPlatformSuggestions(q, limit);

	return NextResponse.json(
		{ success: true, data },
		{
			headers: {
				"Cache-Control": "private, no-cache, no-store, must-revalidate",
			},
		},
	);
}
