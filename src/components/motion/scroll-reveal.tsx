"use client";

import { animate, inView } from "motion";
import {
	type ComponentPropsWithoutRef,
	type CSSProperties,
	createContext,
	type ReactNode,
	type RefObject,
	useCallback,
	useContext,
	useEffect,
	useLayoutEffect,
	useMemo,
	useRef,
} from "react";

/** Soft deceleration — longer settle than a standard ease-out. */
const revealEase = [0.16, 1, 0.3, 1] as const;

/** Wait for route enter (`template.tsx`) before scroll/section reveals begin. */
export const PAGE_TRANSITION_DELAY = 0.12;

export const PAGE_TRANSITION_DURATION = 0.38;

const DEFAULT_MARGIN = "-10% 0px -6% 0px" as const;
const FOOTER_MARGIN = "-4% 0px -2% 0px" as const;

/** Root-margin values accepted by Motion `inView` (typed template literals). */
export type RevealMargin =
	| typeof DEFAULT_MARGIN
	| typeof FOOTER_MARGIN
	| "-12% 0px -8% 0px"
	| "-8% 0px -6% 0px"
	| "-5% 0px -2% 0px";

function prefersReducedMotion(): boolean {
	if (typeof window === "undefined") return false;
	return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

type RevealStagger = {
	/** Claim the next stagger slot; returns delay in seconds. */
	nextDelay: () => number;
};

const RevealStaggerContext = createContext<RevealStagger | null>(null);

type UseInViewRevealOptions = {
	y?: number;
	scale?: number;
	duration?: number;
	/** Absolute delay; when omitted, uses stagger context or PAGE_TRANSITION_DELAY. */
	delay?: number;
	margin?: RevealMargin;
	/** Extra delay on top of the resolved base delay. */
	extraDelay?: number;
};

/** Imperative fade/slide (or scale) reveal tied to viewport entry — once. */
export function useInViewReveal(
	ref: RefObject<HTMLElement | null>,
	{
		y = 20,
		scale,
		duration = 0.9,
		delay,
		margin = DEFAULT_MARGIN,
		extraDelay = 0,
	}: UseInViewRevealOptions = {},
) {
	const stagger = useContext(RevealStaggerContext);
	const delayRef = useRef(0);
	const claimedRef = useRef(false);

	useLayoutEffect(() => {
		if (claimedRef.current) return;
		claimedRef.current = true;
		delayRef.current =
			(delay ?? stagger?.nextDelay() ?? PAGE_TRANSITION_DELAY) + extraDelay;
	}, [delay, extraDelay, stagger]);

	useEffect(() => {
		const el = ref.current;
		if (!el || prefersReducedMotion()) return;

		el.style.opacity = "0";
		el.style.transform =
			scale !== undefined
				? `translateY(${y}px) scale(${scale})`
				: `translateY(${y}px)`;

		let cancelled = false;
		let animControls: { stop: () => void } | undefined;

		const unobserve = inView(
			el,
			() => {
				if (cancelled) return;
				el.style.willChange = "transform, opacity";
				const keyframes =
					scale !== undefined
						? { opacity: 1, y: 0, scale: 1 }
						: { opacity: 1, y: 0 };
				animControls = animate(el, keyframes, {
					duration,
					ease: revealEase,
					delay: delayRef.current,
					onComplete: () => {
						el.style.willChange = "";
					},
				});
				unobserve();
			},
			{ margin },
		);

		return () => {
			cancelled = true;
			animControls?.stop();
			unobserve();
			el.style.willChange = "";
		};
	}, [ref, y, scale, duration, margin]);
}

type ScrollRevealProps = {
	children: ReactNode;
	className?: string;
	stagger?: number;
	delayChildren?: number;
};

/**
 * Scroll-reveal orchestrator with staggered children.
 * Child {@link ScrollRevealItem}s claim stagger slots and animate via `inView`.
 */
export function ScrollReveal({
	children,
	className,
	stagger = 0.1,
	delayChildren = PAGE_TRANSITION_DELAY,
}: ScrollRevealProps) {
	const indexRef = useRef(0);

	const nextDelay = useCallback(() => {
		const i = indexRef.current;
		indexRef.current += 1;
		return delayChildren + i * stagger;
	}, [delayChildren, stagger]);

	const value = useMemo(() => ({ nextDelay }), [nextDelay]);

	return (
		<RevealStaggerContext.Provider value={value}>
			<div className={className}>{children}</div>
		</RevealStaggerContext.Provider>
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
	const ref = useRef<HTMLDivElement>(null);
	useInViewReveal(ref, { y: 20, duration: 0.9 });

	return (
		<div ref={ref} className={className} style={style} {...rest}>
			{children}
		</div>
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
	const ref = useRef<HTMLDivElement>(null);
	useInViewReveal(ref, {
		y: 22,
		duration: 0.95,
		delay: PAGE_TRANSITION_DELAY,
		extraDelay: delay,
	});

	return (
		<div ref={ref} className={className}>
			{children}
		</div>
	);
}

type FooterRevealProps = {
	children: ReactNode;
	className?: string;
};

/** Slide-up reveal for the site footer — staggered children on scroll. */
export function FooterReveal({ children, className }: FooterRevealProps) {
	return (
		<ScrollReveal
			className={className}
			stagger={0.14}
			delayChildren={PAGE_TRANSITION_DELAY}
		>
			{children}
		</ScrollReveal>
	);
}

type FooterRevealItemProps = {
	children: ReactNode;
	className?: string;
};

export function FooterRevealItem({
	children,
	className,
}: FooterRevealItemProps) {
	const ref = useRef<HTMLDivElement>(null);
	useInViewReveal(ref, {
		y: 36,
		duration: 1,
		margin: FOOTER_MARGIN,
	});

	return (
		<div ref={ref} className={className}>
			{children}
		</div>
	);
}

type UseMountRevealOptions = {
	y?: number;
	duration?: number;
	delay?: number;
};

/** Mount-time staggered reveal (hero content already in view). */
export function useMountReveal(
	ref: RefObject<HTMLElement | null>,
	{ y = 18, duration = 0.85, delay }: UseMountRevealOptions = {},
) {
	const stagger = useContext(RevealStaggerContext);
	const delayRef = useRef(0);
	const claimedRef = useRef(false);

	useLayoutEffect(() => {
		if (claimedRef.current) return;
		claimedRef.current = true;
		delayRef.current = delay ?? stagger?.nextDelay() ?? PAGE_TRANSITION_DELAY;
	}, [delay, stagger]);

	useEffect(() => {
		const el = ref.current;
		if (!el || prefersReducedMotion()) return;

		el.style.opacity = "0";
		el.style.transform = `translateY(${y}px)`;
		el.style.willChange = "transform, opacity";

		const controls = animate(
			el,
			{ opacity: 1, y: 0 },
			{
				duration,
				ease: revealEase,
				delay: delayRef.current,
				onComplete: () => {
					el.style.willChange = "";
				},
			},
		);

		return () => {
			controls.stop();
			el.style.willChange = "";
		};
	}, [ref, y, duration]);
}

export { prefersReducedMotion, RevealStaggerContext, revealEase };
