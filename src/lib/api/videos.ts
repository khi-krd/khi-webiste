import "server-only";
import { z } from "zod";
import {
	apiFetch,
	apiFetchPage,
	apiFetchRaw,
	BULK_FETCH_SIZE,
	DEFAULT_REVALIDATE,
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
import { filterVideos, paginateVideos, sortVideos } from "@/lib/video/filter";
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

async function fetchVideosPage(
	searchParams: Record<string, string | number | undefined>,
): Promise<Video[] | null> {
	const page = await apiFetchPage(VIDEOS_ENDPOINT, {
		itemSchema: VideoSchema,
		tags: [VIDEOS_TAG],
		revalidate: DEFAULT_REVALIDATE,
		searchParams,
		normalizeItem: normalizeVideoRecord,
	});

	return page?.content.length ? page.content : null;
}

async function fetchAllVideosFromApi(
	options: Pick<
		VideoListingOptions,
		"videoType" | "topicId" | "memories"
	> = {},
): Promise<Video[] | null> {
	const hasFilters =
		options.videoType != null ||
		options.topicId != null ||
		options.memories != null;

	if (!hasFilters) {
		return fetchVideosPage({ page: 0, size: BULK_FETCH_SIZE });
	}

	const searchParams: Record<string, string | number | undefined> = {
		page: 0,
		size: BULK_FETCH_SIZE,
	};

	if (options.videoType != null) {
		searchParams.videoType = options.videoType;
	}
	if (options.topicId != null) {
		searchParams.topicId = options.topicId;
	}
	if (options.memories != null) {
		searchParams.memories = String(options.memories);
	}

	return fetchVideosPage(searchParams);
}

async function getAllVideos(): Promise<Video[]> {
	const apiVideos = await fetchAllVideosFromApi();
	return applyMockPolicy({
		context: "global",
		apiItems: apiVideos ?? [],
		getMockItems: () => getAllDemoVideos(),
	});
}

type VideoListingFilters = Pick<
	VideoListingOptions,
	"videoType" | "topicId" | "excludeTopicId" | "memories" | "query"
>;

function getMockVideoListingItems(
	locale: string,
	filters: VideoListingFilters,
): ResolvedVideoCard[] {
	const allItems = getAllDemoVideos()
		.flatMap((video) => resolveVideoCards(locale, video));
	return sortVideos(filterVideos(allItems, filters));
}

async function resolveVideoListingItemsFromApi(
	locale: string,
	{
		videoType,
		topicId,
		excludeTopicId,
		memories,
		query,
	}: VideoListingFilters,
): Promise<ResolvedVideoCard[]> {
	if (!getApiBaseUrl()) {
		return [];
	}

	if (
		!query?.trim() &&
		excludeTopicId == null &&
		(videoType != null || topicId != null || memories != null)
	) {
		const apiVideos = await fetchAllVideosFromApi({
			videoType,
			topicId,
			memories,
		});
		if (apiVideos) {
			const allItems = apiVideos.flatMap((video) =>
				resolveVideoCards(locale, video),
			);
			return sortVideos(
				filterVideos(allItems, {
					videoType,
					topicId,
					excludeTopicId,
					memories,
					query,
				}),
			);
		}
	}

	const apiVideos = await fetchAllVideosFromApi();
	if (!apiVideos) {
		return [];
	}

	const allItems = apiVideos.flatMap((video) =>
		resolveVideoCards(locale, video),
	);
	return sortVideos(
		filterVideos(allItems, {
			videoType,
			topicId,
			excludeTopicId,
			memories,
			query,
		}),
	);
}

/** Full resolved card set for in-memory filter/sort/paginate. */
export async function getAllVideoCards(
	locale: string,
): Promise<ResolvedVideoCard[]> {
	const videos = await getAllVideos();
	return videos.flatMap((video) => resolveVideoCards(locale, video));
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
	const apiItems = await resolveVideoListingItemsFromApi(locale, filters);
	const items = applyMockPolicy({
		context: mockContext,
		apiItems,
		getMockItems: () => getMockVideoListingItems(locale, filters),
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
