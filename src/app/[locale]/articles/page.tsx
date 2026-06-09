import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { ArticlesBento } from "@/components/articles/articles-bento";
import { ArticlesHero } from "@/components/articles/articles-hero";
import { ArticlesShell } from "@/components/articles/articles-shell";
import {
	ARTICLE_CATEGORIES,
	type ArticleCategory,
	filterArticles,
	getArticles,
	getFeaturedArticles,
	getLatestArticles,
	isValidCategory,
	paginateArticles,
} from "@/lib/mock/articles";

export async function generateMetadata({
	params,
}: {
	params: Promise<{ locale: string }>;
}): Promise<Metadata> {
	const { locale } = await params;
	const t = await getTranslations({ locale, namespace: "Articles" });

	return {
		title: t("pageTitle"),
		description: t("metaDescription"),
	};
}

type ArticlesPageProps = {
	params: Promise<{ locale: string }>;
	searchParams: Promise<{
		category?: string;
		q?: string;
		page?: string;
	}>;
};

export default async function ArticlesPage({
	params,
	searchParams,
}: ArticlesPageProps) {
	const { locale } = await params;
	const { category, q, page: pageParam } = await searchParams;
	setRequestLocale(locale);

	const t = await getTranslations("Articles");
	const activeCategory =
		category && isValidCategory(category) ? category : null;
	const activeQuery = q?.trim() || null;
	const page = Math.max(1, Number.parseInt(pageParam ?? "1", 10) || 1);

	const categoryLabels = Object.fromEntries(
		ARTICLE_CATEGORIES.map((key) => [key, t(`categories.${key}`)]),
	) as Record<ArticleCategory, string>;

	const allArticles = getArticles(locale);
	const filtered = filterArticles(allArticles, {
		category: activeCategory,
		query: activeQuery,
	});
	const { items, totalPages, currentPage } = paginateArticles(
		filtered,
		page,
	);

	const featuredItems = getFeaturedArticles(locale);
	const latestItems = getLatestArticles(locale);

	const sectionTitle = activeCategory
		? t("sections.filtered", {
				category: categoryLabels[activeCategory],
			})
		: t("sections.allArticles");

	return (
		<main className="-mt-26 sm:-mt-30">
			<ArticlesHero
				eyebrow={t("hero.eyebrow")}
				title={t("hero.title")}
				description={t("hero.description")}
			/>

			<ArticlesBento
				locale={locale}
				categoryLabels={categoryLabels}
				spotlightLabel={t("sections.spotlight")}
			/>

			<ArticlesShell
				articles={items}
				featured={featuredItems}
				latest={latestItems}
				locale={locale}
				sectionTitle={sectionTitle}
				sectionDescription={t("sections.browseDescription")}
				categoryLabels={categoryLabels}
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
