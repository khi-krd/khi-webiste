import "server-only";
import {
	apiFetch,
	BULK_FETCH_SIZE,
	DEFAULT_REVALIDATE,
} from "@/lib/api/client";
import { getApiBaseUrl } from "@/lib/api/config";
import {
	getDemoWritingById,
	getDemoWritingSeries,
} from "@/lib/mock/writing-detail";
import {
	getAllDemoWritingCards,
	getDemoWritingCards,
} from "@/lib/mock/writing-page";
import type { WritingCategorySlug } from "@/lib/writing/categories";
import {
	filterWritings,
	paginateWritings,
	sortWritings,
	type WritingsSort,
} from "@/lib/writing/filter";
import { isBookGenre } from "@/lib/writing/genres";
import {
	resolveSeriesBooks,
	resolveWritingCard,
	resolveWritingDetail,
} from "@/lib/writing/resolve";
import type { BookGenre } from "@/types/writing";
import {
	type ResolvedSeriesBook,
	type ResolvedWritingCard,
	type ResolvedWritingDetail,
	SeriesResponseSchema,
	WritingSchema,
	WritingsPageSchema,
} from "@/types/writing";

const WRITINGS_ENDPOINT = "/api/v1/writings";
const WRITINGS_TAG = "writings";

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
	page?: number;
	sort?: WritingsSort;
	size?: number;
};

/** Fetches a single batch of writings for the autoplay carousel (no URL pagination). */
export async function getWritingsCarousel(
	locale: string,
	size = WRITINGS_CAROUSEL_SIZE,
): Promise<ResolvedWritingCard[]> {
	const { items } = await getWritingsPage(locale, 1, size);
	return items;
}

async function fetchAllWritingsFromApi(
	locale: string,
): Promise<ResolvedWritingCard[] | null> {
	const page = await apiFetch(WRITINGS_ENDPOINT, {
		schema: WritingsPageSchema,
		tags: [WRITINGS_TAG],
		revalidate: DEFAULT_REVALIDATE,
		searchParams: { page: 0, size: BULK_FETCH_SIZE },
	});

	if (!page?.content.length) {
		return null;
	}

	const items = page.content
		.map((writing) => resolveWritingCard(locale, writing))
		.filter((item): item is ResolvedWritingCard => item != null);

	return items.length > 0 ? items : null;
}

/** Returns the full writings set for client-side filter/sort/paginate. */
export async function getAllWritings(
	locale: string,
): Promise<ResolvedWritingCard[]> {
	const apiItems = await fetchAllWritingsFromApi(locale);
	return apiItems ?? getAllDemoWritingCards(locale);
}

export async function getWritingsListing(
	locale: string,
	{
		categorySlug,
		genre,
		query,
		page = 1,
		sort = "newest",
		size = WRITINGS_GRID_PAGE_SIZE,
	}: WritingsListingOptions = {},
): Promise<WritingsListResult> {
	const allItems = await getAllWritings(locale);
	const filtered = filterWritings(allItems, { categorySlug, genre, query });
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
		return getDemoWritingCards(locale, currentPage, size);
	}

	const data = await apiFetch(WRITINGS_ENDPOINT, {
		schema: WritingsPageSchema,
		tags: [WRITINGS_TAG],
		revalidate: DEFAULT_REVALIDATE,
		searchParams: { page: currentPage - 1, size },
	});

	if (!data) {
		return getDemoWritingCards(locale, currentPage, size);
	}

	const items = data.content
		.map((writing) => resolveWritingCard(locale, writing))
		.filter((item): item is ResolvedWritingCard => item != null);

	if (items.length === 0) {
		return getDemoWritingCards(locale, currentPage, size);
	}

	return {
		items,
		totalPages: Math.max(data.totalPages, 1),
		totalElements: data.totalElements,
		currentPage,
		empty: data.empty,
	};
}

export function parseWritingsGenre(value?: string | null): BookGenre | null {
	if (value && isBookGenre(value)) {
		return value;
	}
	return null;
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
	if (!getApiBaseUrl()) {
		return getDemoWritingById(locale, id, labels);
	}

	const detail = await apiFetch(`${WRITINGS_ENDPOINT}/${id}`, {
		schema: WritingSchema,
		tags: [WRITINGS_TAG, `writing-${id}`],
		revalidate: DEFAULT_REVALIDATE,
	});

	if (!detail) {
		return getDemoWritingById(locale, id, labels);
	}

	const resolved = resolveWritingDetail(locale, detail, labels);
	if (resolved?.id === id) {
		return resolved;
	}

	return getDemoWritingById(locale, id, labels);
}

export async function getWritingSeriesBooks(
	locale: string,
	seriesId: string,
	currentId: number,
): Promise<ResolvedSeriesBook[]> {
	if (!getApiBaseUrl()) {
		return getDemoWritingSeries(locale, seriesId, currentId);
	}

	const data = await apiFetch(
		`${WRITINGS_ENDPOINT}/series/${encodeURIComponent(seriesId)}`,
		{
			schema: SeriesResponseSchema,
			tags: [WRITINGS_TAG, `writing-series-${seriesId}`],
			revalidate: DEFAULT_REVALIDATE,
		},
	);

	if (!data) {
		return getDemoWritingSeries(locale, seriesId, currentId);
	}

	return resolveSeriesBooks(locale, data.books, currentId);
}
