"use client";

import { useLocale } from "next-intl";
import { useEffect, useRef, useState } from "react";
import { usePathname } from "@/i18n/navigation";

type Status = "idle" | "active" | "finishing";

/**
 * Thin top progress bar shown during client navigation.
 *
 * The App Router exposes no router events, so we START on navigation INTENT
 * (captured link click + patched `history.pushState` + `popstate`) and FINISH
 * on COMMIT (the route key actually changing). Mounted ONCE in the layout.
 *
 * The visual lives in the `.route-progress` class (globals.css) — hairline,
 * `accent`-tinted, driven by `transform: scaleX` from the leading edge, so it
 * grows correctly in both RTL (ckb) and LTR (ku). Under reduced-motion the
 * global transition kill-switch neutralises the tween → it simply snaps on/off.
 */
export function RouteProgress() {
	const pathname = usePathname();
	const locale = useLocale();
	const [status, setStatus] = useState<Status>("idle");
	// next-intl's usePathname is locale-stripped, so a ckb↔ku switch changes only
	// the locale — key the commit on BOTH or the bar would hang on language change.
	const committedKey = useRef(`${locale}:${pathname}`);
	const finishTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

	// START on navigation intent.
	useEffect(() => {
		const start = () => {
			if (finishTimer.current) {
				clearTimeout(finishTimer.current);
				finishTimer.current = null;
			}
			setStatus("active");
		};

		const isModifiedClick = (event: MouseEvent) =>
			event.metaKey ||
			event.ctrlKey ||
			event.shiftKey ||
			event.altKey ||
			event.button !== 0;

		const onClick = (event: MouseEvent) => {
			if (isModifiedClick(event)) return;
			const anchor = (event.target as HTMLElement | null)?.closest?.("a");
			if (!anchor?.getAttribute("href")) return;
			if (anchor.target === "_blank" || anchor.hasAttribute("download")) return;
			let url: URL;
			try {
				url = new URL(anchor.href, location.href);
			} catch {
				return;
			}
			if (url.origin !== location.origin) return; // external
			// pure in-page hash on the current path → no route change
			if (url.pathname === location.pathname && url.hash) return;
			// identical URL → no commit will ever fire
			if (url.pathname === location.pathname && url.search === location.search)
				return;
			start();
		};

		// Programmatic navigation (router.push, language switch) goes through
		// history.pushState — patch it, and restore on cleanup.
		const originalPushState = history.pushState;
		history.pushState = function patchedPushState(
			...args: Parameters<typeof history.pushState>
		) {
			start();
			return originalPushState.apply(this, args);
		};
		const onPopState = () => start();

		document.addEventListener("click", onClick, true);
		window.addEventListener("popstate", onPopState);
		return () => {
			document.removeEventListener("click", onClick, true);
			window.removeEventListener("popstate", onPopState);
			history.pushState = originalPushState;
		};
	}, []);

	// FINISH on commit — fill to 100% + fade, then reset to idle.
	useEffect(() => {
		const key = `${locale}:${pathname}`;
		if (key === committedKey.current) return;
		committedKey.current = key;
		setStatus("finishing");
		finishTimer.current = setTimeout(() => {
			setStatus("idle");
			finishTimer.current = null;
		}, 260);
	}, [pathname, locale]);

	// Clear a pending finish timer on unmount.
	useEffect(
		() => () => {
			if (finishTimer.current) clearTimeout(finishTimer.current);
		},
		[],
	);

	return (
		<div
			aria-hidden
			data-active={status === "active" || undefined}
			data-finishing={status === "finishing" || undefined}
			className="route-progress pointer-events-none fixed start-0 end-0 top-0 z-[90] h-0.5"
		/>
	);
}
