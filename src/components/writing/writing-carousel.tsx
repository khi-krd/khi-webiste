/* biome-ignore-all lint/a11y/useSemanticElements: carousel slide semantics require role="group". */
"use client";

import Autoplay, { type AutoplayType } from "embla-carousel-autoplay";
import useEmblaCarousel from "embla-carousel-react";
import { useEffect, useMemo, useState } from "react";
import { ScrollRevealBlock } from "@/components/motion/scroll-reveal";
import {
	WritingCard,
	type WritingCardProps,
} from "@/components/writing/writing-card";

const AUTOPLAY_DELAY_MS = 4500;

type WritingCarouselProps = {
	cards: WritingCardProps[];
	direction: "ltr" | "rtl";
	emptyLabel: string;
	carouselLabel: string;
};

/* Narrower slides than the old 4:3 tiles — covers are portrait books now, and
   the wider gap gives each cast shadow room to land on the board. */
const slideClass =
	"min-w-0 shrink-0 basis-[66%] pe-6 sm:basis-[40%] md:basis-[29%] lg:basis-[22%] last:pe-0";

export function WritingCarousel({
	cards,
	direction,
	emptyLabel,
	carouselLabel,
}: WritingCarouselProps) {
	const hasMultipleSlides = cards.length > 1;

	const autoplay = useMemo<AutoplayType | null>(() => {
		if (!hasMultipleSlides) {
			return null;
		}

		return Autoplay({
			delay: AUTOPLAY_DELAY_MS,
			stopOnMouseEnter: true,
			stopOnFocusIn: true,
			stopOnInteraction: false,
			playOnInit: false,
		});
	}, [hasMultipleSlides]);

	const [emblaRef, emblaApi] = useEmblaCarousel(
		{
			loop: hasMultipleSlides,
			align: "start",
			containScroll: false,
			direction,
			slidesToScroll: 1,
			duration: 32,
		},
		autoplay ? [autoplay] : [],
	);

	const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

	useEffect(() => {
		const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
		const updatePreference = () => setPrefersReducedMotion(mediaQuery.matches);
		updatePreference();
		mediaQuery.addEventListener("change", updatePreference);
		return () => mediaQuery.removeEventListener("change", updatePreference);
	}, []);

	useEffect(() => {
		emblaApi?.reInit();
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

	return (
		<section
			id="writings-content"
			aria-labelledby="writings-carousel-heading"
			className="scroll-mt-26 sm:scroll-mt-30"
			aria-roledescription="carousel"
			aria-label={carouselLabel}
		>
			<h2 id="writings-carousel-heading" className="visually-hidden">
				{carouselLabel}
			</h2>

			{cards.length === 0 ? (
				<p className="px-6 py-20 text-center text-body text-muted sm:px-10">
					{emptyLabel}
				</p>
			) : (
				<div className="px-6 pb-10 pt-6 sm:px-10 sm:pb-12 sm:pt-8">
					<div className="touch-pan-y overflow-hidden" ref={emblaRef}>
						<ScrollRevealBlock>
							<ul className="flex touch-pan-y">
								{cards.map((card) => (
									<li
										key={card.id}
										role="group"
										aria-roledescription="slide"
										className={slideClass}
									>
										<WritingCard {...card} />
									</li>
								))}
							</ul>
						</ScrollRevealBlock>
					</div>
				</div>
			)}
		</section>
	);
}
