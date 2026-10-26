import { z } from "zod";
import { lenientArray } from "@/types/lenient";

/**
 * Genre slug — an open string, not an enum: genres are editor-managed rows in
 * the CMS (`/api/v1/book-genres`), so new slugs can appear at any time. The
 * built-in 22 codes in `lib/writing/genres.ts` remain only as the fallback
 * vocabulary while the CMS table is empty.
 */
export type BookGenre = string;

/** One `book_genres` row from `/api/v1/book-genres`. */
export const BookGenreRecordSchema = z.object({
	id: z.number(),
	slug: z.string(),
	nameCkb: z.string().nullish(),
	nameKmr: z.string().nullish(),
	displayOrder: z.number().nullish(),
	active: z.boolean().nullish(),
	bookCount: z.number().nullish(),
});

export const BookGenreRecordListSchema = lenientArray(
	BookGenreRecordSchema,
	"book genre",
);

export type BookGenreRecord = z.infer<typeof BookGenreRecordSchema>;

export const WritingFileFormatSchema = z.enum([
	"PDF",
	"DOCX",
	"DOC",
	"TXT",
	"EPUB",
	"ODT",
	"RTF",
	"HTML",
	"OTHER",
]);

export const WritingContentSchema = z.object({
	title: z.string().nullish(),
	description: z.string().nullish(),
	location: z.string().nullish(),
	fileUrl: z.string().nullish(),
	fileFormat: WritingFileFormatSchema.nullish().catch(null),
	fileSizeBytes: z.number().nullish(),
	pageCount: z.number().int().nullish(),
	genre: z.string().nullish(),
});

export const TopicInfoSchema = z.object({
	id: z.number(),
	nameCkb: z.string().nullish(),
	nameKmr: z.string().nullish(),
});

export const WritingPersonSchema = z.object({
	id: z.number().nullish(),
	role: z.string().nullish(),
	nameCkb: z.string().nullish(),
	nameKmr: z.string().nullish(),
	nicknameCkb: z.string().nullish(),
	nicknameKmr: z.string().nullish(),
	sortOrder: z.number().nullish(),
});

export const SeriesInfoSchema = z
	.object({
		seriesId: z.string().nullish(),
		seriesName: z.string().nullish(),
		seriesOrder: z.number().nullish(),
		parentBookId: z.number().nullable().optional(),
		totalBooks: z.number().int().nullish(),
		isParent: z.boolean().optional(),
		parent: z.boolean().optional(),
	})
	.transform((series) => ({
		seriesId: series.seriesId,
		seriesName: series.seriesName,
		seriesOrder: series.seriesOrder,
		parentBookId: series.parentBookId,
		totalBooks: series.totalBooks,
		isParent: series.isParent ?? series.parent,
	}));

export const BilingualSetSchema = z.object({
	ckb: z.array(z.string()).default([]),
	kmr: z.array(z.string()).default([]),
});

export const WritingSchema = z.object({
	id: z.number(),
	contentLanguages: z.array(z.enum(["CKB", "KMR"])),
	ckbCoverUrl: z.string().nullish(),
	kmrCoverUrl: z.string().nullish(),
	hoverCoverUrl: z.string().nullish(),
	ckbContent: WritingContentSchema.nullish(),
	kmrContent: WritingContentSchema.nullish(),
	topicId: z.number().nullish(),
	topicNameCkb: z.string().nullish(),
	topicNameKmr: z.string().nullish(),
	topic: TopicInfoSchema.nullish(),
	topics: lenientArray(TopicInfoSchema, "writing topic"),
	bookGenres: z.array(z.string()),
	bookLanguageCkb: z.string().nullish(),
	bookLanguageKmr: z.string().nullish(),
	publishedByInstitute: z.boolean(),
	tags: BilingualSetSchema,
	keywords: BilingualSetSchema,
	persons: lenientArray(WritingPersonSchema, "writing person").optional(),
	series: SeriesInfoSchema.nullish(),
	seriesInfo: SeriesInfoSchema.nullish(),
	createdAt: z.string().optional(),
	updatedAt: z.string().optional(),
});

export type Writing = z.infer<typeof WritingSchema>;
export type WritingContent = z.infer<typeof WritingContentSchema>;
export type WritingPerson = z.infer<typeof WritingPersonSchema>;
export type TopicInfo = z.infer<typeof TopicInfoSchema>;
export type SeriesInfo = z.infer<typeof SeriesInfoSchema>;

export const PageableSchema = z.object({
	pageNumber: z.number(),
	pageSize: z.number(),
});

export const WritingsPageSchema = z.object({
	content: lenientArray(WritingSchema, "writing"),
	pageable: PageableSchema.optional(),
	totalElements: z.number(),
	totalPages: z.number(),
	number: z.number().optional(),
	size: z.number().optional(),
	last: z.boolean().optional(),
	first: z.boolean().optional(),
	numberOfElements: z.number().optional(),
	empty: z.boolean().optional(),
});

export type WritingsPage = z.infer<typeof WritingsPageSchema>;

export const ApiResponseSchema = <T extends z.ZodType>(dataSchema: T) =>
	z.object({
		success: z.boolean(),
		message: z.string(),
		data: dataSchema,
	});

export const SeriesBookSummarySchema = z.object({
	id: z.number(),
	titleCkb: z.string().nullish(),
	titleKmr: z.string().nullish(),
	seriesOrder: z.number().nullish(),
	createdAt: z.string().optional(),
	ckbContent: z.object({ title: z.string().nullish() }).nullish(),
	kmrContent: z.object({ title: z.string().nullish() }).nullish(),
});

export const SeriesResponseSchema = z.object({
	seriesId: z.string(),
	seriesName: z.string().nullish(),
	totalBooks: z.number().int().nullish(),
	books: lenientArray(SeriesBookSummarySchema, "series book"),
});

export type SeriesBookSummary = z.infer<typeof SeriesBookSummarySchema>;
export type SeriesResponse = z.infer<typeof SeriesResponseSchema>;

export type WritingFileOffer = {
	language: "CKB" | "KMR";
	languageLabel: string;
	title: string | null;
	fileUrl: string | null;
	fileFormat: string | null;
	pageCount: number | null;
	fileSizeLabel: string | null;
};

export type ResolvedSeriesBook = {
	id: number;
	title: string;
	seriesOrder: number;
	isCurrent: boolean;
};

export type ResolvedWritingPerson = {
	/** Free-text role typed in the dashboard (نووسەر, کۆکەرەوە, ...). */
	role: string | null;
	/** Locale-picked display name (falls back to the other script). */
	name: string;
	/** Locale-picked nickname; rendered after the name when present. */
	nickname: string | null;
};

export type ResolvedWritingDetail = {
	id: number;
	title: string;
	writer: string;
	location: string | null;
	bookLanguage: string | null;
	description: string;
	coverUrl: string | null;
	hoverCoverUrl: string | null;
	genres: BookGenre[];
	topicName: string | null;
	topicNames: string[];
	publishedByInstitute: boolean;
	seriesName: string | null;
	seriesId: string | null;
	seriesOrder: number | null;
	seriesTotalBooks: number | null;
	isPartOfSeries: boolean;
	tags: string[];
	keywords: string[];
	persons: ResolvedWritingPerson[];
	fileOffers: WritingFileOffer[];
	createdAt: string;
	updatedAt: string;
};

export type ResolvedWritingCard = {
	id: number;
	title: string;
	writer: string;
	excerpt: string;
	coverUrl: string | null;
	hoverCoverUrl: string | null;
	genres: BookGenre[];
	/** Both dialects unioned — the tag endpoints OR across CKB and KMR, so the
	 *  in-memory fallback has to match the same way or it drops real hits. */
	tags: string[];
	keywords: string[];
	topicName: string | null;
	topicNames: string[];
	seriesName: string | null;
	publishedByInstitute: boolean;
	seriesOrderLabel: string;
	fileUrl: string | null;
	fileFormat: string | null;
	pageCount: number | null;
	fileSizeBytes: number | null;
};
