import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { VisuallyHidden } from "@/components/ui/visually-hidden";
import {
	VideoFilmstrip,
	type VideoFilmstripFrame,
} from "@/components/video/video-filmstrip";
import { VideoShell } from "@/components/video/video-shell";
import { VideoShortFilmsPromo } from "@/components/video/video-shortfilms-promo";
import { localeAlternates } from "@/lib/seo/metadata";
import { loadVideoPageData } from "@/lib/video/page-data";
import {
	isShortFilm,
	shortFilmDetailHref,
	videoDetailHref,
} from "@/lib/video/resolve";

export async function generateMetadata({
	params,
}: {
	params: Promise<{ locale: string }>;
}): Promise<Metadata> {
	const { locale } = await params;
	const t = await getTranslations({ locale, namespace: "Video" });

	return {
		alternates: localeAlternates(locale, "/videos"),
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

	// Two drifting rows want a good deal more art than a static shelf did —
	// deduped by cover so the same frame never passes twice in one loop.
	const seenCovers = new Set<string>();
	const heroFrames: VideoFilmstripFrame[] = [];
	for (const item of pageData.listing.items) {
		const src = item.coverUrl ?? item.hoverCoverUrl;
		if (!src || seenCovers.has(src)) continue;
		seenCovers.add(src);
		heroFrames.push({
			id: item.id,
			src,
			title: item.title,
			href: isShortFilm(item)
				? shortFilmDetailHref(item.id)
				: videoDetailHref(item.id),
			previewSrc: item.previewVideoUrl,
		});
		if (heroFrames.length >= 12) break;
	}

	return (
		<main className="bg-background">
			<VisuallyHidden as="h1">{t("pageTitle")}</VisuallyHidden>

			<VideoFilmstrip frames={heroFrames} label={t("pageTitle")} />

			<VideoShortFilmsPromo />

			<div id="videos-content" className="scroll-mt-26 sm:scroll-mt-30">
				<VideoShell
					title={t("grid.allTitle")}
					cards={pageData.listing.items}
					showFeatured={pageData.showFeatured}
					featuredLead={pageData.featuredLead}
					currentPage={pageData.listing.currentPage}
					totalPages={pageData.listing.totalPages}
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
