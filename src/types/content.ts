import { z } from "zod";

export const ContentTypeSchema = z.enum([
	"book",
	"song",
	"audio",
	"video",
	"article",
	"gallery",
	"archive",
]);

export type ContentType = z.infer<typeof ContentTypeSchema>;

export const TYPE_SEGMENTS: Record<ContentType, string> = {
	book: "writings",
	song: "audio",
	audio: "audio",
	video: "videos",
	article: "news",
	gallery: "gallery",
	archive: "donate",
};

export const FeaturedImageSchema = z.object({
	url: z.string().min(1),
	alt: z.string().optional(),
	width: z.number().int().positive().optional(),
	height: z.number().int().positive().optional(),
	blurDataURL: z.string().optional(),
});

export const FeaturedItemSchema = z.object({
	id: z.string().min(1),
	type: ContentTypeSchema,
	slug: z.string().min(1),
	title: z.string().min(1),
	description: z.string().min(1),
	image: FeaturedImageSchema,
});

export const FeaturedItemsSchema = z.array(FeaturedItemSchema);

export type FeaturedItem = z.infer<typeof FeaturedItemSchema>;

export const FeaturedSourceSchema = z.enum([
	"news",
	"project",
	"writing",
	"video",
	"sound-track",
	"image-collection",
]);

export type FeaturedSource = z.infer<typeof FeaturedSourceSchema>;

/** Raw DTO from `GET /api/v1/featured`. */
export const FeaturedApiItemSchema = z.object({
	id: z.string().min(1),
	source: FeaturedSourceSchema,
	entityId: z.number(),
	type: ContentTypeSchema,
	slug: z.string().min(1),
	title: z.string().min(1),
	description: z.string().min(1),
	image: FeaturedImageSchema,
	locale: z.string().optional(),
	featured: z.literal(true).optional(),
	featuredOrder: z.number().nullable().optional(),
	displayOrder: z.number().optional(),
	active: z.boolean().optional(),
});

export const FeaturedApiItemsSchema = z.array(FeaturedApiItemSchema);

export type FeaturedApiItem = z.infer<typeof FeaturedApiItemSchema>;

export type HeroSlide = {
	id: string;
	href: string;
	title: string;
	description: string;
	typeLabel: string;
	actionLabel: string;
	slideLabel: string;
	image: FeaturedItem["image"];
};
