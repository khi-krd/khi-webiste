import { z } from "zod";

/**
 * Shared API primitives. Content-type schemas (books, songs, articles, …)
 * live alongside their feature modules and compose these building blocks.
 * Kept intentionally small until the backend taxonomy is locked.
 */

/** Standard paginated list envelope. Pass the item schema in per call. */
export function paginated<TItem extends z.ZodType>(item: TItem) {
	return z.object({
		items: z.array(item),
		total: z.number().int().nonnegative(),
		page: z.number().int().positive(),
		pageSize: z.number().int().positive(),
	});
}

/** Localized string: backend returns one value per locale. */
export const localizedString = z.object({
	ckb: z.string(),
	ku: z.string(),
});

export type LocalizedString = z.infer<typeof localizedString>;

/** A media asset reference served from the S3 host. */
export const mediaAsset = z.object({
	url: z.url(),
	width: z.number().int().positive().optional(),
	height: z.number().int().positive().optional(),
	alt: z.string().optional(),
});

export type MediaAsset = z.infer<typeof mediaAsset>;
