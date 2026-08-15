import { ArrowsPointingOutIcon } from "@heroicons/react/24/outline";
import { getTranslations } from "next-intl/server";
import {
	ScrollReveal,
	ScrollRevealItem,
} from "@/components/motion/scroll-reveal";
import { CoverLightbox } from "@/components/ui/cover-lightbox";
import { Link } from "@/components/ui/link";
import { RichText } from "@/components/ui/rich-text";
import { VideoPlayerFrame } from "@/components/video/video-player-frame";
import type { VideoPosterCardProps } from "@/components/video/video-poster-card";
import { VideoRelatedGrid } from "@/components/video/video-related-grid";
import { Link as NavLink } from "@/i18n/navigation";
import { homeInsetClass } from "@/lib/layout";
import {
	videoMemoriesHref,
	videoTagHref,
	videoTopicHref,
	videoTypeHref,
} from "@/lib/search/taxonomy-href";
import { cn } from "@/lib/utils";
import { formatDuration, formatFileSizeMb } from "@/lib/video/format";
import type { ResolvedVideoDetail } from "@/types/video";

type VideoDetailViewProps = {
	detail: ResolvedVideoDetail;
	relatedVideos?: VideoPosterCardProps[];
};

export async function VideoDetailView({
	detail,
	relatedVideos = [],
}: VideoDetailViewProps) {
	const t = await getTranslations("Video");

	// De-duplicated: the institute is often both director and producer, and
	// "X · X" reads as a mistake in a byline.
	const credits = Array.from(
		new Set([detail.director, detail.producer].filter(Boolean)),
	).join(" · ");
	const durationLabel = formatDuration(detail.durationSeconds);
	const fileSizeLabel = formatFileSizeMb(detail.fileSizeMb);
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

	return (
		<article>
			<ScrollReveal>
				<ScrollRevealItem>
					{/* Dark screening-room hero: liner text on the start side, the
					    player on the end side, mirroring the audio album spread.
					    The player leads on mobile so the film is never below the
					    fold. */}
					{/* Same container recipe as the body below (inset outside,
					    max-w inside) so every zone's text starts on one line.
					    At 2xl every zone widens to 92rem — the full content width
					    of the site's 96rem canvas (96rem − 2×2rem inset) — so the
					    start line also matches the header and other pages. */}
					<section
						className={cn(
							"bg-foreground text-primary-foreground",
							homeInsetClass,
						)}
					>
						<div className="mx-auto max-w-6xl py-8 sm:py-10 2xl:max-w-[92rem]">
							<div className="grid items-center gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,39rem)] lg:gap-12 2xl:grid-cols-[minmax(0,1fr)_minmax(0,48rem)] 2xl:gap-16">
								<div className="min-w-0 text-start">
									<div className="flex flex-wrap items-center gap-2">
										<NavLink
											href={videoTypeHref(detail.videoType)}
											className="bg-background px-3.5 py-1.5 text-label font-semibold text-foreground no-underline transition-opacity fine-hover:opacity-85"
										>
											{t(`typeBadge.${detail.videoType}`)}
										</NavLink>
										{detail.topicName && detail.topicId != null ? (
											<NavLink
												href={videoTopicHref(detail.topicId)}
												className="border border-primary-foreground/40 px-3.5 py-1.5 text-label font-semibold text-primary-foreground no-underline transition-colors fine-hover:border-primary-foreground"
											>
												{detail.topicName}
											</NavLink>
										) : null}
										{detail.albumOfMemories ? (
											<NavLink
												href={videoMemoriesHref()}
												className="border border-primary-foreground/40 px-3.5 py-1.5 text-label font-semibold text-primary-foreground no-underline transition-colors fine-hover:border-primary-foreground"
											>
												{t("card.memoriesBadge")}
											</NavLink>
										) : null}
									</div>

									<h1 className="mt-6 font-heading text-[clamp(1.9rem,3.2vw,2.75rem)] font-bold leading-[1.35] text-balance text-primary-foreground 2xl:text-[3.25rem]">
										{detail.title}
									</h1>

									{credits ? (
										<p className="mt-3 text-small text-primary-foreground/65">
											{credits}
										</p>
									) : null}
								</div>

								<div className="min-w-0 max-lg:order-first">
									<VideoPlayerFrame
										playerKind={detail.playerKind}
										playableSrc={detail.playableSrc}
										title={detail.title}
										poster={detail.coverUrl}
										noSourceLabel={t("detail.noSource")}
										className="shadow-[0_14px_40px_rgba(0,0,0,0.45)]"
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
														<ArrowsPointingOutIcon
															aria-hidden
															className="size-4"
														/>
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
							</div>
						</div>
					</section>
				</ScrollRevealItem>

				{/* Always-visible spec strip under the hero: quiet label beside a
				    confident value, flowing inline like a film print's edge codes. */}
				{metaRows.length > 0 ? (
					<ScrollRevealItem>
						<section
							className={cn("border-b border-border bg-sunken", homeInsetClass)}
						>
							<dl className="mx-auto flex max-w-6xl flex-wrap items-baseline gap-x-8 gap-y-2.5 py-4 text-start 2xl:max-w-[92rem]">
								{metaRows.map((row) => (
									<div key={row.label} className="flex items-baseline gap-2.5">
										<dt className="label font-medium text-muted">
											{row.label}
										</dt>
										<dd
											dir={row.ltr ? "ltr" : undefined}
											className="text-small font-bold text-foreground"
										>
											{row.value}
										</dd>
									</div>
								))}
							</dl>
						</section>
					</ScrollRevealItem>
				) : null}

				<div className={cn("pb-8 lg:pb-10", homeInsetClass)}>
					<div className="mx-auto max-w-6xl 2xl:max-w-[92rem]">
						{detail.description ? (
							<ScrollRevealItem className="pt-7">
								<RichText
									content={detail.description}
									className="max-w-4xl text-justify text-body leading-loose text-foreground/85 2xl:text-[1.125rem]"
								/>
							</ScrollRevealItem>
						) : null}

						{detail.tags.length > 0 ? (
							<ScrollRevealItem>
								<div className="mt-8 flex flex-wrap items-baseline gap-x-4 gap-y-2">
									{detail.tags.map((tag) => (
										<NavLink
											key={tag}
											href={videoTagHref(tag)}
											className="text-body font-bold text-brand no-underline transition-opacity fine-hover:opacity-75"
										>
											#{tag}
										</NavLink>
									))}
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
					</div>
				</div>
			</ScrollReveal>
		</article>
	);
}
