/* biome-ignore-all lint/a11y/useSemanticElements: carousel slide semantics require role="group". */
"use client";

import useEmblaCarousel from "embla-carousel-react";
import NextImage from "next/image";
import { useLocale } from "next-intl";
import { useCallback, useEffect, useState } from "react";
import type { GalleryAlbumMetadataLabels } from "@/components/gallery/gallery-album-item";
import {
	GalleryLightbox,
	type GalleryLightboxItem,
	useGalleryLightbox,
} from "@/components/gallery/gallery-lightbox";
import { cn } from "@/lib/utils";
import type { SoundAttachment } from "@/types/audio";

type AudioAttachmentSliderProps = {
	title: string;
	attachments: SoundAttachment[];
	untitledLabel: string;
	openLabel: string;
	closeLabel: string;
	previousLabel: string;
	nextLabel: string;
	metadataLabels: GalleryAlbumMetadataLabels;
};

const slideClass =
	"min-w-0 shrink-0 grow-0 basis-[72%] pe-4 sm:basis-[48%] sm:pe-5 md:basis-[34%] lg:basis-[28%] xl:basis-[24%] last:pe-6 sm:last:pe-8";

const emblaViewportClass =
	"-mx-6 mt-4 w-auto touch-pan-y overflow-hidden sm:-mx-8 sm:mt-5";

const emblaContainerClass = "flex touch-pan-y ps-6 sm:ps-8";

/** Image attachments in a horizontal carousel — view only, no download. */
export function AudioAttachmentSlider({
	title,
	attachments,
	untitledLabel,
	openLabel,
	closeLabel,
	previousLabel,
	nextLabel,
	metadataLabels,
}: AudioAttachmentSliderProps) {
	const locale = useLocale();
	const direction = locale === "ckb" ? "rtl" : "ltr";
	const { dialogRef, activeIndex, setActiveIndex, open } = useGalleryLightbox();

	const [selectedIndex, setSelectedIndex] = useState(0);

	const [emblaRef, emblaApi] = useEmblaCarousel({
		align: "start",
		containScroll: "trimSnaps",
		direction,
		dragFree: false,
		slidesToScroll: 1,
		duration: 28,
	});

	const syncCarousel = useCallback(() => {
		if (!emblaApi) {
			return;
		}
		setSelectedIndex(emblaApi.selectedScrollSnap());
	}, [emblaApi]);

	useEffect(() => {
		if (!emblaApi) {
			return;
		}
		syncCarousel();
		emblaApi.on("select", syncCarousel);
		emblaApi.on("reInit", syncCarousel);
		return () => {
			emblaApi.off("select", syncCarousel);
			emblaApi.off("reInit", syncCarousel);
		};
	}, [emblaApi, syncCarousel]);

	const scrollTo = useCallback(
		(index: number) => {
			emblaApi?.scrollTo(index);
		},
		[emblaApi],
	);

	if (attachments.length === 0) {
		return null;
	}

	const lightboxItems: GalleryLightboxItem[] = attachments
		.filter((attachment) => Boolean(attachment.fileUrl))
		.map((attachment) => ({
			id: attachment.id,
			imageUrl: attachment.fileUrl as string,
			caption: attachment.title?.trim() || undefined,
		}));

	const showPagination = attachments.length > 1;

	return (
		<section aria-label={title}>
			<h2 className="font-heading text-h3 font-bold">{title}</h2>

			<div
				className={emblaViewportClass}
				ref={emblaRef}
				data-lenis-prevent-horizontal
				data-lenis-prevent-touch
			>
				<ul
					className={emblaContainerClass}
					aria-roledescription="carousel"
					aria-label={title}
				>
					{attachments.map((attachment, index) => {
						const caption = attachment.title?.trim() || untitledLabel;
						const imageUrl = attachment.fileUrl;
						const lightboxIndex = lightboxItems.findIndex(
							(item) => item.id === attachment.id,
						);

						return (
							<li
								key={attachment.id}
								role="group"
								aria-roledescription="slide"
								aria-label={caption}
								aria-hidden={index !== selectedIndex && showPagination}
								className={slideClass}
							>
								<button
									type="button"
									onClick={() => {
										if (lightboxIndex >= 0) {
											open(lightboxIndex);
										}
									}}
									disabled={!imageUrl}
									aria-label={`${openLabel} — ${caption}`}
									className="group block w-full text-start focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
								>
									<span className="relative block aspect-4/3 w-full overflow-hidden border border-border bg-sunken">
										{imageUrl ? (
											<NextImage
												src={imageUrl}
												alt={caption}
												fill
												sizes="(max-width: 640px) 72vw, (max-width: 1024px) 48vw, 24vw"
												className="object-cover brightness-[0.94] saturate-[0.88] transition-[filter,transform] duration-500 group-fine:scale-[1.02] group-fine:brightness-100 group-fine:saturate-100"
												draggable={false}
											/>
										) : null}
									</span>
									{caption ? (
										<span className="mt-1.5 block truncate text-label text-muted">
											{caption}
										</span>
									) : null}
								</button>
							</li>
						);
					})}
				</ul>
			</div>

			{showPagination ? (
				<div
					className="mt-4 flex justify-center gap-2"
					role="tablist"
					aria-label={title}
				>
					{attachments.map((attachment, index) => {
						const isActive = selectedIndex === index;
						const caption = attachment.title?.trim() || untitledLabel;

						return (
							<button
								key={attachment.id}
								type="button"
								role="tab"
								aria-selected={isActive}
								aria-label={caption}
								onClick={() => scrollTo(index)}
								className="flex h-4 items-center rounded-full focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
							>
								<span
									aria-hidden
									className={cn(
										"block h-[2px] w-5 rounded-full transition-colors duration-200 sm:w-6",
										isActive ? "bg-foreground" : "bg-foreground/30",
									)}
								/>
							</button>
						);
					})}
				</div>
			) : null}

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
