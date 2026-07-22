import type { MediaItem } from "@/types/media";

export type NewsMediaModalItemsResult = {
	items: MediaItem[];
	coverIndex: number;
	/** Offset added to gallery thumbnail indices when opening the modal. */
	galleryIndexOffset: number;
};

/**
 * Builds the unified news media carousel: cover plus gallery items, with the
 * cover prepended only when it is not already in the gallery.
 */
export function buildNewsMediaModalItems(
	cover: MediaItem | null,
	galleryItems: MediaItem[],
): NewsMediaModalItemsResult {
	if (!cover) {
		return {
			items: galleryItems,
			coverIndex: 0,
			galleryIndexOffset: 0,
		};
	}

	if (galleryItems.length === 0) {
		return {
			items: [cover],
			coverIndex: 0,
			galleryIndexOffset: 0,
		};
	}

	const matchingIndex = galleryItems.findIndex(
		(item) => item.url === cover.url && item.kind === cover.kind,
	);
	if (matchingIndex >= 0) {
		return {
			items: galleryItems,
			coverIndex: matchingIndex,
			galleryIndexOffset: 0,
		};
	}

	return {
		items: [cover, ...galleryItems],
		coverIndex: 0,
		galleryIndexOffset: 1,
	};
}
