import type { NewsCategory, NewsItem } from "@/lib/mock/news";
import { NEWS_CATEGORIES } from "@/lib/mock/news";
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

function stripHtml(html: string): string {
	return html
		.replace(/<[^>]+>/g, " ")
		.replace(/\s+/g, " ")
		.trim();
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

	const descriptionHtml = content?.description?.trim() || undefined;
	const plainDescription = descriptionHtml ? stripHtml(descriptionHtml) : "";
	const excerpt = plainDescription
		? truncate(plainDescription, EXCERPT_MAX_LENGTH)
		: "";

	const coverUrl =
		locale === "ckb"
			? firstNonBlank(news.coverUrl, news.coverThumbnailUrl)
			: firstNonBlank(news.coverUrl, news.coverThumbnailUrl);

	return {
		id: String(news.id),
		slug: String(news.id),
		title,
		excerpt,
		descriptionHtml,
		category: mapCategory(locale, news),
		publishedAt:
			news.datePublished ?? news.createdAt ?? new Date().toISOString(),
		image: {
			url: coverUrl ?? "/menu/1.jpg",
			alt: title,
		},
	};
}

export function resolveNewsItems(locale: string, items: News[]): NewsItem[] {
	return items
		.map((item) => resolveNewsItem(locale, item))
		.filter((item): item is NewsItem => item != null);
}
