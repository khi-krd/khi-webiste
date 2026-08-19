import "server-only";
import {
	apiFetch,
	BULK_FETCH_SIZE,
	DEFAULT_REVALIDATE,
	sliceToCount,
} from "@/lib/api/client";
import { getApiBaseUrl } from "@/lib/api/config";
import type { LatestUpdateItem } from "@/lib/mock/latest-updates";
import {
	filterNews as filterNewsItems,
	isKnownCategory,
	isValidCategory,
	NEWS_CATEGORIES,
	NEWS_PER_PAGE,
	type NewsCategory,
	type NewsCategoryOption,
	type NewsFilter,
	type NewsItem,
	paginateNews,
	SIDEBAR_ITEMS_LIMIT,
} from "@/lib/mock/news";
import {
	dedupeNewsItems,
	mapToLatestUpdateCategory,
	resolveCategoryKey,
	resolveLocalizedTerms,
	resolveNewsItem,
	resolveNewsItems,
	resolveSubCategoryKey,
} from "@/lib/news/resolve";
import type { News, NewsPage } from "@/types/news";
import { NewsPageSchema, NewsSchema } from "@/types/news";

const NEWS_ENDPOINT = "/api/v1/news";
const NEWS_TAG = "news";
const NEWS_FETCH_SIZE = 20;
/** `language` is not enum-validated upstream — anything outside ckb/kmr ORs both. */
const NEWS_SEARCH_LANGUAGE = "both";
const NEWS_TERM_OPTIONS_LIMIT = 24;

export {
	isKnownCategory,
	isValidCategory,
	NEWS_CATEGORIES,
	NEWS_PER_PAGE,
	type NewsCategory,
	type NewsCategoryOption,
	type NewsFilter,
	type NewsItem,
	paginateNews,
};

async function fetchNewsPageResult(
	searchParams: Record<string, string | number | undefined>,
): Promise<NewsPage | null> {
	const page = await apiFetch(NEWS_ENDPOINT, {
		schema: NewsPageSchema,
		tags: [NEWS_TAG],
		revalidate: DEFAULT_REVALIDATE,
		searchParams,
	});

	return page?.content.length ? page : null;
}

async function fetchNewsSearch(query: string): Promise<News[] | null> {
	const page = await apiFetch(`${NEWS_ENDPOINT}/search`, {
		schema: NewsPageSchema,
		tags: [NEWS_TAG],
		revalidate: DEFAULT_REVALIDATE,
		searchParams: { q: query, page: 0, size: BULK_FETCH_SIZE },
	});

	return page?.content.length ? page.content : null;
}

/** `GET /api/v1/news/search/category?name=` — filter by category name (CKB or KMR). */
async function fetchNewsByCategory(name: string): Promise<News[] | null> {
	const page = await apiFetch(`${NEWS_ENDPOINT}/search/category`, {
		schema: NewsPageSchema,
		tags: [NEWS_TAG],
		revalidate: DEFAULT_REVALIDATE,
		searchParams: { name, page: 0, size: BULK_FETCH_SIZE },
	});

	return page?.content.length ? page.content : null;
}

/** `GET /api/v1/news/search/subcategory?name=` — filter by sub-category name. */
async function fetchNewsBySubCategory(name: string): Promise<News[] | null> {
	const page = await apiFetch(`${NEWS_ENDPOINT}/search/subcategory`, {
		schema: NewsPageSchema,
		tags: [NEWS_TAG],
		revalidate: DEFAULT_REVALIDATE,
		searchParams: { name, page: 0, size: BULK_FETCH_SIZE },
	});

	return page?.content.length ? page.content : null;
}

/** `GET /api/v1/news/search/tag?tag=` — exact match inside the tag collections. */
async function fetchNewsByTag(tag: string): Promise<News[] | null> {
	const page = await apiFetch(`${NEWS_ENDPOINT}/search/tag`, {
		schema: NewsPageSchema,
		tags: [NEWS_TAG],
		revalidate: DEFAULT_REVALIDATE,
		searchParams: {
			tag,
			language: NEWS_SEARCH_LANGUAGE,
			page: 0,
			size: BULK_FETCH_SIZE,
		},
	});

	return page?.content.length ? page.content : null;
}

/** `GET /api/v1/news/search/keyword?keyword=` — match inside the keyword collections. */
async function fetchNewsByKeyword(keyword: string): Promise<News[] | null> {
	const page = await apiFetch(`${NEWS_ENDPOINT}/search/keyword`, {
		schema: NewsPageSchema,
		tags: [NEWS_TAG],
		revalidate: DEFAULT_REVALIDATE,
		searchParams: {
			keyword,
			language: NEWS_SEARCH_LANGUAGE,
			page: 0,
			size: BULK_FETCH_SIZE,
		},
	});

	return page?.content.length ? page.content : null;
}

type UpstreamNewsSearch = {
	records: News[];
	/** Dimensions the endpoint did NOT apply — narrowed in memory afterwards. */
	remaining: NewsFilter;
};

/**
 * Send the most specific active dimension upstream.
 * There is no combined-filter endpoint, so exactly one filter reaches the API and
 * the others are re-applied in memory — otherwise a category+tag pair would render
 * as if the tag had been ignored.
 * Every term is trimmed and non-empty before it leaves here (blank ⇒ 400 upstream).
 */
async function searchNewsUpstream(
	filter: NewsFilter,
): Promise<UpstreamNewsSearch | null> {
	const subcategory = filter.subcategory?.trim();
	if (subcategory) {
		const records = await fetchNewsBySubCategory(subcategory);
		return records
			? { records, remaining: { ...filter, subcategory: null } }
			: null;
	}

	const category = filter.category?.trim();
	if (category) {
		const records = await fetchNewsByCategory(category);
		return records
			? { records, remaining: { ...filter, category: null } }
			: null;
	}

	const tag = filter.tag?.trim();
	if (tag) {
		const records = await fetchNewsByTag(tag);
		return records ? { records, remaining: { ...filter, tag: null } } : null;
	}

	const keyword = filter.keyword?.trim();
	if (keyword) {
		const records = await fetchNewsByKeyword(keyword);
		return records
			? { records, remaining: { ...filter, keyword: null } }
			: null;
	}

	const query = filter.query?.trim();
	if (query) {
		const records = await fetchNewsSearch(query);
		return records ? { records, remaining: { ...filter, query: null } } : null;
	}

	return null;
}

function hasActiveNewsFilter(filter: NewsFilter): boolean {
	return Boolean(
		filter.subcategory?.trim() ||
			filter.category?.trim() ||
			filter.tag?.trim() ||
			filter.keyword?.trim() ||
			filter.query?.trim(),
	);
}

async function getAllNewsRecords(
	locale: string,
	filter: NewsFilter = {},
): Promise<NewsItem[]> {
	if (!getApiBaseUrl()) {
		return [];
	}

	if (!hasActiveNewsFilter(filter)) {
		const page = await fetchNewsPageResult({
			page: 0,
			size: NEWS_FETCH_SIZE,
		});
		return page ? resolveNewsItems(locale, page.content) : [];
	}

	const upstream = await searchNewsUpstream(filter);
	if (upstream) {
		return filterNewsItems(
			resolveNewsItems(locale, upstream.records),
			upstream.remaining,
		);
	}

	// Endpoint matched nothing (or failed): narrow the bulk list with the FULL
	// filter so an unmatched term still renders an empty grid, never every article.
	const page = await fetchNewsPageResult({
		page: 0,
		size: BULK_FETCH_SIZE,
	});
	return page
		? filterNewsItems(resolveNewsItems(locale, page.content), filter)
		: [];
}

export async function getNews(
	locale: string,
	filter: NewsFilter = {},
): Promise<NewsItem[]> {
	return getAllNewsRecords(locale, filter);
}

export function filterNews(items: NewsItem[], filter: NewsFilter): NewsItem[] {
	return filterNewsItems(items, filter);
}

export async function getNewsBySlug(
	locale: string,
	slug: string,
): Promise<{
	item: NewsItem;
	previous: NewsItem | null;
	next: NewsItem | null;
} | null> {
	const numericId = Number.parseInt(slug, 10);
	const isNumericSlug =
		Number.isInteger(numericId) && numericId > 0 && String(numericId) === slug;

	if (getApiBaseUrl() && isNumericSlug) {
		const detail = await apiFetch(`${NEWS_ENDPOINT}/${numericId}`, {
			schema: NewsSchema,
			tags: [NEWS_TAG, `news-${numericId}`],
			revalidate: DEFAULT_REVALIDATE,
		});

		if (detail) {
			const item = resolveNewsItem(locale, detail);
			if (item) {
				const allItems = await getAllNewsRecords(locale);
				const index = allItems.findIndex((entry) => entry.slug === slug);
				return {
					item,
					previous: index > 0 ? allItems[index - 1] : null,
					next:
						index >= 0 && index < allItems.length - 1
							? allItems[index + 1]
							: null,
				};
			}
		}
	}

	return null;
}

const RELATED_NEWS_LIMIT = 3;

/**
 * Other news sharing tags with the current article (falls back to same category).
 * Excludes the current item and optional prev/next neighbors; ranks by shared-tag
 * count, then category match.
 */
export async function getRelatedNews(
	locale: string,
	item: NewsItem,
	options?: {
		limit?: number;
		excludeIds?: ReadonlyArray<string>;
	},
): Promise<NewsItem[]> {
	const limit = options?.limit ?? RELATED_NEWS_LIMIT;
	const allItems = await getAllNewsRecords(locale);
	const exclude = new Set<string>([item.id, ...(options?.excludeIds ?? [])]);
	const tagSet = new Set(
		(item.tags ?? []).map((tag) => tag.trim().toLowerCase()).filter(Boolean),
	);

	const ranked = allItems
		.filter((entry) => !exclude.has(entry.id))
		.map((entry) => {
			const sharedTags = (entry.tags ?? []).filter((tag) =>
				tagSet.has(tag.trim().toLowerCase()),
			).length;
			const sameCategory = entry.category === item.category ? 1 : 0;
			return {
				entry,
				score: sharedTags * 10 + sameCategory,
			};
		})
		.filter(({ score }) => score > 0)
		.sort((a, b) => {
			if (b.score !== a.score) {
				return b.score - a.score;
			}
			return (
				new Date(b.entry.publishedAt).getTime() -
				new Date(a.entry.publishedAt).getTime()
			);
		});

	return ranked.slice(0, limit).map(({ entry }) => entry);
}

export async function getFeaturedNews(locale: string): Promise<NewsItem[]> {
	const items = await getAllNewsRecords(locale);
	return items.slice(0, SIDEBAR_ITEMS_LIMIT);
}

export async function getLatestNews(locale: string): Promise<NewsItem[]> {
	const items = await getAllNewsRecords(locale);
	return items.slice(0, SIDEBAR_ITEMS_LIMIT);
}

export async function getBentoNews(locale: string): Promise<{
	hero: NewsItem | null;
	rail: NewsItem[];
	editorial: NewsItem | null;
	wide: NewsItem | null;
}> {
	const items = await getAllNewsRecords(locale);

	return {
		hero: items[0] ?? null,
		rail: items.slice(1, 5),
		editorial: items[5] ?? null,
		wide: items[7] ?? null,
	};
}

function toLatestUpdateItem(item: NewsItem): LatestUpdateItem {
	return {
		id: item.id,
		slug: item.slug,
		title: item.title,
		excerpt: item.excerpt,
		category: mapToLatestUpdateCategory(item.categoryLabel ?? item.category),
		image: item.image,
	};
}

const LATEST_UPDATES_COUNT = 8;
const LATEST_UPDATES_MAX_PAGES = 3;

async function fetchUniqueLatestNewsItems(
	locale: string,
	targetCount: number,
): Promise<NewsItem[] | null> {
	let collected: NewsItem[] = [];

	for (let page = 0; page < LATEST_UPDATES_MAX_PAGES; page++) {
		const pageData = await fetchNewsPageResult({
			page,
			size: targetCount,
		});
		if (!pageData) {
			break;
		}

		collected = dedupeNewsItems([
			...collected,
			...resolveNewsItems(locale, pageData.content),
		]);

		if (collected.length >= targetCount) {
			return collected.slice(0, targetCount);
		}

		const isLastPage =
			pageData.empty === true ||
			page >= pageData.totalPages - 1 ||
			pageData.content.length < targetCount;

		if (isLastPage) {
			break;
		}
	}

	return collected.length > 0 ? collected : null;
}

export async function getLatestUpdates(
	locale: string,
): Promise<LatestUpdateItem[]> {
	if (!getApiBaseUrl()) {
		return sliceToCount([], LATEST_UPDATES_COUNT);
	}

	const items = await fetchUniqueLatestNewsItems(locale, LATEST_UPDATES_COUNT);
	const apiItems = items ? items.map(toLatestUpdateItem) : [];

	return sliceToCount(apiItems, LATEST_UPDATES_COUNT);
}

function collectCategoryOptions(
	locale: string,
	records: News[],
): NewsCategoryOption[] {
	const map = new Map<string, NewsCategoryOption>();

	for (const news of records) {
		const key = resolveCategoryKey(news);
		if (!key) {
			continue;
		}

		const label =
			locale === "ckb"
				? news.category?.ckbName?.trim() ||
					news.category?.kmrName?.trim() ||
					key
				: news.category?.kmrName?.trim() ||
					news.category?.ckbName?.trim() ||
					key;

		if (!map.has(key)) {
			map.set(key, { key, label });
		}
	}

	return [...map.values()].sort((a, b) =>
		a.label.localeCompare(b.label, locale === "ckb" ? "ckb" : "ku"),
	);
}

function collectSubCategoryOptions(
	locale: string,
	records: News[],
): NewsCategoryOption[] {
	const map = new Map<string, NewsCategoryOption>();

	for (const news of records) {
		const key = resolveSubCategoryKey(news);
		if (!key) {
			continue;
		}

		const label =
			locale === "ckb"
				? news.subCategory?.ckbName?.trim() ||
					news.subCategory?.kmrName?.trim() ||
					key
				: news.subCategory?.kmrName?.trim() ||
					news.subCategory?.ckbName?.trim() ||
					key;

		if (!map.has(key)) {
			map.set(key, { key, label });
		}
	}

	return [...map.values()].sort((a, b) =>
		a.label.localeCompare(b.label, locale === "ckb" ? "ckb" : "ku"),
	);
}

/**
 * Flatten a bilingual string set into localized chip labels.
 * Blank entries are dropped here so a chip can never send an empty term (⇒ 400).
 */
function collectTermOptions(
	locale: string,
	records: News[],
	pick: (news: News) => { ckb: string[]; kmr: string[] } | undefined,
): string[] {
	const map = new Map<string, string>();

	for (const news of records) {
		for (const term of resolveLocalizedTerms(locale, pick(news))) {
			const value = term.trim();
			if (!value) {
				continue;
			}
			const key = value.toLocaleLowerCase();
			if (!map.has(key)) {
				map.set(key, value);
			}
		}
	}

	return [...map.values()]
		.sort((a, b) => a.localeCompare(b, locale === "ckb" ? "ckb" : "ku"))
		.slice(0, NEWS_TERM_OPTIONS_LIMIT);
}

export type NewsFilterOptions = {
	categories: NewsCategoryOption[];
	subCategories: NewsCategoryOption[];
	tags: string[];
	keywords: string[];
};

/** Fresh arrays per call — the result is handed straight to client components. */
function emptyNewsFilterOptions(): NewsFilterOptions {
	return { categories: [], subCategories: [], tags: [], keywords: [] };
}

/**
 * Every filter chip on `/news`, derived from one bulk page.
 * News External exposes no taxonomy list endpoints, and `/news` already issues
 * several list fetches per render — so all four dimensions share this single page.
 */
export async function getNewsFilterOptions(
	locale: string,
): Promise<NewsFilterOptions> {
	if (!getApiBaseUrl()) {
		return emptyNewsFilterOptions();
	}

	const records = await fetchNewsPageResult({
		page: 0,
		size: BULK_FETCH_SIZE,
	});

	if (!records?.content.length) {
		// `off` / global: empty API → empty chips (no mock fallback)
		return emptyNewsFilterOptions();
	}

	return {
		categories: collectCategoryOptions(locale, records.content),
		subCategories: collectSubCategoryOptions(locale, records.content),
		tags: collectTermOptions(locale, records.content, (news) => news.tags),
		keywords: collectTermOptions(
			locale,
			records.content,
			(news) => news.keywords,
		),
	};
}

/**
 * Category chips for the news filter UI.
 * Derived from backend `category.ckbName` / `category.kmrName` on news records
 * (News External has no dedicated categories list endpoint).
 */
export async function getNewsCategories(
	locale: string,
): Promise<NewsCategoryOption[]> {
	return (await getNewsFilterOptions(locale)).categories;
}
