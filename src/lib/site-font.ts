import "server-only";

import type { SiteSettings } from "@/types/site-settings";

const DEFAULT_S3_MEDIA_HOST = "s3-khiwebsite.s3.us-east-1.amazonaws.com";

/**
 * Hosts the font proxy is allowed to fetch from — the media bucket plus
 * whatever host the API is configured on. Anything else is refused, which
 * keeps the route from being a general-purpose open proxy.
 */
function getAllowedFontHosts(): Set<string> {
	const hosts = new Set<string>();
	const mediaHost = process.env.NEXT_PUBLIC_MEDIA_HOST;
	if (mediaHost) {
		hosts.add(mediaHost);
	}
	hosts.add(DEFAULT_S3_MEDIA_HOST);
	for (const envUrl of [
		process.env.API_BASE_URL,
		process.env.PLATFORM_API_BASE_URL,
	]) {
		if (!envUrl) {
			continue;
		}
		try {
			hosts.add(new URL(envUrl).hostname);
		} catch {
			// ignore invalid URL in env
		}
	}
	return hosts;
}

export function isAllowedSiteFontUrl(url: string): boolean {
	try {
		const parsed = new URL(url);
		if (parsed.protocol !== "https:") {
			return false;
		}
		return getAllowedFontHosts().has(parsed.hostname);
	} catch {
		return false;
	}
}

/**
 * The @font-face src for a remote font file. Fonts are fetched in CORS mode
 * and the bucket sends no CORS headers, so remote files always load through
 * the same-origin proxy (which also keeps `font-src 'self'` satisfied).
 */
export function siteFontProxySrc(url: string): string {
	return `/api/site-font?src=${encodeURIComponent(url)}`;
}

const FORMAT_BY_EXT: Record<string, string> = {
	woff2: "woff2",
	woff: "woff",
	ttf: "truetype",
	otf: "opentype",
};

function fontFormatHint(url: string): string {
	const ext = url.split(/[?#]/)[0]?.split(".").pop()?.toLowerCase() ?? "";
	const format = FORMAT_BY_EXT[ext];
	return format ? ` format("${format}")` : "";
}

/**
 * @font-face + token overrides for the dashboard-picked typefaces.
 *
 * Each language gets one fixed family name — the stored `*FontName` is a
 * dashboard label only, and a fixed name keeps the generated CSS free of any
 * admin-typed string. The face declares `font-weight: 100 900` so a single
 * file (variable or not) covers every weight the site asks for.
 *
 * The overrides are emitted unlayered, which beats the `@layer base` rules in
 * globals.css; the heading rules there name the bundled vars directly rather
 * than reading `--font-app-heading`, so headings need their own rule.
 */
export function buildSiteFontCss(settings: SiteSettings | null): string {
	if (!settings) {
		return "";
	}

	const parts: string[] = [];

	const ckbUrl = settings.ckbFontUrl?.trim();
	if (ckbUrl && isAllowedSiteFontUrl(ckbUrl)) {
		parts.push(
			`@font-face{font-family:"KHI Site CKB";src:url("${siteFontProxySrc(ckbUrl)}")${fontFormatHint(ckbUrl)};font-weight:100 900;font-style:normal;font-display:swap}`,
			'html[data-script="arabic"]{--font-app-body:"KHI Site CKB";--font-app-heading:"KHI Site CKB"}',
			'html[data-script="arabic"] :is(h1,h2,h3,h4){font-family:"KHI Site CKB",var(--font-vazirmatn),sans-serif}',
		);
	}

	const kmrUrl = settings.kmrFontUrl?.trim();
	if (kmrUrl && isAllowedSiteFontUrl(kmrUrl)) {
		parts.push(
			`@font-face{font-family:"KHI Site KMR";src:url("${siteFontProxySrc(kmrUrl)}")${fontFormatHint(kmrUrl)};font-weight:100 900;font-style:normal;font-display:swap}`,
			'html[data-script="latin"]{--font-app-body:"KHI Site KMR";--font-app-heading:"KHI Site KMR"}',
			'html[data-script="latin"] :is(h1,h2,h3,h4){font-family:"KHI Site KMR",var(--font-archivo),var(--font-vazirmatn),sans-serif}',
		);
	}

	return parts.join("\n");
}
