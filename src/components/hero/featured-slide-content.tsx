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
		<ScrollReveal className="max-w-4xl text-start text-white">
			<ScrollRevealItem>
				<p className="hero-slide-eyebrow">{typeLabel}</p>
			</ScrollRevealItem>
			<ScrollRevealItem>
				<h2 className="hero-slide-title mt-3">{title}</h2>
			</ScrollRevealItem>
			<ScrollRevealItem>
				<p className="hero-slide-description mt-5 max-w-xl">{description}</p>
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
