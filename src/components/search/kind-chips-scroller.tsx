"use client";

import { type ReactNode, useEffect, useRef } from "react";

/**
 * The `<nav>` around the kind chips. Below `sm` the row scrolls sideways, so
 * on mount the active chip is nudged into view — after a tab switch the
 * chosen kind must never sit off-screen behind the edge mask. Only the strip
 * scrolls (never the page): the effect bails when nothing overflows.
 */
export function KindChipsScroller({
	label,
	className,
	children,
}: {
	label: string;
	className?: string;
	children: ReactNode;
}) {
	const navRef = useRef<HTMLElement>(null);

	useEffect(() => {
		const nav = navRef.current;
		if (!nav) {
			return;
		}
		const strip = nav.querySelector<HTMLElement>("ul");
		if (!strip || strip.scrollWidth <= strip.clientWidth) {
			return;
		}
		const active = nav.querySelector<HTMLElement>('[aria-current="page"]');
		if (!active) {
			return;
		}
		// Scroll the strip by hand rather than `scrollIntoView`, which walks
		// every scrollable ancestor — including the window — and must never
		// move the page. Physical left/right deltas work in both directions.
		const pad = Number.parseFloat(getComputedStyle(strip).paddingInlineStart);
		const box = strip.getBoundingClientRect();
		const chip = active.getBoundingClientRect();
		const overflowStart = chip.left - (box.left + pad);
		const overflowEnd = chip.right - (box.right - pad);
		const delta =
			overflowStart < 0 ? overflowStart : overflowEnd > 0 ? overflowEnd : 0;
		if (delta === 0) {
			return;
		}
		strip.scrollBy({
			left: delta,
			behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches
				? "auto"
				: "smooth",
		});
	}, []);

	return (
		<nav ref={navRef} aria-label={label} className={className}>
			{children}
		</nav>
	);
}
