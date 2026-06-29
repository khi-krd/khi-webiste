import "server-only";
import {
	apiFetchRaw,
	DEFAULT_REVALIDATE,
	unwrapApiPayload,
} from "@/lib/api/client";
import { getApiBaseUrl } from "@/lib/api/config";
import { getDemoFeaturedItems } from "@/lib/mock/featured";
import {
	type ContentType,
	ContentTypeSchema,
	type FeaturedItem,
	FeaturedItemsSchema,
} from "@/types/content";

const FEATURED_ENDPOINT = "/featured";
const FEATURED_V1_ENDPOINT = "/api/v1/featured";
const FEATURED_TAG = "featured";
const FEATURED_REVALIDATE_SECONDS = DEFAULT_REVALIDATE;

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
		archive: "archive",
	};

	const mapped = aliases[normalized];
	return mapped && ContentTypeSchema.safeParse(mapped).success
		? mapped
		: undefined;
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

function remapFeaturedItem(rawItem: unknown): unknown {
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

	return {
		id: getIdentifier(item.id) ?? getIdentifier(item._id),
		type: normalizeContentType(rawType) ?? rawType,
		slug:
			getString(item.slug) ??
			getString(item.path) ??
			getIdentifier(item.id) ??
			getIdentifier(item._id),
		title:
			getString(item.title) ??
			getString(item.name) ??
			getString(localized?.title),
		description:
			getString(item.description) ??
			getString(item.excerpt) ??
			getString(item.summary) ??
			getString(localized?.description),
		image: {
			url:
				getString(image?.url) ??
				getString(image?.src) ??
				getString(image?.path) ??
				"",
			alt:
				getString(image?.alt) ??
				getString(image?.altText) ??
				getString(item.title),
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
	if (!getApiBaseUrl()) {
		return getDemoFeaturedItems(locale);
	}

	for (const endpoint of [FEATURED_V1_ENDPOINT, FEATURED_ENDPOINT]) {
		try {
			const payload = await apiFetchRaw(endpoint, {
				revalidate: FEATURED_REVALIDATE_SECONDS,
				tags: [FEATURED_TAG],
				searchParams: { locale },
			});

			const unwrapped = unwrapApiPayload(payload);
			if (!unwrapped) {
				continue;
			}

			const rawItems = normalizeItems(unwrapped);
			const remappedItems = rawItems.map((item) => remapFeaturedItem(item));
			const parsed = FeaturedItemsSchema.safeParse(remappedItems);

			if (parsed.success && parsed.data.length > 0) {
				return parsed.data;
			}
		} catch {
			continue;
		}
	}

	return getDemoFeaturedItems(locale);
}
