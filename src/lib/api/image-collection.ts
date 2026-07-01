import "server-only";
import {
	apiFetchPage,
	BULK_FETCH_SIZE,
	DEFAULT_REVALIDATE,
} from "@/lib/api/client";
import { getApiBaseUrl } from "@/lib/api/config";
import { normalizeImageCollectionRecord } from "@/lib/api/normalize";
import { resolveImageCollectionItems } from "@/lib/gallery/resolve";
import { HOME_IMAGE_BENTO_COUNT } from "@/lib/home/image-bento";
import type { ImageCollectionItem } from "@/lib/mock/image-collection";
import { getImageCollection as getMockImageCollection } from "@/lib/mock/image-collection";
import { ImageCollectionSchema } from "@/types/gallery";

const GALLERY_ENDPOINT = "/api/v1/image-collections";
const GALLERY_TAG = "image-collections";

export async function getImageCollection(
	locale: string,
): Promise<ImageCollectionItem[]> {
	if (!getApiBaseUrl()) {
		return getMockImageCollection(locale).slice(0, HOME_IMAGE_BENTO_COUNT);
	}

	const page = await apiFetchPage(GALLERY_ENDPOINT, {
		itemSchema: ImageCollectionSchema,
		tags: [GALLERY_TAG],
		revalidate: DEFAULT_REVALIDATE,
		searchParams: { page: 0, size: BULK_FETCH_SIZE },
		normalizeItem: normalizeImageCollectionRecord,
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
