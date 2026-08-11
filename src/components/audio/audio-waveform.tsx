import { waveformBars } from "@/lib/audio/waveform";
import { cn } from "@/lib/utils";

type AudioWaveformProps = {
	/** Seeds the deterministic bar shape (e.g. track or file id). */
	seedId: number;
	barCount?: number;
	className?: string;
	/** Per-bar classes — override the ink fill on dark surfaces. */
	barClassName?: string;
	/** 0–1 playback position; bars behind it take `playedBarClassName`. */
	progress?: number;
	/** Fill for the elapsed part of the strip. Defaults to no distinction. */
	playedBarClassName?: string;
};

/**
 * Deterministic waveform strip — same output on server and client (no
 * Math.random). Decorative, but doubles as a progress readout when `progress`
 * is fed in.
 *
 * `dir-row-unmirrored` because this is a TIME axis, not text: elapsed has to
 * grow from the same edge the play button sits on in both locales, matching the
 * player bar's seek track.
 *
 * A bar takes EITHER the played or the idle class, never both — `cn()` is a
 * plain joiner, and two competing `bg-*` utilities would be resolved by
 * stylesheet order rather than by the order they were passed here.
 *
 * Server component.
 */
export function AudioWaveform({
	seedId,
	barCount = 56,
	className,
	barClassName = "bg-foreground/15",
	progress = 0,
	playedBarClassName,
}: AudioWaveformProps) {
	const bars = waveformBars(seedId, barCount);
	const playedCount = Math.round(Math.min(1, Math.max(0, progress)) * barCount);

	return (
		<div
			aria-hidden
			className={cn(
				"dir-row-unmirrored flex h-10 items-end justify-between gap-px",
				className,
			)}
		>
			{bars.map((height, index) => (
				<div
					// biome-ignore lint/suspicious/noArrayIndexKey: static decorative bars, never reordered
					key={index}
					className={cn(
						// Capped width + `justify-between`: hairline strokes spread evenly
						// across the strip instead of fat blocks that butt up against
						// each other whatever the container width.
						"min-w-0 max-w-[2px] flex-1",
						playedBarClassName && index < playedCount
							? playedBarClassName
							: barClassName,
					)}
					style={{ height: `${Math.round(height * 100)}%` }}
				/>
			))}
		</div>
	);
}
