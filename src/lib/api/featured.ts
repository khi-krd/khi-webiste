import "server-only";
import type { z } from "zod";
import {
	apiFetchRaw,
	DEFAULT_REVALIDATE,
	unwrapApiPayload,
} from "@/lib/api/client";
import { getApiBaseUrl } from "@/lib/api/config";
import { plainTextFromRichContent } from "@/lib/rich-text";
import {
	type ContentType,
	ContentTypeSchema,
	type FeaturedApiItem,
	FeaturedApiItemSchema,
	type FeaturedItem,
	FeaturedItemSchema,
	type FeaturedSource,
} from "@/types/content";

const FEATURED_ENDPOINT = "/api/v1/featured";
const FEATURED_TAG = "featured";
const FEATURED_REVALIDATE_SECONDS = DEFAULT_REVALIDATE;
const isDevelopment = process.env.NODE_ENV === "development";

type UnknownRecord = Record<string, unknown>;

function asRecord(value: unknown): UnknownRecord | null {
	if (!value || typeof value !== "object") {
		return null;
	}

	return value as UnknownRecord;
}

function getString(value: unknown): string | undefined {
	return typeof value === "string" && value.length > 0 ? value : undefined;
}

function getNumber(value: unknown): number | undefined {
	return typeof value === "number" && Number.isFinite(value)
		? value
		: undefined;
}

function getIdentifier(value: unknown): string | undefined {
	const asString = getString(value);
	if (asString) {
		return asString;
	}

	const asNumber = getNumber(value);
	return asNumber != null ? String(asNumber) : undefined;
}

function normalizeContentType(
	raw: string | undefined,
): ContentType | undefined {
	if (!raw) {
		return undefined;
	}

	const normalized = raw.toLowerCase().replace(/[_\s-]/g, "");
	const aliases: Record<string, ContentType> = {
		book: "book",
		writing: "book",
		writings: "book",
		song: "song",
		audio: "audio",
		sound: "audio",
		soundtrack: "audio",
		video: "video",
		article: "article",
		news: "article",
		gallery: "gallery",
		image: "gallery",
		imagecollection: "gallery",
		archive: "archive",
		project: "archive",
		about: "about",
		service: "service",
		services: "service",
		donation: "donation",
		donations: "donation",
		donate: "donation",
	};

	const mapped = aliases[normalized];
	return mapped && ContentTypeSchema.safeParse(mapped).success
		? mapped
		: undefined;
}

const SOURCE_TO_TYPE: Record<FeaturedSource, ContentType> = {
	news: "article",
	project: "archive",
	writing: "book",
	video: "video",
	"sound-track": "audio",
	"image-collection": "gallery",
	about: "about",
	service: "service",
	donation: "donation",
};

function normalizeSourceType(raw: string | undefined): ContentType | undefined {
	if (!raw) {
		return undefined;
	}

	const normalized = raw.toLowerCase() as FeaturedSource;
	if (normalized in SOURCE_TO_TYPE) {
		return SOURCE_TO_TYPE[normalized];
	}

	return undefined;
}

function pickImage(item: UnknownRecord): UnknownRecord | null {
	const image = asRecord(item.image);
	if (image) {
		return image;
	}

	const media = asRecord(item.media);
	if (media) {
		return media;
	}

	const coverImage = asRecord(item.coverImage);
	if (coverImage) {
		return coverImage;
	}

	const thumbnail = asRecord(item.thumbnail);
	return thumbnail;
}

function resolveDescription(
	raw: string | null | undefined,
): string | undefined {
	if (!raw) {
		return undefined;
	}

	const plain = plainTextFromRichContent(raw).trim();
	return plain.length > 0 ? plain : undefined;
}

function logFeaturedParseFailure(rawItem: unknown, error: z.ZodError): void {
	if (!isDevelopment) {
		return;
	}

	const item = asRecord(rawItem);
	const id = getIdentifier(item?.id) ?? getIdentifier(item?.entityId) ?? "?";
	const [firstIssue] = error.issues;
	console.warn(
		`[api] Zod parse failed for ${FEATURED_ENDPOINT}#item-${id}:`,
		firstIssue
			? `${firstIssue.path.join(".") || "(root)"}: ${firstIssue.message}`
			: error.message,
	);
}

function mapFeaturedApiItem(item: FeaturedApiItem): FeaturedItem | null {
	const imageUrl = item.image.url.trim();
	if (!imageUrl) {
		return null;
	}

	const title = item.title.trim();
	const description = resolveDescription(item.description) ?? title;
	const slug = item.slug.trim() || String(item.entityId);

	const parsed = FeaturedItemSchema.safeParse({
		id: item.id,
		type: item.type,
		slug,
		title,
		description,
		image: {
			url: imageUrl,
			alt: item.image.alt?.trim() || title,
			width: item.image.width,
			height: item.image.height,
			blurDataURL: item.image.blurDataURL,
		},
	});

	return parsed.success ? parsed.data : null;
}

/** Parse one raw featured record — official DTO first, legacy remap fallback. */
export function parseFeaturedItem(rawItem: unknown): FeaturedItem | null {
	const apiParsed = FeaturedApiItemSchema.safeParse(rawItem);
	if (apiParsed.success) {
		return mapFeaturedApiItem(apiParsed.data);
	}

	const remapped = remapFeaturedItem(rawItem);
	const uiParsed = FeaturedItemSchema.safeParse(remapped);
	if (uiParsed.success) {
		return uiParsed.data;
	}

	logFeaturedParseFailure(rawItem, apiParsed.error);
	return null;
}

function parseFeaturedItems(rawItems: unknown[]): FeaturedItem[] {
	return rawItems
		.map((item) => parseFeaturedItem(item))
		.filter((item): item is FeaturedItem => item != null);
}

/** Map a legacy/alternate featured payload to the lean UI model shape. */
export function remapFeaturedItem(rawItem: unknown): unknown {
	const item = asRecord(rawItem);
	if (!item) {
		return rawItem;
	}

	const image = pickImage(item);
	const localized = asRecord(item.localized);

	const rawType =
		getString(item.type) ??
		getString(item.contentType) ??
		getString(item.content_type);

	const rawSource = getString(item.source);

	const type =
		normalizeContentType(rawType) ?? normalizeSourceType(rawSource) ?? rawType;

	const title =
		getString(item.title) ??
		getString(item.name) ??
		getString(localized?.title);

	const description =
		resolveDescription(getString(item.description)) ??
		resolveDescription(getString(item.excerpt)) ??
		resolveDescription(getString(item.summary)) ??
		resolveDescription(getString(localized?.description)) ??
		title;

	return {
		id: getIdentifier(item.id) ?? getIdentifier(item._id),
		type,
		slug:
			getString(item.slug) ??
			getString(item.path) ??
			getIdentifier(item.entityId),
		title,
		description,
		image: {
			url:
				getString(image?.url) ??
				getString(image?.src) ??
				getString(image?.path) ??
				"",
			alt: getString(image?.alt) ?? getString(image?.altText) ?? title,
			width: getNumber(image?.width),
			height: getNumber(image?.height),
			blurDataURL:
				getString(image?.blurDataURL) ?? getString(image?.blur_data_url),
		},
	};
}

function normalizeItems(payload: unknown): unknown[] {
	if (Array.isArray(payload)) {
		return payload;
	}

	const record = asRecord(payload);
	if (!record) {
		return [];
	}

	if (Array.isArray(record.data)) {
		return record.data;
	}

	// Spring `Page<T>` — the per-source /featured routes return one of these.
	if (Array.isArray(record.content)) {
		return record.content;
	}

	if (Array.isArray(record.items)) {
		return record.items;
	}

	if (Array.isArray(record.results)) {
		return record.results;
	}

	return [];
}

// ---------------------------------------------------------------------------
// Per-source fallback
//
// `/api/v1/featured` pools all sources server-side, which makes it a single
// point of failure: one broken source query 500s the whole endpoint and the
// homepage silently drops to mock slides. Every source also publishes its own
// `/featured` route, and those stay up independently — so when the aggregate
// gives us nothing, compose the carousel from them instead.
// ---------------------------------------------------------------------------

type FeaturedSourceEndpoint = {
	source: FeaturedSource;
	path: string;
	type: ContentType;
	/** Gallery detail resolves by slug; every other route resolves by numeric id. */
	slugFromRecord?: boolean;
};

const FEATURED_SOURCE_ENDPOINTS: FeaturedSourceEndpoint[] = [
	{ source: "news", path: "/api/v1/news/featured", type: "article" },
	{ source: "project", path: "/api/v1/projects/featured", type: "archive" },
	{ source: "writing", path: "/api/v1/writings/featured", type: "book" },
	{ source: "video", path: "/api/v1/videos/featured", type: "video" },
	{
		source: "sound-track",
		path: "/api/v1/sound-tracks/featured",
		type: "audio",
	},
	{
		source: "image-collection",
		path: "/api/v1/image-collections/featured",
		type: "gallery",
		slugFromRecord: true,
	},
];

/** Mirrors the backend's `SiteSettings.maxFeaturedSlides` default. */
const FEATURED_SLIDE_CAP = 7;

function preferLocalized(
	locale: string,
	ckb: string | undefined,
	kmr: string | undefined,
): string | undefined {
	return locale === "ckb" ? (ckb ?? kmr) : (kmr ?? ckb);
}

function pickLocalizedContent(
	locale: string,
	item: UnknownRecord,
): UnknownRecord | null {
	const ckb = asRecord(item.ckbContent);
	const kmr = asRecord(item.kmrContent);
	return (locale === "ckb" ? (ckb ?? kmr) : (kmr ?? ckb)) ?? null;
}

/** Same precedence the backend applies: wide hero override, then the cover. */
function pickSourceImageUrl(
	locale: string,
	item: UnknownRecord,
): string | undefined {
	return (
		getString(item.featureImageUrl) ??
		getString(item.coverUrl) ??
		preferLocalized(
			locale,
			getString(item.ckbCoverUrl),
			getString(item.kmrCoverUrl),
		) ??
		getString(item.hoverCoverUrl)
	);
}

/** Build one carousel slide from a source's own DTO. */
export function featuredItemFromSourceRecord(
	locale: string,
	endpoint: FeaturedSourceEndpoint,
	rawItem: unknown,
): FeaturedItem | null {
	const item = asRecord(rawItem);
	const entityId = item ? getIdentifier(item.id) : undefined;
	if (!item || !entityId) {
		return null;
	}

	const content = pickLocalizedContent(locale, item);
	const title = getString(content?.title)?.trim();
	const imageUrl = pickSourceImageUrl(locale, item)?.trim();

	// A slide with no picture never renders — the backend drops these too.
	if (!title || !imageUrl) {
		return null;
	}

	const slug = endpoint.slugFromRecord
		? (preferLocalized(
				locale,
				getString(item.slugCkb),
				getString(item.slugKmr),
			) ?? entityId)
		: entityId;

	const parsed = FeaturedItemSchema.safeParse({
		id: `${endpoint.source}-${entityId}`,
		type: endpoint.type,
		slug,
		title,
		description: resolveDescription(getString(content?.description)) ?? title,
		image: { url: imageUrl, alt: title },
	});

	return parsed.success ? parsed.data : null;
}

async function fetchFeaturedSource(
	locale: string,
	endpoint: FeaturedSourceEndpoint,
): Promise<FeaturedItem[]> {
	const payload = await apiFetchRaw(endpoint.path, {
		revalidate: FEATURED_REVALIDATE_SECONDS,
		tags: [FEATURED_TAG, `${FEATURED_TAG}-${endpoint.source}`],
		searchParams: { locale, page: 0, size: FEATURED_SLIDE_CAP },
	});

	if (payload == null) {
		if (isDevelopment) {
			console.warn(`[api] HTTP error or empty response for ${endpoint.path}`);
		}
		return [];
	}

	const unwrapped = unwrapApiPayload(payload);
	if (!unwrapped) {
		return [];
	}

	return normalizeItems(unwrapped)
		.map((rawItem) => featuredItemFromSourceRecord(locale, endpoint, rawItem))
		.filter((item): item is FeaturedItem => item != null);
}

/**
 * Round-robin across sources, capped like the backend.
 *
 * These routes expose no `featuredOrder`, so there is no global sequence to
 * honour — taking one slide per source in turn at least keeps the carousel from
 * opening with a run of the same type.
 */
export function interleaveFeaturedSources(
	groups: FeaturedItem[][],
	limit: number = FEATURED_SLIDE_CAP,
): FeaturedItem[] {
	const merged: FeaturedItem[] = [];
	const deepest = Math.max(0, ...groups.map((group) => group.length));

	for (let index = 0; index < deepest && merged.length < limit; index++) {
		for (const group of groups) {
			const item = group[index];
			if (item) {
				merged.push(item);
				if (merged.length >= limit) {
					break;
				}
			}
		}
	}

	return merged;
}

/** Compose the carousel from the six per-source `/featured` routes. */
export async function getFeaturedItemsFromSources(
	locale: string,
): Promise<FeaturedItem[]> {
	const groups = await Promise.all(
		FEATURED_SOURCE_ENDPOINTS.map((endpoint) =>
			fetchFeaturedSource(locale, endpoint),
		),
	);

	return interleaveFeaturedSources(groups);
}

/**
 * The homepage carousel — CMS records only.
 *
 * An empty or unreachable API yields an empty carousel, which the hero renders
 * as nothing at all. Demo slides would otherwise put invented headlines under
 * the institute's name on its own front page, and they read as real. The
 * There is no mock catalogue to fall back on any more.
 */
export async function getFeaturedItems(
	locale: string,
): Promise<FeaturedItem[]> {
	if (!getApiBaseUrl()) {
		return [];
	}

	let apiItems: FeaturedItem[] = [];

	try {
		const payload = await apiFetchRaw(FEATURED_ENDPOINT, {
			revalidate: FEATURED_REVALIDATE_SECONDS,
			tags: [FEATURED_TAG],
			searchParams: { locale },
		});

		if (payload == null) {
			if (isDevelopment) {
				console.warn(
					`[api] HTTP error or empty response for ${FEATURED_ENDPOINT}`,
				);
			}
		} else {
			const unwrapped = unwrapApiPayload(payload);
			if (unwrapped) {
				apiItems = parseFeaturedItems(normalizeItems(unwrapped));
			}
		}
	} catch {
		// fall through to the per-source routes
	}

	// The aggregate endpoint is down or has nothing — ask each source directly
	// before giving up on the carousel.
	if (apiItems.length === 0) {
		apiItems = await getFeaturedItemsFromSources(locale);
	}

	return apiItems;
}
