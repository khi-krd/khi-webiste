"use client";

import type { CSSProperties, ReactNode } from "react";
import { useRef } from "react";
import {
	ScrollReveal,
	useInViewReveal,
} from "@/components/motion/scroll-reveal";

type GalleryMotionProps = {
	children: ReactNode;
	className?: string;
	/** Inline style passthrough (e.g. per-slice animation-delay for the strip cycle). */
	style?: CSSProperties;
};

/**
 * Scroll-reveal orchestrator for a gallery post row.
 * Reduced motion: plain divs, no animation, identical layout.
 */
export function GalleryReveal({ children, className }: GalleryMotionProps) {
	return (
		<ScrollReveal className={className} stagger={0.09}>
			{children}
		</ScrollReveal>
	);
}

export function GalleryRevealItem({
	children,
	className,
	style,
}: GalleryMotionProps) {
	const ref = useRef<HTMLDivElement>(null);
	useInViewReveal(ref, {
		y: 20,
		duration: 0.9,
		margin: "-12% 0px -8% 0px",
	});

	return (
		<div ref={ref} className={className} style={style}>
			{children}
		</div>
	);
}
