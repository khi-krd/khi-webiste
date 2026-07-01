import type {
	GalleryAlbumItem,
	GalleryCollectionType,
	GalleryHeroColumns,
	GalleryHeroImage,
	GalleryPost,
} from "@/lib/mock/gallery";
import type { ImageCollectionItem } from "@/lib/mock/image-collection";
import type { ImageAlbumItem, ImageCollection } from "@/types/gallery";
import { resolveContentSlug } from "@/lib/content/href";

type GalleryAspect = GalleryHeroImage["aspect"];

const ASPECT_BY_RATIO: { min: number; aspect: GalleryAspect }[] = [
	{ min: 1.2, aspect: "2/3" },
	{ min: 0.95, aspect: "3/4" },
	{ min: 0.75, aspect: "4/5" },
	{ min: 0, aspect: "2/3" },
];

function firstNonBlank(
	...values: (string | null | undefined)[]
): string | null {
	for (const value of values) {
		if (value && value.trim().length > 0) {
			return value;
		}
	}
	return null;
}

function resolveCollectionContent(
	locale: string,
	collection: ImageCollection,
): ImageCollection["ckbContent"] {
	if (locale === "ckb") {
		return collection.ckbContent ?? collection.kmrContent ?? null;
	}
	return collection.kmrContent ?? collection.ckbContent ?? null;
}

function resolveCoverUrl(
	locale: string,
	collection: ImageCollection,
): string | null {
	if (locale === "ckb") {
		return firstNonBlank(
			collection.ckbCoverUrl,
			collection.kmrCoverUrl,
			collection.hoverCoverUrl,
		);
	}
	return firstNonBlank(
		collection.kmrCoverUrl,
		collection.ckbCoverUrl,
		collection.hoverCoverUrl,
	);
}

function resolveTopicName(
	locale: string,
	collection: ImageCollection,
): string | undefined {
	const name =
		locale === "ckb"
			? firstNonBlank(collection.topicNameCkb, collection.topicNameKmr)
			: firstNonBlank(collection.topicNameKmr, collection.topicNameCkb);
	return name ?? undefined;
}

function mapCollectionType(
	apiType: ImageCollection["collectionType"],
): GalleryCollectionType {
	switch (apiType) {
		case "PHOTO_GALLERY":
		case "GALLERY":
			return "GALLERY";
		case "PHOTO_STORY":
			return "PHOTO_STORY";
		case "SINGLE":
		case "SINGLE_IMAGE":
			return "SINGLE";
		default:
			return "GALLERY";
	}
}

function aspectFromRatio(ratio: number | null | undefined): GalleryAspect {
	if (ratio == null || !Number.isFinite(ratio) || ratio <= 0) {
		return "2/3";
	}
	for (const entry of ASPECT_BY_RATIO) {
		if (ratio >= entry.min) {
			return entry.aspect;
		}
	}
	return "2/3";
}

function resolveAlbumCaption(
	locale: string,
	item: ImageAlbumItem,
): string | undefined {
	return (
		(locale === "ckb"
			? firstNonBlank(item.captionCkb, item.captionKmr)
			: firstNonBlank(item.captionKmr, item.captionCkb)) ?? undefined
	);
}

function resolveAlbumDescription(
	locale: string,
	item: ImageAlbumItem,
): string | undefined {
	return (
		(locale === "ckb"
			? firstNonBlank(item.descriptionCkb, item.descriptionKmr)
			: firstNonBlank(item.descriptionKmr, item.descriptionCkb)) ?? undefined
	);
}

function resolveAlbumItem(
	locale: string,
	item: ImageAlbumItem,
): GalleryAlbumItem {
	const caption = resolveAlbumCaption(locale, item);
	const description = resolveAlbumDescription(locale, item);

	return {
		id: item.id,
		imageUrl: item.imageUrl ?? undefined,
		externalUrl: item.externalUrl ?? undefined,
		embedUrl: item.embedUrl ?? undefined,
		caption,
		description:
			description && description !== caption ? description : undefined,
		sortOrder: item.sortOrder ?? 0,
		widthPx: item.widthPx ?? undefined,
		heightPx: item.heightPx ?? undefined,
		aspectRatio: item.aspectRatio ?? undefined,
		humanReadableSize: item.humanReadableSize ?? undefined,
		mimeType: item.mimeType ?? undefined,
		fileSizeBytes: item.fileSizeBytes ?? undefined,
	};
}

function resolveTags(locale: string, collection: ImageCollection): string[] {
	if (locale === "ckb") {
		return collection.tags?.ckb ?? collection.tags?.kmr ?? [];
	}
	return collection.tags?.kmr ?? collection.tags?.ckb ?? [];
}

function resolveCollectionSlug(
	locale: string,
	collection: ImageCollection,
): string {
	return resolveContentSlug(locale, {
		slugCkb: collection.slugCkb,
		slugKmr: collection.slugKmr,
		id: collection.id,
	});
}

export function resolveGalleryPost(
	locale: string,
	collection: ImageCollection,
): GalleryPost | null {
	const content = resolveCollectionContent(locale, collection);
	const title = content?.title?.trim();
	if (!title) {
		return null;
	}

	const description = content?.description?.trim() ?? "";
	const album = [...collection.imageAlbum]
		.sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0))
		.map((item) => resolveAlbumItem(locale, item));

	return {
		id: resolveCollectionSlug(locale, collection),
		collectionType: mapCollectionType(collection.collectionType),
		title,
		description,
		location: content?.location?.trim() || undefined,
		collectedBy: content?.collectedBy?.trim() || undefined,
		topicName: resolveTopicName(locale, collection),
		publishmentDate:
			collection.publishmentDate ?? new Date().toISOString().slice(0, 10),
		tags: resolveTags(locale, collection),
		album,
	};
}

export function resolveGalleryPosts(
	locale: string,
	collections: ImageCollection[],
): GalleryPost[] {
	return collections
		.map((collection) => resolveGalleryPost(locale, collection))
		.filter((post): post is GalleryPost => post != null);
}

export function resolveGalleryHeroColumns(
	locale: string,
	collections: ImageCollection[],
): GalleryHeroColumns {
	const heroImages = collections
		.map((collection) => {
			const post = resolveGalleryPost(locale, collection);
			if (!post) {
				return null;
			}

			const cover =
				post.album[0]?.imageUrl ?? resolveCoverUrl(locale, collection);
			if (!cover) {
				return null;
			}

			const ratio = post.album[0]?.aspectRatio;
			const heroImage: GalleryHeroImage = {
				id: post.id,
				title: post.title,
				aspect: aspectFromRatio(ratio),
				image: { url: cover, alt: post.title },
			};
			if (post.topicName) {
				heroImage.categoryLabel = post.topicName;
			}
			return heroImage;
		})
		.filter((item): item is GalleryHeroImage => item != null);

	const up = heroImages.filter((_, index) => index % 2 === 0).slice(0, 6);
	const down = heroImages.filter((_, index) => index % 2 === 1).slice(0, 6);

	return { up, down };
}

export function resolveImageCollectionItem(
	locale: string,
	collection: ImageCollection,
	index: number,
): ImageCollectionItem | null {
	const content = resolveCollectionContent(locale, collection);
	const title = content?.title?.trim();
	if (!title) {
		return null;
	}

	const cover = resolveCoverUrl(locale, collection);
	const location = content?.location?.trim();

	return {
		id: resolveCollectionSlug(locale, collection),
		slug: resolveCollectionSlug(locale, collection),
		title,
		subtitle: location ?? "",
		catalogRef: `Plate ${String(index + 1).padStart(2, "0")}`,
		image: {
			url: cover ?? "/menu/1.jpg",
			alt: title,
		},
	};
}

export function resolveImageCollectionItems(
	locale: string,
	collections: ImageCollection[],
): ImageCollectionItem[] {
	return collections
		.map((collection, index) =>
			resolveImageCollectionItem(locale, collection, index),
		)
		.filter((item): item is ImageCollectionItem => item != null);
}
