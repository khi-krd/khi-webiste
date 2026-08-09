import {
	ArrowTopRightOnSquareIcon,
	ChevronDownIcon,
} from "@heroicons/react/24/outline";
import NextImage from "next/image";
import { AudioPlayButton } from "@/components/audio/audio-play-button";
import { formatDuration, formatFileSize } from "@/lib/audio/format";
import { cn } from "@/lib/utils";
import type { PlayerTrackPayload, ResolvedAudioFileRow } from "@/types/audio";

export type AudioTracklistLabels = {
	title: string;
	subheading: string | null;
	fileDetails: string;
	techSection: string;
	contentSection: string;
	externalLink: string;
	channelLabels: Record<"STEREO" | "MONO", string>;
	techLabels: {
		fileFormat: string;
		bitRate: string;
		sampleRate: string;
		audioChannel: string;
		size: string;
		duration: string;
		form: string;
		genre: string;
		recordingVenue: string;
		year: string;
	};
};

type AudioTracklistProps = {
	fileRows: ResolvedAudioFileRow[];
	queue: PlayerTrackPayload[];
	labels: AudioTracklistLabels;
	className?: string;
};

type MetaEntry = { key: string; label: string; value: string; ltr?: boolean };

function MetaSection({
	heading,
	entries,
}: {
	heading: string;
	entries: MetaEntry[];
}) {
	if (entries.length === 0) {
		return null;
	}

	return (
		<section className="text-start">
			<h3 className="label font-medium text-muted">{heading}</h3>
			<dl className="mt-2 flex flex-wrap gap-x-8 gap-y-3">
				{entries.map((entry) => (
					<div key={entry.key} className="min-w-0">
						<dt className="text-label text-muted">{entry.label}</dt>
						<dd
							dir={entry.ltr ? "ltr" : undefined}
							className="mt-0.5 text-small font-medium text-foreground"
						>
							{entry.value}
						</dd>
					</div>
				))}
			</dl>
		</section>
	);
}

function trackNo(index: number): string {
	return String(index + 1).padStart(2, "0");
}

function buildTechnicalEntries(
	row: ResolvedAudioFileRow,
	labels: AudioTracklistLabels,
): MetaEntry[] {
	const durationLabel = formatDuration(row.durationSeconds);

	return [
		durationLabel && {
			key: "duration",
			label: labels.techLabels.duration,
			value: durationLabel,
			ltr: true,
		},
		row.sizeBytes != null &&
			row.sizeBytes > 0 && {
				key: "size",
				label: labels.techLabels.size,
				value: formatFileSize(row.sizeBytes) ?? "",
				ltr: true,
			},
		row.bitRate && {
			key: "bitRate",
			label: labels.techLabels.bitRate,
			value: row.bitRate,
			ltr: true,
		},
		row.sampleRate && {
			key: "sampleRate",
			label: labels.techLabels.sampleRate,
			value: row.sampleRate,
			ltr: true,
		},
		row.audioChannel && {
			key: "audioChannel",
			label: labels.techLabels.audioChannel,
			value: labels.channelLabels[row.audioChannel],
		},
		row.fileFormat && {
			key: "fileFormat",
			label: labels.techLabels.fileFormat,
			value: row.fileFormat,
			ltr: true,
		},
	].filter(Boolean) as MetaEntry[];
}

function buildContentEntries(
	row: ResolvedAudioFileRow,
	labels: AudioTracklistLabels,
): MetaEntry[] {
	return [
		row.publishmentYear != null && {
			key: "year",
			label: labels.techLabels.year,
			value: String(row.publishmentYear),
			ltr: true,
		},
		row.form && {
			key: "form",
			label: labels.techLabels.form,
			value: row.form,
		},
		row.genre && {
			key: "genre",
			label: labels.techLabels.genre,
			value: row.genre,
		},
		row.recordingVenue && {
			key: "recordingVenue",
			label: labels.techLabels.recordingVenue,
			value: row.recordingVenue,
		},
	].filter(Boolean) as MetaEntry[];
}

/**
 * Ordered file rows with play controls, set like the printed tracklist on the
 * back of a record sleeve: numbered hairline rows, tabular durations, no
 * surface box. Technical + content metadata sits behind a collapsed
 * “show more” details toggle (mirrors the admin editor).
 */
export function AudioTracklist({
	fileRows,
	queue,
	labels,
	className,
}: AudioTracklistProps) {
	if (fileRows.length === 0) {
		return null;
	}

	const queueIndexByFileId = new Map(
		queue.map((payload, index) => [payload.fileId, index]),
	);

	return (
		<section aria-label={labels.title} className={className}>
			<div className="flex flex-wrap items-baseline justify-between gap-2 text-start">
				<h2 className="font-heading text-h3 font-bold">{labels.title}</h2>
				{labels.subheading ? (
					<p className="text-small text-muted">{labels.subheading}</p>
				) : null}
			</div>

			<ol className="mt-4 border-y border-border">
				{fileRows.map((row, index) => {
					const queueIndex = queueIndexByFileId.get(row.id);
					const durationLabel = formatDuration(row.durationSeconds);
					const technicalEntries = buildTechnicalEntries(row, labels);
					const contentEntries = buildContentEntries(row, labels);
					const hasDetails =
						technicalEntries.length > 0 || contentEntries.length > 0;

					return (
						<li
							key={row.id}
							className={cn(
								"py-2.5 sm:py-3",
								index > 0 && "border-t border-border",
							)}
						>
							<div className="flex items-center gap-3 sm:gap-4">
								<span
									aria-hidden
									dir="ltr"
									className="label w-6 shrink-0 font-medium text-muted tabular-nums"
								>
									{trackNo(index)}
								</span>

								{row.playable && queueIndex != null ? (
									<AudioPlayButton
										queue={queue}
										startIndex={queueIndex}
										size="row"
									/>
								) : row.externalUrl ? (
									<a
										href={row.externalUrl}
										target="_blank"
										rel="noopener noreferrer"
										aria-label={`${labels.externalLink} — ${row.title}`}
										className="inline-flex size-9 shrink-0 items-center justify-center border border-border-strong text-foreground transition-colors fine-hover:bg-sunken focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
									>
										<ArrowTopRightOnSquareIcon aria-hidden className="size-4" />
									</a>
								) : (
									<span
										aria-hidden
										className="inline-flex size-9 shrink-0 items-center justify-center border border-border text-muted/50"
									>
										—
									</span>
								)}

								{row.thumbUrl ? (
									<span className="relative hidden size-10 shrink-0 overflow-hidden border border-border bg-sunken sm:block">
										<NextImage
											src={row.thumbUrl}
											alt=""
											fill
											sizes="2.5rem"
											className="object-cover brightness-[0.94] saturate-[0.9]"
										/>
									</span>
								) : null}

								<p className="min-w-0 flex-1 text-start text-body font-medium text-foreground">
									{row.title}
								</p>

								{durationLabel ? (
									<span
										dir="ltr"
										className="label shrink-0 text-muted tabular-nums"
									>
										{durationLabel}
									</span>
								) : null}
							</div>

							{hasDetails ? (
								// ms offset = number column width + row gap, so the toggle
								// aligns with the play control instead of the numbering.
								<details className="group/details ms-9 mt-2.5 sm:ms-10">
									<summary className="inline-flex cursor-pointer list-none items-center gap-1.5 text-label text-muted transition-colors fine-hover:text-foreground [&::-webkit-details-marker]:hidden">
										<ChevronDownIcon
											aria-hidden
											className="size-3.5 shrink-0 transition-transform group-open/details:rotate-180"
										/>
										{labels.fileDetails}
									</summary>
									<div className="mt-3 space-y-4 border-t border-border pt-3">
										<MetaSection
											heading={labels.techSection}
											entries={technicalEntries}
										/>
										<MetaSection
											heading={labels.contentSection}
											entries={contentEntries}
										/>
									</div>
								</details>
							) : null}
						</li>
					);
				})}
			</ol>
		</section>
	);
}
