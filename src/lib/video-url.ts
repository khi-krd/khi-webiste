import type { VideoType } from "@/types/video";

export type VideoUrlParams = {
	type?: VideoType | string | null;
	topic?: number | string | null;
	category?: number | string | null;
	memories?: boolean | null;
	q?: string | null;
	page?: number;
	/** Route the params hang off — defaults to the catalog. */
	basePath?: string;
};

export function parseVideoType(value?: string | null): VideoType | null {
	if (value === "film") {
		return "FILM";
	}
	if (value === "clip") {
		return "VIDEO_CLIP";
	}
	return null;
}

export function parseVideoTopicId(value?: string | null): number | null {
	if (!value) {
		return null;
	}
	const parsed = Number.parseInt(value, 10);
	return Number.isInteger(parsed) && parsed > 0 ? parsed : null;
}

export function parseVideoMemories(value?: string | null): boolean {
	return value === "1" || value === "true";
}

export const parseVideoCategoryId = parseVideoTopicId;

export function buildVideoHref({
	type,
	topic,
	category,
	memories,
	q,
	page,
	basePath = "/videos",
}: VideoUrlParams): string {
	const params = new URLSearchParams();

	const typeParam =
		type === "FILM" ? "film" : type === "VIDEO_CLIP" ? "clip" : null;
	if (typeParam) {
		params.set("type", typeParam);
	}
	if (topic != null && topic !== "") {
		params.set("topic", String(topic));
	}
	if (category != null && category !== "") {
		params.set("category", String(category));
	}
	if (memories) {
		params.set("memories", "1");
	}
	if (q?.trim()) {
		params.set("q", q.trim());
	}
	if (page && page > 1) {
		params.set("page", String(page));
	}

	const qs = params.toString();
	return qs ? `${basePath}?${qs}` : basePath;
}
