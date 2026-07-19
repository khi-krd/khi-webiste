import bundleAnalyzer from "@next/bundle-analyzer";
import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

/**
 * CMS cover URLs may point at S3, Wikimedia, YouTube thumbnails, or any other
 * HTTPS host. Kept for next/image allowlisting; images are not re-encoded
 * (see `unoptimized` below) so the browser loads the original source URL.
 */
const REMOTE_IMAGE_PATTERNS: NonNullable<
	NextConfig["images"]
>["remotePatterns"] = [
	{ protocol: "https", hostname: "**" },
	{ protocol: "http", hostname: "**" },
];

// Opt-in treemap of client/server bundles: `ANALYZE=true pnpm build`.
const withBundleAnalyzer = bundleAnalyzer({
	enabled: process.env.ANALYZE === "true",
});

const NO_STORE = "private, no-cache, no-store, must-revalidate, max-age=0";

const nextConfig: NextConfig = {
	output: "standalone",
	// Rewrite barrel imports (e.g. `motion/react`) to direct module paths so only
	// the icons/animations actually used land in each route's client bundle.
	experimental: {
		optimizePackageImports: ["motion", "simple-icons"],
	},
	images: {
		// Serve CMS/S3 media directly from the original URL. Skipping the
		// `/_next/image` proxy avoids optimizer failures when the raw source works.
		unoptimized: true,
		formats: ["image/avif", "image/webp"],
		qualities: [40, 75],
		minimumCacheTTL: 31536000,
		remotePatterns: REMOTE_IMAGE_PATTERNS,
	},
	/**
	 * Prevent browsers and Cloudflare from caching HTML / RSC / API JSON.
	 * Static hashed assets under `/_next/static` keep Next's long-lived headers.
	 * `Cloudflare-CDN-Cache-Control` overrides edge caching even when CF
	 * "Cache Everything" rules are present (Origin Cache Control must be ON).
	 */
	async headers() {
		return [
			{
				source: "/((?!_next/static|_next/image|.*\\..*).*)",
				headers: [
					{ key: "Cache-Control", value: NO_STORE },
					{ key: "CDN-Cache-Control", value: "no-store" },
					{ key: "Cloudflare-CDN-Cache-Control", value: "no-store" },
				],
			},
			{
				source: "/api/:path*",
				headers: [
					{ key: "Cache-Control", value: NO_STORE },
					{ key: "CDN-Cache-Control", value: "no-store" },
					{ key: "Cloudflare-CDN-Cache-Control", value: "no-store" },
				],
			},
		];
	},
};

// Points next-intl at src/i18n/request.ts (the default location).
const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

export default withBundleAnalyzer(withNextIntl(nextConfig));
