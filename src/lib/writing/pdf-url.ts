const DEMO_PDF_PATH = "/writings/java-foundations.pdf";

/** Locale-relative demo PDF used by mock writings (same-origin, no CORS). */
export const WRITING_DEMO_PDF_URL = DEMO_PDF_PATH;

function getAllowedPdfHosts(): Set<string> {
	const hosts = new Set<string>();
	const mediaHost = process.env.NEXT_PUBLIC_MEDIA_HOST;
	if (mediaHost) {
		hosts.add(mediaHost);
	}
	const apiBaseUrl = process.env.API_BASE_URL;
	if (apiBaseUrl) {
		try {
			hosts.add(new URL(apiBaseUrl).hostname);
		} catch {
			// ignore invalid API_BASE_URL
		}
	}
	return hosts;
}

export function isAllowedRemotePdfUrl(fileUrl: string): boolean {
	try {
		const parsed = new URL(fileUrl);
		if (parsed.protocol !== "https:") {
			return false;
		}
		return getAllowedPdfHosts().has(parsed.hostname);
	} catch {
		return false;
	}
}

/**
 * Resolves a writing file URL for react-pdf in the browser.
 * Same-origin paths are used directly; remote URLs are proxied to avoid CORS.
 */
export function resolvePdfViewerUrl(fileUrl: string): string {
	if (fileUrl.startsWith("/")) {
		return fileUrl;
	}

	try {
		const parsed = new URL(fileUrl);
		if (
			typeof window !== "undefined" &&
			parsed.origin === window.location.origin
		) {
			return fileUrl;
		}
		if (isAllowedRemotePdfUrl(fileUrl)) {
			return `/api/writings/pdf?src=${encodeURIComponent(fileUrl)}`;
		}
	} catch {
		return fileUrl;
	}

	return `/api/writings/pdf?src=${encodeURIComponent(fileUrl)}`;
}
