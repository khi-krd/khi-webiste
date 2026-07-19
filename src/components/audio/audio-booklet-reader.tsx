/* biome-ignore-all lint/a11y/useSemanticElements: carousel slide semantics require role="group". */
"use client";

import {
	ArrowsPointingInIcon,
	ArrowsPointingOutIcon,
	ChevronLeftIcon,
	ChevronRightIcon,
	MinusIcon,
	PlusIcon,
} from "@heroicons/react/24/outline";
import useEmblaCarousel from "embla-carousel-react";
import NextImage from "next/image";
import { useLocale, useTranslations } from "next-intl";
import { useCallback, useEffect, useState } from "react";
import { DirectionalIcon } from "@/components/ui/directional-icon";
import { useScrollLock } from "@/lib/use-scroll-lock";
import { cn } from "@/lib/utils";
import type { ResolvedBrochureItem } from "@/types/audio";

type AudioBookletReaderLabels = {
	previous: string;
	next: string;
	zoomIn: string;
	zoomOut: string;
	fullscreen: string;
	exitFullscreen: string;
};

type AudioBookletReaderProps = {
	title: string;
	items: ResolvedBrochureItem[];
	labels: AudioBookletReaderLabels;
};

const MIN_ZOOM = 0.5;
const MAX_ZOOM = 2;
const ZOOM_STEP = 0.1;

const VIEWPORT_HEIGHT_CLASS = "h-[26rem] sm:h-[30rem]";
const SLIDE_FRAME_CLASS = "relative h-full w-full overflow-hidden";

const controlButtonClass =
	"inline-flex size-9 items-center justify-center border border-border-strong text-foreground transition-colors fine-hover:bg-sunken disabled:pointer-events-none disabled:opacity-30";

/**
 * Paginated booklet viewer — Embla carousel navigation, fixed viewport, zoom,
 * and fullscreen.
 */
export function AudioBookletReader({
	title,
	items,
	labels,
}: AudioBookletReaderProps) {
	const locale = useLocale();
	const t = useTranslations("Audio.brochures");
	const direction = locale === "ckb" ? "rtl" : "ltr";

	const [zoomLevel, setZoomLevel] = useState(1);
	const [isFullscreen, setIsFullscreen] = useState(false);
	const [selectedIndex, setSelectedIndex] = useState(0);

	const [emblaRef, emblaApi] = useEmblaCarousel({
		align: "center",
		containScroll: "trimSnaps",
		direction,
		dragFree: false,
		slidesToScroll: 1,
		duration: 28,
	});

	useScrollLock(isFullscreen);

	const totalPages = items.length;
	const canGoPrevious = selectedIndex > 0;
	const canGoNext = selectedIndex < totalPages - 1;

	const syncCarousel = useCallback(() => {
		if (!emblaApi) {
			return;
		}
		const index = emblaApi.selectedScrollSnap();
		setSelectedIndex(index);
		setZoomLevel(1);
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

	const scrollPrevious = useCallback(() => {
		emblaApi?.scrollPrev();
	}, [emblaApi]);

	const scrollNext = useCallback(() => {
		emblaApi?.scrollNext();
	}, [emblaApi]);

	const zoomIn = useCallback(() => {
		setZoomLevel((level) => Math.min(MAX_ZOOM, level + ZOOM_STEP));
	}, []);

	const zoomOut = useCallback(() => {
		setZoomLevel((level) => Math.max(MIN_ZOOM, level - ZOOM_STEP));
	}, []);

	const toggleFullscreen = useCallback(() => {
		setIsFullscreen((value) => !value);
	}, []);

	useEffect(() => {
		if (!isFullscreen) {
			return;
		}

		function onKeyDown(event: KeyboardEvent) {
			if (event.key === "Escape") {
				setIsFullscreen(false);
				return;
			}
			if (event.key === "ArrowLeft") {
				event.preventDefault();
				scrollPrevious();
			}
			if (event.key === "ArrowRight") {
				event.preventDefault();
				scrollNext();
			}
		}

		window.addEventListener("keydown", onKeyDown);
		return () => window.removeEventListener("keydown", onKeyDown);
	}, [isFullscreen, scrollNext, scrollPrevious]);

	if (items.length === 0) {
		return null;
	}

	const pageLabel = t("pageIndicator", {
		current: selectedIndex + 1,
		total: totalPages,
	});
	const zoomLabel = `${Math.round(zoomLevel * 100)}%`;

	return (
		<section aria-label={title}>
			<h2 className="font-heading text-h3 font-bold">{title}</h2>

			<div
				className={cn(
					"mt-5",
					isFullscreen &&
						"fixed inset-0 z-50 flex flex-col bg-background p-4 sm:p-6",
				)}
			>
				<div
					className={cn(
						"relative overflow-hidden border border-border bg-surface",
						isFullscreen
							? "flex min-h-0 flex-1 flex-col"
							: "mx-auto w-full max-w-2xl",
					)}
				>
					<div
						className={cn(
							"overflow-hidden bg-sunken",
							isFullscreen ? "min-h-0 flex-1" : VIEWPORT_HEIGHT_CLASS,
						)}
						ref={emblaRef}
					>
						<ul
							className={cn(
								"flex touch-pan-y",
								isFullscreen ? "h-full" : VIEWPORT_HEIGHT_CLASS,
							)}
							aria-roledescription="carousel"
							aria-label={title}
						>
							{items.map((item, index) => (
								<li
									key={item.id}
									role="group"
									aria-roledescription="slide"
									aria-label={item.caption ?? `${title} — ${index + 1}`}
									aria-hidden={index !== selectedIndex}
									className="min-w-0 shrink-0 grow-0 basis-full"
								>
									<div className={SLIDE_FRAME_CLASS}>
										<div
											className={cn(
												"flex h-full w-full items-center justify-center p-4 transition-transform duration-300 ease-out sm:p-6",
												index === selectedIndex ? "origin-center" : "",
											)}
											style={
												index === selectedIndex
													? { transform: `scale(${zoomLevel})` }
													: undefined
											}
										>
											<div className="relative h-full w-full">
												<NextImage
													src={item.imageUrl}
													alt={
														item.caption ??
														t("pageIndicator", {
															current: index + 1,
															total: totalPages,
														})
													}
													fill
													sizes="(max-width: 768px) 90vw, 42rem"
													className="object-contain"
													priority={index === 0}
													draggable={false}
												/>
											</div>
										</div>
										<span className="pointer-events-none absolute inset-x-0 bottom-3 text-center text-label text-muted/60">
											{index + 1}
										</span>
									</div>
								</li>
							))}
						</ul>
					</div>

					<div
						className={cn(
							"flex flex-wrap items-center justify-center gap-3 border-t border-border px-4 py-3 sm:gap-4 sm:px-5",
							isFullscreen && "shrink-0",
						)}
					>
						<button
							type="button"
							onClick={scrollPrevious}
							disabled={!canGoPrevious}
							aria-label={labels.previous}
							className={controlButtonClass}
						>
							<DirectionalIcon icon={ChevronLeftIcon} className="size-4" />
						</button>

						<span
							className="min-w-16 text-center text-label text-muted tabular-nums"
							aria-live="polite"
							aria-atomic="true"
						>
							{pageLabel}
						</span>

						<button
							type="button"
							onClick={scrollNext}
							disabled={!canGoNext}
							aria-label={labels.next}
							className={controlButtonClass}
						>
							<DirectionalIcon icon={ChevronRightIcon} className="size-4" />
						</button>

						<div className="flex items-center gap-1 border-s border-border ps-3 sm:ps-4">
							<button
								type="button"
								onClick={zoomOut}
								disabled={zoomLevel <= MIN_ZOOM}
								aria-label={labels.zoomOut}
								className={controlButtonClass}
							>
								<MinusIcon aria-hidden className="size-3.5" />
							</button>
							<span className="min-w-10 text-center text-label text-muted tabular-nums">
								{zoomLabel}
							</span>
							<button
								type="button"
								onClick={zoomIn}
								disabled={zoomLevel >= MAX_ZOOM}
								aria-label={labels.zoomIn}
								className={controlButtonClass}
							>
								<PlusIcon aria-hidden className="size-3.5" />
							</button>
						</div>

						<button
							type="button"
							onClick={toggleFullscreen}
							aria-label={
								isFullscreen ? labels.exitFullscreen : labels.fullscreen
							}
							className={controlButtonClass}
						>
							{isFullscreen ? (
								<ArrowsPointingInIcon aria-hidden className="size-4" />
							) : (
								<ArrowsPointingOutIcon aria-hidden className="size-4" />
							)}
						</button>
					</div>
				</div>
			</div>
		</section>
	);
}
