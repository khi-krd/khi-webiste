"use client";

import { PlayIcon } from "@heroicons/react/24/solid";
import { motion, useReducedMotion } from "motion/react";
import NextImage from "next/image";
import { useState } from "react";
import { ServiceFeatureImage } from "@/components/services/service-feature-image";
import type { GallerySlide } from "@/components/services/service-gallery-slides";
import { ServiceSectionVideo } from "@/components/services/service-section-video";
import { cn } from "@/lib/utils";

type ThumbnailVariant = "default" | "large" | "compact";

const thumbGridClass: Record<ThumbnailVariant, string> = {
	default:
		"mt-4 flex gap-2 overflow-x-auto px-0.5 pb-1 sm:grid sm:grid-cols-5 sm:gap-3 sm:overflow-visible sm:pb-0 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden",
	large:
		"mt-4 flex gap-2.5 overflow-x-auto px-0.5 pb-1 sm:grid sm:grid-cols-5 sm:gap-3 sm:overflow-visible sm:pb-0 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden",
	compact:
		"mt-4 flex gap-2 overflow-x-auto px-0.5 pb-1 sm:grid sm:grid-cols-5 sm:gap-2.5 sm:overflow-visible sm:pb-0 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden",
};

type ServiceMediaGalleryProps = {
	slides: GallerySlide[];
	title: string;
	defaultIndex?: number;
	mainAspectRatio?: string;
	thumbVariant?: ThumbnailVariant;
	mainClassName?: string;
	className?: string;
};

function slidePreviewSrc(slide: GallerySlide): string {
	if (slide.type === "image") return slide.media.url;
	return slide.video.poster ?? "";
}

function slidePreviewAlt(slide: GallerySlide, title: string): string {
	if (slide.type === "image") return slide.media.alt ?? title;
	return slide.video.posterAlt ?? title;
}

function slideKey(slide: GallerySlide): string {
	if (slide.type === "image") return slide.media.url;
	return slide.video.src;
}

function formatAspectRatio(ratio: string): string {
	return ratio.includes(" / ") ? ratio : ratio.replace("/", " / ");
}

export function ServiceMediaGallery({
	slides,
	title,
	defaultIndex = 0,
	mainAspectRatio = "16/9",
	thumbVariant = "default",
	mainClassName,
	className,
}: ServiceMediaGalleryProps) {
	const reduceMotion = useReducedMotion();
	const [activeIndex, setActiveIndex] = useState(defaultIndex);
	const active = slides[activeIndex] ?? slides[0];
	const aspect = formatAspectRatio(mainAspectRatio);

	return (
		<div className={cn("min-w-0", className)}>
			<div
				className={cn(
					"relative overflow-hidden border border-border bg-surface",
					mainClassName,
				)}
			>
				{active?.type === "video" ? (
					<ServiceSectionVideo
						key={`video-${activeIndex}`}
						video={active.video}
						title={title}
						aspectRatio={aspect}
						compact
						className="border-0"
					/>
				) : active ? (
					<motion.div
						key={`image-${activeIndex}-${active.media.url}`}
						initial={reduceMotion ? false : { opacity: 0.88 }}
						animate={{ opacity: 1 }}
						transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
					>
						<ServiceFeatureImage
							src={active.media.url}
							alt={active.media.alt ?? title}
							aspectRatio={mainAspectRatio}
							sizes="(max-width: 1024px) 100vw, 65vw"
							className="border-0"
						/>
					</motion.div>
				) : null}
			</div>

			{slides.length > 0 && (
				<ul className={thumbGridClass[thumbVariant]}>
					{slides.map((slide, slideIndex) => {
						const isActive = activeIndex === slideIndex;
						const previewSrc = slidePreviewSrc(slide);
						const isVideo = slide.type === "video";

						return (
							<li
								key={slideKey(slide)}
								className="w-[4.75rem] shrink-0 sm:w-auto sm:shrink"
							>
								<button
									type="button"
									onClick={() => setActiveIndex(slideIndex)}
									aria-pressed={isActive}
									aria-label={slidePreviewAlt(slide, title)}
									className={cn(
										"group relative block w-full overflow-hidden border bg-surface text-start transition-[border-color,opacity,transform] duration-200",
										isActive
											? "border-foreground opacity-100"
											: "border-border opacity-80 fine-hover:border-border-strong fine-hover:opacity-100",
										"focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foreground",
									)}
								>
									<span
										className="relative block aspect-[4/3] w-full"
										aria-hidden
									>
										{previewSrc ? (
											<NextImage
												src={previewSrc}
												alt=""
												fill
												sizes="(max-width: 640px) 50vw, 20vw"
												className={cn(
													"object-cover brightness-[0.85] contrast-[1.08] saturate-[0.7]",
													"transition-[filter] duration-300",
													isActive &&
														"brightness-[0.92] contrast-[1.1] saturate-[0.76]",
												)}
											/>
										) : null}
										{isVideo && (
											<span className="pointer-events-none absolute inset-0 flex items-center justify-center bg-foreground/20">
												<span className="inline-flex size-7 items-center justify-center bg-foreground/75 text-white sm:size-8">
													<PlayIcon
														className="size-3 translate-x-0.5 sm:size-3.5"
														aria-hidden
													/>
												</span>
											</span>
										)}
										{isActive && (
											<span
												className="pointer-events-none absolute inset-0 ring-1 ring-inset ring-foreground/80"
												aria-hidden
											/>
										)}
									</span>
								</button>
							</li>
						);
					})}
				</ul>
			)}
		</div>
	);
}
