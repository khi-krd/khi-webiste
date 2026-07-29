import { ArrowLeftIcon, ArrowRightIcon } from "@heroicons/react/24/outline";
import NextImage from "next/image";
import { getTranslations } from "next-intl/server";
import { AudioAlbumVideo } from "@/components/audio/audio-album-video";
import { AudioAttachmentSlider } from "@/components/audio/audio-attachment-slider";
import { AudioAttachments } from "@/components/audio/audio-attachments";
import { AudioBookletReader } from "@/components/audio/audio-booklet-reader";
import { AudioBrochures } from "@/components/audio/audio-brochures";
import { AudioCard, type AudioCardProps } from "@/components/audio/audio-card";
import { AudioPlayButton } from "@/components/audio/audio-play-button";
import {
	type AudioStat,
	AudioStatsStrip,
} from "@/components/audio/audio-stats-strip";
import {
	AudioTracklist,
	type AudioTracklistLabels,
} from "@/components/audio/audio-tracklist";
import { AudioWaveform } from "@/components/audio/audio-waveform";
import {
	ScrollReveal,
	ScrollRevealItem,
} from "@/components/motion/scroll-reveal";
import { Badge } from "@/components/ui/badge";
import { DirectionalIcon } from "@/components/ui/directional-icon";
import { Link } from "@/components/ui/link";
import { RichText } from "@/components/ui/rich-text";
import { TaxonomyBadgeLink } from "@/components/ui/taxonomy-badge-link";
import { formatDuration, formatFileSize } from "@/lib/audio/format";
import { audioDetailHref } from "@/lib/audio/resolve";
import { soundTypeLabel } from "@/lib/audio/sound-types";
import { homeInsetClass } from "@/lib/layout";
import {
	audioSoundTypeHref,
	audioTagHref,
	audioTopicHref,
} from "@/lib/search/taxonomy-href";
import { cn } from "@/lib/utils";
import type { ResolvedAudioCard, ResolvedAudioDetail } from "@/types/audio";

type AudioPostViewProps = {
	detail: ResolvedAudioDetail;
	locale: string;
	previous: ResolvedAudioCard | null;
	next: ResolvedAudioCard | null;
	related: ResolvedAudioCard[];
};

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
			<dd className="mt-0.5 text-small leading-snug text-foreground">
				{children}
			</dd>
		</div>
	);
}

function MetaRow({ children }: { children: React.ReactNode }) {
	return (
		<div className="grid grid-cols-1 gap-x-6 gap-y-3 border-b border-border py-3 sm:grid-cols-2 sm:gap-x-10 sm:py-3.5">
			{children}
		</div>
	);
}

function AdjacentLink({
	item,
	label,
	direction,
}: {
	item: ResolvedAudioCard;
	label: string;
	direction: "previous" | "next";
}) {
	const isNext = direction === "next";

	return (
		<Link
			href={audioDetailHref(item.id)}
			variant="nav"
			className={cn(
				"group flex flex-col gap-3 py-8 no-underline sm:py-10",
				isNext &&
					"items-end border-t border-border text-end sm:border-t-0 sm:border-s sm:ps-8",
				!isNext && "items-start text-start sm:pe-8",
			)}
		>
			<span className="label flex items-center gap-2 font-medium">
				<DirectionalIcon
					icon={isNext ? ArrowRightIcon : ArrowLeftIcon}
					className="size-3.5"
				/>
				{label}
			</span>
			<span className="font-heading text-h3 font-bold text-foreground underline decoration-transparent decoration-2 underline-offset-4 transition-[text-decoration-color] duration-300 group-fine:decoration-current">
				{item.title}
			</span>
		</Link>
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
		yearLabel:
			card.publishmentYear != null ? String(card.publishmentYear) : null,
		memories: card.albumOfMemories,
		memoriesLabel: card.albumOfMemories ? t("memories.badge") : null,
		queue: card.queue,
	};
}

export async function AudioPostView({
	detail,
	locale,
	previous,
	next,
	related,
}: AudioPostViewProps) {
	const t = await getTranslations("Audio");

	const typeLabel = soundTypeLabel((key) => t(key), detail.soundType);
	const stateLabel = t(
		detail.trackState === "MULTI" ? "state.multi" : "state.single",
	);
	const isAlbum = detail.trackState === "MULTI";
	const playLabel = isAlbum ? t("post.playAlbum") : t("post.playTrack");

	const stats: AudioStat[] = [
		detail.totalDurationSeconds != null &&
			detail.totalDurationSeconds > 0 && {
				key: "duration",
				label: t("stats.duration"),
				value: formatDuration(detail.totalDurationSeconds) ?? "",
			},
		detail.totalSizeBytes != null &&
			detail.totalSizeBytes > 0 && {
				key: "size",
				label: t("stats.size"),
				value: formatFileSize(detail.totalSizeBytes) ?? "",
			},
		detail.totalTracks != null && {
			key: "tracks",
			label: t("stats.tracks"),
			value: String(detail.totalTracks),
		},
		detail.publishmentYear != null && {
			key: "year",
			label: t("stats.year"),
			value: String(detail.publishmentYear),
		},
	].filter(Boolean) as AudioStat[];

	const tracklistLabels: AudioTracklistLabels = {
		title: t("post.tracklist"),
		subheading:
			isAlbum && detail.albumName
				? detail.cdNumber != null
					? `${detail.albumName} — ${t("post.cdNumber", { number: detail.cdNumber })}`
					: detail.albumName
				: null,
		fileDetails: t("post.fileDetails"),
		techSection: t("post.techSection"),
		contentSection: t("post.contentSection"),
		externalLink: t("post.externalLink"),
		channelLabels: {
			STEREO: t("channel.STEREO"),
			MONO: t("channel.MONO"),
		},
		techLabels: {
			fileFormat: t("tech.fileFormat"),
			bitRate: t("tech.bitRate"),
			sampleRate: t("tech.sampleRate"),
			audioChannel: t("tech.audioChannel"),
			size: t("tech.size"),
			duration: t("tech.duration"),
			form: t("tech.form"),
			genre: t("tech.genre"),
			recordingVenue: t("tech.recordingVenue"),
			year: t("tech.year"),
		},
	};

	const languageLabels = detail.contentLanguages.map((language) =>
		t(`post.languages.${language}`),
	);

	const hasCredits = Boolean(detail.reader || detail.directors.length > 0);

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

	return (
		<article>
			<div className={cn("pt-10 pb-10 sm:pt-12 lg:pb-16", homeInsetClass)}>
				<ScrollReveal>
					<ScrollRevealItem>
						<Link
							href="/audio"
							className="group inline-flex w-fit items-center gap-2 no-underline"
						>
							<DirectionalIcon
								icon={ArrowLeftIcon}
								className="size-4 text-muted transition-colors group-fine:text-foreground"
							/>
							<span className="label font-medium transition-colors group-fine:text-foreground">
								{t("post.back")}
							</span>
						</Link>
					</ScrollRevealItem>

					<ScrollRevealItem>
						<div className="mt-10 grid gap-10 lg:grid-cols-[minmax(0,20rem)_minmax(0,1fr)] lg:items-start lg:gap-14 xl:grid-cols-[minmax(0,24rem)_minmax(0,1fr)] xl:gap-20">
							{/* cover column — Album-of-Memories records read as a framed,
				    aged photograph: sunken mat around a sepia-tinted cover.
				    Everything else stays flush and untinted. */}
							<div className="w-full max-w-sm lg:sticky lg:top-32">
								<div
									className={cn(
										detail.albumOfMemories &&
											"border border-border bg-sunken p-3 sm:p-4",
									)}
								>
									<div className="relative aspect-square w-full overflow-hidden border border-border bg-sunken">
										{detail.coverUrl ? (
											<NextImage
												src={detail.coverUrl}
												alt=""
												fill
												priority
												sizes="(max-width: 1024px) 80vw, 24rem"
												className={cn(
													"object-cover brightness-[0.94] saturate-[0.9]",
													detail.albumOfMemories &&
														"sepia-[0.3] contrast-[0.96]",
												)}
											/>
										) : (
											<div
												aria-hidden
												className="flex h-full w-full items-center justify-center"
											>
												<span className="font-heading text-display font-bold text-foreground/10">
													{detail.title.charAt(0)}
												</span>
											</div>
										)}
									</div>
								</div>
								<AudioWaveform seedId={detail.id} className="mt-4" />
							</div>

							{/* content column */}
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

								<h1 className="mt-5 font-heading text-h1 font-bold leading-tight text-balance">
									{detail.title}
								</h1>

								{hasCredits ? (
									<p className="mt-3 text-lead text-foreground/80">
										{[detail.reader, ...detail.directors]
											.filter(Boolean)
											.join(" · ")}
									</p>
								) : null}

								{detail.description ? (
									<div className="audio-article-body mt-5 max-w-prose">
										<RichText
											content={detail.description}
											className="text-body leading-relaxed text-foreground/90"
										/>
									</div>
								) : null}

								{detail.queue.length > 0 ? (
									<AudioPlayButton
										queue={detail.queue}
										size="hero"
										label={playLabel}
										className="mt-7"
									/>
								) : null}

								<dl className="mt-7 border-t border-border">
									{detail.topicName || detail.terms ? (
										<MetaRow>
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
											{detail.terms ? (
												<MetaCell label={t("post.terms")}>
													{detail.terms}
												</MetaCell>
											) : null}
										</MetaRow>
									) : null}
									{detail.genre || detail.locations.length > 0 ? (
										<MetaRow>
											{detail.genre ? (
												<MetaCell label={t("post.genre")}>
													{detail.genre}
												</MetaCell>
											) : null}
											{detail.locations.length > 0 ? (
												<MetaCell label={t("post.locations")}>
													{detail.locations.join(" · ")}
												</MetaCell>
											) : null}
										</MetaRow>
									) : null}
									{detail.reader || detail.directors.length > 0 ? (
										<MetaRow>
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
										</MetaRow>
									) : null}
									{languageLabels.length > 0 ? (
										<MetaRow>
											<MetaCell label={t("post.languagesLabel")}>
												{languageLabels.join(" · ")}
											</MetaCell>
										</MetaRow>
									) : null}
								</dl>
							</div>
						</div>
					</ScrollRevealItem>

					{stats.length > 0 ? (
						<ScrollRevealItem>
							<AudioStatsStrip stats={stats} className="mt-12 lg:mt-16" />
						</ScrollRevealItem>
					) : null}

					<ScrollRevealItem>
						<AudioTracklist
							fileRows={detail.fileRows}
							queue={detail.queue}
							labels={tracklistLabels}
							className="mt-12 lg:mt-16"
						/>
					</ScrollRevealItem>

					{detail.brochures.length > 0 ? (
						<ScrollRevealItem>
							<div className="mt-12 lg:mt-16">
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
								className="mt-12 lg:mt-16"
							/>
						</ScrollRevealItem>
					) : null}

					{hasSources ? (
						<ScrollRevealItem>
							<div className="mt-12 space-y-12 lg:mt-16">
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

					{detail.tags.length > 0 || detail.keywords.length > 0 ? (
						<ScrollRevealItem>
							<div className="mt-12 space-y-6 border-t border-border pt-8 text-start lg:mt-16">
								{detail.tags.length > 0 ? (
									<div>
										<p className="label font-medium">{t("post.tags")}</p>
										<div className="mt-3 flex flex-wrap gap-2">
											{detail.tags.map((tag) => (
												<TaxonomyBadgeLink
													key={tag}
													href={audioTagHref(tag)}
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
										<p className="label font-medium">{t("post.keywords")}</p>
										<div className="mt-3 flex flex-wrap gap-2">
											{detail.keywords.map((keyword) => (
												<TaxonomyBadgeLink
													key={keyword}
													href={audioTagHref(keyword)}
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

					<ScrollRevealItem>
						<footer className="mt-12 flex flex-wrap items-center justify-between gap-4 border-t border-border pt-6 text-start lg:mt-16">
							<p className="text-label text-muted">
								{t("post.published")}: {formatDate(locale, detail.createdAt)}
								{detail.updatedAt !== detail.createdAt ? (
									<>
										{" · "}
										{t("post.updated")}: {formatDate(locale, detail.updatedAt)}
									</>
								) : null}
							</p>
							<Link href="/audio" className="label font-medium no-underline">
								{t("post.back")}
							</Link>
						</footer>
					</ScrollRevealItem>

					{previous || next ? (
						<ScrollRevealItem>
							<nav
								aria-label={t("post.navLabel")}
								className="mt-12 border-t border-border sm:mt-16"
							>
								<div className="grid sm:grid-cols-2">
									{previous ? (
										<AdjacentLink
											item={previous}
											label={t("post.previous")}
											direction="previous"
										/>
									) : (
										<div aria-hidden className="hidden sm:block" />
									)}
									{next ? (
										<AdjacentLink
											item={next}
											label={t("post.next")}
											direction="next"
										/>
									) : null}
								</div>
							</nav>
						</ScrollRevealItem>
					) : null}

					{relatedCards.length > 0 ? (
						<ScrollRevealItem>
							<section
								aria-labelledby="audio-related-heading"
								className="mt-12 border-t border-border pt-10 text-start sm:mt-16 sm:pt-12"
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
