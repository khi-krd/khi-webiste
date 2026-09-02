/* biome-ignore-all lint/a11y/useSemanticElements: carousel slide semantics require role="group". */
"use client";

import {
	ArrowsPointingInIcon,
	ArrowsPointingOutIcon,
	ChevronLeftIcon,
	ChevronRightIcon,
} from "@heroicons/react/24/outline";
import useEmblaCarousel from "embla-carousel-react";
import NextImage from "next/image";
import { useLocale, useTranslations } from "next-intl";
import { useCallback, useEffect, useState } from "react";
import { DirectionalIcon } from "@/components/ui/directional-icon";
import { ImageWatermark } from "@/components/ui/image-watermark";
import { useGestureZoom } from "@/lib/use-gesture-zoom";
import { useScrollLock } from "@/lib/use-scroll-lock";
import { cn } from "@/lib/utils";
import type { ResolvedBrochureItem } from "@/types/audio";

type AudioBookletReaderLabels = {
	previous: string;
	next: string;
	fullscreen: string;
	exitFullscreen: string;
};

type AudioBookletReaderProps = {
	title: string;
	items: ResolvedBrochureItem[];
	labels: AudioBookletReaderLabels;
};

const VIEWPORT_HEIGHT_CLASS = "h-[26rem] sm:h-[30rem]";
const SLIDE_FRAME_CLASS = "relative h-full w-full overflow-hidden";

const controlButtonClass =
	"inline-flex size-9 items-center justify-center border border-primary bg-primary text-primary-foreground transition-opacity fine-hover:opacity-90 disabled:pointer-events-none disabled:opacity-30";

/**
 * Paginated booklet viewer — Embla carousel navigation, fixed viewport,
 * gesture zoom, and fullscreen.
 *
 * Zoom has no buttons: it is the same wheel / double-click / drag-to-pan
 * scroll-box gesture system as the gallery lightbox (useGestureZoom), so the
 * two brochure viewers feel identical. While a page is zoomed Embla's own
 * drag is switched off (watchDrag) so panning the page never flips it; at the
 * fitted size, swiping between pages keeps working.
 */
export function AudioBookletReader({
	title,
	items,
	labels,
}: AudioBookletReaderProps) {
	const locale = useLocale();
	const t = useTranslations("Audio.brochures");
	const direction = locale === "ckb" ? "rtl" : "ltr";

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

	// Zoom resets on every page change (resetKey), so a zoomed page can always
	// be left via prev/next even while swiping is off.
	const {
		zoomLevel,
		viewportRef: zoomViewportRef,
		viewportProps: zoomViewportProps,
		cursorClass: zoomCursorClass,
	} = useGestureZoom({ resetKey: selectedIndex });
	const isZoomed = zoomLevel > 1;

	useScrollLock(isFullscreen);

	const totalPages = items.length;
	const canGoPrevious = selectedIndex > 0;
	const canGoNext = selectedIndex < totalPages - 1;

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

	// While zoomed the pointer pans the page INSIDE the slide, so Embla must
	// not read the same drag as a page flip. watchDrag (rather than
	// stopPropagation) because Embla's own listeners sit on an ancestor and
	// would see the pointer before a React handler could stop it.
	useEffect(() => {
		emblaApi?.reInit({ watchDrag: !isZoomed });
	}, [emblaApi, isZoomed]);

	const scrollPrevious = useCallback(() => {
		emblaApi?.scrollPrev();
	}, [emblaApi]);

	const scrollNext = useCallback(() => {
		emblaApi?.scrollNext();
	}, [emblaApi]);

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
								"flex",
								// At the fitted size the vertical pan belongs to the page and
								// the horizontal one to Embla; while zoomed BOTH axes belong
								// to the slide's own scroll box, so touch panning must be
								// unrestricted.
								isZoomed ? "touch-auto" : "touch-pan-y",
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
										{/* Breathing room lives OUTSIDE the zoom scroll box so a
										    100%-sized child means exactly "fitted". */}
										<div className="absolute inset-0 p-4 sm:p-6">
											{/* Zoom scroll box (selected slide only): the child
											    grows with the zoom level and `fill` re-anchors to
											    it, so the page and its watermark scale together
											    while every corner stays reachable by scrolling or
											    dragging — same pattern as the gallery lightbox. */}
											<div
												ref={
													index === selectedIndex ? zoomViewportRef : undefined
												}
												{...(index === selectedIndex
													? zoomViewportProps
													: undefined)}
												className={cn(
													"h-full w-full overflow-auto",
													index === selectedIndex && zoomCursorClass,
												)}
											>
												<div
													className="relative"
													style={{
														width:
															index === selectedIndex
																? `${zoomLevel * 100}%`
																: "100%",
														height:
															index === selectedIndex
																? `${zoomLevel * 100}%`
																: "100%",
													}}
												>
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
													<ImageWatermark
														contain={item.imageUrl}
														zoom={zoomLevel}
													/>
												</div>
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
