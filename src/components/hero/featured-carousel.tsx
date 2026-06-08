/* biome-ignore-all lint/a11y/useSemanticElements: carousel slide semantics require role="group". */
"use client";

import { ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/24/outline";
import Autoplay, { type AutoplayType } from "embla-carousel-autoplay";
import useEmblaCarousel from "embla-carousel-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { FeaturedSlide } from "@/components/hero/featured-slide";
import { DirectionalIcon } from "@/components/ui/directional-icon";
import { cn } from "@/lib/utils";
import type { HeroSlide } from "@/types/content";

type FeaturedCarouselLabels = {
	previous: string;
	next: string;
};

type FeaturedSlideHeight = "viewport" | "playground";

type FeaturedCarouselProps = {
	slides: HeroSlide[];
	direction: "ltr" | "rtl";
	labels: FeaturedCarouselLabels;
	height?: FeaturedSlideHeight;
};

const controlBaseClass =
	"inline-flex size-11 items-center justify-center border border-white/40 bg-black/45 text-white transition hover:bg-black/60 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white disabled:cursor-not-allowed disabled:opacity-45";

export function FeaturedCarousel({
	slides,
	direction,
	labels,
	height = "viewport",
}: FeaturedCarouselProps) {
	const hasMultipleSlides = slides.length > 1;
	const autoplay = useMemo<AutoplayType | null>(() => {
		if (!hasMultipleSlides) {
			return null;
		}

		return Autoplay({
			delay: 6000,
			stopOnMouseEnter: true,
			stopOnFocusIn: true,
			stopOnInteraction: false,
			playOnInit: false,
		});
	}, [hasMultipleSlides]);

	const [emblaRef, emblaApi] = useEmblaCarousel(
		{ loop: hasMultipleSlides, direction, align: "start" },
		autoplay ? [autoplay] : [],
	);
	const [selectedIndex, setSelectedIndex] = useState(0);
	const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

	useEffect(() => {
		const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
		const updatePreference = () => setPrefersReducedMotion(mediaQuery.matches);
		updatePreference();
		mediaQuery.addEventListener("change", updatePreference);
		return () => mediaQuery.removeEventListener("change", updatePreference);
	}, []);

	useEffect(() => {
		if (!emblaApi) {
			return;
		}

		const onSelect = () => setSelectedIndex(emblaApi.selectedScrollSnap());
		onSelect();
		emblaApi.on("select", onSelect);
		emblaApi.on("reInit", onSelect);
		return () => {
			emblaApi.off("select", onSelect);
			emblaApi.off("reInit", onSelect);
		};
	}, [emblaApi]);

	useEffect(() => {
		if (!emblaApi || !autoplay) {
			return;
		}

		if (prefersReducedMotion) {
			autoplay.stop();
		} else {
			autoplay.play();
		}
	}, [autoplay, emblaApi, prefersReducedMotion]);

	const scrollPrevious = useCallback(() => emblaApi?.scrollPrev(), [emblaApi]);
	const scrollNext = useCallback(() => emblaApi?.scrollNext(), [emblaApi]);

	const isAutoPlaying = hasMultipleSlides && !prefersReducedMotion;

	useEffect(() => {
		if (!emblaApi || !hasMultipleSlides) {
			return;
		}

		const rootNode = emblaApi.rootNode();
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
				if (direction === "rtl") {
					scrollNext();
				} else {
					scrollPrevious();
				}
			}

			if (event.key === "ArrowRight") {
				event.preventDefault();
				if (direction === "rtl") {
					scrollPrevious();
				} else {
					scrollNext();
				}
			}
		};

		document.addEventListener("keydown", handleArrowKeys);
		return () => document.removeEventListener("keydown", handleArrowKeys);
	}, [direction, emblaApi, hasMultipleSlides, scrollNext, scrollPrevious]);

	return (
		<div className="relative">
			<div className="overflow-hidden" ref={emblaRef}>
				<ul className="flex" aria-live={isAutoPlaying ? "off" : "polite"}>
					{slides.map((slide, index) => (
						<li
							key={slide.id}
							role="group"
							aria-roledescription="slide"
							aria-label={slide.slideLabel}
							className="min-w-0 flex-[0_0_100%]"
							inert={index !== selectedIndex ? true : undefined}
						>
							<FeaturedSlide
								slide={slide}
								isPriority={index === 0}
								height={height}
							/>
						</li>
					))}
				</ul>
			</div>

			{/* Swipe on small screens; prev/next only from sm up. */}
			<div className="absolute inset-e-8 bottom-8 z-20 hidden items-center gap-2 sm:flex">
				<button
					type="button"
					onClick={scrollPrevious}
					aria-label={labels.previous}
					className={cn(controlBaseClass)}
					disabled={!hasMultipleSlides}
				>
					<DirectionalIcon icon={ChevronLeftIcon} className="size-5" />
				</button>

				<button
					type="button"
					onClick={scrollNext}
					aria-label={labels.next}
					className={cn(controlBaseClass)}
					disabled={!hasMultipleSlides}
				>
					<DirectionalIcon icon={ChevronRightIcon} className="size-5" />
				</button>
			</div>
		</div>
	);
}
