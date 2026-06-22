"use client";

import Lenis from "lenis";
import { useEffect } from "react";

type Props = {
	children: React.ReactNode;
};

/**
 * Lightweight smooth-scroll layer.
 *
 * - No section snapping and no per-frame custom event: those were the source of
 *   the "buggy"/hijacked scroll feel on weak mobile GPUs.
 * - Touch is left native (`syncTouch: false`) so phones keep hardware-accelerated
 *   momentum scrolling and we never run interpolation per touch frame.
 * - Disabled entirely under `prefers-reduced-motion: reduce`.
 *
 * The header reads scroll position from native `scroll` events (Lenis drives the
 * real document scroll), so nothing else needs to subscribe here.
 */
export function LenisProvider({ children }: Props) {
	useEffect(() => {
		if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
			return;
		}

		const lenis = new Lenis({
			autoRaf: true,
			smoothWheel: true,
			syncTouch: false,
			lerp: 0.1,
			wheelMultiplier: 1,
		});

		return () => {
			lenis.destroy();
		};
	}, []);

	return children;
}
