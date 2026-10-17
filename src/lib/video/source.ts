/** Parse a YouTube video ID from Vidstack, URL, or bare ID forms. */
export function parseYouTubeVideoId(input: string): string | null {
	const trimmed = input.trim();

	if (trimmed.startsWith("youtube/")) {
		const id = trimmed.slice("youtube/".length).split(/[?&#]/)[0];
		return id || null;
	}

	try {
		const url = new URL(
			trimmed.startsWith("http") ? trimmed : `https://${trimmed}`,
		);

		if (url.hostname === "youtu.be") {
			return url.pathname.slice(1).split("/")[0] || null;
		}

		if (url.hostname.endsWith("youtube.com")) {
			const watchId = url.searchParams.get("v");
			if (watchId) return watchId;

			const pathMatch = url.pathname.match(
				/^\/(?:embed|shorts|live)\/([^/?]+)/,
			);
			if (pathMatch?.[1]) return pathMatch[1];
		}
	} catch {
		// Not a URL — fall through to bare ID check.
	}

	return /^[\w-]{11}$/.test(trimmed) ? trimmed : null;
}

export function isYouTubeSource(src: string): boolean {
	return parseYouTubeVideoId(src) !== null;
}

/** Normalize any supported source into the shape Vidstack expects. */
export function toVidstackSrc(src: string): string {
	const videoId = parseYouTubeVideoId(src);
	return videoId ? `youtube/${videoId}` : src;
}

export function getYouTubePosterUrl(videoId: string): string {
	return `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`;
}

const MEDIA_FILE_PATTERN = /\.(mp4|webm|ogg|ogv|mov|m4v|m3u8|mpd)(\?|#|$)/i;

/**
 * Normalize an embed URL for in-app playback:
 * - Any YouTube form becomes a `youtube-nocookie.com/embed/<id>` URL with the
 *   branding YouTube lets an embed opt out of (modestbranding, rel=0,
 *   iv_load_policy=3) — the cookieless host also drops the "watch later" /
 *   share chrome's tracking. The player logo on hover cannot be removed.
 * - A plain Vimeo page URL becomes a `player.vimeo.com` embed.
 * - `autoplay` appends `autoplay=1` — only on surfaces reached by a click.
 */
export function toCleanEmbedSrc(
	src: string,
	{ autoplay = false }: { autoplay?: boolean } = {},
): string {
	const trimmed = src.trim();
	const youTubeId = parseYouTubeVideoId(trimmed);
	if (youTubeId) {
		const params = new URLSearchParams({
			modestbranding: "1",
			rel: "0",
			iv_load_policy: "3",
			playsinline: "1",
		});
		if (autoplay) params.set("autoplay", "1");
		return `https://www.youtube-nocookie.com/embed/${youTubeId}?${params}`;
	}
	try {
		const url = new URL(trimmed);
		const vimeoId = url.hostname.includes("vimeo.com")
			? url.pathname.match(/^\/(?:video\/)?(\d+)/)?.[1]
			: null;
		if (vimeoId) {
			const clean = new URL(`https://player.vimeo.com/video/${vimeoId}`);
			if (autoplay) clean.searchParams.set("autoplay", "1");
			return clean.toString();
		}
		if (autoplay && !url.searchParams.has("autoplay")) {
			url.searchParams.set("autoplay", "1");
		}
		return url.toString();
	} catch {
		return trimmed;
	}
}

/** True when the URL points at a file Vidstack can play directly (not an embed page). */
export function isDirectMediaFileUrl(
	url: string | null | undefined,
): url is string {
	const trimmed = url?.trim();
	return Boolean(trimmed && MEDIA_FILE_PATTERN.test(trimmed));
}

export type PlayableSourceKind = "vidstack" | "iframe";

/** Classify a URL for the detail player (Vidstack file/YouTube vs raw iframe). */
export function classifyPlayableSource(
	url: string | null | undefined,
): { kind: PlayableSourceKind; src: string } | null {
	const trimmed = url?.trim();
	if (!trimmed) {
		return null;
	}
	if (parseYouTubeVideoId(trimmed) || MEDIA_FILE_PATTERN.test(trimmed)) {
		return { kind: "vidstack", src: trimmed };
	}
	return { kind: "iframe", src: trimmed };
}
