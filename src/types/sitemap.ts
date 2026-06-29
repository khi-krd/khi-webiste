import { z } from "zod";

export const SitemapResponseSchema = z.object({
	locale: z.string(),
	paths: z.array(z.string()),
});

export type SitemapResponse = z.infer<typeof SitemapResponseSchema>;
