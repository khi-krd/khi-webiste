import { z } from "zod";
import { PageableSchema } from "@/types/writing";

export const ServiceContentSchema = z.object({
	id: z.number(),
	languageCode: z.string(),
	title: z.string().nullish(),
	description: z.string().nullish(),
});

export const ServiceLayoutTypeSchema = z.enum([
	"DEFAULT",
	"FEATURE_GRID",
	"MEDIA_HERO",
]);

export const ServiceGalleryMediaTypeSchema = z.enum(["IMAGE", "VIDEO"]);

export const ServiceGalleryMediaSchema = z.object({
	type: ServiceGalleryMediaTypeSchema,
	url: z.string(),
	posterUrl: z.string().nullish(),
	alt: z.string().nullish(),
});

export const ServiceSchema = z.object({
	id: z.number(),
	serviceType: z.string().nullish(),
	location: z.string().nullish(),
	layoutType: ServiceLayoutTypeSchema.nullish(),
	heroVideoUrl: z.string().nullish(),
	heroPosterUrl: z.string().nullish(),
	navAnchorId: z.string().nullish(),
	featureImageUrls: z.array(z.string()).optional(),
	thumbnailUrls: z.array(z.string()).optional(),
	galleryMedia: z.array(ServiceGalleryMediaSchema).optional(),
	partnerIds: z.array(z.number()).optional(),
	active: z.boolean(),
	sortOrder: z.number().nullish(),
	publishedAt: z.string().nullish(),
	contents: z.array(ServiceContentSchema),
	createdAt: z.string().nullish(),
	updatedAt: z.string().nullish(),
});

export const ServicesPageSchema = z.object({
	content: z.array(ServiceSchema),
	pageable: PageableSchema.optional(),
	totalElements: z.number(),
	totalPages: z.number(),
	number: z.number().optional(),
	size: z.number().optional(),
	last: z.boolean().optional(),
	first: z.boolean().optional(),
	numberOfElements: z.number().optional(),
	empty: z.boolean().optional(),
});

export type ServiceLayoutType = z.infer<typeof ServiceLayoutTypeSchema>;
export type ServiceGalleryMediaType = z.infer<
	typeof ServiceGalleryMediaTypeSchema
>;
export type ServiceGalleryMedia = z.infer<typeof ServiceGalleryMediaSchema>;
export type Service = z.infer<typeof ServiceSchema>;
export type ServiceContent = z.infer<typeof ServiceContentSchema>;
export type ServicesPage = z.infer<typeof ServicesPageSchema>;
