/* biome-ignore-all lint/a11y/useSemanticElements: carousel slide semantics require role="group". */
"use client";

import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import {
	type FocusEvent,
	type PointerEvent,
	useCallback,
	useEffect,
	useRef,
	useState,
} from "react";
import {
	FeaturedSlide,
	type FeaturedSlideHeight,
	featuredSlideHeightClass,
} from "@/components/hero/featured-slide";
import { cn } from "@/lib/utils";
import type { HeroSlide } from "@/types/content";

type FeaturedCarouselLabels = {
	pagination: string;
};

type FeaturedCarouselProps = {
	slides: HeroSlide[];
	direction: "ltr" | "rtl";
	labels: FeaturedCarouselLabels;
	height?: FeaturedSlideHeight;
};

const CAROUSEL_EASE = [0.22, 1, 0.36, 1] as const;
const FADE_DURATION_S = 1.1;
const AUTOPLAY_DELAY_MS = 6000;
const SWIPE_THRESHOLD_PX = 48;

export function FeaturedCarousel({
	slides,
	direction,
	labels,
	height = "viewport",
}: FeaturedCarouselProps) {
	const reduceMotion = useReducedMotion();
	const hasMultipleSlides = slides.length > 1;
	const [selectedIndex, setSelectedIndex] = useState(0);
	const [isPaused, setIsPaused] = useState(false);
	const pointerStart = useRef<{ x: number; y: number } | null>(null);
	const containerRef = useRef<HTMLDivElement>(null);

	const activeSlide = slides[selectedIndex];

	const goTo = useCallback(
		(index: number) => {
			if (!hasMultipleSlides) {
				return;
			}
			setSelectedIndex(
				((index % slides.length) + slides.length) % slides.length,
			);
		},
		[hasMultipleSlides, slides.length],
	);

	const advance = useCallback(() => {
		setSelectedIndex((index) => (index + 1) % slides.length);
	}, [slides.length]);

	const goPrev = useCallback(() => {
		goTo(selectedIndex - 1);
	}, [goTo, selectedIndex]);

	const goNext = useCallback(() => {
		goTo(selectedIndex + 1);
	}, [goTo, selectedIndex]);

	const scrollPrevious = direction === "rtl" ? goNext : goPrev;
	const scrollNext = direction === "rtl" ? goPrev : goNext;

	useEffect(() => {
		if (!hasMultipleSlides || reduceMotion || isPaused) {
			return;
		}

		const id = window.setInterval(advance, AUTOPLAY_DELAY_MS);
		return () => window.clearInterval(id);
	}, [advance, hasMultipleSlides, isPaused, reduceMotion]);

	useEffect(() => {
		if (!hasMultipleSlides) {
			return;
		}

		const rootNode = containerRef.current;
		if (!rootNode) {
			return;
		}

		const handleArrowKeys = (event: KeyboardEvent) => {
			const activeElement = document.activeElement;
			if (
				!(activeElement instanceof Node) ||
				!rootNode.contains(activeElement)
			) {
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
		};

		document.addEventListener("keydown", handleArrowKeys);
		return () => document.removeEventListener("keydown", handleArrowKeys);
	}, [hasMultipleSlides, scrollNext, scrollPrevious]);

	const handlePointerDown = (event: PointerEvent<HTMLDivElement>) => {
		if (!hasMultipleSlides) {
			return;
		}
		pointerStart.current = { x: event.clientX, y: event.clientY };
	};

	const handlePointerUp = (event: PointerEvent<HTMLDivElement>) => {
		if (!pointerStart.current) {
			return;
		}

		const deltaX = event.clientX - pointerStart.current.x;
		const deltaY = event.clientY - pointerStart.current.y;
		pointerStart.current = null;

		if (
			Math.abs(deltaX) < SWIPE_THRESHOLD_PX ||
			Math.abs(deltaX) < Math.abs(deltaY)
		) {
			return;
		}

		if (deltaX > 0) {
			scrollPrevious();
		} else {
			scrollNext();
		}
	};

	const handlePointerCancel = () => {
		pointerStart.current = null;
	};

	const handleBlurCapture = (event: FocusEvent<HTMLDivElement>) => {
		if (!event.currentTarget.contains(event.relatedTarget as Node)) {
			setIsPaused(false);
		}
	};

	const isAutoPlaying = hasMultipleSlides && !reduceMotion && !isPaused;

	const fadeTransition = reduceMotion
		? { duration: 0 }
		: { duration: FADE_DURATION_S, ease: CAROUSEL_EASE };

	const zoomTransition = reduceMotion
		? { duration: 0 }
		: { duration: FADE_DURATION_S * 1.2, ease: CAROUSEL_EASE };

	return (
		<div
			className="relative"
			onPointerEnter={() => setIsPaused(true)}
			onPointerLeave={() => setIsPaused(false)}
			onFocusCapture={() => setIsPaused(true)}
			onBlurCapture={handleBlurCapture}
		>
			<div
				ref={containerRef}
				className={cn(
					"relative touch-pan-y overflow-hidden",
					featuredSlideHeightClass[height],
				)}
				onPointerDown={handlePointerDown}
				onPointerUp={handlePointerUp}
				onPointerCancel={handlePointerCancel}
			>
				<div aria-live={isAutoPlaying ? "off" : "polite"} className="h-full">
					{hasMultipleSlides ? (
						<AnimatePresence initial={false} mode="sync">
							<motion.div
								key={activeSlide.id}
								role="group"
								aria-roledescription="slide"
								aria-label={activeSlide.slideLabel}
								className="absolute inset-0"
								initial={{ opacity: 0, zIndex: 1 }}
								animate={{ opacity: 1, zIndex: 2 }}
								exit={{ opacity: 0, zIndex: 1 }}
								transition={fadeTransition}
							>
								<motion.div
									className="h-full w-full"
									initial={reduceMotion ? false : { scale: 1.045 }}
									animate={{ scale: 1 }}
									transition={zoomTransition}
								>
									<FeaturedSlide
										slide={activeSlide}
										isPriority={selectedIndex === 0}
										height={height}
										className="h-full"
									/>
								</motion.div>
							</motion.div>
						</AnimatePresence>
					) : (
						<div
							role="group"
							aria-roledescription="slide"
							aria-label={activeSlide.slideLabel}
							className="h-full"
						>
							<FeaturedSlide
								slide={activeSlide}
								isPriority
								height={height}
								className="h-full"
							/>
						</div>
					)}
				</div>
			</div>

			{hasMultipleSlides ? (
				<nav
					aria-label={labels.pagination}
					className="absolute inset-x-0 bottom-5 z-20 flex justify-center px-6 sm:bottom-6"
				>
					<div
						role="tablist"
						className="flex items-center gap-2.5"
						onPointerDown={(event) => event.stopPropagation()}
						onPointerUp={(event) => event.stopPropagation()}
					>
						{slides.map((slide, index) => {
							const isActive = index === selectedIndex;

							return (
								<button
									key={slide.id}
									type="button"
									role="tab"
									aria-selected={isActive}
									aria-label={slide.slideLabel}
									onClick={() => goTo(index)}
									className="flex h-5 items-center rounded-full focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-white"
								>
									<motion.span
										aria-hidden
										className="block h-[3px] w-9 rounded-full"
										animate={{
											backgroundColor: isActive
												? "rgb(255 255 255 / 1)"
												: "rgb(255 255 255 / 0.35)",
										}}
										transition={
											reduceMotion
												? { duration: 0 }
												: { duration: 0.45, ease: CAROUSEL_EASE }
										}
									/>
								</button>
							);
						})}
					</div>
				</nav>
			) : null}
		</div>
	);
}
