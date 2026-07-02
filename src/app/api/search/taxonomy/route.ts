import { type NextRequest, NextResponse } from "next/server";
import { getSearchTaxonomy } from "@/lib/search/taxonomy";

export async function GET(request: NextRequest) {
	const { searchParams } = request.nextUrl;
	const locale = searchParams.get("locale") ?? "ckb";

	try {
		const items = await getSearchTaxonomy(locale);
		return NextResponse.json({
			success: true,
			data: items,
		});
	} catch (error) {
		if (process.env.NODE_ENV === "development") {
			console.error("[search/taxonomy] failed", error);
		}
		return NextResponse.json(
			{
				success: false,
				message: "Taxonomy unavailable",
				data: [],
			},
			{ status: 503 },
		);
	}
}
