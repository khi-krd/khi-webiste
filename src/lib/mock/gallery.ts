// Formerly the demo gallery catalogue — now only the shared types and pure
// list helpers production code still imports. All records come from the CMS
// via `@/lib/api/gallery` and `@/lib/api/image-collection`.

export type GalleryAspect = "2/3" | "3/4" | "4/5";
export type GalleryCategory = "photography" | "traditionalDress" | "crafts";

export type GalleryHeroImage = {
	id: string;
	image: { url: string; alt: string };
	/** Short hover label on the marquee card. */
	title: string;
	category?: GalleryCategory;
	/** Localized category eyebrow for the hover card. */
	categoryLabel?: string;
	/** Ratio box the card crops into — varying these creates the masonry rhythm. */
	aspect: GalleryAspect;
	/** Collection detail path — marquee cards link through when set. */
	href?: string;
};

export type GalleryHeroColumns = {
	/** Drifts up in the hero marquee. */
	up: GalleryHeroImage[];
	/** Drifts down. */
	down: GalleryHeroImage[];
};

export type GalleryCollectionType = "SINGLE" | "GALLERY" | "PHOTO_STORY";

export type GalleryAlbumItem = {
	id: number;
	/** Uploaded S3/CDN URL — present for hosted files. */
	imageUrl?: string;
	/** Third-party page link — UI may link out instead of lightboxing. */
	externalUrl?: string;
	/** iframe-embeddable URL — UI may embed instead of lightboxing. */
	embedUrl?: string;
	/** Localized caption (captionCkb / captionKmr resolved per locale). */
	caption?: string;
	/** Localized long description (descriptionCkb / descriptionKmr). */
	description?: string;
	/**
	 * `description` rendered to sanitized HTML by renderRichText during
	 * resolve — the lightbox injects it as markup, preserving the editor's
	 * bold/highlight/color/spacing.
	 */
	descriptionHtml?: string;
	/** 0-based display order — the album arrives sorted ASC. */
	sortOrder: number;
	/* Auto-extracted upload metadata — absent for URL-only items (per API). */
	widthPx?: number;
	heightPx?: number;
	/** widthPx / heightPx, as the API computes it. */
	aspectRatio?: number;
	humanReadableSize?: string;
	mimeType?: string;
	fileSizeBytes?: number;
};

export type GalleryPost = {
	/** Collection slug (or numeric id when the CMS has no slug). */
	id: string;
	collectionType: GalleryCollectionType;
	title: string;
	/** Markdown or legacy HTML — render via RichText. */
	description: string;
	location?: string;
	collectedBy?: string;
	/** Numeric IMAGE topic id — the key the `topicId` filter matches on. */
	topicId?: number;
	/** Localized topic name (topicNameCkb / topicNameKmr). */
	topicName?: string;
	/** All linked topic ids/names — multi-topic collections expose every one. */
	topicIds?: number[];
	topicNames?: string[];
	/** ISO-8601 date (YYYY-MM-DD). */
	publishmentDate: string;
	tags: string[];
	/** CMS cover/thumbnail URL — may differ from album[0]. */
	coverUrl?: string;
	/** Alternate cover shown while the print is hovered. */
	hoverCoverUrl?: string;
	/** Ordered album — its length IS the photo count (no separate field). */
	album: GalleryAlbumItem[];
};

export const GALLERY_POSTS_PER_PAGE = 4;

export function filterGalleryPosts(
	items: GalleryPost[],
	query?: string | null,
	type?: string | null,
	topicId?: number | null,
): GalleryPost[] {
	const trimmedQuery = query?.trim().toLowerCase();
	const trimmedType = type?.trim().toUpperCase();

	return items.filter((item) => {
		if (trimmedType && item.collectionType !== trimmedType) {
			return false;
		}

		// A record the CMS left without a topic id can never match a picked topic.
		if (topicId != null && item.topicId !== topicId) {
			return false;
		}

		if (!trimmedQuery) {
			return true;
		}

		return (
			item.title.toLowerCase().includes(trimmedQuery) ||
			item.tags.some((tag) => tag.toLowerCase().includes(trimmedQuery)) ||
			item.topicName?.toLowerCase().includes(trimmedQuery)
		);
	});
}

export function paginateGalleryPosts<T>(
	items: T[],
	page: number,
	perPage: number = GALLERY_POSTS_PER_PAGE,
): { items: T[]; totalPages: number; currentPage: number } {
	const totalPages = Math.max(1, Math.ceil(items.length / perPage));
	const currentPage = Math.min(Math.max(1, page), totalPages);
	const start = (currentPage - 1) * perPage;

	return {
		items: items.slice(start, start + perPage),
		totalPages,
		currentPage,
	};
}

export type GalleryPostDetail = {
	post: GalleryPost;
	previous: GalleryPost | null;
	next: GalleryPost | null;
	/** Nearest other collections — the detail page's "وێنەی تر" row. */
	related: GalleryPost[];
};

/**
 * Nearest neighbours around `index` (next first, then previous, widening
 * outward), so the row stays meaningful at either end of the archive. An
 * unknown index falls back to the head of the list.
 */
export function collectRelatedGalleryPosts(
	posts: GalleryPost[],
	index: number,
	count = 3,
): GalleryPost[] {
	if (index < 0) {
		return posts.slice(0, count);
	}

	const related: GalleryPost[] = [];
	for (let offset = 1; offset < posts.length; offset++) {
		const after = posts[index + offset];
		if (after) related.push(after);
		if (related.length >= count) break;

		const before = posts[index - offset];
		if (before) related.push(before);
		if (related.length >= count) break;
	}

	return related.slice(0, count);
}
