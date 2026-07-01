import "server-only";
import {
	apiFetchRaw,
	DEFAULT_REVALIDATE,
	unwrapApiPayload,
} from "@/lib/api/client";
import { getApiBaseUrl } from "@/lib/api/config";
import { getDemoFeaturedItems } from "@/lib/mock/featured";
import { plainTextFromRichContent } from "@/lib/rich-text";
import {
	type ContentType,
	ContentTypeSchema,
	type FeaturedItem,
	FeaturedItemsSchema,
	type FeaturedSource,
} from "@/types/content";

const FEATURED_ENDPOINT = "/api/v1/featured";
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

/** Map a raw featured API record to the lean UI model shape. */
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
		resolveDescription(getString(localized?.description));

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
	if (!getApiBaseUrl()) {
		return getDemoFeaturedItems(locale);
	}

	try {
		const payload = await apiFetchRaw(FEATURED_ENDPOINT, {
			revalidate: FEATURED_REVALIDATE_SECONDS,
			tags: [FEATURED_TAG],
			searchParams: { locale },
		});

		const unwrapped = unwrapApiPayload(payload);
		if (!unwrapped) {
			return getDemoFeaturedItems(locale);
		}

		const rawItems = normalizeItems(unwrapped);
		const remappedItems = rawItems.map((item) => remapFeaturedItem(item));
		const parsed = FeaturedItemsSchema.safeParse(remappedItems);

		if (parsed.success) {
			return parsed.data;
		}
	} catch {
		// fall through to demo mock
	}

	return getDemoFeaturedItems(locale);
}
