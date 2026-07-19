import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { NewsBento } from "@/components/news/news-bento";
import { NewsHero } from "@/components/news/news-hero";
import { NewsShell } from "@/components/news/news-shell";
import {
	filterNews,
	getFeaturedNews,
	getLatestNews,
	getNews,
	getNewsCategories,
	isKnownCategory,
	paginateNews,
} from "@/lib/api/news";

export async function generateMetadata({
	params,
}: {
	params: Promise<{ locale: string }>;
}): Promise<Metadata> {
	const { locale } = await params;
	const t = await getTranslations({ locale, namespace: "News" });

	return {
		title: t("pageTitle"),
		description: t("metaDescription"),
	};
}

type NewsPageProps = {
	params: Promise<{ locale: string }>;
	searchParams: Promise<{
		category?: string;
		q?: string;
		page?: string;
	}>;
};

export default async function NewsPage({
	params,
	searchParams,
}: NewsPageProps) {
	const { locale } = await params;
	const { category, q, page: pageParam } = await searchParams;
	setRequestLocale(locale);

	const t = await getTranslations("News");
	const categories = await getNewsCategories(locale);
	const activeCategory =
		category && isKnownCategory(category, categories) ? category : null;
	const activeQuery = q?.trim() || null;
	const page = Math.max(1, Number.parseInt(pageParam ?? "1", 10) || 1);

	const activeCategoryLabel = activeCategory
		? (categories.find((entry) => entry.key === activeCategory)?.label ??
			activeCategory)
		: null;

	const allNews = await getNews(locale, activeQuery, activeCategory);
	const filtered = filterNews(allNews, {
		category: activeCategory,
		query: activeQuery,
	});
	const { items, totalPages, currentPage } = paginateNews(filtered, page);

	const featuredItems = await getFeaturedNews(locale);
	const latestItems = await getLatestNews(locale);

	const sectionTitle = activeCategoryLabel
		? t("sections.filtered", {
				category: activeCategoryLabel,
			})
		: t("sections.allNews");

	return (
		<main>
			<NewsHero
				eyebrow={t("hero.eyebrow")}
				title={t("hero.title")}
				description={t("hero.description")}
			/>

			<NewsBento
				locale={locale}
				categories={categories}
				spotlightLabel={t("sections.spotlight")}
			/>

			<NewsShell
				items={items}
				featured={featuredItems}
				latest={latestItems}
				locale={locale}
				sectionTitle={sectionTitle}
				sectionDescription={t("sections.browseDescription")}
				categories={categories}
				currentPage={currentPage}
				totalPages={totalPages}
				activeCategory={activeCategory}
				activeQuery={activeQuery}
				noResultsMessage={t("search.noResults")}
				paginationLabel={t("pagination.label")}
				previousLabel={t("pagination.previous")}
				nextLabel={t("pagination.next")}
				featuredLabel={t("sidebar.featured")}
				latestLabel={t("sidebar.latest")}
			/>
		</main>
	);
}
