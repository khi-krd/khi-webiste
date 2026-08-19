import "server-only";
import {
	apiFetchPage,
	BULK_FETCH_SIZE,
	DEFAULT_REVALIDATE,
	sliceToCount,
} from "@/lib/api/client";
import { getApiBaseUrl } from "@/lib/api/config";
import { normalizeImageCollectionRecord } from "@/lib/api/normalize";
import { resolveImageCollectionItems } from "@/lib/gallery/resolve";
import { HOME_IMAGE_BENTO_COUNT } from "@/lib/home/image-bento";
import type { GalleryCollectionType } from "@/lib/mock/gallery";
import type { ImageCollectionItem } from "@/lib/mock/image-collection";
import { ImageCollectionSchema } from "@/types/gallery";

const GALLERY_ENDPOINT = "/api/v1/image-collections";
const GALLERY_TAG = "image-collections";

/** The bento is a cover wall, so multi-image galleries read best in it. */
const BENTO_COLLECTION_TYPE: GalleryCollectionType = "GALLERY";

async function fetchCollections(type?: GalleryCollectionType) {
	return apiFetchPage(GALLERY_ENDPOINT, {
		itemSchema: ImageCollectionSchema,
		tags: [GALLERY_TAG],
		revalidate: DEFAULT_REVALIDATE,
		searchParams: { page: 0, size: BULK_FETCH_SIZE, type },
		normalizeItem: normalizeImageCollectionRecord,
	});
}

export async function getImageCollection(
	locale: string,
): Promise<ImageCollectionItem[]> {
	if (!getApiBaseUrl()) {
		return sliceToCount([], HOME_IMAGE_BENTO_COUNT);
	}

	// A CMS that files everything as PHOTO_STORY/SINGLE must still fill the grid,
	// otherwise the whole homepage section drops out.
	const typed = await fetchCollections(BENTO_COLLECTION_TYPE);
	const page = typed?.content.length ? typed : await fetchCollections();

	const apiItems = page?.content.length
		? resolveImageCollectionItems(locale, page.content)
		: [];

	return sliceToCount(apiItems, HOME_IMAGE_BENTO_COUNT);
}
