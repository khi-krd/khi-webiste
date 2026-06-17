import { getWritingsListing, parseWritingsGenre } from "@/lib/api/writings";
import {
	buildCategoryCarouselItems,
	buildWritingGridCards,
	getCategoryGenreLabels,
} from "@/lib/writing/catalog";
import {
	WRITING_CATEGORY_NAV_KEYS,
	WRITING_CATEGORY_SLUGS,
	type WritingCategorySlug,
} from "@/lib/writing/categories";
import { BOOK_GENRES } from "@/lib/writing/genres";
import { parseWritingsSort } from "@/lib/writings-url";
import type { BookGenre } from "@/types/writing";

type TranslateFn = (
	key: string,
	values?: Record<string, string | number>,
) => string;

export type WritingsPageSearchParams = {
	genre?: string;
	q?: string;
	page?: string;
	sort?: string;
};

export async function loadWritingsPageData(
	locale: string,
	t: TranslateFn,
	navT: TranslateFn,
	{
		categorySlug = null,
		searchParams = {},
	}: {
		categorySlug?: WritingCategorySlug | null;
		searchParams?: WritingsPageSearchParams;
	},
) {
	const activeGenre = parseWritingsGenre(searchParams.genre);
	const activeQuery = searchParams.q?.trim() || null;
	const activeSort = parseWritingsSort(searchParams.sort);
	const page = Math.max(1, Number.parseInt(searchParams.page ?? "1", 10) || 1);

	const allGenreLabels = Object.fromEntries(
		BOOK_GENRES.map((genre) => [genre, t(`genres.${genre}`)]),
	) as Record<BookGenre, string>;

	const categoryLabels = Object.fromEntries(
		WRITING_CATEGORY_SLUGS.map((slug) => [
			slug,
			navT(WRITING_CATEGORY_NAV_KEYS[slug]),
		]),
	) as Record<WritingCategorySlug, string>;

	const listing = await getWritingsListing(locale, {
		categorySlug,
		genre: activeGenre,
		query: activeQuery,
		page,
		sort: activeSort,
	});

	const gridCards = buildWritingGridCards(listing.items, {
		translateGenre: (genre) => t(`genres.${genre}`),
		instituteBadgeLabel: t("carousel.instituteBadge"),
		downloadLabel: t("carousel.download"),
		pagesCountLabel: (count) => t("carousel.pagesCount", { count }),
	});

	const categoryCarouselItems = buildCategoryCarouselItems(categoryLabels);

	const gridTitle = categorySlug
		? categoryLabels[categorySlug]
		: t("grid.allTitle");

	const hasFilters = Boolean(
		activeGenre || activeQuery || activeSort !== "newest",
	);

	return {
		activeGenre,
		activeQuery,
		activeSort,
		gridCards,
		categoryCarouselItems,
		gridTitle,
		genreLabels: getCategoryGenreLabels(categorySlug, allGenreLabels),
		listing,
		noResultsMessage: hasFilters ? t("grid.noResults") : t("grid.empty"),
		direction: (locale === "ckb" ? "rtl" : "ltr") as "ltr" | "rtl",
	};
}
