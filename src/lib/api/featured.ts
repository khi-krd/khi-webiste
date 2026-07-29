import "server-only";
import type { z } from "zod";
import {
	apiFetchRaw,
	DEFAULT_REVALIDATE,
	unwrapApiPayload,
} from "@/lib/api/client";
import { getApiBaseUrl } from "@/lib/api/config";
import { applyMockPolicy } from "@/lib/api/mock-policy";
import { getDemoFeaturedItems } from "@/lib/mock/featured";
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

function resolveDescription(raw: string | undefined): string | undefined {
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

	if (Array.isArray(record.items)) {
		return record.items;
	}

	if (Array.isArray(record.results)) {
		return record.results;
	}

	return [];
}

export async function getFeaturedItems(
	locale: string,
): Promise<FeaturedItem[]> {
	const getMockItems = () => getDemoFeaturedItems(locale);

	if (!getApiBaseUrl()) {
		return applyMockPolicy({
			context: "home",
			apiItems: [],
			getMockItems,
		});
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
		// fall through to mock policy
	}

	return applyMockPolicy({
		context: "home",
		apiItems,
		getMockItems,
	});
}
