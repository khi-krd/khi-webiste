"use client";

import {
	usePlayer,
	usePlayerTime,
} from "@/components/audio/audio-player-context";
import { AudioWaveform } from "@/components/audio/audio-waveform";

type AudioHeroWaveProps = {
	/** Seeds the resting contour (the album id). */
	seedId: number;
	/** File ids of this album's queue — the wave goes live for any of them. */
	fileIds: number[];
	className?: string;
};

/**
 * The album page's hero waveform. At rest it is the album's deterministic
 * contour in a quiet green; while the player holds a track FROM THIS ALBUM it
 * switches to that track's contour and fills with the real playback position,
 * so the hero strip and the tracklist row show the same playhead.
 *
 * Split so the resting page never subscribes to the 4×/sec time tick.
 */
export function AudioHeroWave({
	seedId,
	fileIds,
	className,
}: AudioHeroWaveProps) {
	const { state } = usePlayer();
	const current = state.queue[state.index];
	const currentFileId =
		current != null && fileIds.includes(current.fileId) ? current.fileId : null;

	if (currentFileId == null) {
		return (
			<AudioWaveform
				seedId={seedId}
				barCount={72}
				className={className}
				barClassName="bg-brand/25"
			/>
		);
	}

	return <PlayingHeroWave fileId={currentFileId} className={className} />;
}

function PlayingHeroWave({
	fileId,
	className,
}: {
	fileId: number;
	className?: string;
}) {
	const { currentTime, duration } = usePlayerTime();

	return (
		<AudioWaveform
			seedId={fileId}
			barCount={72}
			className={className}
			barClassName="bg-brand/25"
			playedBarClassName="bg-brand"
			progress={duration > 0 ? currentTime / duration : 0}
		/>
	);
}
