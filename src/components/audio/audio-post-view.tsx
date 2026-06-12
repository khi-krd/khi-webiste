import { ArrowLeftIcon } from "@heroicons/react/24/outline";
import NextImage from "next/image";
import { getTranslations } from "next-intl/server";
import { AudioAttachments } from "@/components/audio/audio-attachments";
import { AudioBrochures } from "@/components/audio/audio-brochures";
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
import { Badge } from "@/components/ui/badge";
import { DirectionalIcon } from "@/components/ui/directional-icon";
import { Link } from "@/components/ui/link";
import { formatDuration, formatFileSize } from "@/lib/audio/format";
import { soundTypeLabel } from "@/lib/audio/sound-types";
import { homeInsetClass } from "@/lib/layout";
import { cn } from "@/lib/utils";
import type { ResolvedAudioDetail } from "@/types/audio";

type AudioPostViewProps = {
	detail: ResolvedAudioDetail;
	locale: string;
};

function MetaCell({
	label,
	children,
}: {
	label: string;
	children: React.ReactNode;
}) {
	return (
		<div className="flex flex-col gap-2 py-5 sm:py-6">
			<dt className="label font-medium">{label}</dt>
			<dd className="text-small text-foreground">{children}</dd>
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

export async function AudioPostView({ detail, locale }: AudioPostViewProps) {
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
			recordingVenue: t("tech.recordingVenue"),
			year: t("tech.year"),
		},
	};

	const languageLabels = detail.contentLanguages.map((language) =>
		t(`post.languages.${language}`),
	);

	const hasCredits = Boolean(detail.reader || detail.directors.length > 0);

	return (
		<article>
			<div className={cn("pt-30 pb-10 sm:pt-34 lg:pb-12", homeInsetClass)}>
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
											detail.albumOfMemories && "sepia-[0.3] contrast-[0.96]",
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
					<div className="min-w-0">
						<div className="flex flex-wrap items-center gap-2">
							{detail.thisProjectOfInstitute ? (
								<Badge variant="solid" size="sm">
									{t("card.instituteBadge")}
								</Badge>
							) : null}
							<Badge variant="outline" size="sm">
								{typeLabel}
							</Badge>
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
							<p className="mt-5 max-w-prose text-body leading-relaxed text-foreground/90">
								{detail.description}
							</p>
						) : null}

						{detail.queue.length > 0 ? (
							<AudioPlayButton
								queue={detail.queue}
								size="hero"
								label={playLabel}
								className="mt-7"
							/>
						) : null}

						<dl className="mt-8 grid grid-cols-1 gap-x-8 border-t border-border sm:grid-cols-2 [&>*]:border-b [&>*]:border-border">
							{detail.topicName ? (
								<MetaCell label={t("post.topic")}>{detail.topicName}</MetaCell>
							) : null}
							{detail.terms ? (
								<MetaCell label={t("post.terms")}>{detail.terms}</MetaCell>
							) : null}
							{detail.genre ? (
								<MetaCell label={t("post.genre")}>{detail.genre}</MetaCell>
							) : null}
							{detail.locations.length > 0 ? (
								<MetaCell label={t("post.locations")}>
									{detail.locations.join(" · ")}
								</MetaCell>
							) : null}
							{detail.reader ? (
								<MetaCell label={t("post.reader")}>{detail.reader}</MetaCell>
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
						</dl>
					</div>
				</div>

				{stats.length > 0 ? (
					<AudioStatsStrip stats={stats} className="mt-12 lg:mt-16" />
				) : null}

				<AudioTracklist
					fileRows={detail.fileRows}
					queue={detail.queue}
					labels={tracklistLabels}
					className="mt-12 lg:mt-16"
				/>

				{detail.brochures.length > 0 ? (
					<div className="mt-12 lg:mt-16">
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
					</div>
				) : null}

				{detail.attachments.length > 0 ? (
					<div className="mt-12 lg:mt-16">
						<AudioAttachments
							title={t("attachments.title")}
							attachments={detail.attachments}
							untitledLabel={t("attachments.untitled")}
							downloadLabel={t("attachments.download")}
							typeLabels={{
								PDF: t("attachments.types.PDF"),
								VIDEO: t("attachments.types.VIDEO"),
								IMAGE: t("attachments.types.IMAGE"),
								AUDIO: t("attachments.types.AUDIO"),
								OTHER: t("attachments.types.OTHER"),
							}}
						/>
					</div>
				) : null}

				{detail.tags.length > 0 || detail.keywords.length > 0 ? (
					<div className="mt-12 space-y-6 border-t border-border pt-8 lg:mt-16">
						{detail.tags.length > 0 ? (
							<div>
								<p className="label font-medium">{t("post.tags")}</p>
								<div className="mt-3 flex flex-wrap gap-2">
									{detail.tags.map((tag) => (
										<Badge key={tag} variant="outline" size="sm">
											{tag}
										</Badge>
									))}
								</div>
							</div>
						) : null}
						{detail.keywords.length > 0 ? (
							<div>
								<p className="label font-medium">{t("post.keywords")}</p>
								<div className="mt-3 flex flex-wrap gap-2">
									{detail.keywords.map((keyword) => (
										<Badge key={keyword} variant="subtle" size="sm">
											{keyword}
										</Badge>
									))}
								</div>
							</div>
						) : null}
					</div>
				) : null}

				<footer className="mt-12 flex flex-wrap items-center justify-between gap-4 border-t border-border pt-6 lg:mt-16">
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
			</div>
		</article>
	);
}
