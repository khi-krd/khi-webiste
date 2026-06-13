import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { VideoHero } from "@/components/video/video-hero";
import { VideoShell } from "@/components/video/video-shell";
import { VideoShortFilmsPromo } from "@/components/video/video-shortfilms-promo";
import { loadVideoPageData } from "@/lib/video/page-data";

export async function generateMetadata({
	params,
}: {
	params: Promise<{ locale: string }>;
}): Promise<Metadata> {
	const { locale } = await params;
	const t = await getTranslations({ locale, namespace: "Video" });

	return {
		title: t("pageTitle"),
		description: t("metaDescription"),
	};
}

type VideoPageProps = {
	params: Promise<{ locale: string }>;
	searchParams: Promise<{
		type?: string;
		topic?: string;
		memories?: string;
		q?: string;
		page?: string;
	}>;
};

export default async function VideosPage({
	params,
	searchParams,
}: VideoPageProps) {
	const { locale } = await params;
	const resolvedSearchParams = await searchParams;
	setRequestLocale(locale);

	const t = await getTranslations("Video");
	const pageData = await loadVideoPageData(locale, t, {
		searchParams: resolvedSearchParams,
	});

	if (pageData.redirectToShortFilms) {
		redirect("/videos/shortfilms");
	}

	const heroCovers = [
		...new Set(
			pageData.listing.items.flatMap((item) =>
				[item.coverUrl, item.hoverCoverUrl].filter(
					(cover): cover is string => Boolean(cover),
				),
			),
		),
	].slice(0, 6);

	return (
		<main className="bg-background">
			<VideoHero
				eyebrow={t("page.hero.eyebrow")}
				title={t("page.hero.title")}
				titleEmphasis={t("page.hero.titleEmphasis")}
				description={t("page.hero.description")}
				cta={t("page.hero.cta")}
				covers={heroCovers}
				showEmphasisItalic={locale === "ku" || locale === "en"}
			/>

			<VideoShortFilmsPromo />

			<div id="videos-content">
				<VideoShell
					title={t("grid.allTitle")}
					cards={pageData.listing.items}
					showFeatured={pageData.showFeatured}
					currentPage={pageData.listing.currentPage}
					totalPages={pageData.listing.totalPages}
					totalElements={pageData.listing.totalElements}
					topics={pageData.topics}
					activeType={pageData.activeType}
					activeTopicId={pageData.activeTopicId}
					activeMemories={pageData.activeMemories}
					activeQuery={pageData.activeQuery}
					noResultsMessage={pageData.noResultsMessage}
				/>
			</div>
		</main>
	);
}
