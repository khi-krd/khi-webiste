"use client";

import {
	type GalleryAlbumMetadataLabels,
	galleryPhotoSurfaceClass,
} from "@/components/gallery/gallery-album-item";
import {
	GalleryLightbox,
	useGalleryLightbox,
} from "@/components/gallery/gallery-lightbox";
import { Image } from "@/components/ui/image";
import { buildGalleryLightboxItems } from "@/lib/gallery/lightbox-items";
import { homeInsetClass } from "@/lib/layout";
import type { GalleryAlbumItem } from "@/lib/mock/gallery";
import { cn } from "@/lib/utils";

const sliceEase = "ease-[cubic-bezier(0.22,1,0.36,1)]";

/** Catalog plate number — zero-padded so "01–12" reads as a range. */
function plateNumber(index: number): string {
	return String(index + 1).padStart(2, "0");
}

type GalleryAlbumProps = {
	items: GalleryAlbumItem[];
	coverUrl?: string;
	postTitle: string;
	photosLabel: string;
	closeLabel: string;
	previousLabel: string;
	nextLabel: string;
	metadataLabels: GalleryAlbumMetadataLabels;
};

/**
 * Opened collection album as a uniform square grid — the video page's card
 * language: framed tiles, every cover cropped to the same 1:1 box. Every
 * image opens the lightbox with the full `ImageItemDto` record when present.
 */
export function GalleryAlbum({
	items,
	coverUrl,
	postTitle,
	photosLabel,
	closeLabel,
	previousLabel,
	nextLabel,
	metadataLabels,
}: GalleryAlbumProps) {
	const { items: lightboxItems, albumIndexOffset } = buildGalleryLightboxItems(
		coverUrl,
		items,
		postTitle,
	);
	const { dialogRef, activeIndex, setActiveIndex, open } = useGalleryLightbox();

	return (
		<>
			<section
				aria-label={photosLabel}
				className={cn("pt-5 pb-8 lg:pt-6 lg:pb-10", homeInsetClass)}
			>
				<header className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 border-b border-border pb-3">
					<p className="label font-medium text-foreground">{photosLabel}</p>
					{items.length > 0 && (
						<p aria-hidden="true" className="label">
							{items.length > 1
								? `${plateNumber(0)}–${plateNumber(items.length - 1)}`
								: plateNumber(0)}
						</p>
					)}
				</header>

				<div className="grid grid-cols-2 gap-3 pt-6 sm:gap-4 lg:grid-cols-3">
					{items.map((sheetItem, index) => (
						<button
							key={sheetItem.id}
							type="button"
							onClick={() => open(index + albumIndexOffset)}
							aria-label={sheetItem.caption ?? postTitle}
							className="group block w-full cursor-pointer"
						>
							{sheetItem.imageUrl ? (
								<Image
									src={sheetItem.imageUrl}
									alt=""
									aspectRatio="square"
									sizes="(max-width: 1023px) 50vw, 33vw"
									className={cn(
										"transition-colors group-fine:border-border-strong",
										galleryPhotoSurfaceClass,
									)}
									imageClassName={cn(
										"brightness-[0.97] saturate-[0.85] transition-[filter,scale] duration-700 group-fine:scale-[1.04] group-fine:brightness-100 group-fine:saturate-100",
										sliceEase,
									)}
								/>
							) : (
								<div
									className={cn(
										"flex aspect-square items-center justify-center p-4 text-center text-small text-muted",
										galleryPhotoSurfaceClass,
									)}
								>
									{sheetItem.externalUrl ?? sheetItem.embedUrl}
								</div>
							)}
						</button>
					))}
				</div>
			</section>

			<GalleryLightbox
				items={lightboxItems}
				activeIndex={activeIndex}
				onActiveIndexChange={setActiveIndex}
				dialogRef={dialogRef}
				closeLabel={closeLabel}
				previousLabel={previousLabel}
				nextLabel={nextLabel}
				metadataLabels={metadataLabels}
				fallbackTitle={postTitle}
			/>
		</>
	);
}
