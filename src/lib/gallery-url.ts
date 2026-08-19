import type { GalleryCollectionType } from "@/lib/mock/gallery";

export type GalleryUrlParams = {
	q?: string | null;
	type?: GalleryCollectionType | string | null;
	topic?: number | string | null;
	page?: number;
};

const GALLERY_TYPES = new Set<string>(["SINGLE", "GALLERY", "PHOTO_STORY"]);

export function isGalleryCollectionType(
	value: string | null | undefined,
): value is GalleryCollectionType {
	return Boolean(value && GALLERY_TYPES.has(value));
}

export function parseGalleryTopicId(
	value?: string | number | null,
): number | null {
	if (value == null || value === "") {
		return null;
	}
	const parsed = typeof value === "number" ? value : Number.parseInt(value, 10);
	return Number.isInteger(parsed) && parsed > 0 ? parsed : null;
}

export function buildGalleryHref({
	q,
	type,
	topic,
	page,
}: GalleryUrlParams = {}): "/gallery" | `/gallery?${string}` {
	const params = new URLSearchParams();

	if (q?.trim()) {
		params.set("q", q.trim());
	}
	if (type && isGalleryCollectionType(type)) {
		params.set("type", type);
	}
	const topicId = parseGalleryTopicId(topic);
	if (topicId != null) {
		params.set("topic", String(topicId));
	}
	if (page && page > 1) {
		params.set("page", String(page));
	}

	const qs = params.toString();
	return qs ? (`/gallery?${qs}` as const) : "/gallery";
}
