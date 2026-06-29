import { Vazirmatn } from "next/font/google";
import localFont from "next/font/local";

/**
 * ckb (Sorani / Arabic script) primary family.
 */
export const vazirmatn = Vazirmatn({
	subsets: ["arabic", "latin"],
	variable: "--font-vazirmatn",
	display: "swap",
	weight: ["400", "500", "600", "700"],
});

/**
 * ku (Latin) body family.
 */
export const archivo = localFont({
	src: [
		{
			path: "../../public/fonts/Archivo/Archivo-Variable.woff2",
			style: "normal",
		},
		{
			path: "../../public/fonts/Archivo/Archivo-VariableItalic.woff2",
			style: "italic",
		},
	],
	weight: "100 900",
	variable: "--font-archivo",
	display: "swap",
});

/**
 * ku (Latin) heading family.
 */
export const clashDisplay = localFont({
	src: "../../public/fonts/Clash Display/ClashDisplay-Variable.woff2",
	weight: "200 700",
	variable: "--font-clash-display",
	display: "swap",
});
