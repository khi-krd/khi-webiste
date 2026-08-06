"use client";

import { PauseIcon, PlayIcon } from "@heroicons/react/24/solid";
import { useTranslations } from "next-intl";
import {
	usePlayer,
	usePlayerTime,
} from "@/components/audio/audio-player-context";
import { cn } from "@/lib/utils";
import type { PlayerTrackPayload } from "@/types/audio";

const CENTER = 50;
const RING_RADIUS = 39;
const RING_CIRCUMFERENCE = 2 * Math.PI * RING_RADIUS;

/** Smooth radial progress ring — a single eased arc rather than a discrete tick count. */
function DialRing({ progress }: { progress: number }) {
	const clamped = Math.min(1, Math.max(0, progress));
	const offset = RING_CIRCUMFERENCE * (1 - clamped);

	return (
		<svg
			viewBox="0 0 100 100"
			className="absolute inset-0 h-full w-full -rotate-90"
			aria-hidden="true"
		>
			<circle
				cx={CENTER}
				cy={CENTER}
				r={RING_RADIUS}
				strokeWidth={2}
				className="fill-none stroke-primary-foreground/25"
			/>
			<circle
				cx={CENTER}
				cy={CENTER}
				r={RING_RADIUS}
				strokeWidth={2}
				strokeLinecap="round"
				strokeDasharray={RING_CIRCUMFERENCE}
				strokeDashoffset={offset}
				className={cn(
					"fill-none stroke-accent transition-[stroke-dashoffset] duration-300 ease-linear",
					clamped <= 0 && "opacity-0",
				)}
			/>
		</svg>
	);
}

/** Only the currently-loaded card subscribes to the 4×/sec time updates. */
function ActiveDialRing() {
	const { currentTime, duration } = usePlayerTime();
	const progress = duration > 0 ? Math.min(1, currentTime / duration) : 0;
	return <DialRing progress={progress} />;
}

type AudioDialButtonProps = {
	/** Full queue this button starts (e.g. the whole album). */
	queue: PlayerTrackPayload[];
	/** Which queue entry this button represents. */
	startIndex?: number;
	className?: string;
};

/**
 * Cover-forward play control styled as a radial dial — a tick ring around a
 * solid center capsule. Sized entirely by `className` (expects `size-*`);
 * inner elements scale with it via container queries.
 */
export function AudioDialButton({
	queue,
	startIndex = 0,
	className,
}: AudioDialButtonProps) {
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
			onClick={(event) => {
				event.preventDefault();
				if (isCurrent) {
					actions.toggle();
				} else {
					actions.playQueue(queue, startIndex);
				}
			}}
			aria-label={`${actionLabel} — ${target.title}`}
			aria-pressed={isPlaying}
			className={cn(
				"relative inline-flex shrink-0 items-center justify-center rounded-full transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] fine-hover:scale-[1.07] active:scale-[0.97] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring",
				className,
			)}
		>
			<span
				aria-hidden
				className="absolute inset-0 rounded-full bg-foreground/30 shadow-[0_8px_28px_-6px_rgba(0,0,0,0.55)] backdrop-blur-[2px] transition-shadow duration-300 group-fine:shadow-[0_10px_32px_-6px_rgba(0,0,0,0.65)]"
			/>
			<span
				aria-hidden
				className={cn(
					"absolute inset-0 rounded-full bg-accent/35 blur-lg transition-opacity duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]",
					isPlaying ? "opacity-100" : "opacity-0 group-fine:opacity-60",
				)}
			/>
			{isCurrent ? <ActiveDialRing /> : <DialRing progress={0} />}
			<span
				className={cn(
					"relative z-1 flex size-10 items-center justify-center rounded-full text-primary-foreground shadow-[0_10px_24px_-8px_rgba(0,0,0,0.65)] transition-colors duration-300 ease-out sm:size-12",
					isPlaying
						? "bg-accent text-foreground"
						: "bg-foreground group-fine:bg-accent group-fine:text-foreground",
				)}
			>
				<PlayIcon
					aria-hidden
					className={cn(
						"absolute size-4 translate-x-[6%] transition-[opacity,transform] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] sm:size-5",
						isPlaying ? "scale-75 opacity-0" : "scale-100 opacity-100",
					)}
				/>
				<PauseIcon
					aria-hidden
					className={cn(
						"absolute size-4 transition-[opacity,transform] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] sm:size-5",
						isPlaying ? "scale-100 opacity-100" : "scale-75 opacity-0",
					)}
				/>
			</span>
		</button>
	);
}
