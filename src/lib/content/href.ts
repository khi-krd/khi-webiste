import { audioDetailHref } from "@/lib/audio/resolve";
import { projectDetailHref } from "@/lib/content/project-href";
import { videoDetailHref } from "@/lib/video/resolve";
import type { ContentType, FeaturedItem } from "@/types/content";
import { TYPE_SEGMENTS } from "@/types/content";

// Re-exported so existing `@/lib/content/href` importers keep working; the
// definition lives in a zod-free module so client code can use it directly.
export { projectDetailHref };

function resolveNumericId(id: string, slug: string): number | null {
	for (const value of [slug, id]) {
		const parsed = Number.parseInt(value, 10);
		if (Number.isInteger(parsed) && parsed > 0 && String(parsed) === value) {
			return parsed;
		}
	}
	return null;
}

/** Locale-relative news article path. */
export function newsDetailHref(slug: string): string {
	return `/news/${slug}`;
}

/** Locale-relative gallery post path. */
export function galleryDetailHref(slug: string): string {
	return `/gallery/${slug}`;
}

/** Locale-relative listing path for a content type (consumed by the i18n Link). */
export function contentListingHref(type: ContentType): string {
	return `/${TYPE_SEGMENTS[type]}`;
}

/** Locale-relative detail path for a featured item — only routes that exist today. */
export function contentDetailHref(
	item: Pick<FeaturedItem, "type" | "id" | "slug">,
): string {
	const listing = contentListingHref(item.type);

	switch (item.type) {
		case "book":
			return `${listing}/${item.slug || item.id}`;
		case "song":
		case "audio": {
			const trackId = resolveNumericId(item.id, item.slug);
			return trackId != null ? audioDetailHref(trackId) : listing;
		}
		case "video": {
			const videoId = resolveNumericId(item.id, item.slug);
			return videoId != null ? videoDetailHref(videoId) : listing;
		}
		case "gallery":
			return galleryDetailHref(item.slug || item.id);
		case "article":
			return item.slug || item.id
				? newsDetailHref(item.slug || item.id)
				: listing;
		case "archive":
			return listing;
		default:
			return listing;
	}
}
