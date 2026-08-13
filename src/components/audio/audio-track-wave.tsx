"use client";

import { useTranslations } from "next-intl";
import {
	useIsCurrentTrack,
	usePlayer,
	usePlayerTime,
} from "@/components/audio/audio-player-context";
import { AudioWaveform } from "@/components/audio/audio-waveform";
import { cn } from "@/lib/utils";

/**
 * SoundCloud-style playhead for the tracklist row whose track is loaded in
 * the player: the track's own deterministic contour, with the elapsed bars
 * filling in brand green as the audio actually advances (the same
 * `usePlayerTime` tick the bottom bar's seek track reads — the two playheads
 * always agree). Clicking the strip seeks. Absent on every other row.
 *
 * Split so only the current row subscribes to time: the strip ticks 4×/sec,
 * and every idle row re-rendering on each tick would be wasted work.
 */
export function AudioTrackWave({
	fileId,
	className,
}: {
	fileId: number;
	className?: string;
}) {
	const { isCurrent } = useIsCurrentTrack(fileId);
	if (!isCurrent) {
		return null;
	}
	return <CurrentTrackWave fileId={fileId} className={className} />;
}

function CurrentTrackWave({
	fileId,
	className,
}: {
	fileId: number;
	className?: string;
}) {
	const { actions } = usePlayer();
	const { currentTime, duration } = usePlayerTime();
	const t = useTranslations("Audio.player");

	const progress = duration > 0 ? currentTime / duration : 0;

	return (
		<button
			type="button"
			aria-label={t("seek")}
			disabled={duration <= 0}
			onClick={(event) => {
				// The strip carries dir="ltr": the elapsed side grows from the
				// left in both locales, so the click fraction maps straight onto
				// the timeline.
				const rect = event.currentTarget.getBoundingClientRect();
				if (rect.width <= 0) {
					return;
				}
				const fraction = (event.clientX - rect.left) / rect.width;
				actions.seek(Math.min(1, Math.max(0, fraction)) * duration);
			}}
			className={cn(
				"cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring disabled:cursor-default",
				className,
			)}
		>
			<AudioWaveform
				seedId={fileId}
				barCount={64}
				className="h-8"
				barClassName="bg-brand/25"
				playedBarClassName="bg-brand"
				progress={progress}
			/>
		</button>
	);
}
