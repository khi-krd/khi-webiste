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
 * SoundCloud-style waveform strip — rounded bars mirrored around the center
 * line, deterministic so server and client render identical output (no
 * Math.random). Decorative on its own; fed a `progress`, the elapsed bars
 * take the played fill and the strip reads as a live playhead.
 *
 * The strip carries its own `dir="ltr"` because this is a TIME axis, not
 * text: elapsed always grows from the left like any player timeline,
 * whatever the direction of the page or wrapper it lands in. (The
 * `.dir-row-unmirrored` class can't do this job here — it keys off the
 * page's `[dir="rtl"]` root, so inside an LTR wrapper it would flip a row
 * that was never mirrored.)
 *
 * A bar takes EITHER the played or the idle class, never both — `cn()` is a
 * plain joiner, and two competing `bg-*` utilities would be resolved by
 * stylesheet order rather than by the order they were passed here.
 *
 * No default height — pass one via `className` (the h-* conflict a default
 * would create with callers' heights is resolved by stylesheet order, not by
 * the order classes are passed).
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
			dir="ltr"
			className={cn("flex items-center justify-between gap-px", className)}
		>
			{bars.map((height, index) => (
				<div
					// biome-ignore lint/suspicious/noArrayIndexKey: static decorative bars, never reordered
					key={index}
					className={cn(
						// Capped width + `justify-between`: rounded strokes spread evenly
						// across the strip instead of fat blocks that butt up against
						// each other whatever the container width.
						"min-w-0 max-w-[3px] flex-1 rounded-full transition-colors duration-300",
						playedBarClassName && index < playedCount
							? playedBarClassName
							: barClassName,
					)}
					// Mirrored around the center: never shorter than a dot.
					style={{ height: `${Math.max(8, Math.round(height * 100))}%` }}
				/>
			))}
		</div>
	);
}
