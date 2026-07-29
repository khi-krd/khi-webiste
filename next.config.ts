import bundleAnalyzer from "@next/bundle-analyzer";
import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

/**
 * CMS cover URLs may point at S3, Wikimedia, YouTube thumbnails, or any other
 * HTTPS host. Kept for next/image allowlisting; images are not re-encoded
 * (see `unoptimized` below) so the browser loads the original source URL.
 *
 * HTTPS only — a plaintext image on an HTTPS page is blocked as mixed content
 * by the browser anyway, so allowing `http` only widens the CSP surface.
 */
const REMOTE_IMAGE_PATTERNS: NonNullable<
	NextConfig["images"]
>["remotePatterns"] = [{ protocol: "https", hostname: "**" }];

// Opt-in treemap of client/server bundles: `ANALYZE=true pnpm build`.
const withBundleAnalyzer = bundleAnalyzer({
	enabled: process.env.ANALYZE === "true",
});

const NO_STORE = "private, no-cache, no-store, must-revalidate, max-age=0";

/**
 * Third-party frames the site legitimately embeds: YouTube/Vimeo players in the
 * video sections and a Google Maps embed on the contact page. The map URL comes
 * from the CMS (`page.mapEmbedUrl`), so this allowlist is what stops a bad CMS
 * value from framing an arbitrary origin.
 */
const FRAME_SRC = [
	"'self'",
	"https://www.youtube.com",
	"https://www.youtube-nocookie.com",
	"https://player.vimeo.com",
	"https://www.google.com",
	"https://maps.google.com",
].join(" ");

/**
 * Report-Only for now — flipping this to enforcing requires nonces, because
 * Next.js emits inline bootstrap scripts and `featured-hero.tsx` injects an
 * inline JSON-LD block. Ship this, watch the violation reports, then switch the
 * header name to `Content-Security-Policy` once the report is quiet.
 *
 * `img-src`/`media-src` stay wide (`https:`) to match the wildcard
 * `remotePatterns` above: CMS covers can live on any HTTPS host.
 */
const CONTENT_SECURITY_POLICY = [
	"default-src 'self'",
	"script-src 'self' 'unsafe-inline' 'unsafe-eval'",
	"style-src 'self' 'unsafe-inline'",
	"img-src 'self' data: blob: https:",
	"media-src 'self' blob: https:",
	"font-src 'self' data:",
	"connect-src 'self' https:",
	"worker-src 'self' blob:",
	`frame-src ${FRAME_SRC}`,
	"frame-ancestors 'self'",
	"object-src 'none'",
	"base-uri 'self'",
	"form-action 'self'",
	"upgrade-insecure-requests",
].join("; ");

/**
 * Applied to every response. HSTS is deliberately opt-in: this container is
 * meant to sit behind a TLS-terminating reverse proxy on Hetzner, and sending
 * HSTS from a plain-HTTP origin pins browsers to a scheme the site cannot serve.
 * Set `ENABLE_HSTS=true` once HTTPS is confirmed working end to end.
 *
 * NOTE: `headers()` is evaluated during `next build`, not per request, so
 * ENABLE_HSTS is a BUILD-time variable. It is wired as a Docker build arg —
 * setting it only in the runtime environment has no effect.
 */
const SECURITY_HEADERS = [
	{ key: "X-Content-Type-Options", value: "nosniff" },
	{ key: "X-Frame-Options", value: "SAMEORIGIN" },
	{ key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
	{
		key: "Permissions-Policy",
		value: "camera=(), microphone=(), geolocation=(), browsing-topics=()",
	},
	{
		key: "Content-Security-Policy-Report-Only",
		value: CONTENT_SECURITY_POLICY,
	},
	...(process.env.ENABLE_HSTS === "true"
		? [
				{
					key: "Strict-Transport-Security",
					value: "max-age=63072000; includeSubDomains; preload",
				},
			]
		: []),
];

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
			// Security headers apply to every response, including static assets.
			{ source: "/:path*", headers: SECURITY_HEADERS },
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
