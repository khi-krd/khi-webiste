"use client";

import { useTranslations } from "next-intl";
import { memo, useEffect, useRef, useState } from "react";
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
 * moment a row became current. Both branches read the SAME measured count from
 * the shared wrapper below, so that invariant holds at every width.
 */
/** SSR/first-paint count — the observer corrects it after mount. */
const DEFAULT_BAR_COUNT = 64;
const MIN_BAR_COUNT = 48;
const MAX_BAR_COUNT = 176;
/** Target px of strip per bar (stroke + gap) — the density it settles at. */
const BAR_PITCH_PX = 7;
/** Quantised so 1px resizes never re-seed the contour. */
const BAR_COUNT_STEP = 8;
const WAVE_HEIGHT = "h-8 sm:h-12";
/** Resting rows stay ink: the green is reserved for the loaded track. */
const IDLE_BAR = "bg-foreground/25";
const LIVE_IDLE_BAR = "bg-brand/25";
const PLAYED_BAR = "bg-brand";

/**
 * Memoised so the resting strips are reconciled ONCE. `useIsCurrentTrack`
 * reads the player context, so every row re-renders on any player state change
 * (play/pause, and each step of a volume drag) — without this, that would walk
 * every bar div per row every time, for no visual change. Its props now change
 * only on an actual container resize, never on the player's tick.
 */
const RestingWave = memo(AudioWaveform);

/**
 * Bar count that follows the measured strip width, so the contour actually
 * fills the row (~one bar per BAR_PITCH_PX) instead of spreading a fixed
 * count of strokes thinly across wide screens. No hydration risk: server and
 * first client render both use DEFAULT_BAR_COUNT; the effect re-renders with
 * the measured count right after mount.
 */
function useResponsiveBarCount(): {
	ref: React.RefObject<HTMLDivElement | null>;
	barCount: number;
} {
	const ref = useRef<HTMLDivElement>(null);
	const [barCount, setBarCount] = useState(DEFAULT_BAR_COUNT);

	useEffect(() => {
		const element = ref.current;
		if (!element) {
			return;
		}
		const measure = () => {
			const width = element.clientWidth;
			if (width <= 0) {
				return;
			}
			const stepped =
				Math.round(width / BAR_PITCH_PX / BAR_COUNT_STEP) * BAR_COUNT_STEP;
			setBarCount(Math.min(MAX_BAR_COUNT, Math.max(MIN_BAR_COUNT, stepped)));
		};
		measure();
		const observer = new ResizeObserver(measure);
		observer.observe(element);
		return () => observer.disconnect();
	}, []);

	return { ref, barCount };
}

/**
 * Every tracklist row shows its own deterministic contour. Idle rows render it
 * flat and inert; the row whose track is loaded in the player switches to the
 * brand-green playhead whose elapsed bars fill from the real playback position
 * (the same `usePlayerTime` tick the bottom bar's seek track reads — the two
 * always agree), and whose click seeks.
 *
 * Split so ONLY the current row subscribes to time: the strip ticks 4×/sec
 * and re-rendering every idle row (dozens of bars each) on every tick would
 * be wasted work.
 */
export function AudioTrackWave({
	fileId,
	className,
}: {
	fileId: number;
	className?: string;
}) {
	const { isCurrent } = useIsCurrentTrack(fileId);
	const { ref, barCount } = useResponsiveBarCount();

	return (
		// The wrapper owns the row layout and the measurement, so resting and
		// live strips swap inside it without disturbing either.
		<div ref={ref} className={cn("min-w-0", className)}>
			{isCurrent ? (
				<CurrentTrackWave fileId={fileId} barCount={barCount} />
			) : (
				// Resting contour — no `usePlayerTime`, so this row never
				// re-renders on the player's tick.
				<RestingWave
					seedId={fileId}
					barCount={barCount}
					className={WAVE_HEIGHT}
					barClassName={IDLE_BAR}
				/>
			)}
		</div>
	);
}

function CurrentTrackWave({
	fileId,
	barCount,
}: {
	fileId: number;
	barCount: number;
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
			// `block w-full`: the seek surface fills the measuring wrapper.
			className="block w-full cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring disabled:cursor-default"
		>
			<AudioWaveform
				seedId={fileId}
				barCount={barCount}
				className={WAVE_HEIGHT}
				barClassName={LIVE_IDLE_BAR}
				playedBarClassName={PLAYED_BAR}
				progress={progress}
			/>
		</button>
	);
}
