"use client";

import Lenis from "lenis";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { usePathname } from "@/i18n/navigation";
import { LenisContext } from "./lenis-context";

type Props = {
	children: React.ReactNode;
};

const REDUCE_MOTION = "(prefers-reduced-motion: reduce)";

/**
 * Smooth-scroll layer, exposed through {@link LenisContext} so the rest of the
 * app can coordinate with it (modal scroll-lock, route reset, anchor scroll).
 *
 * - No section snapping / per-frame custom event: those caused the "hijacked"
 *   feel on weak mobile GPUs.
 * - Touch left native (`syncTouch: false`) so phones keep hardware-accelerated
 *   momentum and we never interpolate per touch frame.
 * - Disabled entirely under `prefers-reduced-motion: reduce`, and rebuilt live
 *   if that preference changes — when off, the context value is `null` and every
 *   consumer falls back to native scrolling.
 *
 * The instance lives in state set ONCE (consumers re-render only when it
 * appears/disappears, never per scroll frame). Scroll position never enters
 * React state — the header reads native `scrollY` (Lenis drives the real
 * document scroll).
 */
export function LenisProvider({ children }: Props) {
	const [lenis, setLenis] = useState<Lenis | null>(null);
	const pathname = usePathname();
	const firstRoute = useRef(true);

	// Create/destroy Lenis, and rebuild when the reduced-motion preference flips.
	useEffect(() => {
		const mq = window.matchMedia(REDUCE_MOTION);
		let instance: Lenis | null = null;

		const build = () => {
			if (mq.matches) {
				instance?.destroy();
				instance = null;
				setLenis(null);
				return;
			}
			if (instance) return;
			instance = new Lenis({
				autoRaf: true,
				smoothWheel: true,
				syncTouch: false,
				lerp: 0.1,
				wheelMultiplier: 1,
			});
			setLenis(instance);
		};

		build();
		mq.addEventListener("change", build);
		return () => {
			mq.removeEventListener("change", build);
			instance?.destroy();
			setLenis(null);
		};
	}, []);

	// Reset to top on route change. `immediate: true` (no tween) so it never
	// competes visibly with the template enter transition or Next's own
	// restoration. The first mount is skipped so we don't fight initial position
	// (e.g. a deep link landing mid-page). `pathname` is a trigger-only dep — the
	// reset runs WHEN the route changes; its value is never read in the body.
	// biome-ignore lint/correctness/useExhaustiveDependencies: pathname is a trigger-only dependency (see note above)
	useLayoutEffect(() => {
		if (firstRoute.current) {
			firstRoute.current = false;
			return;
		}
		if (lenis) {
			lenis.scrollTo(0, { immediate: true });
		} else {
			window.scrollTo(0, 0);
		}
	}, [pathname, lenis]);

	// In-page #hash links → smooth scroll through Lenis (offset clears the fixed
	// header band). No-op when Lenis is null: the browser's native jump applies.
	useEffect(() => {
		if (!lenis) return;
		const onClick = (event: MouseEvent) => {
			if (event.defaultPrevented || event.button !== 0) return;
			const anchor = (event.target as HTMLElement | null)?.closest?.(
				"a[href^='#']",
			) as HTMLAnchorElement | null;
			const href = anchor?.getAttribute("href");
			if (!href || href === "#") return;
			const target = document.getElementById(href.slice(1));
			if (!target) return;
			event.preventDefault();
			lenis.scrollTo(target, { offset: -120 });
		};
		document.addEventListener("click", onClick);
		return () => document.removeEventListener("click", onClick);
	}, [lenis]);

	return (
		<LenisContext.Provider value={lenis}>{children}</LenisContext.Provider>
	);
}
