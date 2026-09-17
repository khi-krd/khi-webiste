import { isAllowedSiteFontUrl } from "@/lib/site-font";

export const dynamic = "force-dynamic";

/** Font files are small — refuse anything that clearly is not one. */
const MAX_BYTES = 8 * 1024 * 1024;

/** Give up on a slow origin rather than holding a server connection open. */
const TIMEOUT_MS = 15_000;

const MIME_BY_EXT: Record<string, string> = {
	woff2: "font/woff2",
	woff: "font/woff",
	ttf: "font/ttf",
	otf: "font/otf",
};

/**
 * Same-origin proxy for the dashboard-picked typefaces. The media bucket
 * sends no CORS headers and the site CSP is `font-src 'self' data:`, so the
 * browser cannot load the file directly — it is fetched server-side and
 * re-served from this origin instead (same pattern as /api/writings/pdf).
 */
export async function GET(request: Request) {
	const src = new URL(request.url).searchParams.get("src");
	if (!src) {
		return new Response("Missing src parameter", { status: 400 });
	}

	if (!isAllowedSiteFontUrl(src)) {
		return new Response("Forbidden", { status: 403 });
	}

	let parsed: URL;
	try {
		parsed = new URL(src);
	} catch {
		return new Response("Forbidden", { status: 403 });
	}
	const mime =
		MIME_BY_EXT[parsed.pathname.split(".").pop()?.toLowerCase() ?? ""];
	if (!mime) {
		return new Response("Unsupported font format", { status: 415 });
	}

	try {
		const response = await fetch(src, {
			cache: "no-store",
			// The host allowlist is checked above, but fetch follows redirects by
			// default — an allowlisted origin returning 302 to 169.254.169.254 or
			// any internal address would otherwise be followed and proxied back.
			redirect: "manual",
			signal: AbortSignal.timeout(TIMEOUT_MS),
		});

		// With redirect: "manual" a 3xx arrives as an opaque response instead of
		// being followed; treat it as a refusal rather than passing it through.
		if (response.status >= 300 && response.status < 400) {
			return new Response("Forbidden", { status: 403 });
		}

		if (!response.ok) {
			return new Response("Not found", { status: response.status });
		}

		const declaredLength = Number.parseInt(
			response.headers.get("content-length") ?? "",
			10,
		);
		if (Number.isFinite(declaredLength) && declaredLength > MAX_BYTES) {
			return new Response("Font too large", { status: 413 });
		}

		const body = await response.arrayBuffer();
		if (body.byteLength > MAX_BYTES) {
			return new Response("Font too large", { status: 413 });
		}

		return new Response(body, {
			headers: {
				// Derived from the extension, not echoed from upstream — the bucket
				// may store the object as application/octet-stream, which nosniff
				// would then reject as a font.
				"Content-Type": mime,
				"Content-Length": String(body.byteLength),
				// S3 keys are generated per upload, so a given URL never changes
				// its content.
				"Cache-Control": "public, max-age=86400, stale-while-revalidate=604800",
				"X-Content-Type-Options": "nosniff",
			},
		});
	} catch {
		return new Response("Failed to fetch font", { status: 502 });
	}
}
