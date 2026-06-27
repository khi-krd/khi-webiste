import "server-only";
import {
	apiFetch,
	BULK_FETCH_SIZE,
	DEFAULT_REVALIDATE,
} from "@/lib/api/client";
import { getApiBaseUrl } from "@/lib/api/config";
import type { LatestUpdateItem } from "@/lib/mock/latest-updates";
import { getLatestUpdates as getMockLatestUpdates } from "@/lib/mock/latest-updates";
import {
	filterNews as filterNewsItems,
	getBentoNews as getMockBentoNews,
	getFeaturedNews as getMockFeaturedNews,
	getLatestNews as getMockLatestNews,
	getNews as getMockNews,
	getNewsBySlug as getMockNewsBySlug,
	isValidCategory,
	NEWS_CATEGORIES,
	NEWS_PER_PAGE,
	type NewsCategory,
	type NewsFilter,
	type NewsItem,
	paginateNews,
	SIDEBAR_ITEMS_LIMIT,
} from "@/lib/mock/news";
import { resolveNewsItem, resolveNewsItems } from "@/lib/news/resolve";
import type { News } from "@/types/news";
import { NewsPageSchema, NewsSchema } from "@/types/news";

const NEWS_ENDPOINT = "/api/v1/news";
const NEWS_TAG = "news";
const NEWS_FETCH_SIZE = 20;

export {
	isValidCategory,
	NEWS_CATEGORIES,
	NEWS_PER_PAGE,
	type NewsCategory,
	type NewsFilter,
	type NewsItem,
	paginateNews,
};

async function fetchNewsPage(
	searchParams: Record<string, string | number | undefined>,
): Promise<News[] | null> {
	const page = await apiFetch(NEWS_ENDPOINT, {
		schema: NewsPageSchema,
		tags: [NEWS_TAG],
		revalidate: DEFAULT_REVALIDATE,
		searchParams,
	});

	return page?.content.length ? page.content : null;
}

async function fetchNewsSearch(query: string): Promise<News[] | null> {
	const page = await apiFetch(`${NEWS_ENDPOINT}/search`, {
		schema: NewsPageSchema,
		tags: [NEWS_TAG],
		revalidate: DEFAULT_REVALIDATE,
		searchParams: { q: query, page: 0, size: NEWS_FETCH_SIZE },
	});

	return page?.content.length ? page.content : null;
}

async function getAllNewsRecords(
	locale: string,
	query?: string | null,
): Promise<NewsItem[]> {
	if (!getApiBaseUrl()) {
		return getMockNews(locale);
	}

	const raw = query?.trim()
		? await fetchNewsSearch(query.trim())
		: await fetchNewsPage({ page: 0, size: NEWS_FETCH_SIZE });

	if (!raw) {
		return getMockNews(locale);
	}

	const items = resolveNewsItems(locale, raw);
	return items.length > 0 ? items : getMockNews(locale);
}

export async function getNews(
	locale: string,
	query?: string | null,
): Promise<NewsItem[]> {
	return getAllNewsRecords(locale, query);
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

	return getMockNewsBySlug(locale, slug);
}

export async function getFeaturedNews(locale: string): Promise<NewsItem[]> {
	if (!getApiBaseUrl()) {
		return getMockFeaturedNews(locale);
	}

	const items = await getAllNewsRecords(locale);
	return items.slice(0, SIDEBAR_ITEMS_LIMIT);
}

export async function getLatestNews(locale: string): Promise<NewsItem[]> {
	if (!getApiBaseUrl()) {
		return getMockLatestNews(locale);
	}

	const items = await getAllNewsRecords(locale);
	return items.slice(0, SIDEBAR_ITEMS_LIMIT);
}

export async function getBentoNews(locale: string): Promise<{
	hero: NewsItem;
	rail: NewsItem[];
	editorial: NewsItem;
	wide: NewsItem;
}> {
	if (!getApiBaseUrl()) {
		return getMockBentoNews(locale);
	}

	const items = await getAllNewsRecords(locale);
	const [hero, railA, railB, railC, railD, editorial, , wide] = items;

	return {
		hero: hero ?? items[0],
		rail: [railA, railB, railC, railD].filter(
			(item): item is NewsItem => item != null,
		),
		editorial: editorial ?? items[0],
		wide: wide ?? items[items.length - 1] ?? items[0],
	};
}

function toLatestUpdateItem(item: NewsItem): LatestUpdateItem {
	return {
		id: item.id,
		slug: item.slug,
		title: item.title,
		excerpt: item.excerpt,
		category: item.category,
		image: item.image,
	};
}

const LATEST_UPDATES_COUNT = 8;

export async function getLatestUpdates(
	locale: string,
): Promise<LatestUpdateItem[]> {
	if (!getApiBaseUrl()) {
		return getMockLatestUpdates(locale);
	}

	const raw = await fetchNewsPage({ page: 0, size: LATEST_UPDATES_COUNT });
	const apiItems = raw
		? resolveNewsItems(locale, raw)
				.slice(0, LATEST_UPDATES_COUNT)
				.map(toLatestUpdateItem)
		: [];

	if (apiItems.length >= LATEST_UPDATES_COUNT) {
		return apiItems;
	}

	if (apiItems.length === 0) {
		return getMockLatestUpdates(locale);
	}

	return [...apiItems, ...getMockLatestUpdates(locale)].slice(
		0,
		LATEST_UPDATES_COUNT,
	);
}
