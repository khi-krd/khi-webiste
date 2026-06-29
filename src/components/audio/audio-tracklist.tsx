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
	externalLink: string;
	channelLabels: Record<"STEREO" | "MONO", string>;
	techLabels: {
		fileFormat: string;
		bitRate: string;
		sampleRate: string;
		audioChannel: string;
		size: string;
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

function TechPair({ label, value }: { label: string; value: string }) {
	return (
		<div className="flex flex-col gap-0.5">
			<dt className="text-label text-muted">{label}</dt>
			<dd className="text-small text-foreground">{value}</dd>
		</div>
	);
}

function trackNo(index: number): string {
	return String(index + 1).padStart(2, "0");
}

/**
 * Ordered file rows with play controls and a per-row native `<details>` for
 * technical metadata. The play queue covers playable files only, so row →
 * queue indices are mapped by file id.
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
			<div className="flex flex-wrap items-baseline justify-between gap-2">
				<h2 className="font-heading text-h3 font-bold">{labels.title}</h2>
				{labels.subheading ? (
					<p className="text-small text-muted">{labels.subheading}</p>
				) : null}
			</div>

			<ol className="mt-5 border border-border bg-surface">
				{fileRows.map((row, index) => {
					const queueIndex = queueIndexByFileId.get(row.id);
					const durationLabel = formatDuration(row.durationSeconds);
					const chipItems = [row.form, row.genre].filter(Boolean) as string[];
					const techEntries: { key: string; label: string; value: string }[] = [
						row.fileFormat && {
							key: "fileFormat",
							label: labels.techLabels.fileFormat,
							value: row.fileFormat,
						},
						row.bitRate && {
							key: "bitRate",
							label: labels.techLabels.bitRate,
							value: row.bitRate,
						},
						row.sampleRate && {
							key: "sampleRate",
							label: labels.techLabels.sampleRate,
							value: row.sampleRate,
						},
						row.audioChannel && {
							key: "audioChannel",
							label: labels.techLabels.audioChannel,
							value: labels.channelLabels[row.audioChannel],
						},
						row.sizeBytes != null &&
							row.sizeBytes > 0 && {
								key: "size",
								label: labels.techLabels.size,
								value: formatFileSize(row.sizeBytes) ?? "",
							},
						row.recordingVenue && {
							key: "recordingVenue",
							label: labels.techLabels.recordingVenue,
							value: row.recordingVenue,
						},
						row.publishmentYear != null && {
							key: "year",
							label: labels.techLabels.year,
							value: String(row.publishmentYear),
						},
					].filter(Boolean) as { key: string; label: string; value: string }[];

					return (
						<li
							key={row.id}
							className={cn(
								"px-4 py-3 sm:px-5",
								index > 0 && "border-t border-border",
							)}
						>
							<div className="flex items-center gap-3 sm:gap-4">
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
										className="inline-flex size-9 shrink-0 items-center justify-center border border-border-strong text-foreground transition-colors fine-hover:bg-sunken focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
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

								<span
									aria-hidden
									className="label hidden w-6 shrink-0 font-medium tabular-nums sm:inline"
								>
									{trackNo(index)}
								</span>

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

								<p className="min-w-0 flex-1 text-body font-medium text-foreground">
									{row.title}
								</p>

								{chipItems.length > 0 ? (
									<span className="label hidden shrink-0 text-muted md:inline">
										{chipItems.join(" · ")}
									</span>
								) : null}

								{durationLabel ? (
									<span
										dir="ltr"
										className="label shrink-0 text-muted tabular-nums"
									>
										{durationLabel}
									</span>
								) : null}
							</div>

							{techEntries.length > 0 ? (
								<details className="group/details mt-2 ps-12 sm:ps-[4.75rem]">
									<summary className="inline-flex cursor-pointer list-none items-center gap-1 text-label text-muted transition-colors fine-hover:text-foreground [&::-webkit-details-marker]:hidden">
										<ChevronDownIcon
											aria-hidden
											className="size-3 transition-transform group-open/details:rotate-180"
										/>
										{labels.fileDetails}
									</summary>
									<dl className="mt-3 grid grid-cols-2 gap-x-6 gap-y-3 sm:grid-cols-3 lg:grid-cols-4">
										{techEntries.map((entry) => (
											<TechPair
												key={entry.key}
												label={entry.label}
												value={entry.value}
											/>
										))}
									</dl>
								</details>
							) : null}
						</li>
					);
				})}
			</ol>
		</section>
	);
}
