import type { BookGenre } from "@/types/writing";

/** URL slugs — must match `site.ts` books children hrefs. */
export const WRITING_CATEGORY_SLUGS = [
	"literature",
	"history",
	"poetry",
	"manuscripts",
] as const;

export type WritingCategorySlug = (typeof WRITING_CATEGORY_SLUGS)[number];

/** i18n keys under the Nav namespace for each slug. */
export const WRITING_CATEGORY_NAV_KEYS: Record<
	WritingCategorySlug,
	"booksSubLiterature" | "booksSubHistory" | "booksSubPoetry" | "booksSubManuscripts"
> = {
	literature: "booksSubLiterature",
	history: "booksSubHistory",
	poetry: "booksSubPoetry",
	manuscripts: "booksSubManuscripts",
};

/** Map each nav category to API BookGenre values for filtering. */
export const WRITING_CATEGORY_GENRES: Record<WritingCategorySlug, BookGenre[]> = {
	literature: [
		"NOVEL",
		"SHORT_STORY",
		"DRAMA",
		"PHILOSOPHY",
		"ARTS",
		"CULTURAL",
		"CHILDREN",
		"TRAVEL",
		"EDUCATIONAL",
	],
	history: [
		"HISTORY",
		"BIOGRAPHY",
		"POLITICS",
		"SOCIOLOGY",
		"ECONOMICS",
		"LAW",
		"SCIENCE",
		"MEDICINE",
	],
	poetry: ["POETRY"],
	manuscripts: ["FOLKLORE", "RELIGION", "LINGUISTICS", "OTHER"],
};

export function isWritingCategorySlug(
	value: string,
): value is WritingCategorySlug {
	return (WRITING_CATEGORY_SLUGS as readonly string[]).includes(value);
}

export function getGenresForCategory(
	slug: WritingCategorySlug | null | undefined,
): BookGenre[] | null {
	if (!slug) {
		return null;
	}
	return WRITING_CATEGORY_GENRES[slug];
}
