"use client";

import { PauseIcon, PlayIcon } from "@heroicons/react/24/solid";
import { useTranslations } from "next-intl";
import {
	usePlayer,
	usePlayerTime,
} from "@/components/audio/audio-player-context";
import { cn } from "@/lib/utils";
import type { PlayerTrackPayload } from "@/types/audio";

const TICK_COUNT = 44;
const CENTER = 50;
const TICK_OUTER_RADIUS = 42;
const TICK_LENGTH = 9;
const TICK_ANGLES = Array.from(
	{ length: TICK_COUNT },
	(_, index) => (360 / TICK_COUNT) * index - 90,
);

function radialPoint(radius: number, angleDeg: number) {
	const rad = (angleDeg * Math.PI) / 180;
	return {
		x: CENTER + radius * Math.cos(rad),
		y: CENTER + radius * Math.sin(rad),
	};
}

/** Decorative radial tick ring, same geometry idle or mid-playback — only the lit tick count (by `progress`, 0–1) changes. */
function DialRing({ progress }: { progress: number }) {
	const activeCount = Math.round(progress * TICK_COUNT);
	const handle =
		progress > 0
			? radialPoint(TICK_OUTER_RADIUS + TICK_LENGTH / 2, progress * 360 - 90)
			: null;

	return (
		<svg
			viewBox="0 0 100 100"
			className="absolute inset-0 h-full w-full"
			aria-hidden="true"
		>
			<circle
				cx={CENTER}
				cy={CENTER}
				r={32}
				strokeWidth={1}
				className="fill-none stroke-primary-foreground/20"
			/>
			{TICK_ANGLES.map((angle, index) => (
				<line
					// biome-ignore lint/suspicious/noArrayIndexKey: fixed-length decorative ring, never reordered
					key={index}
					x1={CENTER}
					y1={CENTER - TICK_OUTER_RADIUS}
					x2={CENTER}
					y2={CENTER - TICK_OUTER_RADIUS + TICK_LENGTH}
					transform={`rotate(${angle} ${CENTER} ${CENTER})`}
					strokeWidth={2.6}
					strokeLinecap="round"
					className={cn(
						"transition-colors duration-300",
						index < activeCount
							? "stroke-accent"
							: "stroke-primary-foreground/40",
					)}
				/>
			))}
			{handle ? (
				<circle cx={handle.x} cy={handle.y} r={3} className="fill-accent" />
			) : null}
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
				"relative inline-flex shrink-0 items-center justify-center rounded-full transition-transform duration-300 fine-hover:scale-105 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring",
				className,
			)}
		>
			<span
				aria-hidden
				className="absolute inset-0 rounded-full bg-foreground/35 shadow-[0_8px_28px_-6px_rgba(0,0,0,0.6)] blur-[3px]"
			/>
			<span
				aria-hidden
				className={cn(
					"absolute inset-0 rounded-full bg-accent/30 blur-lg transition-opacity duration-300",
					isPlaying ? "opacity-100" : "opacity-0 group-fine:opacity-50",
				)}
			/>
			{isCurrent ? <ActiveDialRing /> : <DialRing progress={0} />}
			<span
				className={cn(
					"relative z-1 flex size-10 items-center justify-center rounded-full text-primary-foreground shadow-[0_10px_24px_-8px_rgba(0,0,0,0.65)] transition-colors duration-300 sm:size-12",
					isPlaying
						? "bg-accent text-foreground"
						: "bg-foreground group-fine:bg-accent group-fine:text-foreground",
				)}
			>
				{isPlaying ? (
					<PauseIcon aria-hidden className="size-4 sm:size-5" />
				) : (
					<PlayIcon aria-hidden className="size-4 translate-x-[6%] sm:size-5" />
				)}
			</span>
		</button>
	);
}
