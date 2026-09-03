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

/**
 * The chips map for one page. No category → the full chips set as-is (its
 * insertion order is the chip order). A category page keeps its curated
 * built-in genre subset, but labels come from `labelLookup` so CMS renames
 * apply there too; a subset genre with no label anywhere is skipped rather
 * than drawn blank.
 */
export function getCategoryGenreLabels(
	categorySlug: WritingCategorySlug | null | undefined,
	chipLabels: Record<BookGenre, string>,
	labelLookup: Record<BookGenre, string> = chipLabels,
): Record<BookGenre, string> {
	if (categorySlug == null) {
		return chipLabels;
	}

	return Object.fromEntries(
		WRITING_CATEGORY_GENRES[categorySlug].flatMap((genre) => {
			const label = labelLookup[genre];
			return label ? [[genre, label] as const] : [];
		}),
	);
}
