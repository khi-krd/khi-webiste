"use client";

import { motion, useReducedMotion } from "motion/react";
import { type ReactNode, useCallback, useMemo, useRef } from "react";
import {
	PAGE_TRANSITION_DELAY,
	RevealStaggerContext,
	revealEase,
	useInViewReveal,
	useMountReveal,
} from "@/components/motion/scroll-reveal";
import { cn } from "@/lib/utils";

type ServicesHeroMotionProps = {
	children: ReactNode;
	className?: string;
};

export function ServicesHeroMotion({
	children,
	className,
}: ServicesHeroMotionProps) {
	const indexRef = useRef(0);

	const nextDelay = useCallback(() => {
		const i = indexRef.current;
		indexRef.current += 1;
		return PAGE_TRANSITION_DELAY + i * 0.1;
	}, []);

	const value = useMemo(() => ({ nextDelay }), [nextDelay]);

	return (
		<RevealStaggerContext.Provider value={value}>
			<div className={className}>{children}</div>
		</RevealStaggerContext.Provider>
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
	const ref = useRef<HTMLDivElement>(null);
	useMountReveal(ref, { y: 18, duration: 0.85 });

	return (
		<div ref={ref} className={className}>
			{children}
		</div>
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
	const ref = useRef<HTMLDivElement>(null);
	useInViewReveal(ref, {
		y: 22,
		duration: 0.95,
		delay: PAGE_TRANSITION_DELAY,
		extraDelay: delay,
		margin: "-8% 0px -6% 0px",
	});

	return (
		<div ref={ref} className={className}>
			{children}
		</div>
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
