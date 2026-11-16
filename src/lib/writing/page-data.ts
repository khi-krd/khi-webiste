import {
	getAllWritings,
	getWritingsListing,
	getWritingWriters,
	parseWritingsGenres,
} from "@/lib/api/writings";
import {
	buildWritingGridCards,
	getCategoryGenreLabels,
} from "@/lib/writing/catalog";
import {
	WRITING_CATEGORY_NAV_KEYS,
	WRITING_CATEGORY_SLUGS,
	type WritingCategorySlug,
} from "@/lib/writing/categories";
import { getWritingGenreLabelSets } from "@/lib/writing/genre-labels";
import { filterWritings } from "@/lib/writing/filter";
import { parseWritingsSort } from "@/lib/writings-url";

type TranslateFn = (
	key: string,
	values?: Record<string, string | number>,
) => string;

export type WritingsPageSearchParams = {
	genre?: string;
	q?: string;
	writer?: string;
	tag?: string;
	keyword?: string;
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
	const activeGenres = parseWritingsGenres(searchParams.genre);
	const activeQuery = searchParams.q?.trim() || null;
	// Blank terms would be a 400 upstream, so they never become active filters.
	const activeWriter = searchParams.writer?.trim() || null;
	const activeTag = searchParams.tag?.trim() || null;
	const activeKeyword = searchParams.keyword?.trim() || null;
	const activeSort = parseWritingsSort(searchParams.sort);
	const page = Math.max(1, Number.parseInt(searchParams.page ?? "1", 10) || 1);

	const categoryLabels = Object.fromEntries(
		WRITING_CATEGORY_SLUGS.map((slug) => [
			slug,
			navT(WRITING_CATEGORY_NAV_KEYS[slug]),
		]),
	) as Record<WritingCategorySlug, string>;

	const [genreLabelSets, listing, writers] = await Promise.all([
		getWritingGenreLabelSets(locale, t),
		getWritingsListing(locale, {
			categorySlug,
			genre: activeGenres,
			query: activeQuery,
			writer: activeWriter,
			tag: activeTag,
			keyword: activeKeyword,
			page,
			sort: activeSort,
		}),
		getWritingWriters(locale),
	]);

	const gridCards = buildWritingGridCards(listing.items);

	const gridTitle = categorySlug
		? categoryLabels[categorySlug]
		: t("grid.allTitle");

	// Per-genre counts for the جۆر panel — real numbers from the same cached
	// catalogue the listing uses, scoped to the current category only (search
	// terms don't shrink the counts, matching how topic counts behave).
	const genreCounts: Record<string, number> = {};
	for (const item of filterWritings(await getAllWritings(locale), {
		categorySlug,
	})) {
		for (const slug of item.genres) {
			genreCounts[slug] = (genreCounts[slug] ?? 0) + 1;
		}
	}

	const hasFilters = Boolean(
		activeGenres.length > 0 ||
			activeQuery ||
			activeWriter ||
			activeTag ||
			activeKeyword ||
			activeSort !== "newest",
	);

	return {
		activeGenres,
		genreCounts,
		activeQuery,
		activeWriter,
		activeTag,
		activeKeyword,
		activeSort,
		writers,
		gridCards,
		gridTitle,
		genreLabels: getCategoryGenreLabels(
			categorySlug,
			genreLabelSets.chipLabels,
			genreLabelSets.labelLookup,
		),
		listing,
		noResultsMessage: hasFilters ? t("grid.noResults") : t("grid.empty"),
		direction: (locale === "ckb" ? "rtl" : "ltr") as "ltr" | "rtl",
	};
}
