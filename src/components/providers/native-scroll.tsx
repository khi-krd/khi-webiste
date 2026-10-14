"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "@/i18n/navigation";
import { scrollToSection } from "@/lib/scroll-to-section";

/**
 * Native document-scroll helpers:
 * - Reset scroll to top on client navigations
 * - Intercept same-page `#hash` links for smooth scrollIntoView
 * - Glide to a `#hash` target after landing on a page that carries one —
 *   covers deep links like a partner card's `/services#studio`, which the
 *   browser otherwise just jumps to (or, after a soft navigation, misses).
 */
export function NativeScroll({ children }: { children: React.ReactNode }) {
	const pathname = usePathname();
	const firstRoute = useRef(true);

	// biome-ignore lint/correctness/useExhaustiveDependencies: pathname is a trigger-only dependency
	useEffect(() => {
		if (firstRoute.current) {
			firstRoute.current = false;
			return;
		}
		if (window.location.hash) return; // the hash effect below owns landing
		window.scrollTo(0, 0);
	}, [pathname]);

	// Land on the section a deep link points at — smooth when the page loaded
	// at the top (soft navigation), a no-op when the browser already jumped
	// (scrollToSection returns early under ~1px of travel).
	useEffect(() => {
		const id = window.location.hash.slice(1);
		if (!id) return;
		const el = document.getElementById(decodeURIComponent(id));
		if (!el) return;
		const frame = requestAnimationFrame(() => scrollToSection(el));
		return () => cancelAnimationFrame(frame);
	}, [pathname]);

	useEffect(() => {
		const onClick = (event: MouseEvent) => {
			if (event.defaultPrevented || event.button !== 0) return;
			const anchor = (event.target as HTMLElement | null)?.closest?.(
				"a[href]",
			) as HTMLAnchorElement | null;
			const href = anchor?.getAttribute("href");
			if (!href || href === "#" || !href.includes("#")) return;

			// Same-page targets come in two shapes: a bare "#id" and a
			// path+hash like "/services#studio" (locale prefix included). The
			// second form only counts when its path is THIS page — otherwise it
			// is a real navigation and must pass through.
			const bare = href.startsWith("#");
			if (
				!bare &&
				anchor &&
				anchor.pathname !== window.location.pathname
			) {
				return;
			}
			const id = bare ? href.slice(1) : anchor?.hash.slice(1);
			if (!id) return;
			const target = document.getElementById(decodeURIComponent(id));
			if (!target) return;
			event.preventDefault();
			history.pushState(null, "", `#${id}`);
			scrollToSection(target);
		};
		document.addEventListener("click", onClick);
		return () => document.removeEventListener("click", onClick);
	}, []);

	return children;
}
