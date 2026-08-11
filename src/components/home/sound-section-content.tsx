"use client";

import { ArrowRightIcon } from "@heroicons/react/24/outline";
import type { ReactNode } from "react";
import {
	ScrollReveal,
	ScrollRevealItem,
} from "@/components/motion/scroll-reveal";
import { viewAllCtaOnDarkClass } from "@/components/ui/cta-styles";
import { DirectionalIcon } from "@/components/ui/directional-icon";
import { Link } from "@/components/ui/link";
import { cn } from "@/lib/utils";

type SoundSectionContentProps = {
	title: ReactNode;
	ctaLabel: string;
	ctaHref: string;
};

export function SoundSectionContent({
	title,
	ctaLabel,
	ctaHref,
}: SoundSectionContentProps) {
	return (
		<ScrollReveal className="shrink-0 text-primary-foreground">
			{/* Heading start-side, CTA end-side and top-aligned — same header shape
			    as the other home sections, so every "زیاتر" lands in the same spot. */}
			<ScrollRevealItem className="flex flex-col items-start gap-6 sm:flex-row sm:items-start sm:justify-between sm:gap-10">
				{/* One step down from the hero scale: this is a section label, not a
				    full-viewport statement, and the height it gives back goes to the
				    album grid below. */}
				<h2
					id="sound-heading"
					className="hero-slide-title max-w-4xl text-start text-[clamp(1.9rem,4vw,4rem)]"
				>
					{title}
				</h2>

				{/* `sm:mt-3` drops the CTA a touch below the container's top edge so it
				    doesn't sit flush against it. */}
				<Link
					href={ctaHref}
					variant="nav"
					className={cn(viewAllCtaOnDarkClass, "sm:mt-3")}
				>
					<span className="relative z-1">{ctaLabel}</span>
					<DirectionalIcon
						icon={ArrowRightIcon}
						className="relative z-1 size-4"
					/>
				</Link>
			</ScrollRevealItem>
		</ScrollReveal>
	);
}
