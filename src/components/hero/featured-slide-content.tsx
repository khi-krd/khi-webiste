"use client";

import { ChevronRightIcon } from "@heroicons/react/24/outline";
import {
	ScrollReveal,
	ScrollRevealItem,
} from "@/components/motion/scroll-reveal";
import { DirectionalIcon } from "@/components/ui/directional-icon";

type FeaturedSlideContentProps = {
	typeLabel: string;
	title: string;
	description: string;
	actionLabel: string;
};

export function FeaturedSlideContent({
	typeLabel,
	title,
	description,
	actionLabel,
}: FeaturedSlideContentProps) {
	return (
		<ScrollReveal className="max-w-4xl text-start text-white 2xl:max-w-5xl">
			<ScrollRevealItem>
				<p className="hero-slide-eyebrow">{typeLabel}</p>
			</ScrollRevealItem>
			<ScrollRevealItem>
				{/* The clamp() ceiling (4.75rem) is reached by 1200px — restore the
				    title's share of the frame on wide canvases. */}
				<h2 className="hero-slide-title mt-3 2xl:text-[5.5rem]">{title}</h2>
			</ScrollRevealItem>
			<ScrollRevealItem>
				<p className="hero-slide-description mt-5 max-w-xl 2xl:max-w-2xl">
					{description}
				</p>
			</ScrollRevealItem>
			<ScrollRevealItem>
				<p className="hero-slide-cta mt-8 inline-flex items-center gap-2.5">
					<span>{actionLabel}</span>
					<DirectionalIcon
						icon={ChevronRightIcon}
						className="size-5 shrink-0 opacity-90"
					/>
				</p>
			</ScrollRevealItem>
		</ScrollReveal>
	);
}
