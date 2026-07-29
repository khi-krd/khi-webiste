import { timingSafeEqual } from "node:crypto";
import { revalidatePath, revalidateTag } from "next/cache";
import { type NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

type RevalidateBody = {
	tags?: string[];
	paths?: string[];
	/** Absolute URLs to purge from Cloudflare (optional). */
	urls?: string[];
	/** Purge the entire Cloudflare zone cache (use sparingly). */
	purgeEverything?: boolean;
};

type CloudflarePurgeResult = {
	ok: boolean;
	skipped?: boolean;
	error?: string;
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

/** Constant-time compare so the secret cannot be recovered byte by byte. */
function secretMatches(provided: string, expected: string): boolean {
	const a = Buffer.from(provided);
	const b = Buffer.from(expected);
	// timingSafeEqual throws on length mismatch; compare lengths separately.
	return a.length === b.length && timingSafeEqual(a, b);
}

/**
 * Site-relative paths only. `revalidatePath` takes app-router paths, so an
 * absolute URL or a traversal segment is always a caller mistake or an abuse
 * attempt.
 */
function isSafePath(path: string): boolean {
	return path.startsWith("/") && !path.startsWith("//") && !path.includes("..");
}

/**
 * Cloudflare purges are billed and zone-wide, so restrict `files` to this
 * site's own origin — a leaked secret should not be able to purge unrelated
 * hostnames on the same zone.
 */
function isSameOriginUrl(candidate: string): boolean {
	const siteUrl = process.env.NEXT_PUBLIC_SITE_URL?.trim();
	if (!siteUrl) {
		return false;
	}
	try {
		return new URL(candidate).origin === new URL(siteUrl).origin;
	} catch {
		return false;
	}
}

async function purgeCloudflareCache(options: {
	urls: string[];
	purgeEverything: boolean;
}): Promise<CloudflarePurgeResult> {
	const zoneId = process.env.CLOUDFLARE_ZONE_ID?.trim();
	const apiToken = process.env.CLOUDFLARE_API_TOKEN?.trim();

	if (!zoneId || !apiToken) {
		return { ok: true, skipped: true };
	}

	if (!options.purgeEverything && options.urls.length === 0) {
		return { ok: true, skipped: true };
	}

	try {
		const response = await fetch(
			`https://api.cloudflare.com/client/v4/zones/${zoneId}/purge_cache`,
			{
				method: "POST",
				headers: {
					Authorization: `Bearer ${apiToken}`,
					"Content-Type": "application/json",
				},
				body: JSON.stringify(
					options.purgeEverything
						? { purge_everything: true }
						: { files: options.urls },
				),
				cache: "no-store",
			},
		);

		if (!response.ok) {
			// Log the upstream body server-side; return only the status so the
			// caller does not receive Cloudflare's internal error detail.
			console.error(
				`[revalidate] Cloudflare purge failed (${response.status}):`,
				(await response.text()).slice(0, 500),
			);
			return {
				ok: false,
				error: `Cloudflare purge failed (${response.status})`,
			};
		}

		return { ok: true };
	} catch (error) {
		console.error("[revalidate] Cloudflare purge request failed:", error);
		return { ok: false, error: "Cloudflare purge request failed" };
	}
}

/**
 * On-demand ISR + optional Cloudflare edge purge for CMS publish/delete hooks.
 *
 * POST /api/revalidate
 * Header: x-revalidation-secret: <REVALIDATION_SECRET>
 *
 * The secret must be sent as a header. The former `?secret=` query-string form
 * was removed because query strings are recorded in access logs, proxy logs and
 * Referer headers.
 *
 * Body: {
 *   "tags": ["news", "featured"],
 *   "paths": ["/ckb", "/ku"],
 *   "urls": ["https://example.com/ckb/news"],
 *   "purgeEverything": false
 * }
 */
export async function POST(request: NextRequest) {
	const expectedSecret = process.env.REVALIDATION_SECRET?.trim();
	const providedSecret = request.headers.get("x-revalidation-secret")?.trim();

	if (
		!expectedSecret ||
		!providedSecret ||
		!secretMatches(providedSecret, expectedSecret)
	) {
		return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
	}

	let body: RevalidateBody = {};
	try {
		body = (await request.json()) as RevalidateBody;
	} catch {
		return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
	}

	const tags = parseStringArray(body.tags);
	const paths = parseStringArray(body.paths).filter(isSafePath);
	const urls = parseStringArray(body.urls).filter(isSameOriginUrl);
	const purgeEverything = body.purgeEverything === true;

	if (
		tags.length === 0 &&
		paths.length === 0 &&
		urls.length === 0 &&
		!purgeEverything
	) {
		return NextResponse.json(
			{ error: "Provide at least one tag, path, url, or purgeEverything" },
			{ status: 400 },
		);
	}

	for (const tag of tags) {
		revalidateTag(tag, { expire: 0 });
	}

	for (const path of paths) {
		revalidatePath(path);
	}

	const cloudflare = await purgeCloudflareCache({ urls, purgeEverything });

	return NextResponse.json({
		revalidated: true,
		tags,
		paths,
		urls,
		purgeEverything,
		cloudflare,
		now: Date.now(),
	});
}
