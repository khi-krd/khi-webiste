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
 * Ordered file rows set flat between hairline rules — no card backgrounds, so
 * the artwork carries the list — laid out LTR like a printed sleeve tracklist:
 * number, cover thumb carrying the play control, title over a format · size ·
 * genre fine-print line, then the waveform and duration at the row's end.
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

			<ol className="mt-4 flex flex-col divide-y divide-border">
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
							<div
								dir="ltr"
								// Wraps on phones so the strip gets a full-width line of its
								// own under the jacket and title, instead of being dropped
								// (there is no room for it beside them); one line from sm up.
								className="flex flex-wrap items-center gap-x-4 gap-y-2 sm:flex-nowrap sm:gap-5"
							>
								<span
									aria-hidden
									className="label w-6 shrink-0 font-medium text-muted tabular-nums"
								>
									{trackNo(index)}
								</span>

								<span className="relative size-24 shrink-0 overflow-hidden bg-sunken sm:size-32 lg:size-36">
									{thumbUrl ? (
										<NextImage
											src={thumbUrl}
											alt=""
											fill
											sizes="(min-width: 1024px) 9rem, (min-width: 640px) 8rem, 6rem"
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
												className="size-8 drop-shadow-[0_1px_4px_rgba(0,0,0,0.45)]"
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

								{/* A resting contour on every row, the live playhead on the
								    one loaded in the player. From sm up it grows into all the
								    free width between the title and the duration; on phones
								    the order swap makes it the item that wraps to a full-width
								    second line, where there is no room beside the jacket. */}
								<AudioTrackWave
									fileId={row.id}
									className="order-2 w-full sm:order-1 sm:w-auto sm:min-w-0 sm:flex-[3]"
								/>

								{formatDuration(row.durationSeconds) ? (
									<span className="label order-1 shrink-0 text-muted tabular-nums sm:order-2">
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
