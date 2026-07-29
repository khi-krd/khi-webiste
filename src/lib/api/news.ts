import "server-only";
import { getTranslations } from "next-intl/server";
import {
	apiFetch,
	BULK_FETCH_SIZE,
	DEFAULT_REVALIDATE,
} from "@/lib/api/client";
import { getApiBaseUrl, getMockDataMode } from "@/lib/api/config";
import {
	applyMockPolicy,
	applyMockPolicyNullable,
} from "@/lib/api/mock-policy";
import type { LatestUpdateItem } from "@/lib/mock/latest-updates";
import { getLatestUpdates as getMockLatestUpdates } from "@/lib/mock/latest-updates";
import {
	filterNews as filterNewsItems,
	getNews as getMockNews,
	getNewsBySlug as getMockNewsBySlug,
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
	resolveNewsItem,
	resolveNewsItems,
} from "@/lib/news/resolve";
import type { News, NewsPage } from "@/types/news";
import { NewsPageSchema, NewsSchema } from "@/types/news";

const NEWS_ENDPOINT = "/api/v1/news";
const NEWS_TAG = "news";
const NEWS_FETCH_SIZE = 20;

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

async function getAllNewsRecords(
	locale: string,
	query?: string | null,
	category?: string | null,
): Promise<NewsItem[]> {
	let apiItems: NewsItem[] = [];

	if (getApiBaseUrl()) {
		const categoryName = category?.trim() || null;
		const searchQuery = query?.trim() || null;

		let raw: News[] | null = null;

		if (categoryName) {
			raw = await fetchNewsByCategory(categoryName);
			if (raw && searchQuery) {
				const q = searchQuery.toLowerCase();
				raw = raw.filter((item) => {
					const resolved = resolveNewsItem(locale, item);
					if (!resolved) {
						return false;
					}
					return (
						resolved.title.toLowerCase().includes(q) ||
						resolved.excerpt.toLowerCase().includes(q) ||
						(resolved.tags ?? []).some((tag) => tag.toLowerCase().includes(q))
					);
				});
			}
		} else if (searchQuery) {
			raw = await fetchNewsSearch(searchQuery);
		} else {
			const page = await fetchNewsPageResult({
				page: 0,
				size: NEWS_FETCH_SIZE,
			});
			raw = page?.content ?? null;
		}

		if (raw) {
			apiItems = resolveNewsItems(locale, raw);
		}
	}

	return applyMockPolicy({
		context: "global",
		apiItems,
		getMockItems: () => getMockNews(locale),
	});
}

export async function getNews(
	locale: string,
	query?: string | null,
	category?: string | null,
): Promise<NewsItem[]> {
	return getAllNewsRecords(locale, query, category);
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

	return applyMockPolicyNullable({
		apiValue: null,
		getMockValue: () => getMockNewsBySlug(locale, slug),
	});
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
	const getMockItems = () => getMockLatestUpdates(locale);

	if (!getApiBaseUrl()) {
		return applyMockPolicy({
			context: "home",
			apiItems: [],
			getMockItems,
			targetCount: LATEST_UPDATES_COUNT,
		});
	}

	const items = await fetchUniqueLatestNewsItems(locale, LATEST_UPDATES_COUNT);
	const apiItems = items ? items.map(toLatestUpdateItem) : [];

	return applyMockPolicy({
		context: "home",
		apiItems,
		getMockItems,
		targetCount: LATEST_UPDATES_COUNT,
	});
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

async function getMockNewsCategories(
	locale: string,
): Promise<NewsCategoryOption[]> {
	const t = await getTranslations({ locale, namespace: "News" });
	return NEWS_CATEGORIES.map((key) => ({
		key,
		label: t(`categories.${key}`),
	}));
}

/**
 * Category chips for the news filter UI.
 * Derived from backend `category.ckbName` / `category.kmrName` on news records
 * (News External has no dedicated categories list endpoint).
 */
export async function getNewsCategories(
	locale: string,
): Promise<NewsCategoryOption[]> {
	const mode = getMockDataMode();

	if (mode === "full" || !getApiBaseUrl()) {
		return getMockNewsCategories(locale);
	}

	const records = await fetchNewsPageResult({
		page: 0,
		size: BULK_FETCH_SIZE,
	});

	if (records?.content.length) {
		return collectCategoryOptions(locale, records.content);
	}

	// `off` / global: empty API → empty chips (no mock fallback)
	return [];
}
