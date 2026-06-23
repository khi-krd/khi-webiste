import { z } from "zod";

export const ContentLanguageSchema = z.enum(["CKB", "KMR"]);

export const BilingualNameSchema = z.object({
	ckbName: z.string().nullable(),
	kmrName: z.string().nullable(),
});

export const BilingualSetSchema = z.object({
	ckb: z.array(z.string()),
	kmr: z.array(z.string()),
});

export const NewsContentSchema = z.object({
	title: z.string().nullable(),
	description: z.string().nullable(),
});

export type NewsContent = z.infer<typeof NewsContentSchema>;

export const CoverMediaTypeSchema = z.enum(["IMAGE", "VIDEO", "AUDIO"]);

export const NewsSchema = z.object({
	id: z.number(),
	coverUrl: z.string().nullable(),
	coverMediaType: CoverMediaTypeSchema.nullable().optional(),
	coverThumbnailUrl: z.string().nullable().optional(),
	mediaGallery: z.array(z.unknown()).optional(),
	datePublished: z.string().nullable(),
	contentLanguages: z.array(ContentLanguageSchema),
	category: BilingualNameSchema.nullable().optional(),
	subCategory: BilingualNameSchema.nullable().optional(),
	ckbContent: NewsContentSchema.nullish(),
	kmrContent: NewsContentSchema.nullish(),
	tags: BilingualSetSchema.optional(),
	keywords: BilingualSetSchema.optional(),
	createdAt: z.string().optional(),
	updatedAt: z.string().optional(),
});

export type News = z.infer<typeof NewsSchema>;

export const NewsPageSchema = z.object({
	content: z.array(NewsSchema),
	totalElements: z.number(),
	totalPages: z.number(),
	number: z.number().optional(),
	size: z.number().optional(),
	empty: z.boolean().optional(),
});

export type NewsPage = z.infer<typeof NewsPageSchema>;
