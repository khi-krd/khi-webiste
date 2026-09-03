import "server-only";
import { cache } from "react";
import {
	apiFetch,
	apiFetchPage,
	apiFetchRaw,
	BULK_FETCH_SIZE,
	DEFAULT_REVALIDATE,
	type ParsedApiPage,
	sliceToCount,
	unwrapApiPayload,
} from "@/lib/api/client";
import { getApiBaseUrl } from "@/lib/api/config";
import {
	normalizeSeriesBookRecord,
	normalizeWritingRecord,
} from "@/lib/api/normalize";
import type { WritingCategorySlug } from "@/lib/writing/categories";
import {
	filterWritings,
	paginateWritings,
	sortWritings,
	type WritingsSort,
} from "@/lib/writing/filter";
import { normalizeGenreSlug } from "@/lib/writing/genres";
import {
	resolveSeriesBooks,
	resolveWritingCard,
	resolveWritingDetail,
} from "@/lib/writing/resolve";
import type { BookGenre, BookGenreRecord, Writing } from "@/types/writing";
import {
	BookGenreRecordListSchema,
	type ResolvedSeriesBook,
	type ResolvedWritingCard,
	type ResolvedWritingDetail,
	SeriesResponseSchema,
	WritingSchema,
} from "@/types/writing";

const WRITINGS_ENDPOINT = "/api/v1/writings";
const BOOK_GENRES_ENDPOINT = "/api/v1/book-genres";
const WRITINGS_TAG = "writings";

/** The search endpoints cap `size` at 100, unlike the plain list. */
const WRITINGS_SEARCH_SIZE = 100;

export const WRITINGS_PER_PAGE = 4;
export const WRITINGS_CAROUSEL_SIZE = 12;
export const WRITINGS_GRID_PAGE_SIZE = 8;

export type WritingsListResult = {
	items: ResolvedWritingCard[];
	totalPages: number;
	totalElements: number;
	currentPage: number;
	empty: boolean;
};

export type WritingsListingOptions = {
	categorySlug?: WritingCategorySlug | null;
	genre?: BookGenre | null;
	query?: string | null;
	writer?: string | null;
	tag?: string | null;
	keyword?: string | null;
	page?: number;
	sort?: WritingsSort;
	size?: number;
};

/** Fetches a single batch of writings for the autoplay carousel (no URL pagination). */
export async function getWritingsCarousel(
	locale: string,
	size = WRITINGS_CAROUSEL_SIZE,
): Promise<ResolvedWritingCard[]> {
	let apiItems: ResolvedWritingCard[] = [];

	if (getApiBaseUrl()) {
		const data = await apiFetchPage(WRITINGS_ENDPOINT, {
			itemSchema: WritingSchema,
			tags: [WRITINGS_TAG],
			revalidate: DEFAULT_REVALIDATE,
			searchParams: { page: 0, size },
			normalizeItem: normalizeWritingRecord,
		});

		if (data) {
			apiItems = data.content
				.map((writing) => resolveWritingCard(locale, writing))
				.filter((item): item is ResolvedWritingCard => item != null);
		}
	}

	return sliceToCount(apiItems, size);
}

async function fetchAllWritingsFromApi(
	locale: string,
): Promise<ResolvedWritingCard[] | null> {
	const page = await apiFetchPage(WRITINGS_ENDPOINT, {
		itemSchema: WritingSchema,
		tags: [WRITINGS_TAG],
		revalidate: DEFAULT_REVALIDATE,
		searchParams: { page: 0, size: BULK_FETCH_SIZE },
		normalizeItem: normalizeWritingRecord,
	});

	if (!page?.content.length) {
		return null;
	}

	const items = page.content
		.map((writing) => resolveWritingCard(locale, writing))
		.filter((item): item is ResolvedWritingCard => item != null);

	return items.length > 0 ? items : null;
}

/**
 * `language: "both"` keeps records whose match sits in the other language
 * column — resolveWritingCard renders those through its own fallback.
 */
function fetchWritingsSearchPage(
	path: string,
	searchParams: Record<string, string>,
): Promise<ParsedApiPage<Writing> | null> {
	return apiFetchPage(path, {
		itemSchema: WritingSchema,
		tags: [WRITINGS_TAG],
		revalidate: DEFAULT_REVALIDATE,
		searchParams: {
			...searchParams,
			language: "both",
			page: 0,
			size: WRITINGS_SEARCH_SIZE,
		},
		normalizeItem: normalizeWritingRecord,
	});
}

function fetchWritingsByWriter(
	name: string,
): Promise<ParsedApiPage<Writing> | null> {
	return fetchWritingsSearchPage(`${WRITINGS_ENDPOINT}/search/writer`, {
		name,
	});
}

function fetchWritingsByTag(
	tag: string,
): Promise<ParsedApiPage<Writing> | null> {
	return fetchWritingsSearchPage(`${WRITINGS_ENDPOINT}/search/tag`, { tag });
}

function fetchWritingsByKeyword(
	keyword: string,
): Promise<ParsedApiPage<Writing> | null> {
	return fetchWritingsSearchPage(`${WRITINGS_ENDPOINT}/search/keyword`, {
		keyword,
	});
}

/**
 * Returns the full writings set for client-side filter/sort/paginate. Memoized
 * per request so the listing and its writer options share one round-trip.
 */
export const getAllWritings = cache(
	async (locale: string): Promise<ResolvedWritingCard[]> => {
		const apiItems = (await fetchAllWritingsFromApi(locale)) ?? [];
		return apiItems;
	},
);

/** Writer names offered by the listing filter, deduped across the catalogue. */
export async function getWritingWriters(locale: string): Promise<string[]> {
	const names = new Set<string>();
	for (const item of await getAllWritings(locale)) {
		const name = item.writer.trim();
		if (name) {
			names.add(name);
		}
	}
	return [...names].sort((a, b) => a.localeCompare(b));
}

/**
 * Server-side pass for the dimensions the backend owns. Every active dimension
 * is fetched and the id sets intersected: a priority chain would silently drop
 * the loser, because ResolvedWritingCard carries neither tags nor keywords to
 * re-apply in memory. Returns null when a call fails so the caller can fall
 * back — an empty page is an authoritative "nothing matched", not a failure.
 */
async function searchWritingRecords(
	locale: string,
	{ categorySlug, genre, query, writer, tag, keyword }: WritingsListingOptions,
): Promise<ResolvedWritingCard[] | null> {
	if (!getApiBaseUrl()) {
		return null;
	}

	// A blank term is a 400 upstream, so a dimension only ships once it has text.
	const searches: Promise<ParsedApiPage<Writing> | null>[] = [];
	if (writer?.trim()) {
		searches.push(fetchWritingsByWriter(writer.trim()));
	}
	if (tag?.trim()) {
		searches.push(fetchWritingsByTag(tag.trim()));
	}
	if (keyword?.trim()) {
		searches.push(fetchWritingsByKeyword(keyword.trim()));
	}
	if (searches.length === 0) {
		return null;
	}

	let matched: Map<number, ResolvedWritingCard> | null = null;
	for (const page of await Promise.all(searches)) {
		if (!page) {
			return null;
		}

		const cards = new Map<number, ResolvedWritingCard>();
		for (const writing of page.content) {
			const card = resolveWritingCard(locale, writing);
			if (card) {
				cards.set(card.id, card);
			}
		}

		if (matched == null) {
			matched = cards;
			continue;
		}

		// Intersect in place — each extra dimension narrows the same set.
		for (const id of [...matched.keys()]) {
			if (!cards.has(id)) {
				matched.delete(id);
			}
		}
	}

	return filterWritings(matched ? [...matched.values()] : [], {
		categorySlug,
		genre,
		query,
	});
}

function emptyWritingsPage(currentPage: number): WritingsListResult {
	return {
		items: [],
		totalPages: 1,
		totalElements: 0,
		currentPage,
		empty: true,
	};
}

export async function getWritingsListing(
	locale: string,
	{
		categorySlug,
		genre,
		query,
		writer,
		tag,
		keyword,
		page = 1,
		sort = "newest",
		size = WRITINGS_GRID_PAGE_SIZE,
	}: WritingsListingOptions = {},
): Promise<WritingsListResult> {
	const searched =
		writer?.trim() || tag?.trim() || keyword?.trim()
			? await searchWritingRecords(locale, {
					categorySlug,
					genre,
					query,
					writer,
					tag,
					keyword,
				})
			: null;

	// Cards carry both dialects' tags/keywords, so an upstream failure still
	// narrows by every active dimension rather than dumping the whole catalogue.
	const filtered =
		searched ??
		filterWritings(await getAllWritings(locale), {
			categorySlug,
			genre,
			query,
			writer,
			tag,
			keyword,
		});
	const sorted = sortWritings(filtered, sort);
	return paginateWritings(sorted, page, size);
}

export async function getWritingsPage(
	locale: string,
	page = 1,
	size = WRITINGS_PER_PAGE,
): Promise<WritingsListResult> {
	const currentPage = Math.max(1, page);
	if (!getApiBaseUrl()) {
		return emptyWritingsPage(currentPage);
	}

	const data = await apiFetchPage(WRITINGS_ENDPOINT, {
		itemSchema: WritingSchema,
		tags: [WRITINGS_TAG],
		revalidate: DEFAULT_REVALIDATE,
		searchParams: { page: currentPage - 1, size },
		normalizeItem: normalizeWritingRecord,
	});

	const apiItems = data
		? data.content
				.map((writing) => resolveWritingCard(locale, writing))
				.filter((item): item is ResolvedWritingCard => item != null)
		: [];
	const items = apiItems;

	if (items.length === 0) {
		return emptyWritingsPage(currentPage);
	}

	return {
		items,
		totalPages: Math.max(data?.totalPages ?? 1, 1),
		totalElements: data?.totalElements ?? items.length,
		currentPage,
		empty: data?.empty ?? items.length === 0,
	};
}

export function parseWritingsGenre(value?: string | null): BookGenre | null {
	return normalizeGenreSlug(value);
}

/**
 * Editor-managed genre rows. The public GET already returns active rows only,
 * sorted by displayOrder; a missing endpoint (not deployed yet), a failed
 * request and an empty table all resolve to [] — callers then fall back to
 * the built-in genre set.
 */
export async function getBookGenres(): Promise<BookGenreRecord[]> {
	if (!getApiBaseUrl()) {
		return [];
	}

	const genres = await apiFetch(BOOK_GENRES_ENDPOINT, {
		schema: BookGenreRecordListSchema,
		tags: [WRITINGS_TAG, "book-genres"],
		revalidate: DEFAULT_REVALIDATE,
	});

	return genres ?? [];
}

export type WritingDetailLabels = {
	ckbLanguage: string;
	kmrLanguage: string;
};

export async function getWritingById(
	locale: string,
	id: number,
	labels: WritingDetailLabels,
): Promise<ResolvedWritingDetail | null> {
	let apiDetail: ResolvedWritingDetail | null = null;

	if (getApiBaseUrl()) {
		const raw = await apiFetchRaw(`${WRITINGS_ENDPOINT}/${id}`, {
			tags: [WRITINGS_TAG, `writing-${id}`],
			revalidate: DEFAULT_REVALIDATE,
		});
		const unwrapped = unwrapApiPayload(raw);
		const parsed = unwrapped
			? WritingSchema.safeParse(normalizeWritingRecord(unwrapped))
			: null;

		if (parsed?.success) {
			const resolved = resolveWritingDetail(locale, parsed.data, labels);
			if (resolved?.id === id) {
				apiDetail = resolved;
			}
		}
	}

	return apiDetail;
}

export async function getWritingSeriesBooks(
	locale: string,
	seriesId: string,
	currentId: number,
): Promise<ResolvedSeriesBook[]> {
	let apiBooks: ResolvedSeriesBook[] = [];

	if (getApiBaseUrl()) {
		const raw = await apiFetchRaw(
			`${WRITINGS_ENDPOINT}/series/${encodeURIComponent(seriesId)}`,
			{
				tags: [WRITINGS_TAG, `writing-series-${seriesId}`],
				revalidate: DEFAULT_REVALIDATE,
			},
		);

		const unwrapped = unwrapApiPayload(raw);
		const record =
			unwrapped && typeof unwrapped === "object"
				? (unwrapped as Record<string, unknown>)
				: null;
		const books = Array.isArray(record?.books)
			? record.books.map(normalizeSeriesBookRecord)
			: [];
		const parsed = record
			? SeriesResponseSchema.safeParse({ ...record, books })
			: null;

		if (parsed?.success) {
			apiBooks = resolveSeriesBooks(locale, parsed.data.books, currentId);
		}
	}

	return apiBooks;
}

const RELATED_WRITINGS_LIMIT = 4;

/** Prev/next neighbours in the catalogue (newest-first order). */
export async function getWritingNeighbors(
	locale: string,
	id: number,
): Promise<{
	previous: ResolvedWritingCard | null;
	next: ResolvedWritingCard | null;
}> {
	const allItems = sortWritings(await getAllWritings(locale), "newest");
	const index = allItems.findIndex((item) => item.id === id);
	if (index < 0) {
		return { previous: null, next: null };
	}
	return {
		previous: index > 0 ? (allItems[index - 1] ?? null) : null,
		next: index < allItems.length - 1 ? (allItems[index + 1] ?? null) : null,
	};
}

/**
 * Related catalogue cards ranked by shared genres, topic, series, and
 * free-text genre vs detail tags/keywords. Fills with recent peers when scarce.
 */
export async function getRelatedWritings(
	locale: string,
	detail: ResolvedWritingDetail,
	options?: {
		limit?: number;
		excludeIds?: ReadonlyArray<number>;
	},
): Promise<ResolvedWritingCard[]> {
	const limit = options?.limit ?? RELATED_WRITINGS_LIMIT;
	const allItems = await getAllWritings(locale);
	const exclude = new Set<number>([detail.id, ...(options?.excludeIds ?? [])]);
	const tagSet = new Set(
		[...detail.tags, ...detail.keywords]
			.map((tag) => tag.trim().toLowerCase())
			.filter(Boolean),
	);
	const genreSet = new Set(detail.genres);
	const topicKey = detail.topicName?.trim().toLowerCase() ?? "";
	const seriesKey = detail.seriesName?.trim().toLowerCase() ?? "";

	const ranked = allItems
		.filter((entry) => !exclude.has(entry.id))
		.map((entry) => {
			const sharedGenres = entry.genres.filter((genre) =>
				genreSet.has(genre),
			).length;
			const freeTextMatch =
				entry.freeTextGenre != null &&
				tagSet.has(entry.freeTextGenre.trim().toLowerCase())
					? 1
					: 0;
			const sameTopic =
				topicKey.length > 0 &&
				entry.topicName?.trim().toLowerCase() === topicKey
					? 1
					: 0;
			const sameSeries =
				seriesKey.length > 0 &&
				entry.seriesName?.trim().toLowerCase() === seriesKey
					? 1
					: 0;
			return {
				entry,
				score:
					sharedGenres * 8 +
					freeTextMatch * 10 +
					sameTopic * 5 +
					sameSeries * 8,
			};
		})
		.sort((a, b) => {
			if (b.score !== a.score) {
				return b.score - a.score;
			}
			return b.entry.id - a.entry.id;
		});

	const results: ResolvedWritingCard[] = [];
	const used = new Set(exclude);

	for (const { entry, score } of ranked) {
		if (results.length >= limit) {
			break;
		}
		if (score <= 0 || used.has(entry.id)) {
			continue;
		}
		results.push(entry);
		used.add(entry.id);
	}

	if (results.length < limit) {
		for (const item of sortWritings(allItems, "newest")) {
			if (results.length >= limit) {
				break;
			}
			if (used.has(item.id)) {
				continue;
			}
			results.push(item);
			used.add(item.id);
		}
	}

	return results;
}
