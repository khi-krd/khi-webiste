"use client";

import { useEffect } from "react";
import { useLenis, useLenisSnap } from "@/components/providers/lenis-context";

/**
 * Locks page scroll while `active` (for modals / overlays / fullscreen views).
 *
 * Stops Lenis and Snap when present so the smooth layer doesn't keep
 * interpolating behind the overlay, AND sets `body.overflow: hidden` as the
 * always-on fallback (covers reduced-motion, where Lenis is `null`). Both are
 * restored on cleanup.
 */
export function useScrollLock(active: boolean) {
	const lenis = useLenis();
	const snap = useLenisSnap();

	useEffect(() => {
		if (!active) return;
		const previous = document.body.style.overflow;
		document.body.style.overflow = "hidden";
		lenis?.stop();
		snap?.stop();
		return () => {
			document.body.style.overflow = previous;
			lenis?.start();
			snap?.start();
		};
	}, [active, lenis, snap]);
}
