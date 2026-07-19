import type { WritingCategoryCarouselItem } from "@/components/writing/writing-category-carousel";
import type { WritingGridCardProps } from "@/components/writing/writing-grid-card";
import {
	WRITING_CATEGORY_GENRES,
	WRITING_CATEGORY_SLUGS,
	type WritingCategorySlug,
} from "@/lib/writing/categories";
import type { BookGenre, ResolvedWritingCard } from "@/types/writing";

export function buildCategoryCarouselItems(
	labels: Record<WritingCategorySlug, string>,
): WritingCategoryCarouselItem[] {
	return WRITING_CATEGORY_SLUGS.map((slug) => ({
		slug,
		label: labels[slug],
		href: `/writings/${slug}`,
	}));
}

export function buildWritingGridCards(
	items: ResolvedWritingCard[],
): WritingGridCardProps[] {
	return items.map((item) => ({
		id: item.id,
		title: item.title,
		writer: item.writer,
		coverUrl: item.coverUrl,
		seriesName: item.seriesName,
		topicName: item.topicName,
		fileUrl: item.fileUrl,
	}));
}

export function getCategoryGenreLabels(
	categorySlug: WritingCategorySlug | null | undefined,
	allGenreLabels: Record<BookGenre, string>,
): Record<BookGenre, string> {
	const genres =
		categorySlug != null
			? WRITING_CATEGORY_GENRES[categorySlug]
			: (Object.keys(allGenreLabels) as BookGenre[]);

	return Object.fromEntries(
		genres.map((genre) => [genre, allGenreLabels[genre]]),
	) as Record<BookGenre, string>;
}
