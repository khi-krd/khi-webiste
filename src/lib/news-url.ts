export type NewsUrlParams = {
	category?: string | null;
	q?: string | null;
	page?: number;
};

export function buildNewsHref({
	category,
	q,
	page,
}: NewsUrlParams): "/news" | `/news?${string}` {
	const params = new URLSearchParams();

	if (category?.trim()) {
		params.set("category", category.trim());
	}
	if (q?.trim()) {
		params.set("q", q.trim());
	}
	if (page && page > 1) {
		params.set("page", String(page));
	}

	const qs = params.toString();
	return qs ? (`/news?${qs}` as const) : "/news";
}
