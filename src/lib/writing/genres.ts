import type { BookGenre } from "@/types/writing";

/**
 * The 22 built-in genre codes with translated labels in `messages/*.json`.
 * Fallback vocabulary and chip order ONLY — the live list comes from
 * `/api/v1/book-genres` (see `lib/writing/genre-labels.ts`); once that table
 * has rows, it fully replaces this set for the chips row.
 */
export const BOOK_GENRES: BookGenre[] = [
	"POETRY",
	"NOVEL",
	"SHORT_STORY",
	"DRAMA",
	"HISTORY",
	"BIOGRAPHY",
	"PHILOSOPHY",
	"RELIGION",
	"FOLKLORE",
	"POLITICS",
	"SOCIOLOGY",
	"ECONOMICS",
	"LAW",
	"LINGUISTICS",
	"ARTS",
	"CULTURAL",
	"SCIENCE",
	"MEDICINE",
	"EDUCATIONAL",
	"CHILDREN",
	"TRAVEL",
	"OTHER",
];

/** Slug shape the CMS enforces: UPPERCASE letters/digits/underscore, ≤60. */
const GENRE_SLUG_PATTERN = /^[A-Z0-9_]{1,60}$/;

/**
 * Genres are editor-managed rows now, so validity cannot be a static check —
 * this only normalizes a URL/user value to slug shape (trim + uppercase) and
 * rejects strings that could never be a slug. A well-formed slug that matches
 * no genre simply filters to zero books, which is the honest answer.
 */
export function normalizeGenreSlug(value?: string | null): BookGenre | null {
	const slug = value?.trim().toUpperCase();
	return slug && GENRE_SLUG_PATTERN.test(slug) ? slug : null;
}
