"use client";

import { useIsCurrentTrack } from "@/components/audio/audio-player-context";
import { waveformBars } from "@/lib/audio/waveform";
import { cn } from "@/lib/utils";

const BAR_COUNT = 44;

/**
 * Waveform equalizer that fills the free width of the tracklist row whose
 * track is loaded in the player: brand-green bars in the track's own
 * deterministic contour, each pulsing out of phase while it plays and frozen
 * while it is paused, absent everywhere else. Pure CSS animation (`.track-eq`
 * in globals.css) — no per-frame JS, and reduced motion collapses it to a
 * static reading.
 */
export function AudioTrackWave({
	fileId,
	className,
}: {
	fileId: number;
	className?: string;
}) {
	const { isCurrent, isPlaying } = useIsCurrentTrack(fileId);
	if (!isCurrent) {
		return null;
	}

	const bars = waveformBars(fileId, BAR_COUNT);

	return (
		<span
			aria-hidden
			className={cn("track-eq", className)}
			data-paused={isPlaying ? undefined : ""}
		>
			{bars.map((height, index) => (
				<span
					// biome-ignore lint/suspicious/noArrayIndexKey: static decorative bars, never reordered
					key={index}
					style={{
						height: `${Math.round(height * 100)}%`,
						// Prime-stepped phase so neighbours never bounce in lockstep.
						animationDelay: `-${(index * 173) % 900}ms`,
					}}
				/>
			))}
		</span>
	);
}
