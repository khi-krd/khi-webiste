import { ArrowTopRightOnSquareIcon } from "@heroicons/react/24/outline";
import NextImage from "next/image";
import { AudioPlayButton } from "@/components/audio/audio-play-button";
import { AudioTrackRow } from "@/components/audio/audio-track-row";
import { formatDuration, formatFileSize } from "@/lib/audio/format";
import type { PlayerTrackPayload, ResolvedAudioFileRow } from "@/types/audio";

export type AudioTracklistLabels = {
	title: string;
	/** Track-count pill next to the heading, e.g. "٨ تراک". */
	count: string | null;
	/** Total album size line at the header's far end. */
	totalSize: string | null;
	subheading: string | null;
	externalLink: string;
};

type AudioTracklistProps = {
	fileRows: ResolvedAudioFileRow[];
	queue: PlayerTrackPayload[];
	labels: AudioTracklistLabels;
	/** Album cover standing in for rows without their own thumbnail. */
	fallbackThumbUrl?: string | null;
	className?: string;
};

function trackNo(index: number): string {
	return String(index + 1).padStart(2, "0");
}

/**
 * Ordered file rows set as quiet recessed cards: number, cover thumb, title
 * over a format · size · genre fine-print line, play control at the row's
 * end.
 */
export function AudioTracklist({
	fileRows,
	queue,
	labels,
	fallbackThumbUrl,
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
			<div className="flex flex-wrap items-center gap-3 text-start">
				<h2 className="font-heading text-h3 font-bold">{labels.title}</h2>
				{labels.count ? (
					<span className="rounded-md bg-accent/10 px-2.5 py-1 text-label font-semibold text-brand">
						{labels.count}
					</span>
				) : null}
				{labels.subheading ? (
					<p className="text-small text-muted">{labels.subheading}</p>
				) : null}
				{labels.totalSize ? (
					<p className="ms-auto text-small text-muted">{labels.totalSize}</p>
				) : null}
			</div>

			<ol className="mt-4 flex flex-col gap-2">
				{fileRows.map((row, index) => {
					const queueIndex = queueIndexByFileId.get(row.id);
					const thumbUrl = row.thumbUrl ?? fallbackThumbUrl;
					const finePrint = [
						row.fileFormat,
						row.sizeBytes != null && row.sizeBytes > 0
							? formatFileSize(row.sizeBytes)
							: null,
						row.genre,
					]
						.filter(Boolean)
						.join(" · ");

					return (
						<AudioTrackRow key={row.id} fileId={row.id}>
							<div className="flex items-center gap-3 sm:gap-4">
								<span
									aria-hidden
									dir="ltr"
									className="label w-6 shrink-0 font-medium text-muted tabular-nums"
								>
									{trackNo(index)}
								</span>

								{thumbUrl ? (
									<span className="relative hidden size-11 shrink-0 overflow-hidden rounded-md border border-border bg-surface sm:block">
										<NextImage
											src={thumbUrl}
											alt=""
											fill
											sizes="2.75rem"
											className="object-cover"
										/>
									</span>
								) : null}

								<span className="min-w-0 flex-1 text-start">
									<span className="block truncate text-body font-bold text-foreground">
										{row.title}
									</span>
									{finePrint ? (
										// LRM: the line may start with digits ("74.7 MB") whose
										// direction is weak — without it the RTL paragraph
										// shuffles the number to the end of the Latin run.
										<span className="mt-0.5 block text-label text-muted">
											{`‎${finePrint}`}
										</span>
									) : null}
								</span>

								{formatDuration(row.durationSeconds) ? (
									<span
										dir="ltr"
										className="label shrink-0 text-muted tabular-nums"
									>
										{formatDuration(row.durationSeconds)}
									</span>
								) : null}

								{row.playable && queueIndex != null ? (
									<AudioPlayButton
										queue={queue}
										startIndex={queueIndex}
										size="row"
										className="border-brand bg-surface text-brand fine-hover:bg-brand fine-hover:text-primary-foreground"
									/>
								) : row.externalUrl ? (
									<a
										href={row.externalUrl}
										target="_blank"
										rel="noopener noreferrer"
										aria-label={`${labels.externalLink} — ${row.title}`}
										className="inline-flex size-9 shrink-0 items-center justify-center rounded-md border border-brand bg-surface text-brand transition-colors fine-hover:bg-brand fine-hover:text-primary-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
									>
										<ArrowTopRightOnSquareIcon aria-hidden className="size-4" />
									</a>
								) : (
									<span
										aria-hidden
										className="inline-flex size-9 shrink-0 items-center justify-center rounded-md border border-border text-muted/50"
									>
										—
									</span>
								)}
							</div>
						</AudioTrackRow>
					);
				})}
			</ol>
		</section>
	);
}
