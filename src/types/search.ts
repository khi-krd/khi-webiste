import { z } from "zod";

export const SearchTypeSchema = z.enum([
	"ALL",
	"PROJECT",
	"NEWS",
	"VIDEO",
	"WRITING",
	"SOUNDTRACK",
	"IMAGE",
]);

export const SearchItemTypeSchema = z.enum([
	"PROJECT",
	"NEWS",
	"VIDEO",
	"WRITING",
	"SOUNDTRACK",
	"IMAGE",
]);

export const SearchItemSchema = z.object({
	id: z.number(),
	type: SearchItemTypeSchema,
	titleCkb: z.string(),
	titleKmr: z.string().nullish(),
	descriptionCkb: z.string(),
	descriptionKmr: z.string(),
	coverUrl: z.string().nullish(),
	createdAt: z.string().nullish(),
});

export const SearchSectionSchema = z.object({
	items: z.array(SearchItemSchema),
	totalElements: z.number(),
	totalPages: z.number(),
	currentPage: z.number(),
	size: z.number(),
});

export const GlobalSearchResponseSchema = z.object({
	query: z.string(),
	page: z.number(),
	size: z.number(),
	type: SearchTypeSchema,
	projects: SearchSectionSchema.nullable().optional(),
	news: SearchSectionSchema.nullable().optional(),
	videos: SearchSectionSchema.nullable().optional(),
	writings: SearchSectionSchema.nullable().optional(),
	soundTracks: SearchSectionSchema.nullable().optional(),
	imageCollections: SearchSectionSchema.nullable().optional(),
});

export type SearchType = z.infer<typeof SearchTypeSchema>;
export type SearchItemType = z.infer<typeof SearchItemTypeSchema>;
export type SearchItem = z.infer<typeof SearchItemSchema>;
export type SearchSection = z.infer<typeof SearchSectionSchema>;
export type GlobalSearchResponse = z.infer<typeof GlobalSearchResponseSchema>;
