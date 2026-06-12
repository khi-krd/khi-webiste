import "server-only";
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
	ApiResponseSchema,
	type ResolvedSeriesBook,
	type ResolvedWritingCard,
	type ResolvedWritingDetail,
	SeriesResponseSchema,
	WritingSchema,
	WritingsPageSchema,
} from "@/types/writing";

const WRITINGS_ENDPOINT = "/api/v1/writings";
const WRITINGS_TAG = "writings";
const WRITINGS_REVALIDATE_SECONDS = 600;
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
	const apiBaseUrl = process.env.API_BASE_URL;
	if (!apiBaseUrl) {
		return null;
	}

	try {
		const endpoint = new URL(WRITINGS_ENDPOINT, apiBaseUrl);
		endpoint.searchParams.set("page", "0");
		endpoint.searchParams.set("size", String(WRITINGS_CAROUSEL_SIZE));

		const response = await fetch(endpoint, {
			next: {
				revalidate: WRITINGS_REVALIDATE_SECONDS,
				tags: [WRITINGS_TAG],
			},
		});

		if (!response.ok) {
			return null;
		}

		const payload: unknown = await response.json();
		const parsed = ApiResponseSchema(WritingsPageSchema).safeParse(payload);

		if (!parsed.success) {
			return null;
		}

		const { data } = parsed.data;
		const items = data.content
			.map((writing) => resolveWritingCard(locale, writing))
			.filter((item): item is ResolvedWritingCard => item != null);

		return items.length > 0 ? items : null;
	} catch {
		return null;
	}
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
	const apiBaseUrl = process.env.API_BASE_URL;
	const currentPage = Math.max(1, page);

	if (!apiBaseUrl) {
		return getDemoWritingCards(locale, currentPage, size);
	}

	try {
		const endpoint = new URL(WRITINGS_ENDPOINT, apiBaseUrl);
		endpoint.searchParams.set("page", String(currentPage - 1));
		endpoint.searchParams.set("size", String(size));

		const response = await fetch(endpoint, {
			next: {
				revalidate: WRITINGS_REVALIDATE_SECONDS,
				tags: [WRITINGS_TAG],
			},
		});

		if (!response.ok) {
			return getDemoWritingCards(locale, currentPage, size);
		}

		const payload: unknown = await response.json();
		const parsed = ApiResponseSchema(WritingsPageSchema).safeParse(payload);

		if (!parsed.success) {
			return getDemoWritingCards(locale, currentPage, size);
		}

		const { data } = parsed.data;
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
	} catch {
		return getDemoWritingCards(locale, currentPage, size);
	}
}

export function parseWritingsGenre(
	value?: string | null,
): BookGenre | null {
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
	const apiBaseUrl = process.env.API_BASE_URL;

	if (!apiBaseUrl) {
		return getDemoWritingById(locale, id, labels);
	}

	try {
		const endpoint = new URL(`${WRITINGS_ENDPOINT}/${id}`, apiBaseUrl);
		const response = await fetch(endpoint, {
			next: {
				revalidate: WRITINGS_REVALIDATE_SECONDS,
				tags: [WRITINGS_TAG, `writing-${id}`],
			},
		});

		if (!response.ok) {
			return getDemoWritingById(locale, id, labels);
		}

		const payload: unknown = await response.json();
		const parsed = ApiResponseSchema(WritingSchema).safeParse(payload);

		if (!parsed.success) {
			return getDemoWritingById(locale, id, labels);
		}

		const detail = resolveWritingDetail(locale, parsed.data.data, labels);
		if (detail?.id === id) {
			return detail;
		}

		return getDemoWritingById(locale, id, labels);
	} catch {
		return getDemoWritingById(locale, id, labels);
	}
}

export async function getWritingSeriesBooks(
	locale: string,
	seriesId: string,
	currentId: number,
): Promise<ResolvedSeriesBook[]> {
	const apiBaseUrl = process.env.API_BASE_URL;

	if (!apiBaseUrl) {
		return getDemoWritingSeries(locale, seriesId, currentId);
	}

	try {
		const endpoint = new URL(
			`${WRITINGS_ENDPOINT}/series/${encodeURIComponent(seriesId)}`,
			apiBaseUrl,
		);
		const response = await fetch(endpoint, {
			next: {
				revalidate: WRITINGS_REVALIDATE_SECONDS,
				tags: [WRITINGS_TAG, `writing-series-${seriesId}`],
			},
		});

		if (!response.ok) {
			return getDemoWritingSeries(locale, seriesId, currentId);
		}

		const payload: unknown = await response.json();
		const parsed = ApiResponseSchema(SeriesResponseSchema).safeParse(payload);

		if (!parsed.success) {
			return getDemoWritingSeries(locale, seriesId, currentId);
		}

		return resolveSeriesBooks(locale, parsed.data.data.books, currentId);
	} catch {
		return getDemoWritingSeries(locale, seriesId, currentId);
	}
}
