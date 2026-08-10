import { waveformBars } from "@/lib/audio/waveform";
import { cn } from "@/lib/utils";

type AudioWaveformProps = {
	/** Seeds the deterministic bar shape (e.g. track or file id). */
	seedId: number;
	barCount?: number;
	className?: string;
	/** Per-bar classes — override the ink fill on dark surfaces. */
	barClassName?: string;
};

/**
 * Decorative, deterministic waveform strip — same output on server and client
 * (no Math.random), purely presentational. Server component.
 */
export function AudioWaveform({
	seedId,
	barCount = 56,
	className,
	barClassName,
}: AudioWaveformProps) {
	const bars = waveformBars(seedId, barCount);

	return (
		<div aria-hidden className={cn("flex h-10 items-end gap-px", className)}>
			{bars.map((height, index) => (
				<div
					// biome-ignore lint/suspicious/noArrayIndexKey: static decorative bars, never reordered
					key={index}
					className={cn("min-w-0 flex-1 bg-foreground/15", barClassName)}
					style={{ height: `${Math.round(height * 100)}%` }}
				/>
			))}
		</div>
	);
}
