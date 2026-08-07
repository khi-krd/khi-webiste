"use client";

import { PauseIcon, PlayIcon } from "@heroicons/react/24/solid";
import { useTranslations } from "next-intl";
import { useMemo } from "react";
import {
	usePlayer,
	usePlayerTime,
} from "@/components/audio/audio-player-context";
import { radialWaveformBars } from "@/lib/audio/waveform";
import { cn } from "@/lib/utils";
import type { PlayerTrackPayload } from "@/types/audio";

const CENTER = 50;
/** Bars sit outside the arc and grow outward, so the hub stays uncluttered. */
const BAR_INNER = 30;
const BAR_MAX_LENGTH = 19;
const RING_RADIUS = 26.5;
const RING_CIRCUMFERENCE = 2 * Math.PI * RING_RADIUS;
/** One full travel of the pulse around the ring. */
const PULSE_SECONDS = 1.6;

function polar(radius: number, angleDeg: number) {
	const rad = ((angleDeg - 90) * Math.PI) / 180;
	return {
		x: CENTER + radius * Math.cos(rad),
		y: CENTER + radius * Math.sin(rad),
	};
}

type DialRingProps = {
	bars: number[];
	/** 0–1 playback position. */
	progress: number;
	playing: boolean;
};

/**
 * Radial waveform: a seeded bar ring, a hairline guide circle, and an accent
 * arc + handle tracking playback. Geometry never changes — only which bars are
 * lit and how far the arc has swept.
 */
function DialRing({ bars, progress, playing }: DialRingProps) {
	const clamped = Math.min(1, Math.max(0, progress));
	const litCount = clamped * bars.length;
	const handle = polar(RING_RADIUS, clamped * 360);

	return (
		<svg
			viewBox="0 0 100 100"
			className="pointer-events-none absolute inset-0 h-full w-full [filter:drop-shadow(0_0_2px_rgba(0,0,0,0.75))]"
			aria-hidden="true"
		>
			{bars.map((height, index) => {
				const lit = index < litCount;
				const length = 1.5 + height * BAR_MAX_LENGTH;
				return (
					<g
						// biome-ignore lint/suspicious/noArrayIndexKey: fixed-length decorative ring, never reordered
						key={index}
						transform={`rotate(${(360 / bars.length) * index} ${CENTER} ${CENTER})`}
					>
						<line
							x1={CENTER}
							y1={CENTER - BAR_INNER}
							x2={CENTER}
							y2={CENTER - BAR_INNER - length}
							strokeWidth={1.8}
							strokeLinecap="round"
							style={{
								transformBox: "view-box",
								transformOrigin: `${CENTER}px ${CENTER - BAR_INNER}px`,
								// Negative delay → the crest is already mid-travel on mount.
								animationDelay: `${((index / bars.length) * -PULSE_SECONDS).toFixed(3)}s`,
							}}
							className={cn(
								"transition-[stroke] duration-500 ease-out",
								lit ? "stroke-accent" : "stroke-primary-foreground/55",
								// Idle rings wake up on card hover; playing ones stay in motion.
								playing && lit
									? "animate-[khi-dial-bar_1.6s_ease-in-out_infinite]"
									: "group-fine:animate-[khi-dial-bar_1.6s_ease-in-out_infinite]",
							)}
						/>
					</g>
				);
			})}

			<circle
				cx={CENTER}
				cy={CENTER}
				r={RING_RADIUS}
				strokeWidth={1}
				className="fill-none stroke-primary-foreground/25"
			/>
			<circle
				cx={CENTER}
				cy={CENTER}
				r={RING_RADIUS}
				strokeWidth={2.4}
				strokeLinecap="round"
				strokeDasharray={RING_CIRCUMFERENCE}
				strokeDashoffset={RING_CIRCUMFERENCE * (1 - clamped)}
				transform={`rotate(-90 ${CENTER} ${CENTER})`}
				className={cn(
					"fill-none stroke-accent transition-[stroke-dashoffset] duration-300 ease-linear",
					clamped <= 0 && "opacity-0",
				)}
			/>
			{clamped > 0 ? (
				<circle cx={handle.x} cy={handle.y} r={2.4} className="fill-accent" />
			) : null}
		</svg>
	);
}

/** Only the currently-loaded card subscribes to the 4×/sec time updates. */
function ActiveDialRing({ bars }: { bars: number[] }) {
	const { currentTime, duration } = usePlayerTime();
	const { state } = usePlayer();
	const progress = duration > 0 ? Math.min(1, currentTime / duration) : 0;
	return (
		<DialRing
			bars={bars}
			progress={progress}
			playing={state.status === "playing"}
		/>
	);
}

type AudioDialButtonProps = {
	/** Full queue this button starts (e.g. the whole album). */
	queue: PlayerTrackPayload[];
	/** Which queue entry this button represents. */
	startIndex?: number;
	className?: string;
};

/**
 * Cover-forward play control: a translucent radial waveform around a solid
 * hub. Sized entirely by `className` (expects `size-*`) — the ring is drawn in
 * a unit viewBox, so every part scales with it.
 */
export function AudioDialButton({
	queue,
	startIndex = 0,
	className,
}: AudioDialButtonProps) {
	const { state, actions } = usePlayer();
	const t = useTranslations("Audio.player");
	const seed = queue[startIndex]?.fileId ?? 0;
	const bars = useMemo(() => radialWaveformBars(seed), [seed]);

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
				// `scale` (not `transform`) — see the note in sound-section-cards.
				"relative inline-flex shrink-0 items-center justify-center rounded-full transition-[scale] duration-[320ms] ease-[cubic-bezier(0.4,0,0.2,1)] fine-hover:scale-[1.06] fine-hover:duration-[220ms] fine-hover:ease-[cubic-bezier(0.2,0.7,0.35,1)] active:scale-[0.96] active:duration-[120ms] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring",
				className,
			)}
		>
			{/* Soft radial lift so the ring stays legible over busy cover art —
			    a wash, not a plate: the artwork still reads through it. */}
			<span
				aria-hidden
				className="absolute inset-[-6%] rounded-full bg-[radial-gradient(circle,color-mix(in_oklch,var(--color-foreground)_46%,transparent)_0%,color-mix(in_oklch,var(--color-foreground)_26%,transparent)_58%,transparent_82%)] transition-opacity duration-500 ease-out"
			/>
			<span
				aria-hidden
				className={cn(
					"absolute inset-[22%] rounded-full bg-accent/40 blur-md transition-opacity duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]",
					isPlaying ? "opacity-100" : "opacity-0 group-fine:opacity-70",
				)}
			/>

			{isCurrent ? (
				<ActiveDialRing bars={bars} />
			) : (
				<DialRing bars={bars} progress={0} playing={false} />
			)}

			<span
				className={cn(
					// Hub stays ink in every state — accent is reserved for progress, so
					// the ring reads as a meter rather than a wash of colour.
					"relative z-1 flex size-9 items-center justify-center rounded-full bg-foreground text-primary-foreground shadow-[0_6px_18px_-4px_rgba(0,0,0,0.6)] ring-0 ring-accent/70 transition-[box-shadow] duration-300 ease-out group-fine:ring-2 sm:size-11",
					isPlaying && "ring-2",
				)}
			>
				<PlayIcon
					aria-hidden
					className={cn(
						"absolute size-3.5 translate-x-[6%] transition-[opacity,scale] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] sm:size-4",
						isPlaying ? "scale-75 opacity-0" : "scale-100 opacity-100",
					)}
				/>
				<PauseIcon
					aria-hidden
					className={cn(
						"absolute size-3.5 transition-[opacity,scale] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] sm:size-4",
						isPlaying ? "scale-100 opacity-100" : "scale-75 opacity-0",
					)}
				/>
			</span>
		</button>
	);
}
