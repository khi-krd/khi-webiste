"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

/** Always show the bar when within this distance of the document top. */
const AT_TOP_THRESHOLD = 32;

/** Do not hide until the user has scrolled past the hero/header band. */
const HIDE_AFTER_THRESHOLD = 96;

/** Ignore sub-pixel jitter so the bar doesn't flicker on tiny movements. */
const SCROLL_DELTA = 4;

type Props = {
	children: React.ReactNode;
};

/**
 * Fixed header that hides while scrolling down and reappears when the user
 * scrolls up from anywhere on the page (not only at the document top).
 *
 * Reads native `scroll` events (rAF-throttled, passive) so it stays decoupled
 * from the smooth-scroll provider and adds no per-frame main-thread cost.
 */
export function HeaderShell({ children }: Props) {
	const [visible, setVisible] = useState(true);

	useEffect(() => {
		let lastScrollY = Math.max(0, window.scrollY);
		let ticking = false;

		const update = () => {
			ticking = false;
			const current = Math.max(0, window.scrollY);

			if (current <= AT_TOP_THRESHOLD) {
				setVisible(true);
				lastScrollY = current;
				return;
			}

			const delta = current - lastScrollY;
			if (Math.abs(delta) < SCROLL_DELTA) return;

			if (delta < 0) {
				setVisible(true);
			} else if (current > HIDE_AFTER_THRESHOLD) {
				setVisible(false);
			}

			lastScrollY = current;
		};

		const onScroll = () => {
			if (ticking) return;
			ticking = true;
			window.requestAnimationFrame(update);
		};

		window.addEventListener("scroll", onScroll, { passive: true });
		return () => window.removeEventListener("scroll", onScroll);
	}, []);

	return (
		<header
			className={cn(
				"fixed inset-x-0 top-0 z-50 p-5 transition-transform duration-300 ease-out motion-reduce:transition-none",
				visible ? "translate-y-0" : "pointer-events-none -translate-y-full",
			)}
		>
			{children}
		</header>
	);
}
