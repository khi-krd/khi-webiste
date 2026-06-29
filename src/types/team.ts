import { z } from "zod";

export const TeamMemberSchema = z.object({
	id: z.number(),
	nameCkb: z.string().nullish(),
	nameKmr: z.string().nullish(),
	roleCkb: z.string().nullish(),
	roleKmr: z.string().nullish(),
	bioCkb: z.string().nullish(),
	bioKmr: z.string().nullish(),
	office: z.string().nullish(),
	imageUrl: z.string().nullish(),
	displayOrder: z.number().int().nullish(),
	active: z.boolean().optional(),
});

export const TeamMemberListSchema = z.array(TeamMemberSchema);

export type TeamMember = z.infer<typeof TeamMemberSchema>;
