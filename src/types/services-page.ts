import { z } from "zod";

export const ServicesPageSettingsSchema = z.object({
	id: z.number().optional(),
	heroImageUrl: z.string().nullish(),
	eyebrowCkb: z.string().nullish(),
	eyebrowKmr: z.string().nullish(),
	titleCkb: z.string().nullish(),
	titleKmr: z.string().nullish(),
	subtitleCkb: z.string().nullish(),
	subtitleKmr: z.string().nullish(),
});

export type ServicesPageSettings = z.infer<typeof ServicesPageSettingsSchema>;
