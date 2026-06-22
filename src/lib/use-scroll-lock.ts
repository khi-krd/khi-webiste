"use client";

import { useEffect } from "react";
import { useLenis } from "@/components/providers/lenis-context";

/**
 * Locks page scroll while `active` (for modals / overlays / fullscreen views).
 *
 * Stops Lenis when present so the smooth layer doesn't keep interpolating
 * behind the overlay, AND sets `body.overflow: hidden` as the always-on
 * fallback (covers reduced-motion, where Lenis is `null`). Both are restored on
 * cleanup. Callers keep their own focus-management; this only owns the lock.
 */
export function useScrollLock(active: boolean) {
	const lenis = useLenis();

	useEffect(() => {
		if (!active) return;
		const previous = document.body.style.overflow;
		document.body.style.overflow = "hidden";
		lenis?.stop();
		return () => {
			document.body.style.overflow = previous;
			lenis?.start();
		};
	}, [active, lenis]);
}
