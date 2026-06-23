import { z } from "zod";

export const BookGenreSchema = z.enum([
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
]);

export type BookGenre = z.infer<typeof BookGenreSchema>;

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
	title: z.string().nullable(),
	description: z.string().nullable(),
	writer: z.string().nullable(),
	fileUrl: z.string().nullable(),
	fileFormat: WritingFileFormatSchema.nullable(),
	fileSizeBytes: z.number().nullable(),
	pageCount: z.number().int().nullable(),
	genre: z.string().nullable(),
});

export const TopicInfoSchema = z.object({
	id: z.number(),
	nameCkb: z.string().nullable(),
	nameKmr: z.string().nullable(),
});

export const SeriesInfoSchema = z.object({
	seriesId: z.string().nullable(),
	seriesName: z.string().nullable(),
	seriesOrder: z.number().nullable(),
	parentBookId: z.number().nullable(),
	totalBooks: z.number().int().nullable(),
	isParent: z.boolean(),
});

export const BilingualSetSchema = z.object({
	ckb: z.array(z.string()),
	kmr: z.array(z.string()),
});

export const WritingSchema = z.object({
	id: z.number(),
	contentLanguages: z.array(z.enum(["CKB", "KMR"])),
	ckbCoverUrl: z.string().nullish(),
	kmrCoverUrl: z.string().nullish(),
	hoverCoverUrl: z.string().nullish(),
	ckbContent: WritingContentSchema.nullish(),
	kmrContent: WritingContentSchema.nullish(),
	topic: TopicInfoSchema.nullish(),
	bookGenres: z.array(BookGenreSchema),
	publishedByInstitute: z.boolean(),
	tags: BilingualSetSchema,
	keywords: BilingualSetSchema,
	seriesInfo: SeriesInfoSchema,
	createdAt: z.string(),
	updatedAt: z.string(),
});

export type Writing = z.infer<typeof WritingSchema>;
export type WritingContent = z.infer<typeof WritingContentSchema>;
export type TopicInfo = z.infer<typeof TopicInfoSchema>;
export type SeriesInfo = z.infer<typeof SeriesInfoSchema>;

export const PageableSchema = z.object({
	pageNumber: z.number(),
	pageSize: z.number(),
});

export const WritingsPageSchema = z.object({
	content: z.array(WritingSchema),
	pageable: PageableSchema,
	totalElements: z.number(),
	totalPages: z.number(),
	last: z.boolean(),
	first: z.boolean(),
	numberOfElements: z.number(),
	empty: z.boolean(),
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
	titleCkb: z.string().nullable(),
	titleKmr: z.string().nullable(),
	seriesOrder: z.number().nullable(),
	createdAt: z.string(),
});

export const SeriesResponseSchema = z.object({
	seriesId: z.string(),
	seriesName: z.string().nullable(),
	totalBooks: z.number().int().nullable(),
	books: z.array(SeriesBookSummarySchema),
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

export type ResolvedWritingDetail = {
	id: number;
	title: string;
	writer: string;
	description: string;
	coverUrl: string | null;
	hoverCoverUrl: string | null;
	genres: BookGenre[];
	freeTextGenre: string | null;
	topicName: string | null;
	publishedByInstitute: boolean;
	seriesName: string | null;
	seriesId: string | null;
	seriesOrder: number | null;
	seriesTotalBooks: number | null;
	isPartOfSeries: boolean;
	tags: string[];
	keywords: string[];
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
	freeTextGenre: string | null;
	topicName: string | null;
	seriesName: string | null;
	publishedByInstitute: boolean;
	seriesOrderLabel: string;
	fileUrl: string | null;
	fileFormat: string | null;
	pageCount: number | null;
	fileSizeBytes: number | null;
};
