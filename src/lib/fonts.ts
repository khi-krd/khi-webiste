import { Vazirmatn } from "next/font/google";

/**
 * App font. Vazirmatn covers both scripts the site needs:
 * Arabic (Kurdish Sorani / ckb) and Latin (Kurdish Kurmanji / ku),
 * so a single family serves both locales and both text directions.
 *
 * Exposed as the `--font-vazirmatn` CSS variable (deliberately NOT `--font-sans`,
 * to avoid a cycle with Tailwind's `--font-sans` theme token, which consumes
 * this one). Apply `vazirmatn.variable` on <html>; globals.css maps
 * `--font-sans → var(--font-vazirmatn), <fallbacks>`.
 */
export const vazirmatn = Vazirmatn({
	subsets: ["arabic", "latin"],
	variable: "--font-vazirmatn",
	display: "swap",
	// Weights actually used across the UI; trims the downloaded font files.
	weight: ["400", "500", "600", "700"],
});
