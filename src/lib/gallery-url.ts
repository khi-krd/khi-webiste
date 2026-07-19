import type { GalleryCollectionType } from "@/lib/mock/gallery";

export type GalleryUrlParams = {
	q?: string | null;
	type?: GalleryCollectionType | string | null;
	page?: number;
};

const GALLERY_TYPES = new Set<string>(["SINGLE", "GALLERY", "PHOTO_STORY"]);

export function isGalleryCollectionType(
	value: string | null | undefined,
): value is GalleryCollectionType {
	return Boolean(value && GALLERY_TYPES.has(value));
}

export function buildGalleryHref({
	q,
	type,
	page,
}: GalleryUrlParams = {}): "/gallery" | `/gallery?${string}` {
	const params = new URLSearchParams();

	if (q?.trim()) {
		params.set("q", q.trim());
	}
	if (type && isGalleryCollectionType(type)) {
		params.set("type", type);
	}
	if (page && page > 1) {
		params.set("page", String(page));
	}

	const qs = params.toString();
	return qs ? (`/gallery?${qs}` as const) : "/gallery";
}
