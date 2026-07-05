"use client";

import { motion, useReducedMotion } from "motion/react";
import type { ComponentPropsWithoutRef, CSSProperties, ReactNode } from "react";

const revealEase = [0.22, 1, 0.36, 1] as const;

/** Wait for route enter (`template.tsx`) before scroll/section reveals begin. */
export const PAGE_TRANSITION_DELAY = 0.14;

export const PAGE_TRANSITION_DURATION = 0.32;

const viewport = { once: true, margin: "-10% 0px -6% 0px" } as const;

type ScrollRevealProps = {
	children: ReactNode;
	className?: string;
};

/**
 * Scroll-reveal orchestrator with staggered children.
 * Variants propagate to every <ScrollRevealItem> in the subtree.
 */
export function ScrollReveal({ children, className }: ScrollRevealProps) {
	const reduceMotion = useReducedMotion();

	if (reduceMotion) {
		return <div className={className}>{children}</div>;
	}

	return (
		<motion.div
			className={className}
			initial="hidden"
			whileInView="visible"
			viewport={viewport}
			variants={{
				hidden: {},
				visible: {
					transition: {
						staggerChildren: 0.08,
						delayChildren: PAGE_TRANSITION_DELAY,
					},
				},
			}}
		>
			{children}
		</motion.div>
	);
}

type ScrollRevealItemProps = {
	children: ReactNode;
	className?: string;
	style?: CSSProperties;
} & Pick<
	ComponentPropsWithoutRef<"div">,
	"role" | "aria-roledescription" | "aria-label"
>;

export function ScrollRevealItem({
	children,
	className,
	style,
	...rest
}: ScrollRevealItemProps) {
	const reduceMotion = useReducedMotion();

	if (reduceMotion) {
		return (
			<div className={className} style={style} {...rest}>
				{children}
			</div>
		);
	}

	return (
		<motion.div
			className={className}
			style={style}
			{...rest}
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

type ScrollRevealBlockProps = {
	children: ReactNode;
	className?: string;
	/** Extra delay on top of {@link PAGE_TRANSITION_DELAY}. */
	delay?: number;
};

/** Single-element scroll reveal (headers, standalone blocks). */
export function ScrollRevealBlock({
	children,
	className,
	delay = 0,
}: ScrollRevealBlockProps) {
	const reduceMotion = useReducedMotion();

	if (reduceMotion) {
		return <div className={className}>{children}</div>;
	}

	return (
		<motion.div
			className={className}
			initial={{ opacity: 0, y: 28 }}
			whileInView={{ opacity: 1, y: 0 }}
			viewport={viewport}
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

const footerViewport = { once: true, margin: "-4% 0px -2% 0px" } as const;

type FooterRevealProps = {
	children: ReactNode;
	className?: string;
};

/** Slide-up reveal for the site footer — staggered children on scroll. */
export function FooterReveal({ children, className }: FooterRevealProps) {
	const reduceMotion = useReducedMotion();

	if (reduceMotion) {
		return <div className={className}>{children}</div>;
	}

	return (
		<motion.div
			className={className}
			initial="hidden"
			whileInView="visible"
			viewport={footerViewport}
			variants={{
				hidden: {},
				visible: {
					transition: {
						staggerChildren: 0.12,
						delayChildren: PAGE_TRANSITION_DELAY,
					},
				},
			}}
		>
			{children}
		</motion.div>
	);
}

type FooterRevealItemProps = {
	children: ReactNode;
	className?: string;
};

export function FooterRevealItem({ children, className }: FooterRevealItemProps) {
	const reduceMotion = useReducedMotion();

	if (reduceMotion) {
		return <div className={className}>{children}</div>;
	}

	return (
		<motion.div
			className={className}
			variants={{
				hidden: { opacity: 0, y: 48 },
				visible: {
					opacity: 1,
					y: 0,
					transition: { duration: 0.8, ease: revealEase },
				},
			}}
		>
			{children}
		</motion.div>
	);
}
