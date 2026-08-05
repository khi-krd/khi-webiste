"use client";

import { motion, useReducedMotion } from "motion/react";
import { useEffect, useState } from "react";

/** Always show the bar when within this distance of the document top. */
const AT_TOP_THRESHOLD = 96;

/** Do not hide until the user has scrolled past the header band. */
const HIDE_AFTER_THRESHOLD = 96;

/** Ignore sub-pixel jitter so the bar doesn't flicker on tiny movements. */
const SCROLL_DELTA = 4;

const INTRO_DURATION = 0.6;
const SCROLL_DURATION = 0.3;

type Props = {
	children: React.ReactNode;
};

/**
 * Sticky header at the top of the page (in document flow, not an overlay).
 * Hides while scrolling down and reappears on scroll up or when back at the top.
 */
export function HeaderShell({ children }: Props) {
	const reduceMotion = useReducedMotion();
	const [scrollVisible, setScrollVisible] = useState(true);
	const [introRevealed, setIntroRevealed] = useState(false);
	const [introDone, setIntroDone] = useState(false);

	useEffect(() => {
		const id = requestAnimationFrame(() => {
			requestAnimationFrame(() => setIntroRevealed(true));
		});
		return () => cancelAnimationFrame(id);
	}, []);

	useEffect(() => {
		let lastScrollY = Math.max(0, window.scrollY);
		let ticking = false;

		const update = () => {
			ticking = false;
			const current = Math.max(0, window.scrollY);

			if (current <= AT_TOP_THRESHOLD) {
				setScrollVisible(true);
				lastScrollY = current;
				return;
			}

			const delta = current - lastScrollY;
			if (Math.abs(delta) < SCROLL_DELTA) return;

			if (delta < 0) {
				setScrollVisible(true);
			} else if (current > HIDE_AFTER_THRESHOLD) {
				setScrollVisible(false);
			}

			lastScrollY = current;
		};

		const onScroll = () => {
			if (ticking) return;
			ticking = true;
			window.requestAnimationFrame(update);
		};

		update();
		window.addEventListener("scroll", onScroll, { passive: true });
		return () => window.removeEventListener("scroll", onScroll);
	}, []);

	const isVisible = introRevealed && scrollVisible;

	return (
		<motion.header
			className="sticky top-0 z-50 border-b border-border/40 bg-background/35 backdrop-blur-[48px]"
			initial={reduceMotion ? false : { y: "-100%" }}
			animate={{ y: isVisible || reduceMotion ? 0 : "-100%" }}
			transition={
				reduceMotion
					? { duration: 0 }
					: {
							duration: introDone ? SCROLL_DURATION : INTRO_DURATION,
							ease: introDone ? "easeOut" : ([0.22, 1, 0.36, 1] as const),
						}
			}
			onAnimationComplete={() => {
				if (introRevealed && !introDone) {
					setIntroDone(true);
				}
			}}
			style={{ pointerEvents: isVisible ? undefined : "none" }}
		>
			{children}
		</motion.header>
	);
}
