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
			path: "../../public/fonts/Archivo/Archivo-Regular.woff2",
			weight: "400",
			style: "normal",
		},
		{
			path: "../../public/fonts/Archivo/Archivo-Medium.woff2",
			weight: "500",
			style: "normal",
		},
		{
			path: "../../public/fonts/Archivo/Archivo-SemiBold.woff2",
			weight: "600",
			style: "normal",
		},
		{
			path: "../../public/fonts/Archivo/Archivo-Bold.woff2",
			weight: "700",
			style: "normal",
		},
		{
			path: "../../public/fonts/Archivo/Archivo-Italic.woff2",
			weight: "400",
			style: "italic",
		},
	],
	variable: "--font-archivo",
	display: "swap",
});

/**
 * ku (Latin) heading family.
 */
export const clashDisplay = localFont({
	src: [
		{
			path: "../../public/fonts/Clash Display/ClashDisplay-Regular.woff2",
			weight: "400",
			style: "normal",
		},
		{
			path: "../../public/fonts/Clash Display/ClashDisplay-Medium.woff2",
			weight: "500",
			style: "normal",
		},
		{
			path: "../../public/fonts/Clash Display/ClashDisplay-Semibold.woff2",
			weight: "600",
			style: "normal",
		},
		{
			path: "../../public/fonts/Clash Display/ClashDisplay-Bold.woff2",
			weight: "700",
			style: "normal",
		},
	],
	variable: "--font-clash-display",
	display: "swap",
});
