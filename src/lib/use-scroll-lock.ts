"use client";

import { useEffect } from "react";

/**
 * Locks page scroll while `active` (for modals / overlays / fullscreen views).
 * Sets `body.overflow: hidden` and restores it on cleanup.
 */
export function useScrollLock(active: boolean) {
	useEffect(() => {
		if (!active) return;
		const previous = document.body.style.overflow;
		document.body.style.overflow = "hidden";
		return () => {
			document.body.style.overflow = previous;
		};
	}, [active]);
}
