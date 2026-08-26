"use client";

import { AudioPlayButton } from "@/components/audio/audio-play-button";
import {
	usePlayer,
	usePlayerTime,
} from "@/components/audio/audio-player-context";
import { AudioWaveform } from "@/components/audio/audio-waveform";
import { cn } from "@/lib/utils";
import type { PlayerTrackPayload } from "@/types/audio";

type AudioCardTransportProps = {
	/** Seeds the deterministic bar shape — the record's own id. */
	seedId: number;
	queue: PlayerTrackPayload[];
};

const WAVE_BAR_COUNT = 44;

const waveClassName = "h-6 min-w-0 flex-1 sm:h-7";
const idleBarClassName = "bg-primary-foreground/55";
/** `accent` is the token reserved for player progress. */
const playedBarClassName = "bg-accent";

/** Resting strip: no time subscription, so idle cards never re-render. */
function CardWave({ seedId }: { seedId: number }) {
	return (
		<AudioWaveform
			seedId={seedId}
			barCount={WAVE_BAR_COUNT}
			className={waveClassName}
			barClassName={idleBarClassName}
		/>
	);
}

/**
 * Elapsed-aware strip, mounted ONLY for the record currently playing:
 * `usePlayerTime` ticks 4×/sec and subscribing every card in the grid would
 * re-render the whole page on every tick.
 */
function PlayingCardWave({ seedId }: { seedId: number }) {
	const { currentTime, duration } = usePlayerTime();

	return (
		<AudioWaveform
			seedId={seedId}
			barCount={WAVE_BAR_COUNT}
			className={waveClassName}
			barClassName={idleBarClassName}
			playedBarClassName={playedBarClassName}
			progress={duration > 0 ? currentTime / duration : 0}
		/>
	);
}

/**
 * Transport strip along the foot of a catalogue card's cover — the same
 * play-button-plus-wave pairing the home album wall uses, so a record reads
 * the same way in both places.
 */
export function AudioCardTransport({ seedId, queue }: AudioCardTransportProps) {
	const { state } = usePlayer();

	if (queue.length === 0) {
		return null;
	}

	const current = state.queue[state.index];
	const isActive = queue.some((track) => track.fileId === current?.fileId);
	const isPlaying = isActive && state.status === "playing";

	return (
		<>
			{/* Only the foot of the cover is darkened — enough for the controls to
			    read on a pale sleeve, without washing the artwork out. */}
			<div
				aria-hidden
				className={cn(
					"absolute inset-x-0 bottom-0 z-1 h-1/2 bg-linear-to-t from-foreground/90 from-10% via-foreground/45 via-55% to-transparent transition-opacity duration-[420ms] ease-out",
					isPlaying ? "opacity-100" : "opacity-75 group-fine:opacity-100",
				)}
			/>

			{/* `dir-row-unmirrored`: transport controls read left-to-right in every
			    locale — play first, then the strip it drives. */}
			<div className="dir-row-unmirrored absolute inset-x-0 bottom-0 z-2 flex items-center gap-2 p-2 sm:gap-2.5 sm:p-2.5">
				<AudioPlayButton queue={queue} size="overlay" className="shrink-0" />
				{isActive ? (
					<PlayingCardWave seedId={seedId} />
				) : (
					<CardWave seedId={seedId} />
				)}
			</div>
		</>
	);
}
