import { isAllowedRemotePdfUrl } from "@/lib/writing/pdf-url";

export const dynamic = "force-dynamic";

/** Refuse anything larger than this; the viewer streams, but we still buffer. */
const MAX_BYTES = 50 * 1024 * 1024;

/** Give up on a slow origin rather than holding a server connection open. */
const TIMEOUT_MS = 20_000;

export async function GET(request: Request) {
	const src = new URL(request.url).searchParams.get("src");
	if (!src) {
		return new Response("Missing src parameter", { status: 400 });
	}

	if (!isAllowedRemotePdfUrl(src)) {
		return new Response("Forbidden", { status: 403 });
	}

	try {
		const response = await fetch(src, {
			headers: { Accept: "application/pdf" },
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

		// Only proxy actual PDFs. The upstream Content-Type was previously echoed
		// verbatim, which let an attacker-controlled object in the bucket be
		// served as same-origin HTML.
		const upstreamType = response.headers.get("content-type") ?? "";
		if (
			upstreamType &&
			!upstreamType.toLowerCase().includes("application/pdf")
		) {
			return new Response("Unsupported media type", { status: 415 });
		}

		const declaredLength = Number.parseInt(
			response.headers.get("content-length") ?? "",
			10,
		);
		if (Number.isFinite(declaredLength) && declaredLength > MAX_BYTES) {
			return new Response("PDF too large", { status: 413 });
		}

		const body = await response.arrayBuffer();
		// Re-check: Content-Length is advisory and may be absent or wrong.
		if (body.byteLength > MAX_BYTES) {
			return new Response("PDF too large", { status: 413 });
		}

		return new Response(body, {
			headers: {
				"Content-Type": "application/pdf",
				"Content-Length": String(body.byteLength),
				"Cache-Control": "private, no-cache, no-store, must-revalidate",
				"X-Content-Type-Options": "nosniff",
				// Render inline in the viewer, never execute as a document.
				"Content-Disposition": "inline",
			},
		});
	} catch {
		return new Response("Failed to fetch PDF", { status: 502 });
	}
}
