import "server-only";
import {
	apiFetchItemArray,
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
const HOME_POPULAR_ENDPOINT = "/api/v1/home/popular";

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

	// Popular-first homepage feed; empty result falls back to the listing.
	const popular = await apiFetchItemArray(
		`${HOME_POPULAR_ENDPOINT}/collections`,
		{
			itemSchema: ImageCollectionSchema,
			tags: [GALLERY_TAG],
			revalidate: DEFAULT_REVALIDATE,
			searchParams: { limit: HOME_IMAGE_BENTO_COUNT },
			normalizeItem: normalizeImageCollectionRecord,
		},
	);
	const records = popular?.length
		? popular
		: (await fetchCollections(BENTO_COLLECTION_TYPE))?.content;

	const apiItems = records?.length
		? resolveImageCollectionItems(locale, records)
		: [];

	return sliceToCount(apiItems, HOME_IMAGE_BENTO_COUNT);
}
