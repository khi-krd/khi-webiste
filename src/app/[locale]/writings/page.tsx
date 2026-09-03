import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { VisuallyHidden } from "@/components/ui/visually-hidden";
import { WritingsShell } from "@/components/writing/writings-shell";
import { localeAlternates } from "@/lib/seo/metadata";
import { loadWritingsPageData } from "@/lib/writing/page-data";

export async function generateMetadata({
	params,
}: {
	params: Promise<{ locale: string }>;
}): Promise<Metadata> {
	const { locale } = await params;
	const t = await getTranslations({ locale, namespace: "Writings" });

	return {
		alternates: localeAlternates(locale, "/writings"),
		title: t("pageTitle"),
		description: t("metaDescription"),
	};
}

type WritingsPageProps = {
	params: Promise<{ locale: string }>;
	searchParams: Promise<{
		genre?: string;
		q?: string;
		writer?: string;
		tag?: string;
		keyword?: string;
		page?: string;
		sort?: string;
	}>;
};

export default async function WritingsPage({
	params,
	searchParams,
}: WritingsPageProps) {
	const { locale } = await params;
	const resolvedSearchParams = await searchParams;
	setRequestLocale(locale);

	const t = await getTranslations("Writings");
	const navT = await getTranslations("Nav");

	const pageData = await loadWritingsPageData(locale, t, navT, {
		searchParams: resolvedSearchParams,
	});

	return (
		<main className="bg-background">
			<VisuallyHidden as="h1">{t("pageTitle")}</VisuallyHidden>

			<WritingsShell
				id="writings-content"
				title={pageData.gridTitle}
				categoryCarouselItems={pageData.categoryCarouselItems}
				carouselNavLabel={t("grid.categoryNavLabel")}
				cards={pageData.gridCards}
				currentPage={pageData.listing.currentPage}
				totalPages={pageData.listing.totalPages}
				activeGenre={pageData.activeGenre}
				activeQuery={pageData.activeQuery}
				activeWriter={pageData.activeWriter}
				activeTag={pageData.activeTag}
				activeKeyword={pageData.activeKeyword}
				activeSort={pageData.activeSort}
				genreLabels={pageData.genreLabels}
				writers={pageData.writers}
				noResultsMessage={pageData.noResultsMessage}
				paginationLabel={t("pagination.label")}
				previousLabel={t("pagination.previous")}
				nextLabel={t("pagination.next")}
			/>
		</main>
	);
}
