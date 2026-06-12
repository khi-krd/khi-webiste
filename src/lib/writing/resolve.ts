import type {
	ResolvedSeriesBook,
	ResolvedWritingCard,
	ResolvedWritingDetail,
	TopicInfo,
	Writing,
	WritingContent,
	WritingFileOffer,
} from "@/types/writing";

const EXCERPT_MAX_LENGTH = 120;

function firstNonBlank(...values: (string | null | undefined)[]): string | null {
	for (const value of values) {
		if (value && value.trim().length > 0) {
			return value;
		}
	}
	return null;
}

function truncate(text: string, maxLength: number): string {
	if (text.length <= maxLength) {
		return text;
	}
	return `${text.slice(0, maxLength).trimEnd()}…`;
}

export function resolveContent(
	locale: string,
	writing: Writing,
): WritingContent | null {
	if (locale === "ku") {
		return writing.kmrContent ?? writing.ckbContent;
	}
	if (locale === "ckb") {
		return writing.ckbContent ?? writing.kmrContent;
	}
	return writing.ckbContent ?? writing.kmrContent;
}

export function resolveCoverUrl(locale: string, writing: Writing): string | null {
	if (locale === "ku") {
		return firstNonBlank(
			writing.kmrCoverUrl,
			writing.ckbCoverUrl,
			writing.hoverCoverUrl,
		);
	}
	if (locale === "ckb") {
		return firstNonBlank(
			writing.ckbCoverUrl,
			writing.kmrCoverUrl,
			writing.hoverCoverUrl,
		);
	}
	return firstNonBlank(
		writing.ckbCoverUrl,
		writing.kmrCoverUrl,
		writing.hoverCoverUrl,
	);
}

export function resolveTopicName(
	locale: string,
	topic: TopicInfo | null,
): string | null {
	if (!topic) {
		return null;
	}
	if (locale === "ku") {
		return firstNonBlank(topic.nameKmr, topic.nameCkb);
	}
	return firstNonBlank(topic.nameCkb, topic.nameKmr);
}

export function resolveWritingCard(
	locale: string,
	writing: Writing,
): ResolvedWritingCard | null {
	const content = resolveContent(locale, writing);
	if (!content?.title) {
		return null;
	}

	const seriesOrder = writing.seriesInfo.seriesOrder ?? 1;
	const description = content.description?.trim() ?? "";

	return {
		id: writing.id,
		title: content.title,
		writer: content.writer?.trim() ?? "",
		excerpt: description ? truncate(description, EXCERPT_MAX_LENGTH) : "",
		coverUrl: resolveCoverUrl(locale, writing),
		hoverCoverUrl: writing.hoverCoverUrl,
		genres: writing.bookGenres,
		freeTextGenre: content.genre,
		topicName: resolveTopicName(locale, writing.topic),
		seriesName: writing.seriesInfo.seriesName?.trim() || null,
		publishedByInstitute: writing.publishedByInstitute,
		seriesOrderLabel: String(Math.round(seriesOrder)).padStart(2, "0"),
		fileUrl: content.fileUrl,
		fileFormat: content.fileFormat,
		pageCount: content.pageCount,
		fileSizeBytes: content.fileSizeBytes,
	};
}

export function formatFileSize(bytes: number | null): string | null {
	if (bytes == null || bytes <= 0) {
		return null;
	}
	const units = ["B", "KB", "MB", "GB"] as const;
	let size = bytes;
	let unitIndex = 0;
	while (size >= 1024 && unitIndex < units.length - 1) {
		size /= 1024;
		unitIndex += 1;
	}
	const formatted =
		unitIndex === 0 ? String(Math.round(size)) : size.toFixed(1);
	return `${formatted} ${units[unitIndex]}`;
}

function resolveBilingualStrings(
	locale: string,
	ckb: string[],
	kmr: string[],
): string[] {
	if (locale === "ku") {
		return kmr.length > 0 ? kmr : ckb;
	}
	if (locale === "ckb") {
		return ckb.length > 0 ? ckb : kmr;
	}
	return [...new Set([...ckb, ...kmr])];
}

function isPartOfSeries(writing: Writing): boolean {
	const { seriesId, totalBooks } = writing.seriesInfo;
	return Boolean(seriesId && (totalBooks == null || totalBooks > 1));
}

export function resolveWritingDetail(
	locale: string,
	writing: Writing,
	labels: {
		ckbLanguage: string;
		kmrLanguage: string;
	},
): ResolvedWritingDetail | null {
	const content = resolveContent(locale, writing);
	if (!content?.title) {
		return null;
	}

	const description = content.description?.trim() ?? "";
	const fileOffers: WritingFileOffer[] = [];

	if (writing.ckbContent?.fileUrl || writing.contentLanguages.includes("CKB")) {
		fileOffers.push({
			language: "CKB",
			languageLabel: labels.ckbLanguage,
			title: writing.ckbContent?.title ?? null,
			fileUrl: writing.ckbContent?.fileUrl ?? null,
			fileFormat: writing.ckbContent?.fileFormat ?? null,
			pageCount: writing.ckbContent?.pageCount ?? null,
			fileSizeLabel: formatFileSize(writing.ckbContent?.fileSizeBytes ?? null),
		});
	}

	if (writing.kmrContent?.fileUrl || writing.contentLanguages.includes("KMR")) {
		fileOffers.push({
			language: "KMR",
			languageLabel: labels.kmrLanguage,
			title: writing.kmrContent?.title ?? null,
			fileUrl: writing.kmrContent?.fileUrl ?? null,
			fileFormat: writing.kmrContent?.fileFormat ?? null,
			pageCount: writing.kmrContent?.pageCount ?? null,
			fileSizeLabel: formatFileSize(writing.kmrContent?.fileSizeBytes ?? null),
		});
	}

	const uniqueOffers = fileOffers.filter(
		(offer, index, all) =>
			offer.fileUrl != null ||
			all.findIndex((item) => item.language === offer.language) === index,
	);

	return {
		id: writing.id,
		title: content.title,
		writer: content.writer?.trim() ?? "",
		description,
		coverUrl: resolveCoverUrl(locale, writing),
		hoverCoverUrl: writing.hoverCoverUrl,
		genres: writing.bookGenres,
		freeTextGenre: content.genre,
		topicName: resolveTopicName(locale, writing.topic),
		publishedByInstitute: writing.publishedByInstitute,
		seriesName: writing.seriesInfo.seriesName?.trim() || null,
		seriesId: writing.seriesInfo.seriesId,
		seriesOrder: writing.seriesInfo.seriesOrder,
		seriesTotalBooks: writing.seriesInfo.totalBooks,
		isPartOfSeries: isPartOfSeries(writing),
		tags: resolveBilingualStrings(
			locale,
			writing.tags.ckb,
			writing.tags.kmr,
		),
		keywords: resolveBilingualStrings(
			locale,
			writing.keywords.ckb,
			writing.keywords.kmr,
		),
		fileOffers: uniqueOffers,
		createdAt: writing.createdAt,
		updatedAt: writing.updatedAt,
	};
}

export function resolveSeriesBooks(
	locale: string,
	books: Array<{
		id: number;
		titleCkb: string | null;
		titleKmr: string | null;
		seriesOrder: number | null;
	}>,
	currentId: number,
): ResolvedSeriesBook[] {
	return books
		.map((book) => {
			const title =
				locale === "ku"
					? book.titleKmr ?? book.titleCkb
					: book.titleCkb ?? book.titleKmr;
			if (!title) {
				return null;
			}
			return {
				id: book.id,
				title,
				seriesOrder: book.seriesOrder ?? 1,
				isCurrent: book.id === currentId,
			};
		})
		.filter((book): book is ResolvedSeriesBook => book != null)
		.sort((a, b) => a.seriesOrder - b.seriesOrder);
}

export function apiSearchLanguage(locale: string): "ckb" | "kmr" | "both" {
	if (locale === "ku") {
		return "kmr";
	}
	if (locale === "ckb") {
		return "ckb";
	}
	return "both";
}
