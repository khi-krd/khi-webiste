import type { NewsCategory, NewsItem } from "@/lib/mock/news";
import { NEWS_CATEGORIES } from "@/lib/mock/news";
import { parseMediaGallery, parseMediaKind } from "@/lib/project/media";
import { plainTextFromRichContent } from "@/lib/rich-text";
import type { News, NewsContent } from "@/types/news";

const EXCERPT_MAX_LENGTH = 160;

function firstNonBlank(
	...values: (string | null | undefined)[]
): string | null {
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

function resolveNewsContent(locale: string, news: News): NewsContent | null {
	if (locale === "ckb") {
		return news.ckbContent ?? news.kmrContent ?? null;
	}
	return news.kmrContent ?? news.ckbContent ?? null;
}

function resolveCategoryName(locale: string, news: News): string | null {
	if (locale === "ckb") {
		return firstNonBlank(news.category?.ckbName, news.category?.kmrName);
	}
	return firstNonBlank(news.category?.kmrName, news.category?.ckbName);
}

const CATEGORY_ALIASES: Record<string, NewsCategory> = {
	culture: "culture",
	çand: "culture",
	کلتور: "culture",
	کەلتوور: "culture",
	history: "history",
	dîrok: "history",
	مێژوو: "history",
	language: "language",
	ziman: "language",
	زمان: "language",
	heritage: "heritage",
	mîras: "heritage",
	میرات: "heritage",
	society: "society",
	civak: "society",
	کۆمەڵگا: "society",
};

function mapCategory(locale: string, news: News): NewsCategory {
	const name = resolveCategoryName(locale, news);
	if (!name) {
		return "culture";
	}

	const normalized = name.trim().toLowerCase();
	const direct = CATEGORY_ALIASES[normalized];
	if (direct) {
		return direct;
	}

	for (const [alias, category] of Object.entries(CATEGORY_ALIASES)) {
		if (normalized.includes(alias)) {
			return category;
		}
	}

	return NEWS_CATEGORIES.includes(normalized as NewsCategory)
		? (normalized as NewsCategory)
		: "culture";
}

export function resolveNewsItem(locale: string, news: News): NewsItem | null {
	const content = resolveNewsContent(locale, news);
	const title = content?.title?.trim();
	if (!title) {
		return null;
	}

	const description = content?.description?.trim() || undefined;
	const plainDescription = description
		? plainTextFromRichContent(description)
		: "";
	const excerpt = plainDescription
		? truncate(plainDescription, EXCERPT_MAX_LENGTH)
		: "";

	const coverUrl =
		locale === "ckb"
			? firstNonBlank(news.coverUrl, news.coverThumbnailUrl)
			: firstNonBlank(news.coverUrl, news.coverThumbnailUrl);

	const tags =
		locale === "ckb"
			? (news.tags?.ckb ?? news.tags?.kmr ?? [])
			: (news.tags?.kmr ?? news.tags?.ckb ?? []);

	return {
		id: String(news.id),
		slug: String(news.id),
		title,
		excerpt,
		description,
		category: mapCategory(locale, news),
		publishedAt:
			news.datePublished ?? news.createdAt ?? new Date().toISOString(),
		coverMediaType: parseMediaKind(news.coverMediaType, coverUrl),
		coverUrl: coverUrl ?? "/menu/1.jpg",
		coverThumbnailUrl: news.coverThumbnailUrl ?? null,
		mediaGallery: parseMediaGallery(news.mediaGallery, locale),
		tags,
		image: {
			url: coverUrl ?? "/menu/1.jpg",
			alt: title,
		},
	};
}

/** Drop repeated rows the API may return (same id). */
export function dedupeNewsItems(items: NewsItem[]): NewsItem[] {
	const seen = new Set<string>();
	const result: NewsItem[] = [];

	for (const item of items) {
		if (seen.has(item.id)) {
			continue;
		}
		seen.add(item.id);
		result.push(item);
	}

	return result;
}

export function resolveNewsItems(locale: string, items: News[]): NewsItem[] {
	return dedupeNewsItems(
		items
			.map((item) => resolveNewsItem(locale, item))
			.filter((item): item is NewsItem => item != null),
	);
}
