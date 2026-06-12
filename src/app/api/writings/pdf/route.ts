import { isAllowedRemotePdfUrl } from "@/lib/writing/pdf-url";

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
			next: { revalidate: 3600 },
		});

		if (!response.ok) {
			return new Response("Not found", { status: response.status });
		}

		const body = await response.arrayBuffer();
		return new Response(body, {
			headers: {
				"Content-Type":
					response.headers.get("content-type") ?? "application/pdf",
				"Cache-Control": "private, max-age=3600",
			},
		});
	} catch {
		return new Response("Failed to fetch PDF", { status: 502 });
	}
}
