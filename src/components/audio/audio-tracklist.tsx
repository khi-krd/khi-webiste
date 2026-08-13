import { ArrowTopRightOnSquareIcon } from "@heroicons/react/24/outline";
import NextImage from "next/image";
import { AudioPlayButton } from "@/components/audio/audio-play-button";
import { AudioTrackRow } from "@/components/audio/audio-track-row";
import { AudioTrackWave } from "@/components/audio/audio-track-wave";
import { formatDuration, formatFileSize } from "@/lib/audio/format";
import type { PlayerTrackPayload, ResolvedAudioFileRow } from "@/types/audio";

export type AudioTracklistLabels = {
	title: string;
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
 * Ordered file rows set as quiet recessed cards, laid out LTR like a printed
 * sleeve tracklist: number, cover thumb carrying the play control, title over
 * a format · size · genre fine-print line, then the now-playing equalizer and
 * duration at the row's end.
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
			<h2 className="text-start font-heading text-h3 font-bold">
				{labels.title}
			</h2>

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
							{/* LTR row whatever the locale: the number leads on the left,
							    then the jacket (with the play control ON the artwork),
							    then the mostly-Latin title — reading like a record
							    sleeve's printed tracklist. */}
							<div dir="ltr" className="flex items-center gap-3 sm:gap-4">
								<span
									aria-hidden
									className="label w-6 shrink-0 font-medium text-muted tabular-nums"
								>
									{trackNo(index)}
								</span>

								<span className="relative size-14 shrink-0 overflow-hidden rounded-md border border-border bg-surface sm:size-16">
									{thumbUrl ? (
										<NextImage
											src={thumbUrl}
											alt=""
											fill
											sizes="4rem"
											className="object-cover"
										/>
									) : null}
									{row.playable && queueIndex != null ? (
										<AudioPlayButton
											queue={queue}
											startIndex={queueIndex}
											size="cover"
										/>
									) : row.externalUrl ? (
										<a
											href={row.externalUrl}
											target="_blank"
											rel="noopener noreferrer"
											aria-label={`${labels.externalLink} — ${row.title}`}
											className="absolute inset-0 inline-flex items-center justify-center bg-foreground/30 text-white transition-colors fine-hover:bg-foreground/50 focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-ring"
										>
											<ArrowTopRightOnSquareIcon
												aria-hidden
												className="size-5 drop-shadow-[0_1px_4px_rgba(0,0,0,0.45)]"
											/>
										</a>
									) : null}
								</span>

								<span className="min-w-0 flex-1 text-start">
									<span className="block truncate text-body font-bold text-foreground">
										{row.title}
									</span>
									{finePrint ? (
										<span className="mt-0.5 block text-label text-muted">
											{finePrint}
										</span>
									) : null}
								</span>

								{/* Fills all the free width between the title and the
								    duration while this row's track is loaded. */}
								<AudioTrackWave
									fileId={row.id}
									className="min-w-0 flex-[3] max-sm:hidden"
								/>

								{formatDuration(row.durationSeconds) ? (
									<span className="label shrink-0 text-muted tabular-nums">
										{formatDuration(row.durationSeconds)}
									</span>
								) : null}
							</div>
						</AudioTrackRow>
					);
				})}
			</ol>
		</section>
	);
}
