import {
	isWritingCategorySlug,
	type WritingCategorySlug,
} from "@/lib/writing/categories";
import { isBookGenre } from "@/lib/writing/genres";
import type { WritingsSort } from "@/lib/writing/filter";
import type { BookGenre } from "@/types/writing";

export type WritingsUrlParams = {
	category?: WritingCategorySlug | string | null;
	genre?: BookGenre | string | null;
	q?: string | null;
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
	page,
	sort,
}: WritingsUrlParams): string {
	const params = new URLSearchParams();
	const path = basePath(category);

	if (genre && isBookGenre(genre)) {
		params.set("genre", genre);
	}
	if (q?.trim()) {
		params.set("q", q.trim());
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
