import { buildAudioHref } from "@/lib/audio-url";
import { buildGalleryHref } from "@/lib/gallery-url";
import { buildNewsHref } from "@/lib/news-url";
import { projectsHref } from "@/lib/projects-url";
import { buildVideoHref } from "@/lib/video-url";
import { isBookGenre } from "@/lib/writing/genres";
import { buildWritingsHref } from "@/lib/writings-url";
import type { VideoType } from "@/types/video";

export function newsCategoryHref(category: string): string {
	return category.trim()
		? buildNewsHref({ category: category.trim() })
		: buildNewsHref({});
}

export function newsTagHref(tag: string): string {
	return buildNewsHref({ tag });
}

export function projectTagHref(tag: string): string {
	return projectsHref({ tag });
}

export function galleryTagHref(tag: string): string {
	return buildGalleryHref({ q: tag });
}

export function videoTagHref(tag: string, basePath = "/videos"): string {
	return buildVideoHref({ q: tag, basePath });
}

export function videoTopicHref(topicId: number, basePath = "/videos"): string {
	return buildVideoHref({ topic: topicId, basePath });
}

export function videoTypeHref(type: VideoType, basePath = "/videos"): string {
	return buildVideoHref({ type, basePath });
}

export function videoMemoriesHref(basePath = "/videos"): string {
	return buildVideoHref({ memories: true, basePath });
}

export function audioTagHref(tag: string): string {
	return buildAudioHref({ tag });
}

export function audioTopicHref(topicId: number): string {
	return buildAudioHref({ topic: topicId });
}

export function audioSoundTypeHref(soundType: string): string {
	return buildAudioHref({ type: soundType });
}

export function writingTagHref(tag: string): string {
	return buildWritingsHref({ tag });
}

export function writingKeywordHref(keyword: string): string {
	return buildWritingsHref({ keyword });
}

export function writingGenreHref(genre: string): string {
	if (isBookGenre(genre)) {
		return buildWritingsHref({ genre });
	}
	return buildWritingsHref({ q: genre });
}
