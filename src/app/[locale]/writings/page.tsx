import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { buildGenreLabels } from "@/components/writing/writing-card";
import { WritingCarousel } from "@/components/writing/writing-carousel";
import { WritingHero } from "@/components/writing/writing-hero";
import { WritingsShell } from "@/components/writing/writings-shell";
import { getWritingsCarousel } from "@/lib/api/writings";
import { homeInsetClass } from "@/lib/layout";
import { localeAlternates } from "@/lib/seo/metadata";
import { cn } from "@/lib/utils";
import { loadWritingsPageData } from "@/lib/writing/page-data";
import { WRITINGS_STILL } from "@/lib/writing/still";
import type { BookGenre } from "@/types/writing";

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
	const items = await getWritingsCarousel(locale);

	const translateGenre = (genre: BookGenre) => t(`genres.${genre}`);

	const cards = items.map((item) => ({
		id: item.id,
		title: item.title,
		writer: item.writer,
		excerpt: item.excerpt,
		coverUrl: item.coverUrl,
		hoverCoverUrl: item.hoverCoverUrl,
		genreLabels: buildGenreLabels(
			item.genres,
			item.freeTextGenre,
			translateGenre,
		),
		topicName: item.topicName,
		fileUrl: item.fileUrl,
		downloadLabel: t("carousel.download"),
	}));

	const heroTexture =
		items.find((item) => item.coverUrl)?.coverUrl ?? WRITINGS_STILL;

	const direction = locale === "ckb" ? "rtl" : "ltr";

	const pageData = await loadWritingsPageData(locale, t, navT, {
		searchParams: resolvedSearchParams,
	});

	return (
		<main className="bg-background">
			<div className={cn(homeInsetClass, "pb-0")}>
				<div className="overflow-hidden border border-border bg-surface">
					<WritingHero
						eyebrow={t("page.hero.eyebrow")}
						title={t("page.hero.title")}
						titleEmphasis={t("page.hero.titleEmphasis")}
						textureUrl={heroTexture}
						showEmphasisItalic={locale === "ku"}
					/>

					<WritingCarousel
						cards={cards}
						direction={direction}
						emptyLabel={t("carousel.empty")}
						carouselLabel={t("carousel.autoplayLabel")}
					/>
				</div>
			</div>

			<WritingsShell
				id="writings-content"
				title={pageData.gridTitle}
				categoryCarouselItems={pageData.categoryCarouselItems}
				carouselNavLabel={t("grid.categoryNavLabel")}
				cards={pageData.gridCards}
				currentPage={pageData.listing.currentPage}
				totalPages={pageData.listing.totalPages}
				totalElements={pageData.listing.totalElements}
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
