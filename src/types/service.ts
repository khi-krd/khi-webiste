import { z } from "zod";
import { PageableSchema } from "@/types/writing";

export const ServiceContentSchema = z.object({
	id: z.number(),
	languageCode: z.string(),
	title: z.string().nullish(),
	description: z.string().nullish(),
});

export const ServiceSchema = z.object({
	id: z.number(),
	serviceType: z.string().nullish(),
	location: z.string().nullish(),
	active: z.boolean(),
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
	last: z.boolean().optional(),
	first: z.boolean().optional(),
	numberOfElements: z.number().optional(),
	empty: z.boolean().optional(),
});

export type Service = z.infer<typeof ServiceSchema>;
export type ServiceContent = z.infer<typeof ServiceContentSchema>;
export type ServicesPage = z.infer<typeof ServicesPageSchema>;
