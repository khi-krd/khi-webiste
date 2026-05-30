import { Vazirmatn } from "next/font/google";

/**
 * App font. Vazirmatn covers both scripts the site needs:
 * Arabic (Kurdish Sorani / ckb) and Latin (Kurdish Kurmanji / ku),
 * so a single family serves both locales and both text directions.
 *
 * Exposed as the `--font-sans` CSS variable — reference it from Tailwind's
 * theme (`--font-sans` token) and apply `vazirmatn.variable` on <html>.
 */
export const vazirmatn = Vazirmatn({
	subsets: ["arabic", "latin"],
	variable: "--font-sans",
	display: "swap",
	// Weights actually used across the UI; trims the downloaded font files.
	weight: ["400", "500", "600", "700"],
});
