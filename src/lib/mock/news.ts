import type { LatestUpdateCategory } from "@/lib/mock/latest-updates";
import type { MediaItem, MediaKind } from "@/types/media";

// Formerly the demo news catalogue — now only the shared types, taxonomy
// constants and pure list helpers production code still imports. All records
// come from the CMS via `@/lib/api/news`.

export type NewsCategory = LatestUpdateCategory;

export const NEWS_CATEGORIES: NewsCategory[] = [
	"culture",
	"history",
	"language",
	"heritage",
	"society",
];

export type NewsItem = {
	id: string;
	slug: string;
	title: string;
	excerpt: string;
	/** Markdown or legacy HTML from the API — rendered on the detail page. */
	description?: string;
	/** Stable filter key (`category.ckbName` from API). */
	category: string;
	/** Localized label for display (from API bilingual names when available). */
	categoryLabel?: string;
	/** Stable filter key for `?subcategory=` (`subCategory.ckbName` from API). */
	subCategory?: string;
	subCategoryLabel?: string;
	publishedAt: string;
	featured?: boolean;
	author?: string;
	/** Where the news happened / was reported from — rendered in the masthead. */
	location?: string;
	readTime?: number;
	image: {
		url: string;
		alt?: string;
	};
	coverMediaType?: MediaKind | null;
	coverUrl?: string;
	coverThumbnailUrl?: string | null;
	mediaGallery?: MediaItem[];
	tags?: string[];
	keywords?: string[];
};

/** Filter chip option derived from the backend taxonomy. */
export type NewsCategoryOption = {
	key: string;
	label: string;
};

export const NEWS_PER_PAGE = 300;
export const SIDEBAR_ITEMS_LIMIT = 3;

export type NewsFilter = {
	category?: string | null;
	subcategory?: string | null;
	tag?: string | null;
	keyword?: string | null;
	query?: string | null;
};

export function isValidCategory(category: string): category is NewsCategory {
	return (NEWS_CATEGORIES as string[]).includes(category);
}

export function isKnownCategory(
	category: string,
	options: readonly NewsCategoryOption[],
): boolean {
	const key = category.trim();
	if (!key) {
		return false;
	}
	return options.some((option) => option.key === key);
}

export function newsItemCategoryLabel(
	item: Pick<NewsItem, "category" | "categoryLabel">,
	options?: readonly NewsCategoryOption[],
): string {
	if (item.categoryLabel?.trim()) {
		return item.categoryLabel.trim();
	}
	const match = options?.find((option) => option.key === item.category);
	return match?.label ?? item.category;
}

/** Card badge: subcategory is the more specific label — fall back to the category when absent. */
export function newsItemBadgeLabel(
	item: Pick<
		NewsItem,
		"category" | "categoryLabel" | "subCategory" | "subCategoryLabel"
	>,
	options?: readonly NewsCategoryOption[],
): string {
	if (item.subCategoryLabel?.trim()) {
		return item.subCategoryLabel.trim();
	}
	if (item.subCategory?.trim()) {
		return item.subCategory.trim();
	}
	return newsItemCategoryLabel(item, options);
}

/** Case-insensitive membership test for the localized tag/keyword collections. */
function hasTerm(terms: string[] | undefined, term: string): boolean {
	const needle = term.toLowerCase();
	return (terms ?? []).some((entry) => entry.trim().toLowerCase() === needle);
}

export function filterNews(
	items: NewsItem[],
	{ category, subcategory, tag, keyword, query }: NewsFilter,
): NewsItem[] {
	let result = items;

	if (category?.trim()) {
		const key = category.trim();
		result = result.filter(
			(item) => item.category === key || item.categoryLabel?.trim() === key,
		);
	}

	if (subcategory?.trim()) {
		const key = subcategory.trim();
		result = result.filter(
			(item) =>
				item.subCategory === key || item.subCategoryLabel?.trim() === key,
		);
	}

	if (tag?.trim()) {
		const key = tag.trim();
		result = result.filter((item) => hasTerm(item.tags, key));
	}

	if (keyword?.trim()) {
		const key = keyword.trim();
		result = result.filter((item) => hasTerm(item.keywords, key));
	}

	if (query?.trim()) {
		const q = query.trim().toLowerCase();
		result = result.filter(
			(item) =>
				item.title.toLowerCase().includes(q) ||
				item.excerpt.toLowerCase().includes(q) ||
				(item.tags ?? []).some((tag) => tag.toLowerCase().includes(q)),
		);
	}

	return result;
}

export function paginateNews<T>(
	items: T[],
	page: number,
	perPage: number = NEWS_PER_PAGE,
): { items: T[]; totalPages: number; currentPage: number } {
	const totalPages = Math.max(1, Math.ceil(items.length / perPage));
	const currentPage = Math.min(Math.max(1, page), totalPages);
	const start = (currentPage - 1) * perPage;

	return {
		items: items.slice(start, start + perPage),
		totalPages,
		currentPage,
	};
}

export function formatNewsDate(isoDate: string, locale: string): string {
	return new Intl.DateTimeFormat(locale === "ckb" ? "ar-IQ" : locale, {
		year: "numeric",
		month: "short",
		day: "numeric",
	}).format(new Date(isoDate));
}
