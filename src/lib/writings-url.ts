import {
	isWritingCategorySlug,
	type WritingCategorySlug,
} from "@/lib/writing/categories";
import type { WritingsSort } from "@/lib/writing/filter";
import { normalizeGenreSlug } from "@/lib/writing/genres";
import type { BookGenre } from "@/types/writing";

export type WritingsUrlParams = {
	category?: WritingCategorySlug | string | null;
	genre?: BookGenre | string | null;
	q?: string | null;
	writer?: string | null;
	tag?: string | null;
	keyword?: string | null;
	page?: number;
	sort?: WritingsSort | string | null;
};

function basePath(category?: WritingCategorySlug | string | null): string {
	if (category && isWritingCategorySlug(category)) {
		return `/writings/${category}`;
	}
	return "/writings";
}

export function buildWritingsHref({
	category,
	genre,
	q,
	writer,
	tag,
	keyword,
	page,
	sort,
}: WritingsUrlParams): string {
	const params = new URLSearchParams();
	const path = basePath(category);

	const genreSlug = normalizeGenreSlug(genre);
	if (genreSlug) {
		params.set("genre", genreSlug);
	}
	if (q?.trim()) {
		params.set("q", q.trim());
	}
	// Blank search terms are a 400 upstream, so they never reach the URL.
	if (writer?.trim()) {
		params.set("writer", writer.trim());
	}
	if (tag?.trim()) {
		params.set("tag", tag.trim());
	}
	if (keyword?.trim()) {
		params.set("keyword", keyword.trim());
	}
	if (page && page > 1) {
		params.set("page", String(page));
	}
	if (sort && sort !== "newest") {
		params.set("sort", sort);
	}

	const qs = params.toString();
	return qs ? `${path}?${qs}` : path;
}

export function parseWritingsSort(value?: string | null): WritingsSort {
	return value === "title" ? "title" : "newest";
}
