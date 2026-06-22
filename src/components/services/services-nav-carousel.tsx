/* biome-ignore-all lint/a11y/useSemanticElements: carousel slide semantics require role="group". */
"use client";

import useEmblaCarousel from "embla-carousel-react";
import type { PointerEvent as ReactPointerEvent } from "react";
import { useCallback, useEffect, useRef, useState } from "react";
import { ServiceNavCard } from "@/components/services/service-nav-card";
import type { ServiceItem } from "@/lib/mock/services";
import { cn } from "@/lib/utils";

const DRAG_THRESHOLD_PX = 8;

type NavCarouselItem = {
	service: ServiceItem;
	title: string;
};

type ServicesNavCarouselProps = {
	items: NavCarouselItem[];
	navLabel: string;
	direction: "ltr" | "rtl";
	className?: string;
};

export function ServicesNavCarousel({
	items,
	navLabel,
	direction,
	className,
}: ServicesNavCarouselProps) {
	const [emblaRef, emblaApi] = useEmblaCarousel({
		align: "start",
		containScroll: "trimSnaps",
		direction,
		dragFree: false,
		slidesToScroll: 1,
		duration: 25,
	});

	const [selectedIndex, setSelectedIndex] = useState(0);
	const [scrollSnaps, setScrollSnaps] = useState<number[]>([]);
	const dragState = useRef({ active: false, startX: 0, startY: 0 });

	const onSelect = useCallback(() => {
		if (!emblaApi) return;
		setSelectedIndex(emblaApi.selectedScrollSnap());
	}, [emblaApi]);

	useEffect(() => {
		if (!emblaApi) return;
		setScrollSnaps(emblaApi.scrollSnapList());
		onSelect();
		emblaApi.on("select", onSelect);
		emblaApi.on("reInit", onSelect);
		return () => {
			emblaApi.off("select", onSelect);
			emblaApi.off("reInit", onSelect);
		};
	}, [emblaApi, onSelect]);

	const scrollTo = useCallback(
		(index: number) => {
			emblaApi?.scrollTo(index);
		},
		[emblaApi],
	);

	const handleCardActivate = useCallback((id: string) => {
		if (dragState.current.active) {
			dragState.current.active = false;
			return;
		}

		const target = document.getElementById(id);
		if (!target) return;

		target.scrollIntoView({ behavior: "smooth", block: "start" });
	}, []);

	const handleSlidePointerDown = useCallback(
		(event: ReactPointerEvent<HTMLLIElement>) => {
			dragState.current = {
				active: false,
				startX: event.clientX,
				startY: event.clientY,
			};
		},
		[],
	);

	const handleSlidePointerMove = useCallback(
		(event: ReactPointerEvent<HTMLLIElement>) => {
			if (dragState.current.active) return;

			const deltaX = Math.abs(event.clientX - dragState.current.startX);
			const deltaY = Math.abs(event.clientY - dragState.current.startY);

			if (deltaX > DRAG_THRESHOLD_PX || deltaY > DRAG_THRESHOLD_PX) {
				dragState.current.active = true;
			}
		},
		[],
	);

	return (
		<div className={cn("mt-10 sm:mt-12 lg:mt-14", className)}>
			<section aria-roledescription="carousel" aria-label={navLabel}>
				<div
					className="-mx-6 touch-pan-y overflow-hidden sm:-mx-8"
					ref={emblaRef}
					data-lenis-prevent-horizontal
					data-lenis-prevent-touch
				>
					<ul className="flex touch-pan-y px-6 sm:px-8">
						{items.map(({ service, title }) => (
							// biome-ignore lint/a11y/useKeyWithClickEvents: tap vs drag on slide; sticky nav covers keyboard access
							<li
								key={service.id}
								role="group"
								aria-roledescription="slide"
								className="min-w-0 shrink-0 grow-0 cursor-pointer pe-3 sm:pe-4"
								onPointerDown={handleSlidePointerDown}
								onPointerMove={handleSlidePointerMove}
								onClick={() => handleCardActivate(service.id)}
								aria-label={title}
							>
								<ServiceNavCard service={service} title={title} />
							</li>
						))}
					</ul>
				</div>

				{scrollSnaps.length > 1 && (
					<div
						className="mt-6 flex justify-center gap-2 sm:mt-7"
						role="tablist"
						aria-label={navLabel}
					>
						{scrollSnaps.map((snap, index) => (
							<button
								// biome-ignore lint/suspicious/noArrayIndexKey: Embla snap list is positional
								key={`snap-${index}-${snap}`}
								type="button"
								role="tab"
								aria-selected={selectedIndex === index}
								aria-label={`${navLabel} ${index + 1}`}
								onClick={() => scrollTo(index)}
								className={cn(
									"h-0.5 w-8 shrink-0 transition-colors duration-200 sm:w-10",
									selectedIndex === index ? "bg-white" : "bg-white/35",
									"focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white",
								)}
							/>
						))}
					</div>
				)}
			</section>
		</div>
	);
}
