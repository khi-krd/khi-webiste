"use client";

import type { ReactNode } from "react";
import {
	ScrollReveal,
	ScrollRevealItem,
} from "@/components/motion/scroll-reveal";

type SoundSectionContentProps = {
	title: ReactNode;
};

export function SoundSectionContent({ title }: SoundSectionContentProps) {
	return (
		<ScrollReveal className="max-w-4xl text-start text-primary-foreground">
			<ScrollRevealItem>
				<h2 id="sound-heading" className="hero-slide-title">
					{title}
				</h2>
			</ScrollRevealItem>
		</ScrollReveal>
	);
}
