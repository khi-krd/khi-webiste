import {
	getGenresForCategory,
	type WritingCategorySlug,
} from "@/lib/writing/categories";
import { isBookGenre } from "@/lib/writing/genres";
import type { BookGenre, ResolvedWritingCard } from "@/types/writing";

export type WritingsSort = "newest" | "title";

export type WritingsFilterOptions = {
	categorySlug?: WritingCategorySlug | null;
	genre?: BookGenre | null;
	query?: string | null;
};

export function filterWritings(
	items: ResolvedWritingCard[],
	{ categorySlug, genre, query }: WritingsFilterOptions,
): ResolvedWritingCard[] {
	let result = items;

	const categoryGenres = getGenresForCategory(categorySlug);
	if (categoryGenres) {
		result = result.filter((item) =>
			item.genres.some((g) => categoryGenres.includes(g)),
		);
	}

	if (genre && isBookGenre(genre)) {
		result = result.filter((item) => item.genres.includes(genre));
	}

	const trimmedQuery = query?.trim().toLowerCase();
	if (trimmedQuery) {
		result = result.filter((item) => {
			const haystack = [
				item.title,
				item.writer,
				item.excerpt,
				item.seriesName,
				item.topicName,
				item.freeTextGenre,
			]
				.filter(Boolean)
				.join(" ")
				.toLowerCase();
			return haystack.includes(trimmedQuery);
		});
	}

	return result;
}

export function sortWritings(
	items: ResolvedWritingCard[],
	sort: WritingsSort = "newest",
): ResolvedWritingCard[] {
	const sorted = [...items];
	if (sort === "title") {
		sorted.sort((a, b) =>
			a.title.localeCompare(b.title, undefined, { sensitivity: "base" }),
		);
	} else {
		sorted.sort((a, b) => b.id - a.id);
	}
	return sorted;
}

export function paginateWritings(
	items: ResolvedWritingCard[],
	page: number,
	size: number,
): {
	items: ResolvedWritingCard[];
	totalPages: number;
	totalElements: number;
	currentPage: number;
	empty: boolean;
} {
	const totalElements = items.length;
	const totalPages = Math.max(1, Math.ceil(totalElements / size));
	const currentPage = Math.min(Math.max(1, page), totalPages);
	const start = (currentPage - 1) * size;
	const pageItems = items.slice(start, start + size);

	return {
		items: pageItems,
		totalPages,
		totalElements,
		currentPage,
		empty: pageItems.length === 0,
	};
}
