"use client";

import {
	albumItemToLightboxItem,
	galleryPhotoSurfaceClass,
	type GalleryAlbumMetadataLabels,
} from "@/components/gallery/gallery-album-item";
import { GalleryLightbox, useGalleryLightbox } from "@/components/gallery/gallery-lightbox";
import { Image } from "@/components/ui/image";
import { homeInsetClass } from "@/lib/layout";
import type { GalleryAlbumItem } from "@/lib/mock/gallery";
import { cn } from "@/lib/utils";

const sliceEase = "ease-[cubic-bezier(0.22,1,0.36,1)]";

type GalleryAlbumProps = {
	items: GalleryAlbumItem[];
	postTitle: string;
	photosLabel: string;
	closeLabel: string;
	previousLabel: string;
	nextLabel: string;
	metadataLabels: GalleryAlbumMetadataLabels;
};

function frameNo(index: number): string {
	return String(index + 1).padStart(2, "0");
}

/**
 * Opened collection album — contact sheet grid. Every image opens the
 * lightbox with the full `ImageItemDto` record when present.
 */
export function GalleryAlbum({
	items,
	postTitle,
	photosLabel,
	closeLabel,
	previousLabel,
	nextLabel,
	metadataLabels,
}: GalleryAlbumProps) {
	const lightboxItems = items.map((item) =>
		albumItemToLightboxItem(item, postTitle),
	);
	const { dialogRef, activeIndex, setActiveIndex, open } = useGalleryLightbox();

	return (
		<>
			<section
				aria-label={photosLabel}
				className={cn("pt-8 pb-12 lg:pt-10 lg:pb-16", homeInsetClass)}
			>
				<header className="flex items-baseline justify-between gap-4 border-b border-border pb-4">
					<p className="label font-medium text-foreground">
						<span aria-hidden="true" className="me-2">
							{"//"}
						</span>
						{photosLabel}
					</p>
					<p className="label" aria-hidden="true">
						{frameNo(items.length - 1)}
					</p>
				</header>

				<div className="columns-2 gap-2 pt-6 lg:columns-3">
					{items.map((sheetItem, index) => (
						<figure key={sheetItem.id} className="mb-2 break-inside-avoid">
							<button
								type="button"
								onClick={() => open(index)}
								aria-label={
									sheetItem.caption ?? `${postTitle} — ${frameNo(index)}`
								}
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
							<figcaption className="px-0.5 pt-1.5 pb-2.5">
								<p className="label flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
									<span className="font-medium">{frameNo(index)}</span>
									{sheetItem.caption && (
										<span className="text-foreground">{sheetItem.caption}</span>
									)}
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
