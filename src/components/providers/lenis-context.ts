"use client";

import type Lenis from "lenis";
import { createContext, useContext } from "react";

/**
 * The live Lenis instance, exposed app-wide so modals can pause it, the
 * route-reset can drive it, and in-page anchors can scroll through it.
 *
 * Nullable BY DESIGN: under `prefers-reduced-motion: reduce` Lenis is never
 * created, so every consumer must null-check and fall back to native behaviour.
 */
export const LenisContext = createContext<Lenis | null>(null);

/** Current Lenis instance, or `null` (reduced-motion / before first mount). */
export function useLenis(): Lenis | null {
	return useContext(LenisContext);
}
