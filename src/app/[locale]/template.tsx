"use client";

import { motion, useReducedMotion } from "motion/react";

/**
 * Per-navigation enter transition. A `template.tsx` re-mounts its subtree on
 * every navigation (unlike `layout.tsx`), which is exactly the trigger we want —
 * so this is ENTER-only. App Router swaps route content synchronously, making
 * `AnimatePresence` *exit* animations unreliable; we don't attempt them.
 *
 * Block-axis only (opacity + translateY): identical in RTL (ckb) and LTR (ku),
 * no `dir` handling needed. Both are compositor-friendly. Gated on
 * `useReducedMotion()` — the CSS media query alone does NOT stop Motion (JS).
 *
 * Only `children` (the page) animate; the Header/Footer live in `layout.tsx` and
 * stay stable across navigations.
 */

const EASE = [0.22, 1, 0.36, 1] as const; // house easing

export default function Template({ children }: { children: React.ReactNode }) {
	const reduceMotion = useReducedMotion();

	if (reduceMotion) return <>{children}</>;

	return (
		<motion.div
			initial={{ opacity: 0, y: 8 }}
			animate={{ opacity: 1, y: 0 }}
			transition={{ duration: 0.28, ease: EASE }}
		>
			{children}
		</motion.div>
	);
}
