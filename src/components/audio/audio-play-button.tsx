"use client";

import { PauseIcon, PlayIcon } from "@heroicons/react/24/solid";
import { useTranslations } from "next-intl";
import { usePlayer } from "@/components/audio/audio-player-context";
import { cn } from "@/lib/utils";
import type { PlayerTrackPayload } from "@/types/audio";

type Size = "overlay" | "row" | "hero";

type AudioPlayButtonProps = {
	/** Full queue this button starts (e.g. the whole album). */
	queue: PlayerTrackPayload[];
	/** Which queue entry this button represents. */
	startIndex?: number;
	size?: Size;
	/** Visible label — rendered for the `hero` size only. */
	label?: string;
	className?: string;
};

const sizeClasses: Record<Size, string> = {
	overlay:
		"size-10 bg-primary text-primary-foreground transition-opacity fine-hover:opacity-90 [&_svg]:size-4",
	row: "size-9 border border-border-strong bg-transparent text-foreground transition-colors fine-hover:bg-sunken [&_svg]:size-4",
	hero: "h-11 gap-2.5 bg-primary px-6 text-small font-medium text-primary-foreground transition-opacity fine-hover:opacity-90 [&_svg]:size-4",
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
	label,
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
				"inline-flex shrink-0 items-center justify-center rounded-md focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
				sizeClasses[size],
				className,
			)}
		>
			{isPlaying ? <PauseIcon aria-hidden /> : <PlayIcon aria-hidden />}
			{size === "hero" && label ? <span>{label}</span> : null}
		</button>
	);
}
