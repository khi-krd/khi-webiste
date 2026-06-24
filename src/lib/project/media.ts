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

export function parseMediaKind(value: unknown): MediaKind {
	if (value === "VIDEO" || value === "AUDIO" || value === "IMAGE") {
		return value;
	}
	return "IMAGE";
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
					kind: parseMediaKind(record.kind ?? record.mediaType ?? record.type),
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
