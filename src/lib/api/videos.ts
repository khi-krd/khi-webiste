import "server-only";
import { z } from "zod";
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
import { VideoSchema, VideosPageSchema, VideoTopicSchema } from "@/types/video";
import { ApiResponseSchema } from "@/types/writing";

const VIDEOS_ENDPOINT = "/api/v1/videos";
const VIDEOS_TAG = "videos";
const VIDEOS_REVALIDATE_SECONDS = 600;
const VIDEOS_FETCH_ALL_SIZE = 200;

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
	const apiBaseUrl = process.env.API_BASE_URL;
	if (!apiBaseUrl) {
		return null;
	}

	try {
		const endpoint = new URL(VIDEOS_ENDPOINT, apiBaseUrl);
		endpoint.searchParams.set("page", "0");
		endpoint.searchParams.set("size", String(VIDEOS_FETCH_ALL_SIZE));

		const response = await fetch(endpoint, {
			next: {
				revalidate: VIDEOS_REVALIDATE_SECONDS,
				tags: [VIDEOS_TAG],
			},
		});

		if (!response.ok) {
			return null;
		}

		const payload: unknown = await response.json();
		const parsed = ApiResponseSchema(VideosPageSchema).safeParse(payload);

		if (!parsed.success) {
			return null;
		}

		const videos = parsed.data.data.content;
		return videos.length > 0 ? videos : null;
	} catch {
		return null;
	}
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
	const apiBaseUrl = process.env.API_BASE_URL;

	if (apiBaseUrl) {
		try {
			const endpoint = new URL(`${VIDEOS_ENDPOINT}/${id}`, apiBaseUrl);
			const response = await fetch(endpoint, {
				next: {
					revalidate: VIDEOS_REVALIDATE_SECONDS,
					tags: [VIDEOS_TAG, `video-${id}`],
				},
			});

			if (response.ok) {
				const payload: unknown = await response.json();
				const parsed = ApiResponseSchema(VideoSchema).safeParse(payload);
				if (parsed.success) {
					const detail = resolveVideoDetail(locale, parsed.data.data);
					if (detail?.id === id) {
						return detail;
					}
				}
			}
		} catch {
			// fall through to demo data
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
	const apiBaseUrl = process.env.API_BASE_URL;

	if (apiBaseUrl) {
		try {
			const endpoint = new URL(`${VIDEOS_ENDPOINT}/topics`, apiBaseUrl);
			const response = await fetch(endpoint, {
				next: {
					revalidate: VIDEOS_REVALIDATE_SECONDS,
					tags: [VIDEOS_TAG],
				},
			});

			if (response.ok) {
				const payload: unknown = await response.json();
				const parsed = ApiResponseSchema(z.array(VideoTopicSchema)).safeParse(
					payload,
				);
				if (parsed.success && parsed.data.data.length > 0) {
					return parsed.data.data
						.map((topic) => ({
							id: topic.id,
							name:
								locale === "ku"
									? (topic.nameKmr ?? topic.nameCkb)
									: (topic.nameCkb ?? topic.nameKmr),
						}))
						.filter((topic): topic is VideoTopicOption => topic.name != null);
				}
			}
		} catch {
			// fall through to demo data
		}
	}

	return DEMO_VIDEO_TOPICS.map((topic) => ({
		id: topic.id,
		name:
			locale === "ku"
				? (topic.nameKmr ?? topic.nameCkb ?? "")
				: (topic.nameCkb ?? topic.nameKmr ?? ""),
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
