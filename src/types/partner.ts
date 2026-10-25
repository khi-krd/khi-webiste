import { z } from "zod";
import { lenientArray } from "@/types/lenient";

export const PartnerSchema = z.object({
	id: z.number(),
	nameCkb: z.string().nullish(),
	nameKmr: z.string().nullish(),
	descriptionCkb: z.string().nullish(),
	descriptionKmr: z.string().nullish(),
	logoUrl: z.string().nullish(),
	websiteUrl: z.string().nullish(),
	displayOrder: z.number().int().nullish(),
	active: z.boolean().optional(),
});

export const PartnerListSchema = lenientArray(PartnerSchema, "partner");

export type Partner = z.infer<typeof PartnerSchema>;
