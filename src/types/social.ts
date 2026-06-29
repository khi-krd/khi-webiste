import { z } from "zod";

export const SocialPlatformSchema = z.enum([
	"FACEBOOK",
	"INSTAGRAM",
	"YOUTUBE",
	"WHATSAPP",
	"TWITTER",
	"LINKEDIN",
	"TELEGRAM",
	"TIKTOK",
	"OTHER",
]);

export const SocialLinkSchema = z.object({
	id: z.number(),
	platform: SocialPlatformSchema,
	url: z.string(),
	labelCkb: z.string().nullish(),
	labelKmr: z.string().nullish(),
	displayOrder: z.number().int().nullish(),
	active: z.boolean().optional(),
});

export const SocialLinkListSchema = z.array(SocialLinkSchema);

export type SocialPlatform = z.infer<typeof SocialPlatformSchema>;
export type SocialLink = z.infer<typeof SocialLinkSchema>;
