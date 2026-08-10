"use client";

import { ArrowRightIcon } from "@heroicons/react/24/outline";
import type { ReactNode } from "react";
import {
	ScrollReveal,
	ScrollRevealItem,
} from "@/components/motion/scroll-reveal";
import { DirectionalIcon } from "@/components/ui/directional-icon";
import { Link } from "@/components/ui/link";
import { cn } from "@/lib/utils";

type SoundSectionContentProps = {
	title: ReactNode;
	ctaLabel: string;
	ctaHref: string;
};

/**
 * Square-cornered to match the section CTAs elsewhere on the home page — the
 * whole "view all" family reads as one editorial control, so no radius here.
 */
const soundCtaClass =
	"group/sound-cta relative inline-flex h-10 w-fit shrink-0 items-center gap-2.5 overflow-hidden border border-primary-foreground/70 bg-primary-foreground/10 px-5 font-heading text-small font-semibold text-primary-foreground no-underline backdrop-blur-[2px] transition-[color,gap,box-shadow,background-color,border-color] duration-300 ease-out before:absolute before:inset-0 before:z-0 before:origin-bottom before:scale-y-0 before:bg-primary-foreground before:transition-transform before:duration-300 before:ease-[cubic-bezier(0.22,1,0.36,1)] fine-hover:gap-3.5 fine-hover:border-primary-foreground fine-hover:text-foreground fine-hover:shadow-[0_8px_24px_-12px_color-mix(in_oklch,var(--color-foreground)_55%,transparent)] fine-hover:before:scale-y-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-foreground motion-reduce:before:transition-none motion-reduce:fine-hover:before:scale-y-100 motion-reduce:fine-hover:gap-2.5";

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
					className={cn(soundCtaClass, "sm:mt-3")}
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
