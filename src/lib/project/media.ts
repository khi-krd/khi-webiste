import type { MediaItem, MediaKind } from "@/types/media";

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
		lower.startsWith("youtube/")
	) {
		return "VIDEO";
	}

	return null;
}

export function parseMediaKind(
	value: unknown,
	url?: string | null,
): MediaKind {
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
			if (!url) return [];

			const caption =
				locale === "ckb"
					? firstNonBlank(
							typeof record.captionCkb === "string"
								? record.captionCkb
								: null,
							typeof record.captionKmr === "string"
								? record.captionKmr
								: null,
							typeof record.caption === "string" ? record.caption : null,
						)
					: firstNonBlank(
							typeof record.captionKmr === "string"
								? record.captionKmr
								: null,
							typeof record.captionCkb === "string"
								? record.captionCkb
								: null,
							typeof record.caption === "string" ? record.caption : null,
						);

			const sortOrder =
				typeof record.sortOrder === "number" && Number.isFinite(record.sortOrder)
					? record.sortOrder
					: index;

			return [
				{
					url,
					kind: parseMediaKind(
						record.kind ?? record.mediaType ?? record.type,
						url,
					),
					thumbnailUrl: firstNonBlank(
						typeof record.thumbnailUrl === "string"
							? record.thumbnailUrl
							: null,
					),
					caption,
					sortOrder,
				},
			];
		})
		.sort((a, b) => a.sortOrder - b.sortOrder);
}

export function countGalleryMedia(items: MediaItem[]) {
	return {
		images: items.filter((item) => item.kind === "IMAGE").length,
		videos: items.filter((item) => item.kind === "VIDEO").length,
		audio: items.filter((item) => item.kind === "AUDIO").length,
	};
}
