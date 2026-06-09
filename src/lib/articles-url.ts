import { isValidCategory } from "@/lib/mock/articles";

export type ArticlesUrlParams = {
	category?: string | null;
	q?: string | null;
	page?: number;
};

export function buildArticlesHref({
	category,
	q,
	page,
}: ArticlesUrlParams): "/articles" | `/articles?${string}` {
	const params = new URLSearchParams();

	if (category && isValidCategory(category)) {
		params.set("category", category);
	}
	if (q?.trim()) {
		params.set("q", q.trim());
	}
	if (page && page > 1) {
		params.set("page", String(page));
	}

	const qs = params.toString();
	return qs ? (`/articles?${qs}` as const) : "/articles";
}
