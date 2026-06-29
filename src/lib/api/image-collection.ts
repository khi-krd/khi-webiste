import "server-only";
import {
	apiFetch,
	BULK_FETCH_SIZE,
	DEFAULT_REVALIDATE,
} from "@/lib/api/client";
import { getApiBaseUrl } from "@/lib/api/config";
import { resolveImageCollectionItems } from "@/lib/gallery/resolve";
import { HOME_IMAGE_BENTO_COUNT } from "@/lib/home/image-bento";
import type { ImageCollectionItem } from "@/lib/mock/image-collection";
import { getImageCollection as getMockImageCollection } from "@/lib/mock/image-collection";
import { ImageCollectionsPageSchema } from "@/types/gallery";

const GALLERY_ENDPOINT = "/api/v1/image-collections";
const GALLERY_TAG = "image-collections";

export async function getImageCollection(
	locale: string,
): Promise<ImageCollectionItem[]> {
	if (!getApiBaseUrl()) {
		return getMockImageCollection(locale).slice(0, HOME_IMAGE_BENTO_COUNT);
	}

	const page = await apiFetch(GALLERY_ENDPOINT, {
		schema: ImageCollectionsPageSchema,
		tags: [GALLERY_TAG],
		revalidate: DEFAULT_REVALIDATE,
		searchParams: { page: 0, size: BULK_FETCH_SIZE },
	});

	if (!page?.content.length) {
		return getMockImageCollection(locale);
	}

	const items = resolveImageCollectionItems(locale, page.content).slice(
		0,
		HOME_IMAGE_BENTO_COUNT,
	);
	return items.length > 0
		? items
		: getMockImageCollection(locale).slice(0, HOME_IMAGE_BENTO_COUNT);
}
