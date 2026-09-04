import "server-only";
import {
	type PlatformDetailResponse,
	PlatformDetailResponseSchema,
	type PlatformFullMedia,
	type PlatformHit,
	type PlatformMediaKind,
	type PlatformSearchResponse,
	PlatformSearchResponseSchema,
	type PlatformSort,
	type PlatformSuggestion,
	PlatformSuggestionsSchema,
} from "@/types/platform";

/**
 * KHI Archive Platform (پلاتفۆڕم) client — every request is made from the
 * Next.js server, never the browser. The platform's CORS allowlist is
 * exact-match and does not include this site's origins, so browser XHR would
 * be blocked in production; going through the server sidesteps CORS entirely.
 * Media (`<img>`/`<audio>`/`<video>` src) is exempt from CORS and loads
 * straight from the platform, which is why every media path is absolutized
 * here before a response leaves the server.
 */

const DEFAULT_PLATFORM_API_BASE_URL =
	"https://khiarchiveplatformbackend-production.up.railway.app";

/** Give up on a slow origin rather than hanging the page render. */
const TIMEOUT_MS = 12_000;

export function getPlatformApiBaseUrl(): string {
	return (
		process.env.PLATFORM_API_BASE_URL?.trim() || DEFAULT_PLATFORM_API_BASE_URL
	);
}

function getPlatformOrigin(): string {
	try {
		return new URL(getPlatformApiBaseUrl()).origin;
	} catch {
		return DEFAULT_PLATFORM_API_BASE_URL;
	}
}

/**
 * Host-relative platform paths (`/api/guest/audio/AUD-1/stream`) are joined
 * against the platform ORIGIN. Absolute http(s)/data/blob values pass through
 * untouched, so legacy fields carrying a raw URL stay safe.
 */
export function resolvePlatformMediaUrl(
	path: string | null | undefined,
): string | null {
	const trimmed = path?.trim();
	if (!trimmed) {
		return null;
	}
	if (/^(https?:|data:|blob:)/i.test(trimmed)) {
		return trimmed;
	}
	return `${getPlatformOrigin()}${trimmed.startsWith("/") ? "" : "/"}${trimmed}`;
}

function absolutizeFullMedia(media: PlatformFullMedia): PlatformFullMedia {
	return {
		...media,
		personMediaPortrait: resolvePlatformMediaUrl(media.personMediaPortrait),
		person: media.person
			? {
					...media.person,
					mediaPortrait: resolvePlatformMediaUrl(media.person.mediaPortrait),
				}
			: media.person,
		audioFileUrl: resolvePlatformMediaUrl(media.audioFileUrl),
		videoFileUrl: resolvePlatformMediaUrl(media.videoFileUrl),
		imageFileUrl: resolvePlatformMediaUrl(media.imageFileUrl),
		textFileUrl: resolvePlatformMediaUrl(media.textFileUrl),
		coverImageUrl: resolvePlatformMediaUrl(media.coverImageUrl),
	};
}

function absolutizeHit(hit: PlatformHit): PlatformHit {
	return {
		...hit,
		mediaUrl: resolvePlatformMediaUrl(hit.mediaUrl),
		thumbnailUrl: resolvePlatformMediaUrl(hit.thumbnailUrl),
		person: hit.person
			? {
					...hit.person,
					mediaPortrait: resolvePlatformMediaUrl(hit.person.mediaPortrait),
				}
			: hit.person,
		audio: hit.audio ? absolutizeFullMedia(hit.audio) : hit.audio,
		video: hit.video ? absolutizeFullMedia(hit.video) : hit.video,
		image: hit.image ? absolutizeFullMedia(hit.image) : hit.image,
		text: hit.text ? absolutizeFullMedia(hit.text) : hit.text,
	};
}

async function fetchPlatformJson(endpoint: URL): Promise<unknown | null> {
	let response: Response;
	try {
		response = await fetch(endpoint, {
			cache: "no-store",
			headers: { Accept: "application/json" },
			signal: AbortSignal.timeout(TIMEOUT_MS),
		});
	} catch (error) {
		if (process.env.NODE_ENV === "development") {
			console.error("[platform] fetch failed", endpoint.pathname, error);
		}
		return null;
	}

	if (!response.ok) {
		if (process.env.NODE_ENV === "development") {
			const body = await response.text();
			console.error(
				"[platform] upstream error",
				response.status,
				endpoint.pathname,
				body.slice(0, 300),
			);
		}
		return null;
	}

	try {
		return await response.json();
	} catch {
		return null;
	}
}

export type PlatformSearchParams = {
	q?: string | null;
	/** One of the four kinds, or absent for all. */
	type?: PlatformMediaKind | null;
	sort?: PlatformSort | null;
	page?: number;
	size?: number;
	facets?: boolean;

	projectCode?: string | null;
	categoryCode?: string | null;
	personCode?: string | null;
	language?: string | null;
	dialect?: string | null;
	region?: string | null;
	decade?: string | null;
	dateFrom?: string | null;
	dateTo?: string | null;

	/** Repeatable filters — Spring binds `?tag=a&tag=b`, never `tag[0]=a`. */
	subject?: readonly string[];
	genre?: readonly string[];
	tag?: readonly string[];
	keyword?: readonly string[];
};

const SINGLE_FILTER_KEYS = [
	"projectCode",
	"categoryCode",
	"personCode",
	"language",
	"dialect",
	"region",
	"decade",
	"dateFrom",
	"dateTo",
] as const;

const REPEATED_FILTER_KEYS = ["subject", "genre", "tag", "keyword"] as const;

/**
 * One keyword, all four media kinds, ranked together — the website search
 * page's primary call (`GET /api/guest/media/search`).
 */
export async function searchPlatformMedia(
	params: PlatformSearchParams,
): Promise<PlatformSearchResponse | null> {
	const endpoint = new URL("/api/guest/media/search", getPlatformApiBaseUrl());
	const search = endpoint.searchParams;

	if (params.q?.trim()) {
		search.set("q", params.q.trim());
	}
	if (params.type) {
		search.set("type", params.type);
	}
	if (params.sort) {
		search.set("sort", params.sort);
	}
	if (params.page != null && params.page > 0) {
		search.set("page", String(params.page));
	}
	search.set("size", String(params.size ?? 24));
	if (params.facets) {
		search.set("facets", "true");
	}

	for (const key of SINGLE_FILTER_KEYS) {
		const value = params[key]?.trim();
		if (value) {
			search.set(key, value);
		}
	}
	for (const key of REPEATED_FILTER_KEYS) {
		for (const value of params[key] ?? []) {
			if (value.trim()) {
				search.append(key, value.trim());
			}
		}
	}

	const payload = await fetchPlatformJson(endpoint);
	if (payload == null) {
		return null;
	}

	const parsed = PlatformSearchResponseSchema.safeParse(payload);
	if (!parsed.success) {
		if (process.env.NODE_ENV === "development") {
			console.error(
				"[platform] search schema validation failed",
				parsed.error.flatten(),
			);
		}
		return null;
	}

	return {
		...parsed.data,
		content: parsed.data.content.map(absolutizeHit),
	};
}

/**
 * Open one item (`GET /api/guest/media/{type}/{code}`) — the flat card, the
 * complete kind-specific payload and the "more from this collection" rail.
 * `null` means unreachable/invalid; `"not-found"` is the endpoint's 404, which
 * deliberately covers unknown, non-public and trashed alike.
 */
export async function getPlatformMediaDetail(
	type: PlatformMediaKind,
	code: string,
): Promise<PlatformDetailResponse | "not-found" | null> {
	const endpoint = new URL(
		`/api/guest/media/${encodeURIComponent(type)}/${encodeURIComponent(code)}`,
		getPlatformApiBaseUrl(),
	);

	let response: Response;
	try {
		response = await fetch(endpoint, {
			cache: "no-store",
			headers: { Accept: "application/json" },
			signal: AbortSignal.timeout(TIMEOUT_MS),
		});
	} catch (error) {
		if (process.env.NODE_ENV === "development") {
			console.error("[platform] detail fetch failed", endpoint.pathname, error);
		}
		return null;
	}

	if (response.status === 404) {
		return "not-found";
	}
	if (!response.ok) {
		return null;
	}

	let payload: unknown;
	try {
		payload = await response.json();
	} catch {
		return null;
	}

	const parsed = PlatformDetailResponseSchema.safeParse(payload);
	if (!parsed.success) {
		if (process.env.NODE_ENV === "development") {
			console.error(
				"[platform] detail schema validation failed",
				parsed.error.flatten(),
			);
		}
		return null;
	}

	const detail = parsed.data;
	return {
		...detail,
		item: absolutizeHit(detail.item),
		audio: detail.audio ? absolutizeFullMedia(detail.audio) : detail.audio,
		video: detail.video ? absolutizeFullMedia(detail.video) : detail.video,
		image: detail.image ? absolutizeFullMedia(detail.image) : detail.image,
		text: detail.text ? absolutizeFullMedia(detail.text) : detail.text,
		related: detail.related?.map(absolutizeHit),
	};
}

/** Autocomplete (`GET /api/guest/suggest`) — plain array, not a page. */
export async function getPlatformSuggestions(
	q: string,
	limit = 8,
): Promise<PlatformSuggestion[]> {
	const trimmed = q.trim();
	if (!trimmed) {
		return [];
	}

	const endpoint = new URL("/api/guest/suggest", getPlatformApiBaseUrl());
	endpoint.searchParams.set("q", trimmed);
	endpoint.searchParams.set("limit", String(limit));

	const payload = await fetchPlatformJson(endpoint);
	if (payload == null) {
		return [];
	}

	const parsed = PlatformSuggestionsSchema.safeParse(payload);
	return parsed.success ? parsed.data : [];
}
