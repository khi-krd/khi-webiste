import { getTranslations } from "next-intl/server";
import { AudioAlbumVideo } from "@/components/audio/audio-album-video";
import { AudioAttachmentSlider } from "@/components/audio/audio-attachment-slider";
import { AudioAttachments } from "@/components/audio/audio-attachments";
import { AudioBookletReader } from "@/components/audio/audio-booklet-reader";
import { AudioBrochures } from "@/components/audio/audio-brochures";
import { AudioCard, type AudioCardProps } from "@/components/audio/audio-card";
import {
	AudioTracklist,
	type AudioTracklistLabels,
} from "@/components/audio/audio-tracklist";
import { AudioWaveform } from "@/components/audio/audio-waveform";
import {
	ScrollReveal,
	ScrollRevealItem,
} from "@/components/motion/scroll-reveal";
import { ProjectCoverImage } from "@/components/projects/project-cover-image";
import { Badge } from "@/components/ui/badge";
import { CoverLightbox } from "@/components/ui/cover-lightbox";
import { Link } from "@/components/ui/link";
import { RichText } from "@/components/ui/rich-text";
import { TaxonomyBadgeLink } from "@/components/ui/taxonomy-badge-link";
import { Link as NavLink } from "@/i18n/navigation";
import { formatDuration, formatFileSize } from "@/lib/audio/format";
import { soundTypeLabel } from "@/lib/audio/sound-types";
import { homeInsetClass } from "@/lib/layout";
import {
	audioSoundTypeHref,
	audioTagHref,
	audioTopicHref,
} from "@/lib/search/taxonomy-href";
import { displayTitleSizeClass } from "@/lib/title-scale";
import { cn } from "@/lib/utils";
import type { ResolvedAudioCard, ResolvedAudioDetail } from "@/types/audio";

type AudioPostViewProps = {
	detail: ResolvedAudioDetail;
	locale: string;
	related: ResolvedAudioCard[];
};

/** One entry in the liner-notes card — quiet label over a confident value. */
function MetaCell({
	label,
	children,
}: {
	label: string;
	children: React.ReactNode;
}) {
	return (
		<div className="min-w-0 text-start">
			<dt className="label font-medium text-muted">{label}</dt>
			<dd className="mt-1 text-small font-bold leading-relaxed text-foreground">
				{children}
			</dd>
		</div>
	);
}

/** ckb has no Intl data — ar-IQ is the closest match (Eastern Arabic digits). */
function formatNumber(locale: string, value: number): string {
	try {
		return new Intl.NumberFormat(locale === "ckb" ? "ar-IQ" : locale, {
			useGrouping: false,
		}).format(value);
	} catch {
		return String(value);
	}
}

function toAudioCardProps(
	card: ResolvedAudioCard,
	t: (key: string, values?: Record<string, number>) => string,
): AudioCardProps {
	const typeLabel = soundTypeLabel((key) => t(key), card.soundType);
	const metaLabel =
		card.trackState === "MULTI"
			? `${typeLabel} · ${t("card.albumTracks", { count: card.totalTracks ?? 0 })}`
			: typeLabel;

	return {
		id: card.id,
		title: card.title,
		subtitle: card.subtitle,
		coverUrl: card.coverUrl,
		hoverCoverUrl: card.hoverCoverUrl,
		metaLabel,
		instituteLabel: card.thisProjectOfInstitute
			? t("card.instituteBadge")
			: null,
		durationLabel: formatDuration(card.totalDurationSeconds),
		memories: card.albumOfMemories,
		memoriesLabel: card.albumOfMemories ? t("memories.badge") : null,
		queue: card.queue,
	};
}

export async function AudioPostView({
	detail,
	locale,
	related,
}: AudioPostViewProps) {
	const t = await getTranslations("Audio");

	const typeLabel = soundTypeLabel((key) => t(key), detail.soundType);
	const stateLabel = t(
		detail.trackState === "MULTI" ? "state.multi" : "state.single",
	);
	const totalSizeLabel =
		detail.totalSizeBytes != null && detail.totalSizeBytes > 0
			? formatFileSize(detail.totalSizeBytes)
			: null;
	const totalDurationLabel =
		detail.totalDurationSeconds != null && detail.totalDurationSeconds > 0
			? formatDuration(detail.totalDurationSeconds)
			: null;

	const tracklistLabels: AudioTracklistLabels = {
		title: t("post.tracklist"),
		externalLink: t("post.externalLink"),
	};

	const languageLabels = detail.contentLanguages.map((language) =>
		t(`post.languages.${language}`),
	);

	const hasCredits = Boolean(detail.reader || detail.directors.length > 0);
	// Guards the liner-notes <dl> so an empty one never draws a stray hairline.
	const hasMeta = Boolean(
		detail.topicName ||
			detail.terms ||
			detail.genre ||
			detail.locations.length > 0 ||
			hasCredits ||
			languageLabels.length > 0 ||
			detail.totalTracks != null ||
			totalDurationLabel ||
			totalSizeLabel,
	);

	const downloadableAttachments = detail.attachments.filter((attachment) => {
		if (attachment.attachmentType === "VIDEO") {
			return false;
		}
		if (
			attachment.attachmentType === "IMAGE" &&
			(attachment.title?.toLowerCase().includes("poster") ||
				attachment.fileUrl?.toLowerCase().includes("poster"))
		) {
			return false;
		}
		return true;
	});

	const imageAttachments = downloadableAttachments.filter(
		(attachment) =>
			attachment.attachmentType === "IMAGE" && Boolean(attachment.fileUrl),
	);
	const fileAttachments = downloadableAttachments.filter(
		(attachment) => attachment.attachmentType !== "IMAGE",
	);
	const hasSources = imageAttachments.length > 0 || fileAttachments.length > 0;

	const relatedCards = related.map((card) => toAudioCardProps(card, t));

	// Hashtag row under the description, set like the news article tags.
	const tagsBlock =
		detail.tags.length > 0 ? (
			<div className="flex flex-wrap items-baseline gap-x-4 gap-y-2 text-start">
				{detail.tags.map((tag) => (
					<NavLink
						key={tag}
						href={audioTagHref(tag)}
						className="text-body font-bold text-brand no-underline transition-opacity fine-hover:opacity-75"
					>
						#{tag}
					</NavLink>
				))}
			</div>
		) : null;

	return (
		<article>
			<div className={cn("pt-10 pb-12 sm:pt-12 sm:pb-16", homeInsetClass)}>
				<ScrollReveal>
					<ScrollRevealItem>
						{/* Open hero — liner text (badges, title, album subtitle, fact
						    pills, play row over waveform grooves) beside the record
						    jacket, shown in full at its own ratio instead of a square
						    crop. Album-of-Memories covers keep the sepia treatment. */}
						<div className="grid items-center gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,29rem)] lg:gap-10 xl:grid-cols-[minmax(0,1fr)_minmax(0,33rem)] xl:gap-14">
							<div className="min-w-0 text-start">
								<div className="flex flex-wrap items-center gap-2">
									{detail.thisProjectOfInstitute ? (
										<Badge variant="solid" size="sm">
											{t("card.instituteBadge")}
										</Badge>
									) : null}
									<TaxonomyBadgeLink
										href={audioSoundTypeHref(detail.soundType)}
										variant="outline"
										size="sm"
									>
										{typeLabel}
									</TaxonomyBadgeLink>
									<Badge variant="subtle" size="sm">
										{stateLabel}
									</Badge>
									{detail.albumOfMemories ? (
										<Badge variant="outline" size="sm">
											{t("memories.badge")}
										</Badge>
									) : null}
								</div>

								<h1
									className={cn(
										"display-title mt-4",
										displayTitleSizeClass(detail.title),
									)}
								>
									{detail.title}
								</h1>

								{detail.queue.length > 0 ? (
									<AudioWaveform
										seedId={detail.id}
										barCount={72}
										className="mt-8 h-11 min-w-0"
										barClassName="bg-brand/40"
									/>
								) : null}
							</div>

							{/* Full jacket — natural ratio, click to enlarge. First on
							    mobile so the artwork leads, beside the text from lg up. */}
							<figure className="min-w-0 max-lg:order-first">
								{detail.coverUrl ? (
									<CoverLightbox
										src={detail.coverUrl}
										alt={detail.title}
										caption={detail.title}
										closeLabel={t("brochures.close")}
									>
										<div className="overflow-hidden rounded-md border border-border">
											<ProjectCoverImage
												src={detail.coverUrl}
												alt={detail.title}
												priority
												naturalRatio
												sizes="(max-width: 1024px) 100vw, 33rem"
												imageClassName={
													detail.albumOfMemories
														? "sepia-[0.3] contrast-[0.96]"
														: undefined
												}
											/>
										</div>
									</CoverLightbox>
								) : (
									<div
										aria-hidden
										className="flex aspect-[4/3] w-full items-center justify-center rounded-md border border-border bg-sunken"
									>
										<span className="font-heading text-display font-bold text-foreground/10">
											{detail.title.charAt(0)}
										</span>
									</div>
								)}
							</figure>
						</div>
					</ScrollRevealItem>

					{detail.description || hasMeta ? (
						<ScrollRevealItem>
							{/* Liner notes — the bio under an "about" heading + hairline
							    rule, with the credits fine print collected on a recessed
							    card beside it (below it on small screens). */}
							<div className="mt-10 grid items-start gap-8 text-start sm:mt-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,23rem)] lg:gap-10 xl:gap-12">
								{detail.description ? (
									<div className="min-w-0">
										<div className="audio-article-body max-w-prose">
											<RichText
												content={detail.description}
												className="text-body leading-relaxed text-foreground/90"
											/>
										</div>
										{tagsBlock ? (
											<div className="mt-8 sm:mt-10">{tagsBlock}</div>
										) : null}
									</div>
								) : null}

								{hasMeta ? (
									<dl className="grid min-w-0 grid-cols-2 gap-x-5 gap-y-4 rounded-md bg-sunken p-5 sm:p-6">
										{detail.topicName ? (
											<MetaCell label={t("post.topic")}>
												{detail.topicId != null ? (
													<Link
														href={audioTopicHref(detail.topicId)}
														className="underline decoration-border underline-offset-2 transition-colors fine-hover:decoration-foreground"
													>
														{detail.topicName}
													</Link>
												) : (
													detail.topicName
												)}
											</MetaCell>
										) : null}
										{detail.genre ? (
											<MetaCell label={t("post.genre")}>
												{detail.genre}
											</MetaCell>
										) : null}
										{detail.terms ? (
											<MetaCell label={t("post.terms")}>
												{detail.terms}
											</MetaCell>
										) : null}
										{detail.locations.length > 0 ? (
											<MetaCell label={t("post.locations")}>
												{detail.locations.join(" · ")}
											</MetaCell>
										) : null}
										{detail.reader ? (
											<MetaCell label={t("post.reader")}>
												{detail.reader}
											</MetaCell>
										) : null}
										{detail.directors.length > 0 ? (
											<MetaCell label={t("post.directors")}>
												{detail.directors.join(" · ")}
											</MetaCell>
										) : null}
										{languageLabels.length > 0 ? (
											<MetaCell label={t("post.languagesLabel")}>
												{languageLabels.join(" · ")}
											</MetaCell>
										) : null}
										{detail.totalTracks != null ? (
											<MetaCell label={t("stats.tracks")}>
												{t("stats.trackCount", {
													count: formatNumber(locale, detail.totalTracks),
												})}
											</MetaCell>
										) : null}
										{totalDurationLabel ? (
											<MetaCell label={t("stats.duration")}>
												<span dir="ltr">{totalDurationLabel}</span>
											</MetaCell>
										) : null}
										{totalSizeLabel ? (
											<MetaCell label={t("stats.size")}>
												<span dir="ltr">{totalSizeLabel}</span>
											</MetaCell>
										) : null}
									</dl>
								) : null}
							</div>
						</ScrollRevealItem>
					) : null}

					<ScrollRevealItem>
						<AudioTracklist
							fileRows={detail.fileRows}
							queue={detail.queue}
							labels={tracklistLabels}
							fallbackThumbUrl={detail.coverUrl}
							className="mt-10 sm:mt-12"
						/>
					</ScrollRevealItem>

					{detail.brochures.length > 0 ? (
						<ScrollRevealItem>
							<div className="mt-10 sm:mt-12">
								{detail.albumOfMemories ? (
									<AudioBookletReader
										title={t("brochures.title")}
										items={detail.brochures}
										labels={{
											previous: t("brochures.previous"),
											next: t("brochures.next"),
											zoomIn: t("brochures.zoomIn"),
											zoomOut: t("brochures.zoomOut"),
											fullscreen: t("brochures.fullscreen"),
											exitFullscreen: t("brochures.exitFullscreen"),
										}}
									/>
								) : (
									<AudioBrochures
										title={t("brochures.title")}
										items={detail.brochures}
										openLabel={t("brochures.open")}
										closeLabel={t("brochures.close")}
										previousLabel={t("brochures.previous")}
										nextLabel={t("brochures.next")}
										metadataLabels={{
											dimensions: t("brochures.metadata.dimensions"),
											fileSize: t("brochures.metadata.fileSize"),
											fileSizeBytes: t("brochures.metadata.fileSizeBytes"),
											mimeType: t("brochures.metadata.mimeType"),
											aspectRatio: t("brochures.metadata.aspectRatio"),
											sortOrder: t("brochures.metadata.sortOrder"),
											externalUrl: t("brochures.metadata.externalUrl"),
											embedUrl: t("brochures.metadata.embedUrl"),
										}}
									/>
								)}
							</div>
						</ScrollRevealItem>
					) : null}

					{detail.video ? (
						<ScrollRevealItem>
							<AudioAlbumVideo
								title={t("video.title")}
								video={detail.video}
								className="mt-10 sm:mt-12"
							/>
						</ScrollRevealItem>
					) : null}

					{hasSources ? (
						<ScrollRevealItem>
							<div className="mt-10 space-y-8 sm:mt-12">
								{imageAttachments.length > 0 ? (
									<AudioAttachmentSlider
										title={t("attachments.title")}
										attachments={imageAttachments}
										untitledLabel={t("attachments.untitled")}
										openLabel={t("brochures.open")}
										closeLabel={t("brochures.close")}
										previousLabel={t("brochures.previous")}
										nextLabel={t("brochures.next")}
										metadataLabels={{
											dimensions: t("brochures.metadata.dimensions"),
											fileSize: t("brochures.metadata.fileSize"),
											fileSizeBytes: t("brochures.metadata.fileSizeBytes"),
											mimeType: t("brochures.metadata.mimeType"),
											aspectRatio: t("brochures.metadata.aspectRatio"),
											sortOrder: t("brochures.metadata.sortOrder"),
											externalUrl: t("brochures.metadata.externalUrl"),
											embedUrl: t("brochures.metadata.embedUrl"),
										}}
									/>
								) : null}
								{fileAttachments.length > 0 ? (
									<AudioAttachments
										title={
											imageAttachments.length > 0
												? t("attachments.filesTitle")
												: t("attachments.title")
										}
										attachments={fileAttachments}
										untitledLabel={t("attachments.untitled")}
										typeLabels={{
											PDF: t("attachments.types.PDF"),
											VIDEO: t("attachments.types.VIDEO"),
											IMAGE: t("attachments.types.IMAGE"),
											AUDIO: t("attachments.types.AUDIO"),
											OTHER: t("attachments.types.OTHER"),
										}}
									/>
								) : null}
							</div>
						</ScrollRevealItem>
					) : null}

					{!detail.description && tagsBlock ? (
						<ScrollRevealItem>
							<div className="mt-10 sm:mt-12">{tagsBlock}</div>
						</ScrollRevealItem>
					) : null}

					{relatedCards.length > 0 ? (
						<ScrollRevealItem>
							<section
								aria-labelledby="audio-related-heading"
								className="mt-10 border-t border-border pt-8 text-start sm:mt-12"
							>
								<h2
									id="audio-related-heading"
									className="font-heading text-h2 font-bold text-balance"
								>
									{t("post.related")}
								</h2>
								<div className="mt-6 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
									{relatedCards.map((card) => (
										<AudioCard key={card.id} {...card} />
									))}
								</div>
							</section>
						</ScrollRevealItem>
					) : null}
				</ScrollReveal>
			</div>
		</article>
	);
}
