import "server-only";
import {
	apiFetchPage,
	apiFetchRaw,
	BULK_FETCH_SIZE,
	DEFAULT_REVALIDATE,
	unwrapApiPayload,
} from "@/lib/api/client";
import { getApiBaseUrl } from "@/lib/api/config";
import {
	applyMockPolicy,
	applyMockPolicyNullable,
} from "@/lib/api/mock-policy";
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
	filterGalleryPosts,
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
	filterGalleryPosts,
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
	const raw = getApiBaseUrl() ? await fetchAllCollections() : null;
	const apiItems = raw ? resolveGalleryPosts(locale, raw) : [];

	return applyMockPolicy({
		context: "global",
		apiItems,
		getMockItems: () => getMockGalleryPosts(locale),
	});
}

export async function getGalleryHeroColumns(
	locale: string,
): Promise<GalleryHeroColumns> {
	const emptyColumns: GalleryHeroColumns = { up: [], down: [] };
	const raw = getApiBaseUrl() ? await fetchAllCollections() : null;
	const apiColumns = raw
		? resolveGalleryHeroColumns(locale, raw)
		: emptyColumns;
	const hasApiColumns =
		apiColumns.up.length > 0 || apiColumns.down.length > 0;

	return (
		applyMockPolicyNullable({
			apiValue: hasApiColumns ? apiColumns : null,
			getMockValue: () => getMockGalleryHeroColumns(locale),
		}) ?? emptyColumns
	);
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

	return applyMockPolicyNullable({
		apiValue: null,
		getMockValue: () => getMockGalleryPostBySlug(locale, slug),
	});
}
