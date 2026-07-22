import {
	albumItemToLightboxItem,
	type GalleryLightboxItem,
} from "@/components/gallery/gallery-album-item";
import type { GalleryAlbumItem } from "@/lib/mock/gallery";

export type GalleryLightboxItemsResult = {
	items: GalleryLightboxItem[];
	coverIndex: number;
	/** Offset added to album grid indices when opening the lightbox. */
	albumIndexOffset: number;
};

/**
 * Builds the unified lightbox carousel: album frames plus the CMS cover when
 * it is not already present in the album.
 */
export function buildGalleryLightboxItems(
	coverUrl: string | undefined,
	albumItems: GalleryAlbumItem[],
	postTitle: string,
): GalleryLightboxItemsResult {
	const albumLightboxItems = albumItems.map((item) =>
		albumItemToLightboxItem(item, postTitle),
	);

	if (!coverUrl) {
		return {
			items: albumLightboxItems,
			coverIndex: 0,
			albumIndexOffset: 0,
		};
	}

	const matchingIndex = albumItems.findIndex(
		(item) => item.imageUrl === coverUrl,
	);
	if (matchingIndex >= 0) {
		return {
			items: albumLightboxItems,
			coverIndex: matchingIndex,
			albumIndexOffset: 0,
		};
	}

	const coverItem: GalleryLightboxItem = {
		id: "cover",
		imageUrl: coverUrl,
		context: postTitle,
		sortOrder: -1,
	};

	return {
		items: [coverItem, ...albumLightboxItems],
		coverIndex: 0,
		albumIndexOffset: 1,
	};
}
