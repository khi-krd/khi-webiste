"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "@/i18n/navigation";
import { scrollToSection } from "@/lib/scroll-to-section";

/**
 * Native document-scroll helpers:
 * - Reset scroll to top on client navigations
 * - Intercept same-page `#hash` links for smooth scrollIntoView
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
		window.scrollTo(0, 0);
	}, [pathname]);

	useEffect(() => {
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
			scrollToSection(target);
		};
		document.addEventListener("click", onClick);
		return () => document.removeEventListener("click", onClick);
	}, []);

	return children;
}
