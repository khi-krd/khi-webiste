"use client";

import Lenis from "lenis";
import Snap from "lenis/snap";
import {
	useCallback,
	useEffect,
	useLayoutEffect,
	useRef,
	useState,
} from "react";
import { usePathname } from "@/i18n/navigation";
import { discoverSnapSections } from "@/lib/scroll-sections";
import { scrollToSection } from "@/lib/scroll-to-section";
import { LenisContext, LenisSnapContext } from "./lenis-context";

type Props = {
	children: React.ReactNode;
};

const REDUCE_MOTION = "(prefers-reduced-motion: reduce)";
const MIN_SNAP_SECTIONS = 2;

/**
 * Smooth-scroll layer with section snapping, exposed through {@link LenisContext}
 * and {@link LenisSnapContext} so the rest of the app can coordinate with it.
 *
 * - Wheel and touch both run through Lenis (`syncTouch: true`).
 * - `lenis/snap` settles free scroll onto nearest `[data-snap-section]` block.
 * - Disabled entirely under `prefers-reduced-motion: reduce`.
 *
 * The instances live in state set ONCE (consumers re-render only when they
 * appear/disappear, never per scroll frame).
 */
export function LenisProvider({ children }: Props) {
	const [lenis, setLenis] = useState<Lenis | null>(null);
	const [snap, setSnap] = useState<Snap | null>(null);
	const pathname = usePathname();
	const firstRoute = useRef(true);
	const snapRemoversRef = useRef<(() => void)[]>([]);

	const clearSnapSections = useCallback(() => {
		for (const remove of snapRemoversRef.current) {
			remove();
		}
		snapRemoversRef.current = [];
	}, []);

	const bindSnapSections = useCallback(
		(snapInstance: Snap) => {
			clearSnapSections();
			const sections = discoverSnapSections();
			if (sections.length < MIN_SNAP_SECTIONS) return;
			const remove = snapInstance.addElements(sections, { align: "start" });
			snapRemoversRef.current.push(remove);
			snapInstance.resize();
		},
		[clearSnapSections],
	);

	// Create/destroy Lenis + Snap; rebuild when reduced-motion preference flips.
	useEffect(() => {
		const mq = window.matchMedia(REDUCE_MOTION);
		let instance: Lenis | null = null;
		let snapInstance: Snap | null = null;

		const build = () => {
			if (mq.matches) {
				clearSnapSections();
				snapInstance?.destroy();
				snapInstance = null;
				instance?.destroy();
				instance = null;
				setSnap(null);
				setLenis(null);
				return;
			}
			if (instance) return;

			instance = new Lenis({
				autoRaf: true,
				smoothWheel: true,
				syncTouch: true,
				syncTouchLerp: 0.075,
				touchMultiplier: 1,
				lerp: 0.1,
				wheelMultiplier: 1,
			});

			snapInstance = new Snap(instance, {
				type: "proximity",
				distanceThreshold: "40%",
				debounce: 120,
				duration: 0.8,
			});

			setLenis(instance);
			setSnap(snapInstance);

			requestAnimationFrame(() => {
				requestAnimationFrame(() => {
					if (snapInstance) bindSnapSections(snapInstance);
				});
			});
		};

		build();
		mq.addEventListener("change", build);
		return () => {
			mq.removeEventListener("change", build);
			clearSnapSections();
			snapInstance?.destroy();
			instance?.destroy();
			setSnap(null);
			setLenis(null);
		};
	}, [bindSnapSections, clearSnapSections]);

	// Reset to top on route change and rebind snap targets for the new page.
	// biome-ignore lint/correctness/useExhaustiveDependencies: pathname is a trigger-only dependency
	useLayoutEffect(() => {
		if (firstRoute.current) {
			firstRoute.current = false;
		} else if (lenis) {
			lenis.scrollTo(0, { immediate: true });
		} else {
			window.scrollTo(0, 0);
		}

		if (!snap) return;

		const frame = requestAnimationFrame(() => {
			requestAnimationFrame(() => {
				bindSnapSections(snap);
			});
		});

		return () => cancelAnimationFrame(frame);
	}, [pathname, lenis, snap, bindSnapSections]);

	// In-page #hash links → smooth scroll through Lenis.
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
			scrollToSection(target, lenis);
		};
		document.addEventListener("click", onClick);
		return () => document.removeEventListener("click", onClick);
	}, [lenis]);

	return (
		<LenisContext.Provider value={lenis}>
			<LenisSnapContext.Provider value={snap}>
				{children}
			</LenisSnapContext.Provider>
		</LenisContext.Provider>
	);
}
