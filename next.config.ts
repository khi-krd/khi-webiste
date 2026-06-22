import bundleAnalyzer from "@next/bundle-analyzer";
import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const mediaHost = process.env.NEXT_PUBLIC_MEDIA_HOST;

// Opt-in treemap of client/server bundles: `ANALYZE=true pnpm build`.
const withBundleAnalyzer = bundleAnalyzer({
	enabled: process.env.ANALYZE === "true",
});

const nextConfig: NextConfig = {
	output: "standalone",
	// Rewrite barrel imports (e.g. `motion/react`) to direct module paths so only
	// the icons/animations actually used land in each route's client bundle.
	experimental: {
		optimizePackageImports: ["motion", "simple-icons"],
	},
	images: {
		// Serve modern formats; AVIF first (smaller), WebP fallback. Browsers
		// that support neither still get the original JPEG/PNG.
		formats: ["image/avif", "image/webp"],
		// 40 is used for the heavily-blurred decorative footer backdrop; 75 is
		// the default for all content imagery.
		qualities: [40, 75],
		// No CDN in front (self-hosted/Dokploy), so let the on-container optimizer
		// cache optimized variants aggressively (1 year) instead of re-encoding.
		minimumCacheTTL: 31536000,
		remotePatterns: mediaHost
			? [{ protocol: "https" as const, hostname: mediaHost }]
			: [],
	},
};

// Points next-intl at src/i18n/request.ts (the default location).
const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

export default withBundleAnalyzer(withNextIntl(nextConfig));
