import { audioDetailHref } from "@/lib/audio/resolve";
import {
	projectDetailHref,
	projectsIndexHref,
} from "@/lib/content/project-href";
import { videoDetailHref } from "@/lib/video/resolve";
import type { ContentType, FeaturedItem } from "@/types/content";
import { TYPE_SEGMENTS } from "@/types/content";

// Re-exported so existing `@/lib/content/href` importers keep working; the
// definition lives in a zod-free module so client code can use it directly.
export { projectDetailHref };

function resolveNumericId(slug: string, id: string): number | null {
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

function firstNonBlank(
	...values: (string | null | undefined)[]
): string | null {
	for (const value of values) {
		if (value && value.trim().length > 0) {
			return value;
		}
	}
	return null;
}

/** Prefer locale slug; fall back to numeric id string. */
export function resolveContentSlug(
	locale: string,
	slugs: {
		slugCkb?: string | null;
		slugKmr?: string | null;
		id: number;
	},
): string {
	const slug =
		locale === "ckb"
			? firstNonBlank(slugs.slugCkb, slugs.slugKmr)
			: firstNonBlank(slugs.slugKmr, slugs.slugCkb);
	return slug ?? String(slugs.id);
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
			const trackId = resolveNumericId(item.slug, item.id);
			return trackId != null ? audioDetailHref(trackId) : listing;
		}
		case "video": {
			const videoId = resolveNumericId(item.slug, item.id);
			return videoId != null ? videoDetailHref(videoId) : listing;
		}
		case "gallery":
			return galleryDetailHref(item.slug || item.id);
		case "article":
			return item.slug || item.id
				? newsDetailHref(item.slug || item.id)
				: listing;
		case "archive": {
			const projectId = resolveNumericId(item.slug, item.id);
			return projectId != null
				? projectDetailHref(String(projectId))
				: projectsIndexHref();
		}
		// Institutional slides: the site has one page each, so the slide links to
		// the page itself. Services are one page of sections, so the backend's
		// slug (navAnchorId, else the id — both match a section id) scrolls to it.
		case "about":
		case "donation":
			return listing;
		case "service": {
			const anchor = item.slug.trim();
			return anchor ? `${listing}#${anchor}` : listing;
		}
		default:
			return listing;
	}
}
