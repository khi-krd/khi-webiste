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
import { normalizeVideoRecord } from "@/lib/api/normalize";
import {
	DEMO_VIDEO_TOPICS,
	getAllDemoVideos,
	getDemoVideoById,
} from "@/lib/mock/videos";
import { filterVideos, paginateVideos, sortVideos } from "@/lib/video/filter";
import { resolveVideoCard, resolveVideoDetail } from "@/lib/video/resolve";
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
	return apiVideos ?? getAllDemoVideos();
}

/** Full resolved card set for in-memory filter/sort/paginate. */
export async function getAllVideoCards(
	locale: string,
): Promise<ResolvedVideoCard[]> {
	const videos = await getAllVideos();
	return videos
		.map((video) => resolveVideoCard(locale, video))
		.filter((item): item is ResolvedVideoCard => item != null);
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
	}: VideoListingOptions = {},
): Promise<VideoListResult> {
	if (
		getApiBaseUrl() &&
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
			const allItems = apiVideos
				.map((video) => resolveVideoCard(locale, video))
				.filter((item): item is ResolvedVideoCard => item != null);
			const filtered = filterVideos(allItems, {
				videoType,
				topicId,
				excludeTopicId,
				memories,
				query,
			});
			const sorted = sortVideos(filtered);
			return paginateVideos(sorted, page, size);
		}
	}

	const allItems = await getAllVideoCards(locale);
	const filtered = filterVideos(allItems, {
		videoType,
		topicId,
		excludeTopicId,
		memories,
		query,
	});
	const sorted = sortVideos(filtered);
	return paginateVideos(sorted, page, size);
}

export async function getVideoById(
	locale: string,
	id: number,
): Promise<ResolvedVideoDetail | null> {
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
			const resolved = resolveVideoDetail(locale, parsed.data);
			if (resolved?.id === id) {
				return resolved;
			}
		}
	}

	const demoVideo = getDemoVideoById(id);
	return demoVideo ? resolveVideoDetail(locale, demoVideo) : null;
}

export type VideoTopicOption = {
	id: number;
	name: string;
};

/** Topic options for the filter UI (`GET /api/v1/videos/topics`). */
export async function getVideoTopics(
	locale: string,
): Promise<VideoTopicOption[]> {
	if (getApiBaseUrl()) {
		const topics = await apiFetch(`${VIDEOS_ENDPOINT}/topics`, {
			schema: z.array(VideoTopicSchema),
			tags: [VIDEOS_TAG],
			revalidate: DEFAULT_REVALIDATE,
		});

		if (topics && topics.length > 0) {
			return topics
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

	return DEMO_VIDEO_TOPICS.map((topic) => ({
		id: topic.id,
		name:
			locale === "ckb"
				? (topic.nameCkb ?? topic.nameKmr ?? "")
				: (topic.nameKmr ?? topic.nameCkb ?? ""),
	})).filter((topic) => topic.name.length > 0);
}

/** Resolve a single topic's localized name (used by the short-films header). */
export async function getVideoTopicName(
	locale: string,
	topicId: number,
): Promise<string | null> {
	const topics = await getVideoTopics(locale);
	return topics.find((topic) => topic.id === topicId)?.name ?? null;
}
