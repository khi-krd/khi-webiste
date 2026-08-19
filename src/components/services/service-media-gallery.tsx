"use client";

import { PlayIcon } from "@heroicons/react/24/solid";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import NextImage from "next/image";
import { useCallback, useEffect, useId, useState } from "react";
import { ServiceFeatureImage } from "@/components/services/service-feature-image";
import {
	type GallerySlide,
	slideKey,
} from "@/components/services/service-gallery-slides";
import { ServiceSectionVideo } from "@/components/services/service-section-video";
import { cn } from "@/lib/utils";

type ServiceMediaGalleryProps = {
	slides: GallerySlide[];
	title: string;
	defaultIndex?: number;
	mainAspectRatio?: string;
	mainClassName?: string;
	className?: string;
};

const revealEase = [0.22, 1, 0.36, 1] as const;

function slidePreviewSrc(slide: GallerySlide): string {
	if (slide.type === "image") return slide.media.url;
	return slide.video.poster ?? "";
}

function slidePreviewAlt(slide: GallerySlide, title: string): string {
	if (slide.type === "image") return slide.media.alt ?? title;
	return slide.video.posterAlt ?? title;
}

function slideKindLabel(slide: GallerySlide): string {
	return slide.type === "video" ? "Video" : "Image";
}

function formatAspectRatio(ratio: string): string {
	return ratio.includes(" / ") ? ratio : ratio.replace("/", " / ");
}

export function ServiceMediaGallery({
	slides,
	title,
	defaultIndex = 0,
	mainAspectRatio = "16/9",
	mainClassName,
	className,
}: ServiceMediaGalleryProps) {
	const reduceMotion = useReducedMotion();
	const galleryId = useId();
	const safeDefaultIndex =
		slides.length > 0 ? Math.min(defaultIndex, slides.length - 1) : 0;
	const [activeIndex, setActiveIndex] = useState(safeDefaultIndex);

	const active = slides[activeIndex] ?? slides[0];
	const aspect = formatAspectRatio(mainAspectRatio);
	const hasMultipleSlides = slides.length > 1;

	useEffect(() => {
		setActiveIndex((current) => {
			if (slides.length === 0) return 0;
			return Math.min(current, slides.length - 1);
		});
	}, [slides.length]);

	const goTo = useCallback(
		(index: number) => {
			if (index < 0 || index >= slides.length) return;
			setActiveIndex(index);
		},
		[slides.length],
	);

	return (
		<div className={cn("flex w-full min-w-0 flex-col", className)}>
			<div
				className={cn(
					"relative w-full overflow-hidden bg-surface",
					mainClassName,
				)}
				role="tabpanel"
				id={`${galleryId}-panel`}
				aria-labelledby={`${galleryId}-tab-${activeIndex}`}
			>
				<AnimatePresence mode="wait" initial={false}>
					{active?.type === "video" ? (
						<motion.div
							key={`video-${activeIndex}-${slideKey(active)}`}
							className="w-full"
							initial={reduceMotion ? false : { opacity: 0.9 }}
							animate={{ opacity: 1 }}
							exit={reduceMotion ? undefined : { opacity: 0.92 }}
							transition={{ duration: 0.28, ease: revealEase }}
						>
							<ServiceSectionVideo
								video={active.video}
								title={title}
								aspectRatio={aspect}
								compact
								className="w-full border-0"
							/>
						</motion.div>
					) : active ? (
						<motion.div
							key={`image-${activeIndex}-${active.media.url}`}
							className="w-full"
							initial={reduceMotion ? false : { opacity: 0.9 }}
							animate={{ opacity: 1 }}
							exit={reduceMotion ? undefined : { opacity: 0.92 }}
							transition={{ duration: 0.28, ease: revealEase }}
						>
							<ServiceFeatureImage
								src={active.media.url}
								alt={active.media.alt ?? title}
								aspectRatio={mainAspectRatio}
								sizes="100vw"
								className="w-full"
							/>
						</motion.div>
					) : null}
				</AnimatePresence>
			</div>

			{hasMultipleSlides && (
				<div
					className="mt-4 grid w-full grid-cols-3 gap-2 sm:grid-cols-4 sm:gap-3 lg:grid-cols-6"
					role="tablist"
					aria-label={`${title} media`}
				>
					{slides.map((slide, slideIndex) => {
						const isActive = activeIndex === slideIndex;
						const previewSrc = slidePreviewSrc(slide);
						const isVideo = slide.type === "video";

						return (
							<button
								key={slideKey(slide)}
								type="button"
								id={`${galleryId}-tab-${slideIndex}`}
								role="tab"
								aria-selected={isActive}
								aria-controls={`${galleryId}-panel`}
								onClick={() => goTo(slideIndex)}
								aria-label={`${slideKindLabel(slide)}: ${slidePreviewAlt(slide, title)}`}
								className={cn(
									"group relative block w-full overflow-hidden border bg-surface text-start transition-[border-color,opacity,transform] duration-200",
									isActive
										? "border-foreground opacity-100 ring-1 ring-inset ring-foreground/80"
										: "border-border opacity-72 fine-hover:border-border-strong fine-hover:opacity-100",
									"focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foreground",
								)}
							>
								<span className="relative block aspect-4/3 w-full" aria-hidden>
									{previewSrc ? (
										<NextImage
											src={previewSrc}
											alt=""
											fill
											sizes="(max-width: 640px) 30vw, 12vw"
											className={cn(
												"object-cover brightness-[0.85] contrast-[1.08] saturate-[0.7] transition-[filter,transform] duration-500",
												!isActive &&
													"group-fine:scale-[1.03] group-fine:brightness-[0.92] group-fine:saturate-[0.78]",
												isActive && "brightness-[0.95] saturate-[0.8]",
											)}
										/>
									) : (
										<span className="absolute inset-0 bg-sunken" />
									)}

									{isVideo && (
										<span className="pointer-events-none absolute inset-x-0 top-0 flex justify-end bg-linear-to-b from-foreground/55 to-transparent px-1.5 py-1">
											<span className="inline-flex size-5 items-center justify-center bg-foreground/75 text-white">
												<PlayIcon
													className="size-2.5 translate-x-px"
													aria-hidden
												/>
											</span>
										</span>
									)}

									{isActive && (
										<span
											className="pointer-events-none absolute inset-0 ring-1 ring-inset ring-white/35"
											aria-hidden
										/>
									)}
								</span>
							</button>
						);
					})}
				</div>
			)}
		</div>
	);
}
