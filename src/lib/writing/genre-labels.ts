import { preferLocaleText } from "@/lib/api/locale-text";
import { getBookGenres } from "@/lib/api/writings";
import { BOOK_GENRES, normalizeGenreSlug } from "@/lib/writing/genres";

type TranslateFn = (key: string) => string;

export type WritingGenreLabelSets = {
	/**
	 * The chips row: slug → label, insertion order IS chip order. Entirely
	 * CMS-driven once `book_genres` has rows; the built-in 22 otherwise.
	 */
	chipLabels: Record<string, string>;
	/**
	 * Labels for ANY genre a book record may carry: built-in translations
	 * overlaid with the CMS names (renames win). A slug in neither set has no
	 * label and its chip/qualifier is skipped by the views.
	 */
	labelLookup: Record<string, string>;
};

/**
 * One fetch feeding every genre surface — the filter chips, the active-filter
 * badge and the detail-page qualifiers. Server-only (goes through the
 * writings API module).
 */
export async function getWritingGenreLabelSets(
	locale: string,
	t: TranslateFn,
): Promise<WritingGenreLabelSets> {
	const records = await getBookGenres();
	const isCkb = locale === "ckb";

	const builtinLabels = Object.fromEntries(
		BOOK_GENRES.map((genre) => [genre, t(`genres.${genre}`)]),
	);

	const cmsEntries = records
		.filter((record) => record.active !== false)
		.map((record) => ({
			id: record.id,
			slug: normalizeGenreSlug(record.slug),
			label: preferLocaleText(isCkb, record.nameCkb, record.nameKmr),
			order: record.displayOrder ?? 0,
		}))
		.filter((entry): entry is typeof entry & { slug: string; label: string } =>
			Boolean(entry.slug && entry.label),
		)
		.sort((a, b) => a.order - b.order || a.id - b.id);

	const cmsLabels = Object.fromEntries(
		cmsEntries.map((entry) => [entry.slug, entry.label]),
	);

	return {
		chipLabels: cmsEntries.length > 0 ? cmsLabels : builtinLabels,
		labelLookup: { ...builtinLabels, ...cmsLabels },
	};
}
