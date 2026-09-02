"use client";

import { PauseIcon, PlayIcon } from "@heroicons/react/24/solid";
import { useTranslations } from "next-intl";
import { usePlayer } from "@/components/audio/audio-player-context";
import { cn } from "@/lib/utils";
import type { PlayerTrackPayload } from "@/types/audio";

type Size = "overlay" | "row" | "hero" | "cover";

type AudioPlayButtonProps = {
	/** Full queue this button starts (e.g. the whole album). */
	queue: PlayerTrackPayload[];
	/** Which queue entry this button represents. */
	startIndex?: number;
	size?: Size;
	className?: string;
};

// Each size declares its own rounding — the base class below carries none, so
// the circular play chips and the rounded-md row button can coexist (cn()
// is a plain joiner; competing rounded-* utilities resolve by stylesheet order).
const sizeClasses: Record<Size, string> = {
	overlay:
		"size-10 rounded-full bg-primary text-primary-foreground shadow-[0_12px_32px_-10px_rgb(0_0_0/0.55)] ring-1 ring-primary-foreground/30 transition-[opacity,transform] fine-hover:opacity-90 active:scale-95 [&_svg]:size-4",
	row: "size-9 rounded-md border border-border-strong bg-transparent text-foreground transition-[background-color,transform] fine-hover:bg-sunken active:scale-95 [&_svg]:size-4",
	// Circular hero transport — the album page's lead play control. Grows a
	// touch on hover and dips on press so the lead control feels tactile; the
	// full-bleed `cover` wash skips the scale (it would shrink the artwork).
	hero: "size-12 rounded-full bg-primary text-primary-foreground shadow-[0_12px_32px_-10px_rgb(0_0_0/0.55)] ring-1 ring-primary-foreground/30 transition-[opacity,transform] fine-hover:scale-105 fine-hover:opacity-90 active:scale-95 [&_svg]:size-5 sm:size-14 sm:[&_svg]:size-6",
	// Fills a cover thumbnail: a green wash over the art with the glyph centered.
	cover:
		"absolute inset-0 rounded-none bg-primary/30 text-white transition-colors fine-hover:bg-primary/50 [&_svg]:size-8 [&_svg]:drop-shadow-[0_1px_4px_rgba(0,0,0,0.45)]",
};

/**
 * Client play/pause control fed by server components via a serializable
 * `PlayerTrackPayload[]`. Clicking a non-current track loads its queue;
 * clicking the current one toggles playback.
 */
export function AudioPlayButton({
	queue,
	startIndex = 0,
	size = "row",
	className,
}: AudioPlayButtonProps) {
	const { state, actions } = usePlayer();
	const t = useTranslations("Audio.player");

	const target = queue[startIndex];
	if (!target) {
		return null;
	}

	const current = state.queue[state.index];
	const isCurrent = current?.fileId === target.fileId;
	const isPlaying = isCurrent && state.status === "playing";

	const actionLabel = isPlaying ? t("pause") : t("play");

	return (
		<button
			type="button"
			onClick={() => {
				if (isCurrent) {
					actions.toggle();
				} else {
					actions.playQueue(queue, startIndex);
				}
			}}
			aria-label={`${actionLabel} — ${target.title}`}
			aria-pressed={isPlaying}
			className={cn(
				"inline-flex shrink-0 items-center justify-center focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
				sizeClasses[size],
				className,
			)}
		>
			{isPlaying ? <PauseIcon aria-hidden /> : <PlayIcon aria-hidden />}
		</button>
	);
}
