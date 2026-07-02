export type GalleryUrlParams = {
	q?: string | null;
	page?: number;
};

export function buildGalleryHref({
	q,
	page,
}: GalleryUrlParams = {}): "/gallery" | `/gallery?${string}` {
	const params = new URLSearchParams();

	if (q?.trim()) {
		params.set("q", q.trim());
	}
	if (page && page > 1) {
		params.set("page", String(page));
	}

	const qs = params.toString();
	return qs ? (`/gallery?${qs}` as const) : "/gallery";
}
