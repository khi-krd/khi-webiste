import { z } from "zod";
import { lenientArray } from "@/types/lenient";

/** Null-ish because the backend omits null fields rather than sending them. */
export const NavMenuItemSchema = z.object({
	itemKey: z.string().min(1),
	imageUrl: z.string().nullish(),
	active: z.boolean().nullish(),
});

export const NavMenuSchema = lenientArray(NavMenuItemSchema, "nav menu item");
