import { animate } from "motion";

type ScrollToSectionOptions = {
	immediate?: boolean;
};

/** House easing — long settle, Apple-like deceleration. */
const SCROLL_EASE = [0.16, 1, 0.3, 1] as const;

const MIN_DURATION = 0.5;
const MAX_DURATION = 1.15;
/** px of travel mapped into duration (higher = faster for long jumps). */
const DISTANCE_PER_SECOND = 1400;

let activeScroll: { stop: () => void } | null = null;
let removeInterruptListeners: (() => void) | null = null;

function prefersReducedMotion(): boolean {
	return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function durationForDistance(distance: number): number {
	return Math.min(
		MAX_DURATION,
		Math.max(MIN_DURATION, distance / DISTANCE_PER_SECOND),
	);
}

function stopActiveScroll() {
	activeScroll?.stop();
	activeScroll = null;
	removeInterruptListeners?.();
	removeInterruptListeners = null;
}

/** Smooth-scroll to a section with Motion easing (native snap when reduced-motion). */
export function scrollToSection(
	target: string | HTMLElement,
	options?: ScrollToSectionOptions,
): void {
	const el =
		typeof target === "string" ? document.getElementById(target) : target;
	if (!el) return;

	const immediate = options?.immediate || prefersReducedMotion();
	const top = el.getBoundingClientRect().top + window.scrollY;

	if (immediate) {
		stopActiveScroll();
		window.scrollTo({ top, behavior: "auto" });
		return;
	}

	const from = window.scrollY;
	const distance = Math.abs(top - from);
	if (distance < 1) return;

	stopActiveScroll();

	const interrupt = () => {
		stopActiveScroll();
	};

	window.addEventListener("wheel", interrupt, { passive: true });
	window.addEventListener("touchstart", interrupt, { passive: true });
	removeInterruptListeners = () => {
		window.removeEventListener("wheel", interrupt);
		window.removeEventListener("touchstart", interrupt);
	};

	activeScroll = animate(from, top, {
		duration: durationForDistance(distance),
		ease: SCROLL_EASE,
		onUpdate: (latest) => {
			window.scrollTo(0, latest);
		},
		onComplete: () => {
			activeScroll = null;
			removeInterruptListeners?.();
			removeInterruptListeners = null;
		},
	});
}
