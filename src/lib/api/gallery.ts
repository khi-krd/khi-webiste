import "server-only";
import {
	apiFetchPage,
	apiFetchRaw,
	BULK_FETCH_SIZE,
	DEFAULT_REVALIDATE,
	unwrapApiPayload,
} from "@/lib/api/client";
import { getApiBaseUrl } from "@/lib/api/config";
import { normalizeImageCollectionRecord } from "@/lib/api/normalize";
import {
	resolveGalleryHeroColumns,
	resolveGalleryPost,
	resolveGalleryPosts,
} from "@/lib/gallery/resolve";
import {
	GALLERY_POSTS_PER_PAGE,
	type GalleryHeroColumns,
	type GalleryPost,
	type GalleryPostDetail,
	getGalleryHeroColumns as getMockGalleryHeroColumns,
	getGalleryPostBySlug as getMockGalleryPostBySlug,
	getGalleryPosts as getMockGalleryPosts,
	paginateGalleryPosts,
} from "@/lib/mock/gallery";
import {
	ImageCollectionSchema,
} from "@/types/gallery";

const GALLERY_ENDPOINT = "/api/v1/image-collections";
const GALLERY_TAG = "image-collections";

export {
	GALLERY_POSTS_PER_PAGE,
	type GalleryHeroColumns,
	type GalleryPost,
	type GalleryPostDetail,
	paginateGalleryPosts,
};

async function fetchAllCollections() {
	const page = await apiFetchPage(GALLERY_ENDPOINT, {
		itemSchema: ImageCollectionSchema,
		tags: [GALLERY_TAG],
		revalidate: DEFAULT_REVALIDATE,
		searchParams: { page: 0, size: BULK_FETCH_SIZE },
		normalizeItem: normalizeImageCollectionRecord,
	});

	return page?.content.length ? page.content : null;
}

export async function getGalleryPosts(locale: string): Promise<GalleryPost[]> {
	if (!getApiBaseUrl()) {
		return getMockGalleryPosts(locale);
	}

	const raw = await fetchAllCollections();
	if (!raw) {
		return getMockGalleryPosts(locale);
	}

	const posts = resolveGalleryPosts(locale, raw);
	return posts.length > 0 ? posts : getMockGalleryPosts(locale);
}

export async function getGalleryHeroColumns(
	locale: string,
): Promise<GalleryHeroColumns> {
	if (!getApiBaseUrl()) {
		return getMockGalleryHeroColumns(locale);
	}

	const raw = await fetchAllCollections();
	if (!raw) {
		return getMockGalleryHeroColumns(locale);
	}

	const columns = resolveGalleryHeroColumns(locale, raw);
	if (columns.up.length === 0 && columns.down.length === 0) {
		return getMockGalleryHeroColumns(locale);
	}

	return columns;
}

export async function getGalleryPostBySlug(
	locale: string,
	slug: string,
): Promise<GalleryPostDetail | null> {
	if (getApiBaseUrl()) {
		const fetchDetail = async (path: string) => {
			const raw = await apiFetchRaw(path, {
				tags: [GALLERY_TAG],
				revalidate: DEFAULT_REVALIDATE,
			});
			const unwrapped = unwrapApiPayload(raw);
			return unwrapped
				? ImageCollectionSchema.safeParse(
						normalizeImageCollectionRecord(unwrapped),
					)
				: null;
		};

		const slugDetail = await fetchDetail(
			`${GALLERY_ENDPOINT}/slug/${encodeURIComponent(slug)}`,
		);

		if (slugDetail?.success) {
			const post = resolveGalleryPost(locale, slugDetail.data);
			if (post) {
				const allPosts = await getGalleryPosts(locale);
				const index = allPosts.findIndex(
					(entry) => entry.id === post.id || entry.id === slug,
				);
				return {
					post,
					previous: index > 0 ? allPosts[index - 1] : null,
					next:
						index >= 0 && index < allPosts.length - 1
							? allPosts[index + 1]
							: null,
				};
			}
		}

		const numericId = Number.parseInt(slug, 10);
		const isNumericSlug =
			Number.isInteger(numericId) &&
			numericId > 0 &&
			String(numericId) === slug;

		if (isNumericSlug) {
			const detail = await fetchDetail(`${GALLERY_ENDPOINT}/${numericId}`);

			if (detail?.success) {
				const post = resolveGalleryPost(locale, detail.data);
				if (post) {
					const allPosts = await getGalleryPosts(locale);
					const index = allPosts.findIndex((entry) => entry.id === post.id);
					return {
						post,
						previous: index > 0 ? allPosts[index - 1] : null,
						next:
							index >= 0 && index < allPosts.length - 1
								? allPosts[index + 1]
								: null,
					};
				}
			}
		}
	}

	return getMockGalleryPostBySlug(locale, slug);
}
