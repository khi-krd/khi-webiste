import { z } from "zod";
import { BilingualSetSchema, ContentLanguageSchema } from "@/types/news";

export const ImageCollectionTypeSchema = z.enum([
	"SINGLE",
	"GALLERY",
	"PHOTO_STORY",
	"PHOTO_GALLERY",
	"SINGLE_IMAGE",
]);

export const ImageCollectionContentSchema = z.object({
	title: z.string().nullable(),
	description: z.string().nullable(),
	location: z.string().nullable(),
	collectedBy: z.string().nullable(),
});

export const ImageAlbumItemSchema = z.object({
	id: z.number(),
	imageUrl: z.string().nullable().optional(),
	externalUrl: z.string().nullable().optional(),
	embedUrl: z.string().nullable().optional(),
	captionCkb: z.string().nullable().optional(),
	captionKmr: z.string().nullable().optional(),
	descriptionCkb: z.string().nullable().optional(),
	descriptionKmr: z.string().nullable().optional(),
	sortOrder: z.number().int().nullish(),
	widthPx: z.number().nullable().optional(),
	heightPx: z.number().nullable().optional(),
	mimeType: z.string().nullable().optional(),
	aspectRatio: z.number().nullable().optional(),
	humanReadableSize: z.string().nullable().optional(),
	fileSizeBytes: z.number().nullable().optional(),
});

export type ImageAlbumItem = z.infer<typeof ImageAlbumItemSchema>;

export const ImageCollectionSchema = z.object({
	id: z.number(),
	slugCkb: z.string().nullish(),
	slugKmr: z.string().nullish(),
	collectionType: ImageCollectionTypeSchema,
	ckbCoverUrl: z.string().nullish(),
	kmrCoverUrl: z.string().nullish(),
	hoverCoverUrl: z.string().nullish(),
	topicId: z.number().nullish(),
	topicNameCkb: z.string().nullish(),
	topicNameKmr: z.string().nullish(),
	publishmentDate: z.string().nullish(),
	contentLanguages: z.array(ContentLanguageSchema),
	ckbContent: ImageCollectionContentSchema.nullish(),
	kmrContent: ImageCollectionContentSchema.nullish(),
	tags: BilingualSetSchema.optional(),
	keywords: BilingualSetSchema.optional(),
	imageAlbum: z.array(ImageAlbumItemSchema),
	createdAt: z.string().optional(),
	updatedAt: z.string().optional(),
});

export type ImageCollection = z.infer<typeof ImageCollectionSchema>;

export const ImageCollectionsPageSchema = z.object({
	content: z.array(ImageCollectionSchema),
	totalElements: z.number(),
	totalPages: z.number(),
	number: z.number().optional(),
	size: z.number().optional(),
	empty: z.boolean().optional(),
});

export type ImageCollectionsPage = z.infer<typeof ImageCollectionsPageSchema>;

export const ImageTopicSchema = z.object({
	id: z.number(),
	nameCkb: z.string().nullable(),
	nameKmr: z.string().nullable(),
});

export type ImageTopic = z.infer<typeof ImageTopicSchema>;
