import { revalidatePath, revalidateTag } from "next/cache";
import { type NextRequest, NextResponse } from "next/server";

type RevalidateBody = {
	tags?: string[];
	paths?: string[];
};

function isNonEmptyString(value: unknown): value is string {
	return typeof value === "string" && value.trim().length > 0;
}

function parseStringArray(value: unknown): string[] {
	if (!Array.isArray(value)) {
		return [];
	}

	return value.filter(isNonEmptyString).map((entry) => entry.trim());
}

/**
 * On-demand ISR invalidation for CMS publish/delete hooks.
 *
 * POST /api/revalidate
 * Header: x-revalidation-secret: <REVALIDATION_SECRET>
 * Body: { "tags": ["news", "featured"], "paths": ["/ckb", "/ku"] }
 */
export async function POST(request: NextRequest) {
	const expectedSecret = process.env.REVALIDATION_SECRET?.trim();
	const providedSecret =
		request.headers.get("x-revalidation-secret")?.trim() ??
		request.nextUrl.searchParams.get("secret")?.trim();

	if (!expectedSecret || providedSecret !== expectedSecret) {
		return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
	}

	let body: RevalidateBody = {};
	try {
		body = (await request.json()) as RevalidateBody;
	} catch {
		return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
	}

	const tags = parseStringArray(body.tags);
	const paths = parseStringArray(body.paths);

	if (tags.length === 0 && paths.length === 0) {
		return NextResponse.json(
			{ error: "Provide at least one tag or path to revalidate" },
			{ status: 400 },
		);
	}

	for (const tag of tags) {
		revalidateTag(tag, { expire: 0 });
	}

	for (const path of paths) {
		revalidatePath(path);
	}

	return NextResponse.json({
		revalidated: true,
		tags,
		paths,
		now: Date.now(),
	});
}
