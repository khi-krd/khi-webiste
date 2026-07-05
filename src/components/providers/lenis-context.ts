"use client";

import type Lenis from "lenis";
import type Snap from "lenis/snap";
import { createContext, useCallback, useContext } from "react";
import { scrollToSection } from "@/lib/scroll-to-section";

/**
 * The live Lenis instance, exposed app-wide so modals can pause it, the
 * route-reset can drive it, and in-page anchors can scroll through it.
 *
 * Nullable BY DESIGN: under `prefers-reduced-motion: reduce` Lenis is never
 * created, so every consumer must null-check and fall back to native behaviour.
 */
export const LenisContext = createContext<Lenis | null>(null);

/** Lenis Snap instance for section snapping, or `null` when disabled. */
export const LenisSnapContext = createContext<Snap | null>(null);

/** Current Lenis instance, or `null` (reduced-motion / before first mount). */
export function useLenis(): Lenis | null {
	return useContext(LenisContext);
}

/** Current Snap instance, or `null` (reduced-motion / before first mount). */
export function useLenisSnap(): Snap | null {
	return useContext(LenisSnapContext);
}

/** Scroll to a section id or element through Lenis when available. */
export function useScrollToSection() {
	const lenis = useLenis();

	return useCallback(
		(target: string | HTMLElement, options?: { immediate?: boolean }) => {
			scrollToSection(target, lenis, options);
		},
		[lenis],
	);
}
