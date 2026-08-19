export type NewsUrlParams = {
	category?: string | null;
	subcategory?: string | null;
	tag?: string | null;
	keyword?: string | null;
	q?: string | null;
	page?: number;
};

export function buildNewsHref({
	category,
	subcategory,
	tag,
	keyword,
	q,
	page,
}: NewsUrlParams): "/news" | `/news?${string}` {
	const params = new URLSearchParams();

	if (category?.trim()) {
		params.set("category", category.trim());
	}
	if (subcategory?.trim()) {
		params.set("subcategory", subcategory.trim());
	}
	if (tag?.trim()) {
		params.set("tag", tag.trim());
	}
	if (keyword?.trim()) {
		params.set("keyword", keyword.trim());
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
