import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { VideoHero, type VideoHeroStill } from "@/components/video/video-hero";
import { VideoShell } from "@/components/video/video-shell";
import { VideoShortFilmsPromo } from "@/components/video/video-shortfilms-promo";
import { homeInsetClass } from "@/lib/layout";
import { localeAlternates } from "@/lib/seo/metadata";
import { cn } from "@/lib/utils";
import { formatDuration } from "@/lib/video/format";
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

	const seenCovers = new Set<string>();
	const heroStills: VideoHeroStill[] = [];
	for (const item of pageData.listing.items) {
		const src = item.coverUrl ?? item.hoverCoverUrl;
		if (!src || seenCovers.has(src)) continue;
		seenCovers.add(src);
		heroStills.push({
			src,
			title: item.title,
			href: isShortFilm(item)
				? shortFilmDetailHref(item.id)
				: videoDetailHref(item.id),
			// Only the lead still moves — hover preview + timecode chip.
			previewSrc: heroStills.length === 0 ? item.previewVideoUrl : null,
			durationLabel:
				heroStills.length === 0 ? formatDuration(item.durationSeconds) : null,
		});
		if (heroStills.length >= 5) break;
	}

	return (
		<main className="bg-background">
			<VideoHero
				eyebrow={t("page.hero.eyebrow")}
				title={t("page.hero.title")}
				titleEmphasis={t("page.hero.titleEmphasis")}
				description={t("page.hero.description")}
				ctaLabel={t("page.hero.cta")}
				stills={heroStills}
				showEmphasisItalic={locale === "ku"}
			/>

			{/* Spec strip — the video-detail edge-code idiom promoted to the
			    landing: quiet label, confident value, film-print rhythm. */}
			<section
				aria-label={t("page.stats.label")}
				className="border-b border-border bg-sunken"
			>
				<dl
					className={cn(
						// 2xl:max-w-none — homeInsetClass's 2xl canvas padding replaces the
						// cap there; combining both would crush the content box.
						"mx-auto flex max-w-7xl flex-wrap items-baseline gap-x-8 gap-y-2.5 py-4 text-start 2xl:max-w-none",
						homeInsetClass,
					)}
				>
					<div className="flex items-baseline gap-2">
						<dt className="label font-medium text-muted">
							{t("page.stats.holdings")}
						</dt>
						<dd className="text-small font-bold text-foreground">
							{t("grid.itemCount", {
								count: pageData.listing.totalElements,
								formatted: String(pageData.listing.totalElements),
							})}
						</dd>
					</div>
					<div className="flex items-baseline gap-2">
						<dt className="label font-medium text-muted">
							{t("filter.typeLabel")}
						</dt>
						<dd className="text-small font-bold text-foreground">
							{t("typeBadge.FILM")} · {t("typeBadge.VIDEO_CLIP")}
						</dd>
					</div>
					<div className="flex items-baseline gap-2">
						<dt className="label font-medium text-muted">
							{t("filter.topicLabel")}
						</dt>
						<dd
							dir="ltr"
							className="text-small font-bold text-foreground tabular-nums"
						>
							{String(pageData.topics.length)}
						</dd>
					</div>
				</dl>
			</section>

			<VideoShortFilmsPromo />

			<div id="videos-content" className="scroll-mt-26 sm:scroll-mt-30">
				<VideoShell
					title={t("grid.allTitle")}
					cards={pageData.listing.items}
					showFeatured={pageData.showFeatured}
					featuredLead={pageData.featuredLead}
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
