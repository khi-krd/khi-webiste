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

/** All three collection types (SINGLE, GALLERY, PHOTO_STORY) belong in the
 *  home bento — no type filter. */
const BENTO_COLLECTION_TYPE: GalleryCollectionType | undefined = undefined;

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

	// Every type shows: singles, galleries, and photo stories all appear in the
	// bento. The unfiltered page already returns newest-first.
	const page = await fetchCollections(BENTO_COLLECTION_TYPE);

	const apiItems = page?.content.length
		? resolveImageCollectionItems(locale, page.content)
		: [];

	return sliceToCount(apiItems, HOME_IMAGE_BENTO_COUNT);
}
