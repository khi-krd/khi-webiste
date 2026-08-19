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
	filterGalleryPosts,
	GALLERY_POSTS_PER_PAGE,
	type GalleryCollectionType,
	type GalleryHeroColumns,
	type GalleryPost,
	type GalleryPostDetail,
	paginateGalleryPosts,
} from "@/lib/mock/gallery";
import { ImageCollectionSchema } from "@/types/gallery";

const GALLERY_ENDPOINT = "/api/v1/image-collections";
const GALLERY_TAG = "image-collections";

export {
	filterGalleryPosts,
	GALLERY_POSTS_PER_PAGE,
	type GalleryHeroColumns,
	type GalleryPost,
	type GalleryPostDetail,
	paginateGalleryPosts,
};

export type GalleryListingOptions = {
	/** Canonical enum only — an unknown value answers HTTP 500 upstream. */
	type?: GalleryCollectionType | null;
	topicId?: number | null;
};

export type GalleryTopicOption = {
	id: number;
	name: string;
};

function buildCollectionParams({
	type,
	topicId,
}: GalleryListingOptions): Record<string, string | number | undefined> {
	const searchParams: Record<string, string | number | undefined> = {
		page: 0,
		size: BULK_FETCH_SIZE,
	};

	// Priority chain, not a combination: given both, the backend answers `type`
	// and silently drops `topicId`. Only the winner travels; the loser is narrowed
	// in memory by filterGalleryPosts.
	if (type != null) {
		searchParams.type = type;
	} else if (topicId != null) {
		searchParams.topicId = topicId;
	}

	return searchParams;
}

async function fetchCollectionsPage(
	searchParams: Record<string, string | number | undefined>,
) {
	return apiFetchPage(GALLERY_ENDPOINT, {
		itemSchema: ImageCollectionSchema,
		tags: [GALLERY_TAG],
		revalidate: DEFAULT_REVALIDATE,
		searchParams,
		normalizeItem: normalizeImageCollectionRecord,
	});
}

async function fetchAllCollections(options: GalleryListingOptions = {}) {
	const searchParams = buildCollectionParams(options);
	const isFiltered = searchParams.type != null || searchParams.topicId != null;
	let page = await fetchCollectionsPage(searchParams);

	// A rejected filter must not blank the grid — an empty 200 is a real "no
	// matches" and stays empty, but a failed request falls back to the full set
	// for the in-memory pass to narrow.
	if (!page && isFiltered) {
		page = await fetchCollectionsPage(buildCollectionParams({}));
	}

	return page?.content.length ? page.content : null;
}

/**
 * Second argument is optional on purpose: global-search taxonomy and the
 * detail page's prev/next neighbours both need the unfiltered set.
 */
export async function getGalleryPosts(
	locale: string,
	options: GalleryListingOptions = {},
): Promise<GalleryPost[]> {
	const raw = getApiBaseUrl() ? await fetchAllCollections(options) : null;
	const apiItems = raw ? resolveGalleryPosts(locale, raw) : [];

	return apiItems;
}

function collectTopicOptions(
	locale: string,
	posts: GalleryPost[],
): GalleryTopicOption[] {
	const map = new Map<number, GalleryTopicOption>();

	for (const post of posts) {
		if (post.topicId == null || !post.topicName) {
			continue;
		}

		if (!map.has(post.topicId)) {
			map.set(post.topicId, { id: post.topicId, name: post.topicName });
		}
	}

	return [...map.values()].sort((a, b) =>
		a.name.localeCompare(b.name, locale === "ckb" ? "ckb" : "ku"),
	);
}

/**
 * Topic options for the gallery filter UI, derived from the collections
 * themselves (image collections have no topics list endpoint). Always fetched
 * unfiltered, otherwise picking a topic would collapse the select to that one
 * option and strand the reader.
 */
export async function getGalleryTopics(
	locale: string,
): Promise<GalleryTopicOption[]> {
	if (!getApiBaseUrl()) {
		return [];
	}

	const raw = await fetchAllCollections();
	const posts = raw ? resolveGalleryPosts(locale, raw) : [];

	return collectTopicOptions(locale, posts);
}

export async function getGalleryHeroColumns(
	locale: string,
): Promise<GalleryHeroColumns> {
	const emptyColumns: GalleryHeroColumns = { up: [], down: [] };
	const raw = getApiBaseUrl() ? await fetchAllCollections() : null;
	const apiColumns = raw
		? resolveGalleryHeroColumns(locale, raw)
		: emptyColumns;
	const hasApiColumns = apiColumns.up.length > 0 || apiColumns.down.length > 0;

	return hasApiColumns ? apiColumns : emptyColumns;
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

	return null;
}
