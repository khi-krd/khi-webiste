import type { MediaItem, MediaKind } from "@/types/media";
import {
	getYouTubePosterUrl,
	parseYouTubeVideoId,
} from "@/lib/video/source";

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

function normalizeDeclaredMediaKind(value: unknown): MediaKind | null {
	if (value === "VIDEO" || value === "AUDIO" || value === "IMAGE") {
		return value;
	}

	if (typeof value === "string") {
		const upper = value.trim().toUpperCase();
		if (upper === "VIDEO" || upper === "AUDIO" || upper === "IMAGE") {
			return upper;
		}
	}

	return null;
}

/** Infer media kind from a URL path or known embed hosts. */
export function inferMediaKindFromUrl(url: string): MediaKind | null {
	const trimmed = url.trim();
	if (!trimmed) return null;

	const path = trimmed.split(/[?#]/)[0]?.toLowerCase() ?? "";
	if (/\.(mp4|webm|mov|m4v|ogv)$/.test(path)) return "VIDEO";
	if (/\.(mp3|m4a|wav|ogg|aac|flac)$/.test(path)) return "AUDIO";
	if (/\.(jpe?g|png|gif|webp|avif|svg|bmp|ico|heic|heif)$/.test(path)) {
		return "IMAGE";
	}

	const lower = trimmed.toLowerCase();
	if (
		lower.includes("youtube.com") ||
		lower.includes("youtu.be") ||
		lower.startsWith("youtube/") ||
		lower.includes("vimeo.com") ||
		lower.includes("dailymotion.com")
	) {
		return "VIDEO";
	}

	if (
		lower.includes("soundcloud.com") ||
		lower.includes("spotify.com") ||
		lower.includes("mixcloud.com") ||
		lower.includes("audiomack.com")
	) {
		return "AUDIO";
	}

	return null;
}

export function parseMediaKind(value: unknown, url?: string | null): MediaKind {
	const declared = normalizeDeclaredMediaKind(value);
	const inferred = url ? inferMediaKindFromUrl(url) : null;

	// CMS rows sometimes mark an image URL as VIDEO/AUDIO — trust the file URL.
	if (declared && inferred && declared !== inferred) {
		return inferred;
	}

	return declared ?? inferred ?? "IMAGE";
}

export function parseMediaGallery(
	gallery: unknown[] | undefined,
	locale: string,
): MediaItem[] {
	if (!gallery?.length) return [];

	return gallery
		.flatMap((entry, index) => {
			if (!entry || typeof entry !== "object") return [];
			const record = entry as Record<string, unknown>;

			const url = firstNonBlank(
				typeof record.url === "string" ? record.url : null,
				typeof record.mediaUrl === "string" ? record.mediaUrl : null,
			);
			const externalUrl = firstNonBlank(
				typeof record.externalUrl === "string" ? record.externalUrl : null,
				typeof record.external_url === "string" ? record.external_url : null,
			);
			const embedUrl = firstNonBlank(
				typeof record.embedUrl === "string" ? record.embedUrl : null,
				typeof record.embed_url === "string" ? record.embed_url : null,
			);
			// An item is playable when it carries ANY source: a direct file, an
			// embeddable player URL, or an external page link.
			if (!url && !externalUrl && !embedUrl) return [];

			const bestSrc = url ?? embedUrl ?? externalUrl;

			const caption =
				locale === "ckb"
					? firstNonBlank(
							typeof record.captionCkb === "string" ? record.captionCkb : null,
							typeof record.captionKmr === "string" ? record.captionKmr : null,
							typeof record.caption === "string" ? record.caption : null,
						)
					: firstNonBlank(
							typeof record.captionKmr === "string" ? record.captionKmr : null,
							typeof record.captionCkb === "string" ? record.captionCkb : null,
							typeof record.caption === "string" ? record.caption : null,
						);

			const sortOrder =
				typeof record.sortOrder === "number" &&
				Number.isFinite(record.sortOrder)
					? record.sortOrder
					: index;

			return [
				{
					url: url ?? "",
					kind: parseMediaKind(
						record.kind ?? record.mediaType ?? record.type,
						bestSrc,
					),
					externalUrl,
					embedUrl,
					thumbnailUrl:
						firstNonBlank(
							typeof record.thumbnailUrl === "string"
								? record.thumbnailUrl
								: null,
						) ?? youTubePosterFor(bestSrc),
					caption,
					sortOrder,
				},
			];
		})
		.sort((a, b) => a.sortOrder - b.sortOrder);
}

/** YouTube's own poster image for media records with no stored thumbnail. */
function youTubePosterFor(url: string | null | undefined): string | null {
	const id = url ? parseYouTubeVideoId(url) : null;
	return id ? getYouTubePosterUrl(id) : null;
}

export function countGalleryMedia(items: MediaItem[]) {
	return {
		images: items.filter((item) => item.kind === "IMAGE").length,
		videos: items.filter((item) => item.kind === "VIDEO").length,
		audio: items.filter((item) => item.kind === "AUDIO").length,
	};
}
