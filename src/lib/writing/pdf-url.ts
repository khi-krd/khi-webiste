const DEMO_PDF_PATH = "/writings/java-foundations.pdf";
const DEFAULT_S3_MEDIA_HOST =
	"pub-2ed2b741674940688bf1aa254047ad7e.r2.dev";

/** The archive platform's text proxy also serves PDFs the reader opens. */
const DEFAULT_PLATFORM_HOST = "178.105.87.169";

/** Locale-relative demo PDF used by mock writings (same-origin, no CORS). */
export const WRITING_DEMO_PDF_URL = DEMO_PDF_PATH;

function getAllowedPdfHosts(): Set<string> {
	const hosts = new Set<string>();
	const mediaHost = process.env.NEXT_PUBLIC_MEDIA_HOST;
	if (mediaHost) {
		hosts.add(mediaHost);
	}
	hosts.add(DEFAULT_S3_MEDIA_HOST);
	hosts.add(DEFAULT_PLATFORM_HOST);
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

export function isAllowedRemotePdfUrl(fileUrl: string): boolean {
	try {
		const parsed = new URL(fileUrl);
		if (parsed.protocol !== "https:") {
			// The archive platform serves plain HTTP — allow http only for the
			// hosts we explicitly trust (env-configured base URL or the default).
			if (parsed.protocol !== "http:") {
				return false;
			}
			const envHost = (() => {
				try {
					return new URL(process.env.PLATFORM_API_BASE_URL ?? "")
						.hostname;
				} catch {
					return "";
				}
			})();
			if (
				parsed.hostname !== DEFAULT_PLATFORM_HOST &&
				parsed.hostname !== envHost
			) {
				return false;
			}
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
