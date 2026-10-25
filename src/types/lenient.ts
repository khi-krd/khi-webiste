import { z } from "zod";

/**
 * Array that validates each entry on its own: an entry the schema rejects is
 * dropped (and logged) instead of failing the whole array — and with it the
 * parent record or the entire section. A missing or non-array value becomes
 * an empty list.
 *
 * Use for every list of objects coming from the API. A strict `z.array` there
 * means one malformed image hides its album, one malformed news item empties
 * the news page.
 */
export function lenientArray<T extends z.ZodType>(item: T, label = "item") {
	return z
		.array(z.unknown())
		.catch([])
		.transform((entries) => {
			const parsed: z.output<T>[] = [];
			for (const entry of entries) {
				const result = item.safeParse(entry);
				if (result.success) {
					parsed.push(result.data);
				} else {
					reportDropped(label, entry, result.error);
				}
			}
			return parsed;
		});
}

/** Surfaces a dropped record in the server logs instead of losing it silently. */
export function reportDropped(
	label: string,
	entry: unknown,
	error: z.ZodError,
): void {
	const id =
		entry && typeof entry === "object" && "id" in entry
			? ` id=${String((entry as { id: unknown }).id)}`
			: "";
	const [issue] = error.issues;
	console.warn(
		`[api] dropped ${label}${id}: ${
			issue
				? `${issue.path.join(".") || "(root)"} ${issue.message}`
				: error.message
		}`,
	);
}
