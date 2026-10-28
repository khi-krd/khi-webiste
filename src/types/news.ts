import { z } from "zod";
import { lenientArray } from "@/types/lenient";

export const ContentLanguageSchema = z.enum(["CKB", "KMR"]);

export const BilingualNameSchema = z.object({
	ckbName: z.string().nullish(),
	kmrName: z.string().nullish(),
});

export const BilingualSetSchema = z.object({
	ckb: z.array(z.string()),
	kmr: z.array(z.string()),
});

export const NewsContentSchema = z.object({
	title: z.string().nullish(),
	description: z.string().nullish(),
	location: z.string().nullish(),
});

export type NewsContent = z.infer<typeof NewsContentSchema>;

export const CoverMediaTypeSchema = z.enum(["IMAGE", "VIDEO", "AUDIO"]);

export const NewsSchema = z.object({
	id: z.number(),
	coverUrl: z.string().nullish(),
	coverMediaType: CoverMediaTypeSchema.nullish().catch(null),
	coverThumbnailUrl: z.string().nullable().optional(),
	mediaGallery: z.array(z.unknown()).optional(),
	datePublished: z.string().nullish(),
	contentLanguages: z.array(ContentLanguageSchema),
	category: BilingualNameSchema.nullable().optional(),
	subCategory: BilingualNameSchema.nullable().optional(),
	ckbContent: NewsContentSchema.nullish(),
	kmrContent: NewsContentSchema.nullish(),
	tags: BilingualSetSchema.optional(),
	keywords: BilingualSetSchema.optional(),
	sortOrder: z.number().int().nullish(),
	createdAt: z.string().optional(),
	updatedAt: z.string().optional(),
});

export type News = z.infer<typeof NewsSchema>;

export const NewsPageSchema = z.object({
	content: lenientArray(NewsSchema, "news"),
	totalElements: z.number(),
	totalPages: z.number(),
	number: z.number().optional(),
	size: z.number().optional(),
	empty: z.boolean().optional(),
});

export type NewsPage = z.infer<typeof NewsPageSchema>;
