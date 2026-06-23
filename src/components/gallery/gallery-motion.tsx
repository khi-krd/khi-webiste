"use client";

import { motion, useReducedMotion } from "motion/react";
import type { CSSProperties, ReactNode } from "react";
import { PAGE_TRANSITION_DELAY } from "@/components/motion/scroll-reveal";

const revealEase = [0.22, 1, 0.36, 1] as const;

type GalleryMotionProps = {
	children: ReactNode;
	className?: string;
	/** Inline style passthrough (e.g. per-slice animation-delay for the strip cycle). */
	style?: CSSProperties;
};

/**
 * Scroll-reveal orchestrator for a gallery post row (services-motion pattern).
 * Variants propagate to every <GalleryRevealItem> in the subtree — DOM nesting
 * doesn't matter — so the text block and each strip slice stagger in reading
 * order as the row enters the viewport. Reduced motion: plain divs, no
 * animation, identical layout.
 */
export function GalleryReveal({ children, className }: GalleryMotionProps) {
	const reduceMotion = useReducedMotion();

	if (reduceMotion) {
		return <div className={className}>{children}</div>;
	}

	return (
		<motion.div
			className={className}
			initial="hidden"
			whileInView="visible"
			viewport={{ once: true, margin: "-12% 0px -8% 0px" }}
			variants={{
				hidden: {},
				visible: {
					transition: {
						staggerChildren: 0.09,
						delayChildren: PAGE_TRANSITION_DELAY,
					},
				},
			}}
		>
			{children}
		</motion.div>
	);
}

export function GalleryRevealItem({
	children,
	className,
	style,
}: GalleryMotionProps) {
	const reduceMotion = useReducedMotion();

	if (reduceMotion) {
		return (
			<div className={className} style={style}>
				{children}
			</div>
		);
	}

	return (
		<motion.div
			className={className}
			style={style}
			variants={{
				hidden: { opacity: 0, y: 26 },
				visible: {
					opacity: 1,
					y: 0,
					transition: { duration: 0.7, ease: revealEase },
				},
			}}
		>
			{children}
		</motion.div>
	);
}
