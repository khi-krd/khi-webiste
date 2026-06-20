import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const mediaHost = process.env.NEXT_PUBLIC_MEDIA_HOST;

const nextConfig: NextConfig = {
	output: "standalone",
	images: {
		// Serve modern formats; AVIF first (smaller), WebP fallback. Browsers
		// that support neither still get the original JPEG/PNG.
		formats: ["image/avif", "image/webp"],
		// 40 is used for the heavily-blurred decorative footer backdrop; 75 is
		// the default for all content imagery.
		qualities: [40, 75],
		remotePatterns: mediaHost
			? [{ protocol: "https" as const, hostname: mediaHost }]
			: [],
	},
};

// Points next-intl at src/i18n/request.ts (the default location).
const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

export default withNextIntl(nextConfig);
