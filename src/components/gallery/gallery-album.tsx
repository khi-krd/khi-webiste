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
 * Opened collection album as exhibition-catalog plates: each image carries a
 * hairline-topped wall label with its plate number and caption. Every image
 * opens the lightbox with the full `ImageItemDto` record when present.
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

				<div className="columns-2 gap-4 pt-6 lg:columns-3">
					{items.map((sheetItem, index) => (
						<figure key={sheetItem.id} className="mb-5 break-inside-avoid">
							<button
								type="button"
								onClick={() => open(index + albumIndexOffset)}
								aria-label={sheetItem.caption ?? postTitle}
								className="group block w-full cursor-pointer"
							>
								{sheetItem.imageUrl ? (
									<Image
										src={sheetItem.imageUrl}
										alt=""
										aspectRatio={
											sheetItem.aspectRatio
												? String(sheetItem.aspectRatio)
												: "3/4"
										}
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
											"flex aspect-3/4 items-center justify-center p-4 text-center text-small text-muted",
											galleryPhotoSurfaceClass,
										)}
									>
										{sheetItem.externalUrl ?? sheetItem.embedUrl}
									</div>
								)}
							</button>
							{/* Wall label: hairline rule, plate number, quiet caption. */}
							<figcaption className="mt-2 border-t border-border pt-2">
								<p className="flex items-baseline gap-2">
									<span aria-hidden="true" className="label">
										{plateNumber(index)}
									</span>
									{sheetItem.caption ? (
										<span className="text-small leading-snug text-muted">
											{sheetItem.caption}
										</span>
									) : null}
								</p>
							</figcaption>
						</figure>
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
