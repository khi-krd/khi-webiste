export type ResolvedMap = {
	/** URL safe to put in <iframe src>, or null when nothing embeddable could be derived. */
	embedUrl: string | null;
	/** URL for the "Open in Google Maps" link (never null when input or coords exist). */
	linkUrl: string | null;
	/** Coordinates derived from the input (pb string, @lat,lng, q=lat,lng, plain "lat,lng"), or null. */
	coordinates: { lat: number; lng: number } | null;
};

type Coordinates = { lat: number; lng: number };

export function coordinatesEmbedUrl(
	lat: number,
	lng: number,
	zoom = 15,
): string {
	return `https://maps.google.com/maps?q=${lat},${lng}&z=${zoom}&output=embed`;
}

export function coordinatesLinkUrl(lat: number, lng: number): string {
	return `https://www.google.com/maps?q=${lat},${lng}`;
}

const GOOGLE_HOST_RE = /^(www\.|maps\.)?google\.[a-z.]+$/;
const SHORT_LINK_HOSTS = new Set([
	"maps.app.goo.gl",
	"goo.gl",
	"g.page",
	"g.co",
]);

function isGoogleHost(hostname: string): boolean {
	return GOOGLE_HOST_RE.test(hostname) || SHORT_LINK_HOSTS.has(hostname);
}

function validCoordinates(lat: number, lng: number): Coordinates | null {
	if (
		!Number.isFinite(lat) ||
		!Number.isFinite(lng) ||
		Math.abs(lat) > 90 ||
		Math.abs(lng) > 180
	) {
		return null;
	}
	// pb strings carry full double precision — trim to ~10 cm so the link and
	// embed URLs stay readable.
	return {
		lat: Math.round(lat * 1e6) / 1e6,
		lng: Math.round(lng * 1e6) / 1e6,
	};
}

function parseLatLng(text: string | null | undefined): Coordinates | null {
	if (!text) {
		return null;
	}
	const match = text.match(
		/^\s*(-?\d+(?:\.\d+)?)\s*(?:,|\s)\s*(-?\d+(?:\.\d+)?)\s*$/,
	);
	if (!match) {
		return null;
	}
	return validCoordinates(Number(match[1]), Number(match[2]));
}

/**
 * First match wins: the pb protobuf string (`!3d<lat>` + `!2d<lng>`, found in
 * decoded search), the `/@lat,lng` viewport, a `q`/`query`/`ll`/`center`
 * param holding `lat,lng`, then the `!8m2!3d<lat>!4d<lng>` block place URLs
 * carry in their path.
 */
function coordinatesFromUrl(url: URL): Coordinates | null {
	const decodedSearch = decodeURIComponent(url.search);
	const pbLat = decodedSearch.match(/!3d(-?\d+(?:\.\d+)?)/);
	const pbLng = decodedSearch.match(/!2d(-?\d+(?:\.\d+)?)/);
	if (pbLat && pbLng) {
		const coords = validCoordinates(Number(pbLat[1]), Number(pbLng[1]));
		if (coords) {
			return coords;
		}
	}

	const at = url.pathname.match(/@(-?\d+(?:\.\d+)?),(-?\d+(?:\.\d+)?)/);
	if (at) {
		const coords = validCoordinates(Number(at[1]), Number(at[2]));
		if (coords) {
			return coords;
		}
	}

	for (const key of ["q", "query", "ll", "center"]) {
		const coords = parseLatLng(url.searchParams.get(key));
		if (coords) {
			return coords;
		}
	}

	const place = url.pathname.match(
		/!8m2!3d(-?\d+(?:\.\d+)?)!4d(-?\d+(?:\.\d+)?)/,
	);
	if (place) {
		const coords = validCoordinates(Number(place[1]), Number(place[2]));
		if (coords) {
			return coords;
		}
	}

	return null;
}

/** CSP `frame-src` only allows www.google.com and maps.google.com. */
function normalizedEmbedUrl(url: URL): string {
	const normalized = new URL(url.toString());
	normalized.protocol = "https:";
	if (
		normalized.hostname !== "www.google.com" &&
		normalized.hostname !== "maps.google.com"
	) {
		normalized.hostname = "www.google.com";
	}
	return normalized.toString();
}

function queryEmbedUrl(query: string): string {
	return `https://maps.google.com/maps?q=${encodeURIComponent(query)}&output=embed`;
}

export function resolveMapUrl(
	raw: string | null | undefined,
	fallback: { lat: number | null | undefined; lng: number | null | undefined },
): ResolvedMap {
	const fallbackCoords =
		fallback.lat != null && fallback.lng != null
			? validCoordinates(fallback.lat, fallback.lng)
			: null;

	let candidate = raw?.trim() ?? "";
	let fromIframe = false;
	if (candidate) {
		const iframeSrc = candidate.match(/<iframe[^>]+src=["']([^"']+)["']/i);
		if (iframeSrc) {
			fromIframe = true;
			candidate = iframeSrc[1].replace(/&amp;/g, "&").trim();
		}
	}

	let url: URL | null = null;
	if (candidate) {
		try {
			const parsed = new URL(candidate);
			if (parsed.protocol === "http:" || parsed.protocol === "https:") {
				url = parsed;
			}
		} catch {
			url = null;
		}
	}

	// A plain "lat, lng" (or "lat lng") paste is not a URL but is still
	// enough to build an embed from.
	if (!url) {
		const coords = parseLatLng(candidate) ?? fallbackCoords;
		return {
			embedUrl: coords ? coordinatesEmbedUrl(coords.lat, coords.lng) : null,
			linkUrl: coords ? coordinatesLinkUrl(coords.lat, coords.lng) : null,
			coordinates: coords,
		};
	}

	if (!isGoogleHost(url.hostname)) {
		return {
			embedUrl: fallbackCoords
				? coordinatesEmbedUrl(fallbackCoords.lat, fallbackCoords.lng)
				: null,
			linkUrl: url.toString(),
			coordinates: fallbackCoords,
		};
	}

	const urlCoords = coordinatesFromUrl(url);
	const coordinates = urlCoords ?? fallbackCoords;
	const pathname = url.pathname;
	const isShortLink = SHORT_LINK_HOSTS.has(url.hostname);
	const hasOutputEmbed = url.searchParams.get("output") === "embed";

	let embedUrl: string | null = null;
	if (pathname.startsWith("/maps/embed")) {
		embedUrl = normalizedEmbedUrl(url);
	} else if (hasOutputEmbed && pathname.startsWith("/maps")) {
		embedUrl = normalizedEmbedUrl(url);
	} else if (isShortLink) {
		// Redirect chains don't frame; embed the coordinates instead.
		embedUrl = coordinates
			? coordinatesEmbedUrl(coordinates.lat, coordinates.lng)
			: null;
	} else if (pathname.startsWith("/maps/place/")) {
		if (urlCoords) {
			embedUrl = coordinatesEmbedUrl(urlCoords.lat, urlCoords.lng);
		} else {
			const name = pathname.split("/")[3];
			embedUrl = name ? queryEmbedUrl(decodeURIComponent(name)) : null;
		}
	} else if (pathname.startsWith("/maps/d/")) {
		if (pathname.startsWith("/maps/d/embed")) {
			embedUrl = normalizedEmbedUrl(url);
		} else {
			const mid = url.searchParams.get("mid");
			embedUrl = mid
				? `https://www.google.com/maps/d/embed?mid=${encodeURIComponent(mid)}`
				: coordinates
					? coordinatesEmbedUrl(coordinates.lat, coordinates.lng)
					: null;
		}
	} else if (pathname.startsWith("/maps")) {
		if (urlCoords) {
			embedUrl = coordinatesEmbedUrl(urlCoords.lat, urlCoords.lng);
		} else {
			const query = url.searchParams.get("q") ?? url.searchParams.get("query");
			embedUrl = query?.trim() ? queryEmbedUrl(query) : null;
		}
	} else {
		embedUrl = coordinates
			? coordinatesEmbedUrl(coordinates.lat, coordinates.lng)
			: null;
	}

	if (embedUrl == null && fallbackCoords) {
		embedUrl = coordinatesEmbedUrl(fallbackCoords.lat, fallbackCoords.lng);
	}

	let linkUrl: string;
	if (fromIframe || pathname.startsWith("/maps/embed") || hasOutputEmbed) {
		// Embed URLs are not share links; rebuild a plain maps URL.
		linkUrl = coordinates
			? coordinatesLinkUrl(coordinates.lat, coordinates.lng)
			: (embedUrl ?? url.toString());
	} else {
		const shareable = new URL(url.toString());
		shareable.searchParams.delete("output");
		linkUrl = shareable.toString();
	}

	return { embedUrl, linkUrl, coordinates };
}
