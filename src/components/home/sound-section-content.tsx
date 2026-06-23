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

const soundCtaClass =
	"group/sound-cta relative inline-flex h-10 w-fit shrink-0 items-center gap-2.5 overflow-hidden border border-white/70 bg-white/10 px-5 font-heading text-small font-semibold text-white no-underline backdrop-blur-[2px] transition-[color,gap,box-shadow,background-color,border-color] duration-300 ease-out before:absolute before:inset-0 before:z-0 before:origin-bottom before:scale-y-0 before:bg-white before:transition-transform before:duration-300 before:ease-[cubic-bezier(0.22,1,0.36,1)] fine-hover:gap-3.5 fine-hover:border-white fine-hover:text-foreground fine-hover:shadow-[0_8px_24px_-12px_rgba(0,0,0,0.45)] fine-hover:before:scale-y-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white motion-reduce:before:transition-none motion-reduce:fine-hover:before:scale-y-100 motion-reduce:fine-hover:gap-2.5";

type SoundSectionContentProps = {
	eyebrow: ReactNode;
	title: ReactNode;
	description: ReactNode;
	cta: ReactNode;
	ctaHref: string;
};

export function SoundSectionContent({
	eyebrow,
	title,
	description,
	cta,
	ctaHref,
}: SoundSectionContentProps) {
	return (
		<ScrollReveal className="max-w-4xl text-start text-white">
			<ScrollRevealItem>
				<p className="hero-slide-eyebrow">{eyebrow}</p>
			</ScrollRevealItem>
			<ScrollRevealItem>
				<h2 id="sound-heading" className="hero-slide-title mt-3">
					{title}
				</h2>
			</ScrollRevealItem>
			<ScrollRevealItem>
				<p className="hero-slide-description mt-5 max-w-xl">{description}</p>
			</ScrollRevealItem>
			<ScrollRevealItem>
				<Link
					href={ctaHref}
					variant="nav"
					className={cn(soundCtaClass, "mt-8")}
				>
					<span className="relative z-1">{cta}</span>
					<DirectionalIcon
						icon={ArrowRightIcon}
						className="relative z-1 size-4"
					/>
				</Link>
			</ScrollRevealItem>
		</ScrollReveal>
	);
}
