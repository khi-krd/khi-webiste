import { ArrowsPointingOutIcon } from "@heroicons/react/24/outline";
import { getTranslations } from "next-intl/server";
import {
	ScrollReveal,
	ScrollRevealItem,
} from "@/components/motion/scroll-reveal";
import { CoverLightbox } from "@/components/ui/cover-lightbox";
import { Link } from "@/components/ui/link";
import { RichText } from "@/components/ui/rich-text";
import { TaxonomyBadgeLink } from "@/components/ui/taxonomy-badge-link";
import { VideoPlayerFrame } from "@/components/video/video-player-frame";
import type { VideoPosterCardProps } from "@/components/video/video-poster-card";
import { VideoRelatedGrid } from "@/components/video/video-related-grid";
import { homeInsetClass } from "@/lib/layout";
import {
	videoMemoriesHref,
	videoTagHref,
	videoTopicHref,
	videoTypeHref,
} from "@/lib/search/taxonomy-href";
import { cn } from "@/lib/utils";
import {
	formatDuration,
	formatFileSizeMb,
	formatPublishmentDate,
} from "@/lib/video/format";
import type { ResolvedVideoDetail } from "@/types/video";

type VideoDetailViewProps = {
	detail: ResolvedVideoDetail;
	locale: string;
	relatedVideos?: VideoPosterCardProps[];
};

function MetaRow({
	label,
	children,
	ltr = false,
}: {
	label: string;
	children: React.ReactNode;
	ltr?: boolean;
}) {
	return (
		<div className="flex items-baseline justify-between gap-4 py-3 first:pt-0 last:pb-0">
			<dt className="shrink-0 text-label text-muted">{label}</dt>
			<dd
				className="text-end text-small font-medium leading-snug text-foreground"
				dir={ltr ? "ltr" : undefined}
			>
				{children}
			</dd>
		</div>
	);
}

function formatDate(locale: string, iso: string): string {
	try {
		return new Intl.DateTimeFormat(locale, {
			year: "numeric",
			month: "long",
			day: "numeric",
		}).format(new Date(iso));
	} catch {
		return iso;
	}
}

export async function VideoDetailView({
	detail,
	locale,
	relatedVideos = [],
}: VideoDetailViewProps) {
	const t = await getTranslations("Video");

	const credits = [detail.director, detail.producer]
		.filter(Boolean)
		.join(" · ");
	const durationLabel = formatDuration(detail.durationSeconds);
	const fileSizeLabel = formatFileSizeMb(detail.fileSizeMb);
	const publishedDateLabel = formatPublishmentDate(
		locale,
		detail.publishmentDate,
	);
	const languageLabels = detail.contentLanguages.map((language) =>
		t(`detail.languages.${language}`),
	);

	const metaRows: {
		label: string;
		value: React.ReactNode;
		ltr?: boolean;
	}[] = [
		detail.director
			? { label: t("detail.director"), value: detail.director }
			: null,
		detail.producer
			? { label: t("detail.producer"), value: detail.producer }
			: null,
		detail.location
			? { label: t("detail.location"), value: detail.location }
			: null,
		detail.topicName
			? {
					label: t("detail.topic"),
					value:
						detail.topicId != null ? (
							<Link
								href={videoTopicHref(detail.topicId)}
								className="underline decoration-border underline-offset-2 transition-colors fine-hover:decoration-foreground"
							>
								{detail.topicName}
							</Link>
						) : (
							detail.topicName
						),
				}
			: null,
		durationLabel
			? { label: t("detail.duration"), value: durationLabel, ltr: true }
			: null,
		detail.resolution
			? { label: t("detail.resolution"), value: detail.resolution, ltr: true }
			: null,
		detail.fileFormat
			? {
					label: t("detail.fileFormat"),
					value: detail.fileFormat.toUpperCase(),
					ltr: true,
				}
			: null,
		publishedDateLabel
			? { label: t("detail.publishmentDate"), value: publishedDateLabel }
			: null,
		fileSizeLabel
			? { label: t("detail.fileSize"), value: fileSizeLabel, ltr: true }
			: null,
		languageLabels.length > 0
			? {
					label: t("detail.languagesLabel"),
					value: languageLabels.join(" · "),
				}
			: null,
	].filter((row): row is NonNullable<typeof row> => row != null);

	/** "Screening card": surface panel that sits on the sunken screening band. */
	const metaAside =
		metaRows.length > 0 ? (
			<aside className="border border-border bg-surface p-4 sm:p-5">
				<dl className="divide-y divide-border">
					{metaRows.map((row) => (
						<MetaRow key={row.label} label={row.label} ltr={row.ltr}>
							{row.value}
						</MetaRow>
					))}
				</dl>
			</aside>
		) : null;

	return (
		<article>
			<ScrollReveal>
				<ScrollRevealItem>
					{/* Full-bleed sunken screening band: the player sits on a recessed stage. */}
					<section className="mt-6 border-y border-border bg-sunken sm:mt-8">
						<div
							className={cn("mx-auto max-w-6xl py-6 sm:py-8", homeInsetClass)}
						>
							<VideoPlayerFrame
								playerKind={detail.playerKind}
								playableSrc={detail.playableSrc}
								title={detail.title}
								poster={detail.coverUrl}
								noSourceLabel={t("detail.noSource")}
								aside={metaAside}
								surfaceOverlay={
									detail.coverUrl ? (
										<CoverLightbox
											src={detail.coverUrl}
											alt={detail.title}
											caption={detail.title}
											closeLabel={t("detail.lightboxClose")}
											triggerLabel={t("detail.lightboxOpen")}
											className="absolute end-3 top-3 z-10 max-w-fit"
										>
											<span className="inline-flex size-9 items-center justify-center border border-border/80 bg-background/90 text-foreground transition-colors fine-hover:bg-background">
												<ArrowsPointingOutIcon aria-hidden className="size-4" />
											</span>
										</CoverLightbox>
									) : null
								}
								clips={detail.clips}
								activeClipNumber={detail.activeClipNumber}
								clipLabels={{
									title: t("detail.clips"),
									play: t("detail.playClip"),
									nowPlaying: t("detail.nowPlaying"),
								}}
							/>
						</div>
					</section>
				</ScrollRevealItem>

				<div className={cn("pb-8 lg:pb-10", homeInsetClass)}>
					<div className="mx-auto max-w-6xl">
						{/* The band's bottom hairline opens this zone — pt only, no extra rule. */}
						<ScrollRevealItem className="pt-8">
							<div className="flex flex-wrap items-center gap-2">
								<TaxonomyBadgeLink
									href={videoTypeHref(detail.videoType)}
									variant="outline"
									size="sm"
								>
									{t(`typeBadge.${detail.videoType}`)}
								</TaxonomyBadgeLink>
								{detail.topicName && detail.topicId != null ? (
									<TaxonomyBadgeLink
										href={videoTopicHref(detail.topicId)}
										variant="subtle"
										size="sm"
									>
										{detail.topicName}
									</TaxonomyBadgeLink>
								) : null}
								{detail.albumOfMemories ? (
									<TaxonomyBadgeLink
										href={videoMemoriesHref()}
										variant="outline"
										size="sm"
									>
										{t("card.memoriesBadge")}
									</TaxonomyBadgeLink>
								) : null}
							</div>

							<h1 className="mt-5 font-heading text-h1 font-bold leading-tight text-balance">
								{detail.title}
							</h1>

							{credits ? (
								<p className="mt-3 text-lead text-foreground/80">{credits}</p>
							) : null}

							{detail.description ? (
								<RichText
									content={detail.description}
									className="mt-5 max-w-prose text-body leading-relaxed text-foreground/90"
								/>
							) : null}
						</ScrollRevealItem>

						{detail.tags.length > 0 || detail.keywords.length > 0 ? (
							<ScrollRevealItem>
								<div className="mt-8 space-y-6 border-t border-border pt-8">
									{detail.tags.length > 0 ? (
										<div>
											<p className="label font-medium">{t("detail.tags")}</p>
											<div className="mt-3 flex flex-wrap gap-2">
												{detail.tags.map((tag) => (
													<TaxonomyBadgeLink
														key={tag}
														href={videoTagHref(tag)}
														variant="outline"
														size="sm"
													>
														{tag}
													</TaxonomyBadgeLink>
												))}
											</div>
										</div>
									) : null}
									{detail.keywords.length > 0 ? (
										<div>
											<p className="label font-medium">
												{t("detail.keywords")}
											</p>
											<div className="mt-3 flex flex-wrap gap-2">
												{detail.keywords.map((keyword) => (
													<TaxonomyBadgeLink
														key={keyword}
														href={videoTagHref(keyword)}
														variant="subtle"
														size="sm"
													>
														{keyword}
													</TaxonomyBadgeLink>
												))}
											</div>
										</div>
									) : null}
								</div>
							</ScrollRevealItem>
						) : null}

						{relatedVideos.length > 0 ? (
							<ScrollRevealItem>
								<VideoRelatedGrid
									title={t("detail.related")}
									cards={relatedVideos}
									className="mt-8"
								/>
							</ScrollRevealItem>
						) : null}

						<ScrollRevealItem>
							<footer className="mt-8 flex flex-wrap items-center justify-between gap-4 border-t border-border pt-6">
								<p className="text-label text-muted">
									{t("detail.published")}:{" "}
									{formatDate(locale, detail.createdAt)}
									{detail.updatedAt !== detail.createdAt ? (
										<>
											{" · "}
											{t("detail.updated")}:{" "}
											{formatDate(locale, detail.updatedAt)}
										</>
									) : null}
								</p>
								<Link href="/videos" className="label font-medium no-underline">
									{t("detail.back")}
								</Link>
							</footer>
						</ScrollRevealItem>
					</div>
				</div>
			</ScrollReveal>
		</article>
	);
}
