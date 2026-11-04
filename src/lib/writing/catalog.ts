import type { WritingCategoryCarouselItem } from "@/components/writing/writing-category-carousel";
import type { WritingGridCardProps } from "@/components/writing/writing-grid-card";
import {
	WRITING_CATEGORY_GENRES,
	WRITING_CATEGORY_SLUGS,
	type WritingCategorySlug,
} from "@/lib/writing/categories";
import type {
	BookGenre,
	ResolvedSeriesBook,
	ResolvedWritingCard,
} from "@/types/writing";

export type WritingSeriesCard = WritingGridCardProps & {
	order: number;
	current: boolean;
};

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
		hoverCoverUrl: item.hoverCoverUrl,
		fileUrl: item.fileUrl,
	}));
}

/**
 * Series volumes as full catalogue cards — the /series endpoint only carries
 * id, title and position, so the card's cover/writer data is joined from the
 * (request-memoized) catalogue. A member missing from the catalogue still
 * renders, just without a cover.
 */
export function buildSeriesGridCards(
	books: ResolvedSeriesBook[],
	catalogue: ResolvedWritingCard[],
): WritingSeriesCard[] {
	const byId = new Map(catalogue.map((entry) => [entry.id, entry]));
	return books.map((book) => {
		const card = byId.get(book.id);
		return {
			id: book.id,
			title: card?.title ?? book.title,
			writer: card?.writer ?? "",
			coverUrl: card?.coverUrl ?? null,
			hoverCoverUrl: card?.hoverCoverUrl ?? null,
			fileUrl: card?.fileUrl ?? null,
			order: book.seriesOrder,
			current: book.isCurrent,
		};
	});
}

/**
 * The chips map for one page. No category → the full chips set as-is (its
 * insertion order is the chip order). A category page keeps only its curated
 * subset of the chips set — `chipLabels` already excludes genres no book
 * uses, so unused genres never surface here either; labels come from
 * `labelLookup` so CMS renames apply there too.
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
			if (!(genre in chipLabels)) {
				return [];
			}
			const label = labelLookup[genre];
			return label ? [[genre, label] as const] : [];
		}),
	);
}
