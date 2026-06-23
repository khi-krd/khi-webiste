"use client";

import { motion, useReducedMotion } from "motion/react";
import type { ReactNode } from "react";
import { PAGE_TRANSITION_DELAY } from "@/components/motion/scroll-reveal";
import { cn } from "@/lib/utils";

const revealEase = [0.22, 1, 0.36, 1] as const;

type ServicesHeroMotionProps = {
	children: ReactNode;
	className?: string;
};

export function ServicesHeroMotion({
	children,
	className,
}: ServicesHeroMotionProps) {
	const reduceMotion = useReducedMotion();

	if (reduceMotion) {
		return <div className={className}>{children}</div>;
	}

	return (
		<motion.div
			className={className}
			initial="hidden"
			animate="visible"
			variants={{
				hidden: {},
				visible: {
					transition: {
						staggerChildren: 0.1,
						delayChildren: PAGE_TRANSITION_DELAY,
					},
				},
			}}
		>
			{children}
		</motion.div>
	);
}

type ServicesHeroBlockProps = {
	children: ReactNode;
	className?: string;
};

export function ServicesHeroBlock({
	children,
	className,
}: ServicesHeroBlockProps) {
	const reduceMotion = useReducedMotion();

	if (reduceMotion) {
		return <div className={className}>{children}</div>;
	}

	return (
		<motion.div
			className={className}
			variants={{
				hidden: { opacity: 0, y: 24 },
				visible: {
					opacity: 1,
					y: 0,
					transition: { duration: 0.65, ease: revealEase },
				},
			}}
		>
			{children}
		</motion.div>
	);
}

type ServicesRevealProps = {
	children: ReactNode;
	className?: string;
	delay?: number;
};

export function ServicesReveal({
	children,
	className,
	delay = 0,
}: ServicesRevealProps) {
	const reduceMotion = useReducedMotion();

	if (reduceMotion) {
		return <div className={className}>{children}</div>;
	}

	return (
		<motion.div
			className={className}
			initial={{ opacity: 0, y: 28 }}
			whileInView={{ opacity: 1, y: 0 }}
			viewport={{ once: true, margin: "-8% 0px -6% 0px" }}
			transition={{
				duration: 0.65,
				ease: revealEase,
				delay: PAGE_TRANSITION_DELAY + delay,
			}}
		>
			{children}
		</motion.div>
	);
}

type ServicesNavIndicatorProps = {
	active: boolean;
	className?: string;
};

export function ServicesNavIndicator({
	active,
	className,
}: ServicesNavIndicatorProps) {
	const reduceMotion = useReducedMotion();

	return (
		<span className={cn("relative h-6 w-px shrink-0", className)} aria-hidden>
			{active && !reduceMotion ? (
				<motion.span
					layoutId="services-nav-indicator"
					className="absolute inset-0 bg-foreground"
					transition={{ duration: 0.35, ease: revealEase }}
				/>
			) : (
				<span
					className={cn(
						"absolute inset-0 transition-colors duration-300",
						active
							? "bg-foreground"
							: "bg-border group-fine:group-hover:bg-border-strong",
					)}
				/>
			)}
		</span>
	);
}
