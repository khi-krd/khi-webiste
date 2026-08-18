import "server-only";
import { z } from "zod";
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
import { normalizeVideoRecord } from "@/lib/api/normalize";
import {
	cardIdentity,
	filterVideos,
	paginateVideos,
	pickFeaturedCard,
	sortVideos,
} from "@/lib/video/filter";
import { resolveVideoCards, resolveVideoDetail } from "@/lib/video/resolve";
import type {
	FilmReklamVideo,
	ResolvedVideoCard,
	ResolvedVideoDetail,
	Video,
	VideoType,
} from "@/types/video";
import {
	FilmReklamVideoSchema,
	VideoSchema,
	VideoTopicSchema,
} from "@/types/video";

const VIDEOS_ENDPOINT = "/api/v1/videos";
const VIDEOS_TAG = "videos";
const FILM_REKLAM_VIDEO_ENDPOINT = `${VIDEOS_ENDPOINT}/film-reklam-video`;

export const VIDEO_GRID_PAGE_SIZE = 12;

export type VideoListResult = {
	items: ResolvedVideoCard[];
	totalPages: number;
	totalElements: number;
	currentPage: number;
	empty: boolean;
};

export type VideoListingOptions = {
	videoType?: VideoType | null;
	topicId?: number | null;
	excludeTopicId?: number | null;
	memories?: boolean | null;
	query?: string | null;
	page?: number;
	size?: number;
	/**
	 * Presentation shape. "home" returns one capped page for the homepage rails;
	 * "listing" paginates. Named `mockContext` while it lived on the mock policy —
	 * it was never a mock switch.
	 */
	variant?: "home" | "listing";
	/** Card identity to drop from the flow (e.g. the page-1 hero lead). */
	excludeCardIdentity?: string | null;
};

type VideoListingFilters = Pick<
	VideoListingOptions,
	"videoType" | "topicId" | "excludeTopicId" | "memories" | "query"
>;

type VideoPageFetchOptions = Pick<
	VideoListingOptions,
	"videoType" | "topicId" | "memories"
>;

function buildVideoSearchParams(
	page: number,
	size: number,
	{ videoType, topicId, memories }: VideoPageFetchOptions = {},
): Record<string, string | number | undefined> {
	const searchParams: Record<string, string | number | undefined> = {
		page,
		size,
	};

	if (videoType != null) {
		searchParams.videoType = videoType;
	}
	if (topicId != null) {
		searchParams.topicId = topicId;
	}
	if (memories != null) {
		searchParams.memories = String(memories);
	}

	return searchParams;
}

async function fetchVideosPageResult(
	searchParams: Record<string, string | number | undefined>,
): Promise<ParsedApiPage<Video> | null> {
	return apiFetchPage(VIDEOS_ENDPOINT, {
		itemSchema: VideoSchema,
		tags: [VIDEOS_TAG],
		revalidate: DEFAULT_REVALIDATE,
		searchParams,
		normalizeItem: normalizeVideoRecord,
	});
}

async function fetchVideosByTag(
	value: string,
	page: number,
	size: number,
): Promise<ParsedApiPage<Video> | null> {
	return apiFetchPage(`${VIDEOS_ENDPOINT}/search/tag`, {
		itemSchema: VideoSchema,
		tags: [VIDEOS_TAG],
		revalidate: DEFAULT_REVALIDATE,
		searchParams: { value, page, size },
		normalizeItem: normalizeVideoRecord,
	});
}

async function fetchVideosByKeyword(
	value: string,
	page: number,
	size: number,
): Promise<ParsedApiPage<Video> | null> {
	return apiFetchPage(`${VIDEOS_ENDPOINT}/search/keyword`, {
		itemSchema: VideoSchema,
		tags: [VIDEOS_TAG],
		revalidate: DEFAULT_REVALIDATE,
		searchParams: { value, page, size },
		normalizeItem: normalizeVideoRecord,
	});
}

async function fetchAllVideosFromApi(
	options: VideoPageFetchOptions = {},
): Promise<Video[] | null> {
	const page = await fetchVideosPageResult(
		buildVideoSearchParams(0, BULK_FETCH_SIZE, options),
	);
	return page?.content.length ? page.content : null;
}

async function getAllVideos(): Promise<Video[]> {
	const apiVideos = await fetchAllVideosFromApi();
	return apiVideos ?? [];
}

function resolvePageToCards(
	locale: string,
	videos: Video[],
): ResolvedVideoCard[] {
	return sortVideos(
		videos.flatMap((video) => resolveVideoCards(locale, video)),
	);
}

function applyClientOnlyFilters(
	items: ResolvedVideoCard[],
	filters: VideoListingFilters,
): ResolvedVideoCard[] {
	return filterVideos(items, filters);
}

/** Full matching card set from the search endpoints (bulk, not per-page). */
async function searchVideosFromApi(
	locale: string,
	query: string,
	filters: VideoListingFilters,
): Promise<ResolvedVideoCard[] | null> {
	const trimmedQuery = query.trim();

	let result = await fetchVideosByTag(trimmedQuery, 0, BULK_FETCH_SIZE);
	if (!result?.content.length) {
		result = await fetchVideosByKeyword(trimmedQuery, 0, BULK_FETCH_SIZE);
	}
	if (!result) {
		return null;
	}

	return applyClientOnlyFilters(resolvePageToCards(locale, result.content), {
		...filters,
		query: null,
	});
}

async function resolveVideoListingItemsFromApi(
	locale: string,
	filters: VideoListingFilters,
): Promise<ResolvedVideoCard[]> {
	if (!getApiBaseUrl()) {
		return [];
	}

	const apiVideos = await fetchAllVideosFromApi(filters);
	if (!apiVideos) {
		return [];
	}

	return applyClientOnlyFilters(resolvePageToCards(locale, apiVideos), filters);
}

/** Full resolved card set for in-memory filter/sort/paginate. */
export async function getAllVideoCards(
	locale: string,
): Promise<ResolvedVideoCard[]> {
	const videos = await getAllVideos();
	return resolvePageToCards(locale, videos);
}

/** Global featured lead for the unfiltered catalogue bento. */
export async function getFeaturedVideoLead(
	locale: string,
): Promise<ResolvedVideoCard | null> {
	if (getApiBaseUrl()) {
		const result = await fetchVideosPageResult({
			page: 0,
			size: BULK_FETCH_SIZE,
		});
		if (result?.content.length) {
			const lead = pickFeaturedCard(resolvePageToCards(locale, result.content));
			if (lead) {
				return lead;
			}
		}
	}

	// No CMS video carries `featured`, so there is no lead to pick. Returning
	// null lets VideoShell open on the newest real video (`cards[0]`) instead of
	// on a demo one.
	return null;
}

export async function getVideoListing(
	locale: string,
	{
		videoType,
		topicId,
		excludeTopicId,
		memories,
		query,
		page = 1,
		size = VIDEO_GRID_PAGE_SIZE,
		variant = "listing",
		excludeCardIdentity,
	}: VideoListingOptions = {},
): Promise<VideoListResult> {
	const filters: VideoListingFilters = {
		videoType,
		topicId,
		excludeTopicId,
		memories,
		query,
	};

	// Resolve the full matching card set, then paginate at CARD level. Backend
	// pages count records, but records expand/contract into cards (clip
	// flatMap + client-only filters), which left mid-listing pages ragged.
	// In-memory slicing keeps every non-final page at exactly `size` cards, so
	// the grid rows stay full whenever more pages follow.
	const apiItems = query?.trim()
		? ((await searchVideosFromApi(locale, query, filters)) ??
			(await resolveVideoListingItemsFromApi(locale, filters)))
		: await resolveVideoListingItemsFromApi(locale, filters);

	let items = sliceToCount(apiItems, variant === "home" ? size : undefined);

	if (excludeCardIdentity != null) {
		items = items.filter((card) => cardIdentity(card) !== excludeCardIdentity);
	}

	if (variant === "home") {
		return {
			items: items.slice(0, size),
			totalPages: 1,
			totalElements: items.length,
			currentPage: 1,
			empty: items.length === 0,
		};
	}

	return paginateVideos(items, page, size);
}

export async function getVideoById(
	locale: string,
	id: number,
	clipNumber?: number | null,
): Promise<ResolvedVideoDetail | null> {
	let apiDetail: ResolvedVideoDetail | null = null;

	if (getApiBaseUrl()) {
		const raw = await apiFetchRaw(`${VIDEOS_ENDPOINT}/${id}`, {
			tags: [VIDEOS_TAG, `video-${id}`],
			revalidate: DEFAULT_REVALIDATE,
		});
		const unwrapped = unwrapApiPayload(raw);
		const parsed = unwrapped
			? VideoSchema.safeParse(normalizeVideoRecord(unwrapped))
			: null;

		if (parsed?.success) {
			const resolved = resolveVideoDetail(locale, parsed.data, clipNumber);
			if (resolved?.id === id) {
				apiDetail = resolved;
			}
		}
	}

	return apiDetail;
}

export type VideoTopicOption = {
	id: number;
	name: string;
};

/** Topic options for the filter UI (`GET /api/v1/videos/topics`). */
export async function getVideoTopics(
	locale: string,
): Promise<VideoTopicOption[]> {
	let apiItems: VideoTopicOption[] = [];

	if (getApiBaseUrl()) {
		const topics = await apiFetch(`${VIDEOS_ENDPOINT}/topics`, {
			schema: z.array(VideoTopicSchema),
			tags: [VIDEOS_TAG],
			revalidate: DEFAULT_REVALIDATE,
		});

		if (topics && topics.length > 0) {
			apiItems = topics
				.map((topic) => ({
					id: topic.id,
					name:
						locale === "ckb"
							? (topic.nameCkb ?? topic.nameKmr)
							: (topic.nameKmr ?? topic.nameCkb),
				}))
				.filter((topic): topic is VideoTopicOption => topic.name != null);
		}
	}

	return apiItems;
}

/** Resolve a single topic's localized name (used by the short-films header). */
export async function getVideoTopicName(
	locale: string,
	topicId: number,
): Promise<string | null> {
	const topics = await getVideoTopics(locale);
	return topics.find((topic) => topic.id === topicId)?.name ?? null;
}

/**
 * Homepage film-section background video (`GET /api/v1/videos/film-reklam-video`).
 *
 * `404` is the documented empty state — nothing uploaded — and `apiFetch` turns
 * any non-2xx into `null`, so the section simply renders without a background.
 */
export async function getFilmReklamVideo(): Promise<FilmReklamVideo | null> {
	if (!getApiBaseUrl()) {
		return null;
	}

	return apiFetch(FILM_REKLAM_VIDEO_ENDPOINT, {
		schema: FilmReklamVideoSchema,
		tags: [VIDEOS_TAG, "film-reklam-video"],
		revalidate: DEFAULT_REVALIDATE,
	});
}
