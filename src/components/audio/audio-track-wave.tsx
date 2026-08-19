"use client";

import { useTranslations } from "next-intl";
import { memo } from "react";
import {
	useIsCurrentTrack,
	usePlayer,
	usePlayerTime,
} from "@/components/audio/audio-player-context";
import { AudioWaveform } from "@/components/audio/audio-waveform";
import { cn } from "@/lib/utils";

/**
 * Shape + palette shared by the resting and the live strip. One place only:
 * `cn()` is a plain joiner, so two competing h-* classes would be resolved by
 * stylesheet order — and a differing bar count would make the contour jump the
 * moment a row became current.
 */
const WAVE_BAR_COUNT = 64;
const WAVE_HEIGHT = "h-8 sm:h-12";
/** Resting rows stay ink: the green is reserved for the loaded track. */
const IDLE_BAR = "bg-foreground/25";
const LIVE_IDLE_BAR = "bg-brand/25";
const PLAYED_BAR = "bg-brand";

/**
 * Memoised so the resting strips are reconciled ONCE. `useIsCurrentTrack`
 * reads the player context, so every row re-renders on any player state change
 * (play/pause, and each step of a volume drag) — without this, that would walk
 * 64 bar divs per row every time, for no visual change.
 */
const RestingWave = memo(AudioWaveform);

/**
 * Every tracklist row shows its own deterministic contour. Idle rows render it
 * flat and inert; the row whose track is loaded in the player switches to the
 * brand-green playhead whose elapsed bars fill from the real playback position
 * (the same `usePlayerTime` tick the bottom bar's seek track reads — the two
 * always agree), and whose click seeks.
 *
 * Split so ONLY the current row subscribes to time: the strip ticks 4×/sec and
 * re-rendering every idle row (64 bars each) on every tick would be wasted work.
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
		// Resting contour — no `usePlayerTime`, so this row never re-renders on
		// the player's tick.
		return (
			<RestingWave
				seedId={fileId}
				barCount={WAVE_BAR_COUNT}
				className={cn(WAVE_HEIGHT, className)}
				barClassName={IDLE_BAR}
			/>
		);
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
				barCount={WAVE_BAR_COUNT}
				className={WAVE_HEIGHT}
				barClassName={LIVE_IDLE_BAR}
				playedBarClassName={PLAYED_BAR}
				progress={progress}
			/>
		</button>
	);
}
