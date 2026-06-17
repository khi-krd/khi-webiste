import "server-only";
import { z } from "zod";
import {
	apiFetch,
	BULK_FETCH_SIZE,
	DEFAULT_REVALIDATE,
} from "@/lib/api/client";
import { getApiBaseUrl } from "@/lib/api/config";
import {
	DEMO_VIDEO_TOPICS,
	getAllDemoVideos,
	getDemoVideoById,
} from "@/lib/mock/videos";
import { DEMO_VIDEO_TOPICS_EN } from "@/lib/mock/videos-en";
import { filterVideos, paginateVideos, sortVideos } from "@/lib/video/filter";
import { resolveVideoCard, resolveVideoDetail } from "@/lib/video/resolve";
import type {
	ResolvedVideoCard,
	ResolvedVideoDetail,
	Video,
	VideoType,
} from "@/types/video";
import { VideoSchema, VideosPageSchema, VideoTopicSchema } from "@/types/video";

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

async function fetchAllVideosFromApi(): Promise<Video[] | null> {
	const page = await apiFetch(VIDEOS_ENDPOINT, {
		schema: VideosPageSchema,
		tags: [VIDEOS_TAG],
		revalidate: DEFAULT_REVALIDATE,
		searchParams: { page: 0, size: BULK_FETCH_SIZE },
	});

	return page?.content.length ? page.content : null;
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
		const detail = await apiFetch(`${VIDEOS_ENDPOINT}/${id}`, {
			schema: VideoSchema,
			tags: [VIDEOS_TAG, `video-${id}`],
			revalidate: DEFAULT_REVALIDATE,
		});

		if (detail) {
			const resolved = resolveVideoDetail(locale, detail);
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
						locale === "en"
							? (topic.nameEn ?? topic.nameKmr ?? topic.nameCkb)
							: locale === "ckb"
								? (topic.nameCkb ?? topic.nameKmr)
								: (topic.nameKmr ?? topic.nameCkb),
				}))
				.filter((topic): topic is VideoTopicOption => topic.name != null);
		}
	}

	return DEMO_VIDEO_TOPICS.map((topic) => ({
		id: topic.id,
		name:
			locale === "en"
				? (DEMO_VIDEO_TOPICS_EN[topic.id] ??
					topic.nameKmr ??
					topic.nameCkb ??
					"")
				: locale === "ckb"
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
