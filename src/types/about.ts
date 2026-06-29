import { z } from "zod";

export const AboutContentSchema = z.object({
	title: z.string().nullish(),
	subtitle: z.string().nullish(),
	metaDescription: z.string().nullish(),
	body: z.string().nullish(),
});

export const AboutStatSchema = z.object({
	labelCkb: z.string().nullish(),
	labelKmr: z.string().nullish(),
	value: z.string().nullish(),
});

export const AboutSchema = z.object({
	id: z.number(),
	slugCkb: z.string().nullish(),
	slugKmr: z.string().nullish(),
	ckbContent: AboutContentSchema.nullish(),
	kmrContent: AboutContentSchema.nullish(),
	founderNameCkb: z.string().nullish(),
	founderNameKmr: z.string().nullish(),
	founderBioCkb: z.string().nullish(),
	founderBioKmr: z.string().nullish(),
	founderImageUrl: z.string().nullish(),
	heroVideoUrl: z.string().nullish(),
	heroPosterUrl: z.string().nullish(),
	active: z.boolean().optional(),
	stats: z.array(AboutStatSchema).optional(),
	createdAt: z.string().nullish(),
	updatedAt: z.string().nullish(),
});

export const AboutListSchema = z.array(AboutSchema);

export type About = z.infer<typeof AboutSchema>;
export type AboutContent = z.infer<typeof AboutContentSchema>;
export type AboutStat = z.infer<typeof AboutStatSchema>;
