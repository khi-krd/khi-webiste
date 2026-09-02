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
// the hero circle and the rounded-md squares can coexist (cn() is a plain
// joiner; competing rounded-* utilities resolve by stylesheet order).
const sizeClasses: Record<Size, string> = {
	overlay:
		"size-10 rounded-md bg-primary text-primary-foreground transition-opacity fine-hover:opacity-90 [&_svg]:size-4",
	row: "size-9 rounded-md border border-border-strong bg-transparent text-foreground transition-colors fine-hover:bg-sunken [&_svg]:size-4",
	// Circular hero transport — the album page's lead play control.
	hero: "size-12 rounded-full bg-primary text-primary-foreground transition-opacity fine-hover:opacity-90 [&_svg]:size-5 sm:size-14 sm:[&_svg]:size-6",
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
