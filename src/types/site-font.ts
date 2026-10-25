import { z } from "zod";
import { lenientArray } from "@/types/lenient";

export const SiteFontSchema = z.object({
	id: z.number(),
	language: z.string().nullish(),
	name: z.string(),
	url: z.string(),
});
export type SiteFont = z.infer<typeof SiteFontSchema>;

export const SiteFontListSchema = lenientArray(SiteFontSchema, "site font");
