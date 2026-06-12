"use client";

import NextImage from "next/image";
import type { GalleryAlbumMetadataLabels } from "@/components/gallery/gallery-album-item";
import {
	GalleryLightbox,
	type GalleryLightboxItem,
	useGalleryLightbox,
} from "@/components/gallery/gallery-lightbox";
import type { ResolvedBrochureItem } from "@/types/audio";

type AudioBrochuresProps = {
	title: string;
	items: ResolvedBrochureItem[];
	openLabel: string;
	closeLabel: string;
	previousLabel: string;
	nextLabel: string;
	metadataLabels: GalleryAlbumMetadataLabels;
};

/**
 * Ordered brochure scans (covers, booklet pages) as a thumbnail strip; clicks
 * open the shared gallery lightbox.
 */
export function AudioBrochures({
	title,
	items,
	openLabel,
	closeLabel,
	previousLabel,
	nextLabel,
	metadataLabels,
}: AudioBrochuresProps) {
	const { dialogRef, activeIndex, setActiveIndex, open } = useGalleryLightbox();

	if (items.length === 0) {
		return null;
	}

	const lightboxItems: GalleryLightboxItem[] = items.map((item) => ({
		id: item.id,
		imageUrl: item.imageUrl,
		caption: item.caption ?? undefined,
	}));

	return (
		<section aria-label={title}>
			<h2 className="font-heading text-h3 font-bold">{title}</h2>

			<ul className="mt-5 grid grid-cols-3 gap-3 sm:grid-cols-5 sm:gap-4">
				{items.map((item, index) => (
					<li key={item.id}>
						<button
							type="button"
							onClick={() => open(index)}
							aria-label={`${openLabel} — ${item.caption ?? title}`}
							className="group block w-full text-start focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
						>
							<span className="relative block aspect-square w-full overflow-hidden border border-border bg-sunken">
								<NextImage
									src={item.imageUrl}
									alt={item.caption ?? ""}
									fill
									sizes="(max-width: 640px) 33vw, 20vw"
									className="object-cover brightness-[0.94] saturate-[0.88] transition-[filter] duration-500 group-fine:brightness-100 group-fine:saturate-100"
								/>
							</span>
							{item.caption ? (
								<span className="mt-2 block truncate text-label text-muted">
									{item.caption}
								</span>
							) : null}
						</button>
					</li>
				))}
			</ul>

			<GalleryLightbox
				items={lightboxItems}
				activeIndex={activeIndex}
				onActiveIndexChange={setActiveIndex}
				dialogRef={dialogRef}
				closeLabel={closeLabel}
				previousLabel={previousLabel}
				nextLabel={nextLabel}
				metadataLabels={metadataLabels}
				fallbackTitle={title}
			/>
		</section>
	);
}
