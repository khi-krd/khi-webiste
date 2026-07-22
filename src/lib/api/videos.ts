import "server-only";
import { z } from "zod";
import {
	apiFetch,
	apiFetchPage,
	apiFetchRaw,
	BULK_FETCH_SIZE,
	DEFAULT_REVALIDATE,
	type ParsedApiPage,
	unwrapApiPayload,
} from "@/lib/api/client";
import { getApiBaseUrl } from "@/lib/api/config";
import {
	applyMockPolicy,
	applyMockPolicyNullable,
	type MockPolicyContext,
} from "@/lib/api/mock-policy";
import { normalizeVideoRecord } from "@/lib/api/normalize";
import {
	DEMO_VIDEO_TOPICS,
	getAllDemoVideos,
	getDemoVideoById,
} from "@/lib/mock/videos";
import {
	cardIdentity,
	filterVideos,
	paginateVideos,
	pickFeaturedCard,
	sortVideos,
} from "@/lib/video/filter";
import { resolveVideoCards, resolveVideoDetail } from "@/lib/video/resolve";
import type {
	ResolvedVideoCard,
	ResolvedVideoDetail,
	Video,
	VideoType,
} from "@/types/video";
import { VideoSchema, VideoTopicSchema } from "@/types/video";

const VIDEOS_ENDPOINT = "/api/v1/videos";
const VIDEOS_TAG = "videos";

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
	mockContext?: MockPolicyContext;
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
	return applyMockPolicy({
		context: "global",
		apiItems: apiVideos ?? [],
		getMockItems: () => getAllDemoVideos(),
	});
}

function resolvePageToCards(
	locale: string,
	videos: Video[],
): ResolvedVideoCard[] {
	return sortVideos(
		videos.flatMap((video) => resolveVideoCards(locale, video)),
	);
}

function toListResult(
	items: ResolvedVideoCard[],
	totalPages: number,
	totalElements: number,
	currentPage: number,
): VideoListResult {
	return {
		items,
		totalPages: Math.max(1, totalPages),
		totalElements,
		currentPage,
		empty: items.length === 0,
	};
}

function getMockVideoListingItems(
	locale: string,
	filters: VideoListingFilters,
): ResolvedVideoCard[] {
	const allItems = getAllDemoVideos().flatMap((video) =>
		resolveVideoCards(locale, video),
	);
	return sortVideos(filterVideos(allItems, filters));
}

function applyClientOnlyFilters(
	items: ResolvedVideoCard[],
	filters: VideoListingFilters,
): ResolvedVideoCard[] {
	return filterVideos(items, filters);
}

async function searchVideosFromApi(
	locale: string,
	query: string,
	page: number,
	size: number,
	filters: VideoListingFilters,
): Promise<VideoListResult | null> {
	const apiPage = Math.max(0, page - 1);
	const trimmedQuery = query.trim();

	let result = await fetchVideosByTag(trimmedQuery, apiPage, size);
	if (!result?.content.length) {
		result = await fetchVideosByKeyword(trimmedQuery, apiPage, size);
	}
	if (!result) {
		return null;
	}

	const items = applyClientOnlyFilters(
		resolvePageToCards(locale, result.content),
		{ ...filters, query: null },
	);

	return toListResult(
		items,
		result.totalPages,
		result.totalElements,
		page,
	);
}

async function fetchPaginatedListingFromApi(
	locale: string,
	page: number,
	size: number,
	filters: VideoListingFilters,
): Promise<VideoListResult | null> {
	const apiPage = Math.max(0, page - 1);
	const result = await fetchVideosPageResult(
		buildVideoSearchParams(apiPage, size, filters),
	);
	if (!result) {
		return null;
	}

	const items = applyClientOnlyFilters(
		resolvePageToCards(locale, result.content),
		filters,
	);

	return toListResult(
		items,
		result.totalPages,
		result.totalElements,
		page,
	);
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

	return applyClientOnlyFilters(
		resolvePageToCards(locale, apiVideos),
		filters,
	);
}

function canUseServerPagination(filters: VideoListingFilters): boolean {
	return filters.excludeTopicId == null;
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
			const lead = pickFeaturedCard(
				resolvePageToCards(locale, result.content),
			);
			if (lead) {
				return lead;
			}
		}
	}

	return pickFeaturedCard(getMockVideoListingItems(locale, {}));
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
		mockContext = "global",
	}: VideoListingOptions = {},
): Promise<VideoListResult> {
	const filters: VideoListingFilters = {
		videoType,
		topicId,
		excludeTopicId,
		memories,
		query,
	};

	if (getApiBaseUrl()) {
		if (query?.trim()) {
			const searched = await searchVideosFromApi(
				locale,
				query,
				page,
				size,
				filters,
			);
			if (searched) {
				const items = applyMockPolicy({
					context: mockContext,
					apiItems: searched.items,
					getMockItems: () => {
						const mockItems = getMockVideoListingItems(locale, filters);
						return paginateVideos(mockItems, page, size).items;
					},
					targetCount: mockContext === "home" ? size : undefined,
				});

				if (mockContext === "home") {
					return {
						items,
						totalPages: 1,
						totalElements: items.length,
						currentPage: 1,
						empty: items.length === 0,
					};
				}

				return {
					...searched,
					items,
					empty: items.length === 0,
				};
			}
		} else if (canUseServerPagination(filters)) {
			const paginated = await fetchPaginatedListingFromApi(
				locale,
				page,
				size,
				filters,
			);
			if (paginated) {
				const items = applyMockPolicy({
					context: mockContext,
					apiItems: paginated.items,
					getMockItems: () => {
						const mockItems = getMockVideoListingItems(locale, filters);
						return mockContext === "home"
							? mockItems.slice(0, size)
							: paginateVideos(mockItems, page, size).items;
					},
					targetCount: mockContext === "home" ? size : undefined,
				});

				if (mockContext === "home") {
					return {
						items,
						totalPages: 1,
						totalElements: items.length,
						currentPage: 1,
						empty: items.length === 0,
					};
				}

				return {
					...paginated,
					items,
					empty: items.length === 0,
				};
			}
		}
	}

	const apiItems = await resolveVideoListingItemsFromApi(locale, filters);
	const items = applyMockPolicy({
		context: mockContext,
		apiItems,
		getMockItems: () => getMockVideoListingItems(locale, filters),
		targetCount: mockContext === "home" ? size : undefined,
	});

	if (mockContext === "home") {
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

	const demoVideo = getDemoVideoById(id);
	return applyMockPolicyNullable({
		apiValue: apiDetail,
		getMockValue: () =>
			demoVideo ? resolveVideoDetail(locale, demoVideo, clipNumber) : null,
	});
}

export type VideoTopicOption = {
	id: number;
	name: string;
};

function getMockVideoTopics(locale: string): VideoTopicOption[] {
	return DEMO_VIDEO_TOPICS.map((topic) => ({
		id: topic.id,
		name:
			locale === "ckb"
				? (topic.nameCkb ?? topic.nameKmr ?? "")
				: (topic.nameKmr ?? topic.nameCkb ?? ""),
	})).filter((topic) => topic.name.length > 0);
}

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

	return applyMockPolicy({
		context: "global",
		apiItems,
		getMockItems: () => getMockVideoTopics(locale),
	});
}

/** Resolve a single topic's localized name (used by the short-films header). */
export async function getVideoTopicName(
	locale: string,
	topicId: number,
): Promise<string | null> {
	const topics = await getVideoTopics(locale);
	return topics.find((topic) => topic.id === topicId)?.name ?? null;
}