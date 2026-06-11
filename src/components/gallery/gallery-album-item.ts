import type { GalleryAlbumItem } from "@/lib/mock/gallery";
import { cn } from "@/lib/utils";

/** UI shape for one lightbox frame — mirrors `ImageItemDto` after locale resolution. */
export type GalleryLightboxItem = {
	id: string | number;
	imageUrl?: string;
	externalUrl?: string;
	embedUrl?: string;
	alt?: string;
	caption?: string;
	description?: string;
	sortOrder?: number;
	fileSizeBytes?: number;
	widthPx?: number;
	heightPx?: number;
	mimeType?: string;
	aspectRatio?: number;
	humanReadableSize?: string;
	context?: string;
};

/** Maps a locale-resolved `ImageItemDto` onto the lightbox record shape. */
export function albumItemToLightboxItem(
	item: GalleryAlbumItem,
	collectionTitle: string,
): GalleryLightboxItem {
	return {
		id: item.id,
		imageUrl: item.imageUrl,
		externalUrl: item.externalUrl,
		embedUrl: item.embedUrl,
		caption: item.caption,
		description: item.description,
		sortOrder: item.sortOrder,
		fileSizeBytes: item.fileSizeBytes,
		widthPx: item.widthPx,
		heightPx: item.heightPx,
		mimeType: item.mimeType,
		aspectRatio: item.aspectRatio,
		humanReadableSize: item.humanReadableSize,
		context: collectionTitle,
	};
}

export function formatAspectRatio(ratio: number): string {
	return ratio.toLocaleString(undefined, { maximumFractionDigits: 4 });
}

export function formatFileSizeBytes(bytes: number): string {
	return bytes.toLocaleString();
}

export type GalleryAlbumMetadataLabels = {
	dimensions: string;
	fileSize: string;
	fileSizeBytes: string;
	mimeType: string;
	aspectRatio: string;
	sortOrder: string;
	externalUrl: string;
	embedUrl: string;
};

/** Hairline frame + recessed fill so photos read apart from page sections. */
export const galleryPhotoSurfaceClass = cn(
	"border border-border bg-surface shadow-[inset_0_0_0_1px_rgba(26,24,19,0.05)]",
);

/** Sunken tray behind multi-image strips. */
export const galleryStripTrayClass = "bg-sunken p-1 sm:p-1.5";
