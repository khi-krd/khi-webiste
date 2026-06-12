import { getAllDemoWritingCards } from "@/lib/mock/writing-page";
import {
	resolveSeriesBooks,
	resolveWritingDetail,
} from "@/lib/writing/resolve";
import type {
	ResolvedSeriesBook,
	ResolvedWritingDetail,
	SeriesResponse,
	Writing,
} from "@/types/writing";

const DEMO_SERIES_ID = "series-khi-literary";

const EXTRA_DESCRIPTIONS: Record<string, string> = {
	en: "A long-form study drawing on archival sources, oral histories, and contemporary scholarship. This edition preserves the full text with editorial notes prepared by the Kurdish Heritage Institute.",
	ku: "Lêkolînek dirêj ku ji çavkaniyên arşîvî, dîroka devkî û lêkolînên nûjen sûde digire. Ev çap nivîsa tevahî bi notên edîtorî yên Enstîtuya Kevneşopiya Kurdî parastiye.",
	ckb: "توێژینەوەیەکی درێژ کە لە سەرچاوە ئارشیفییەکان، مێژووی شفاهی و توێژینەوەی هاوچەرخ سودی لێ وەردەگرێت. ئەم چاپە دەقە تەواوەکە لەگەڵ تێبینییە دەستییەکانی ئینستیوتی کەلەپووری کوردی پارێزراوە.",
};

const DEMO_TAGS: Record<string, { ckb: string[]; kmr: string[] }> = {
	default: {
		ckb: ["کوردستان", "ئەدەب"],
		kmr: ["Kurdistan", "edebî"],
	},
};

function enrichWriting(base: Writing, locale: string, index: number): Writing {
	const descriptions = EXTRA_DESCRIPTIONS[locale] ?? EXTRA_DESCRIPTIONS.en;
	const tags = DEMO_TAGS.default;

	return {
		...base,
		ckbContent: base.ckbContent
			? {
					...base.ckbContent,
					description:
						base.ckbContent.description ??
						`${descriptions} (${index + 1})`,
				}
			: null,
		kmrContent: base.kmrContent
			? {
					...base.kmrContent,
					description:
						base.kmrContent.description ??
						`${descriptions} (${index + 1})`,
				}
			: null,
		tags: {
			ckb: tags.ckb,
			kmr: tags.kmr,
		},
		keywords: {
			ckb: ["ئەدەبی کوردی"],
			kmr: ["edebiyata kurdî"],
		},
		seriesInfo:
			index % 6 === 0
				? {
						seriesId: DEMO_SERIES_ID,
						seriesName: "KHI Literary Series",
						seriesOrder: (index % 3) + 1,
						parentBookId: index % 3 === 0 ? null : 10_001,
						totalBooks: 3,
						isParent: index % 3 === 0,
					}
				: base.seriesInfo,
		createdAt: `2026-04-${String(10 + (index % 18)).padStart(2, "0")}T10:00:00`,
		updatedAt: `2026-04-${String(12 + (index % 16)).padStart(2, "0")}T14:30:00`,
	};
}

function cardToWriting(
	card: ReturnType<typeof getAllDemoWritingCards>[number],
	index: number,
	locale: string,
): Writing {
	const hasKmr = locale === "ku" || index % 2 === 0;

	return enrichWriting(
		{
			id: card.id,
			contentLanguages: hasKmr ? ["CKB", "KMR"] : ["CKB"],
			ckbCoverUrl: card.coverUrl,
			kmrCoverUrl: card.coverUrl,
			hoverCoverUrl: card.hoverCoverUrl,
			ckbContent: {
				title: card.title,
				description: card.excerpt,
				writer: card.writer,
				fileUrl: card.fileUrl,
				fileFormat: (card.fileFormat ?? "PDF") as "PDF",
				fileSizeBytes: card.fileSizeBytes,
				pageCount: card.pageCount,
				genre: card.freeTextGenre,
			},
			kmrContent: hasKmr
				? {
						title: card.title,
						description: card.excerpt,
						writer: card.writer,
						fileUrl: card.fileUrl,
						fileFormat: (card.fileFormat ?? "PDF") as "PDF",
						fileSizeBytes: card.fileSizeBytes,
						pageCount: card.pageCount,
						genre: card.freeTextGenre,
					}
				: null,
			topic: card.topicName
				? { id: 1, nameCkb: card.topicName, nameKmr: card.topicName }
				: null,
			bookGenres: card.genres,
			publishedByInstitute: card.publishedByInstitute,
			tags: { ckb: [], kmr: [] },
			keywords: { ckb: [], kmr: [] },
			seriesInfo: {
				seriesId: `series-${card.id}`,
				seriesName: card.seriesName,
				seriesOrder: Number.parseInt(card.seriesOrderLabel, 10) || 1,
				parentBookId: null,
				totalBooks: null,
				isParent: false,
			},
			createdAt: "2026-04-11T21:30:00",
			updatedAt: "2026-04-11T21:30:00",
		},
		locale,
		index,
	);
}

const demoWritingsCache = new Map<string, Writing[]>();

function getDemoWritings(locale: string): Writing[] {
	const cached = demoWritingsCache.get(locale);
	if (cached) {
		return cached;
	}

	const cards = getAllDemoWritingCards(locale);
	const writings = cards.map((card, index) => cardToWriting(card, index, locale));
	demoWritingsCache.set(locale, writings);
	return writings;
}

export function getDemoWritingById(
	locale: string,
	id: number,
	labels: { ckbLanguage: string; kmrLanguage: string },
): ResolvedWritingDetail | null {
	const writing = getDemoWritings(locale).find((item) => item.id === id);
	if (!writing) {
		return null;
	}
	return resolveWritingDetail(locale, writing, labels);
}

export function getDemoWritingSeries(
	locale: string,
	seriesId: string,
	currentId: number,
): ResolvedSeriesBook[] {
	const books = getDemoWritings(locale).filter(
		(w) => w.seriesInfo.seriesId === seriesId,
	);

	if (books.length <= 1) {
		return [];
	}

	return resolveSeriesBooks(
		locale,
		books.map((book) => ({
			id: book.id,
			titleCkb: book.ckbContent?.title ?? null,
			titleKmr: book.kmrContent?.title ?? null,
			seriesOrder: book.seriesInfo.seriesOrder,
		})),
		currentId,
	);
}

export function getDemoSeriesResponse(seriesId: string): SeriesResponse | null {
	if (seriesId !== DEMO_SERIES_ID) {
		return null;
	}

	return {
		seriesId: DEMO_SERIES_ID,
		seriesName: "KHI Literary Series",
		totalBooks: 3,
		books: [
			{
				id: 10_001,
				titleCkb: "Volume I",
				titleKmr: "Cild I",
				seriesOrder: 1,
				createdAt: "2026-04-09T10:00:00",
			},
			{
				id: 10_007,
				titleCkb: "Volume II",
				titleKmr: "Cild II",
				seriesOrder: 2,
				createdAt: "2026-04-10T09:00:00",
			},
			{
				id: 10_013,
				titleCkb: "Volume III",
				titleKmr: "Cild III",
				seriesOrder: 3,
				createdAt: "2026-04-11T08:00:00",
			},
		],
	};
}
