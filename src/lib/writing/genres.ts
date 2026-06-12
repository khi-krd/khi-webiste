import type { BookGenre } from "@/types/writing";

/** All 22 BookGenre enum values from the Writing API. */
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

export function isBookGenre(value: string): value is BookGenre {
	return (BOOK_GENRES as string[]).includes(value);
}
