import { z } from "zod";

export const ContactContentSchema = z.object({
	title: z.string().nullish(),
	subtitle: z.string().nullish(),
	address: z.string().nullish(),
	workingHours: z.string().nullish(),
	description: z.string().nullish(),
});

export const ContactPageSchema = z.object({
	id: z.number(),
	slugCkb: z.string().nullish(),
	slugKmr: z.string().nullish(),
	ckbContent: ContactContentSchema.nullish(),
	kmrContent: ContactContentSchema.nullish(),
	phone: z.string().nullish(),
	secondaryPhone: z.string().nullish(),
	email: z.string().nullish(),
	mapEmbedUrl: z.string().nullish(),
	latitude: z.number().nullish(),
	longitude: z.number().nullish(),
	active: z.boolean().optional(),
	createdAt: z.string().nullish(),
	updatedAt: z.string().nullish(),
});

export const ContactPageListSchema = z.array(ContactPageSchema);

export type ContactPage = z.infer<typeof ContactPageSchema>;
export type ContactContent = z.infer<typeof ContactContentSchema>;
