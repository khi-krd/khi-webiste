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
	getNewsFilterOptions,
	isKnownCategory,
	paginateNews,
} from "@/lib/api/news";
import { localeAlternates } from "@/lib/seo/metadata";

export async function generateMetadata({
	params,
}: {
	params: Promise<{ locale: string }>;
}): Promise<Metadata> {
	const { locale } = await params;
	const t = await getTranslations({ locale, namespace: "News" });

	return {
		alternates: localeAlternates(locale, "/news"),
		title: t("pageTitle"),
		description: t("metaDescription"),
	};
}

type NewsPageProps = {
	params: Promise<{ locale: string }>;
	searchParams: Promise<{
		category?: string;
		subcategory?: string;
		tag?: string;
		keyword?: string;
		q?: string;
		page?: string;
	}>;
};

export default async function NewsPage({
	params,
	searchParams,
}: NewsPageProps) {
	const { locale } = await params;
	const {
		category,
		subcategory,
		tag,
		keyword,
		q,
		page: pageParam,
	} = await searchParams;
	setRequestLocale(locale);

	const t = await getTranslations("News");
	const { categories, subCategories, tags, keywords } =
		await getNewsFilterOptions(locale);
	const activeCategory =
		category && isKnownCategory(category, categories) ? category : null;
	const activeSubCategory =
		subcategory && isKnownCategory(subcategory, subCategories)
			? subcategory
			: null;
	// Tag and keyword are free text upstream (no enum, no 500 risk) — a trimmed,
	// non-empty term is the only precondition the endpoints have.
	const activeTag = tag?.trim() || null;
	const activeKeyword = keyword?.trim() || null;
	const activeQuery = q?.trim() || null;
	const page = Math.max(1, Number.parseInt(pageParam ?? "1", 10) || 1);

	const activeCategoryLabel = activeCategory
		? (categories.find((entry) => entry.key === activeCategory)?.label ??
			activeCategory)
		: null;
	const activeSubCategoryLabel = activeSubCategory
		? (subCategories.find((entry) => entry.key === activeSubCategory)?.label ??
			activeSubCategory)
		: null;

	const newsFilter = {
		category: activeCategory,
		subcategory: activeSubCategory,
		tag: activeTag,
		keyword: activeKeyword,
		query: activeQuery,
	};

	const allNews = await getNews(locale, newsFilter);
	const filtered = filterNews(allNews, newsFilter);
	const { items, totalPages, currentPage } = paginateNews(filtered, page);

	const featuredItems = await getFeaturedNews(locale);
	const latestItems = await getLatestNews(locale);

	// Category and sub-category share the taxonomy wording; a free-text tag or
	// keyword names the term it matched instead.
	const taxonomyLabel = activeSubCategoryLabel ?? activeCategoryLabel;
	let sectionTitle = t("sections.allNews");
	if (taxonomyLabel) {
		sectionTitle = t("sections.filtered", { category: taxonomyLabel });
	} else if (activeTag) {
		sectionTitle = t("sections.filteredByTag", { tag: activeTag });
	} else if (activeKeyword) {
		sectionTitle = t("sections.filteredByKeyword", { keyword: activeKeyword });
	}

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
				subCategories={subCategories}
				tags={tags}
				keywords={keywords}
				currentPage={currentPage}
				totalPages={totalPages}
				activeCategory={activeCategory}
				activeSubCategory={activeSubCategory}
				activeTag={activeTag}
				activeKeyword={activeKeyword}
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
