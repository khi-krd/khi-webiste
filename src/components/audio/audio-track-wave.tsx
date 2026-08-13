"use client";

import { useIsCurrentTrack } from "@/components/audio/audio-player-context";

/**
 * Tiny equalizer that marks the tracklist row whose track is loaded in the
 * player: brand-green bars bouncing while it plays, frozen while it is
 * paused, absent everywhere else. Pure CSS animation (`.track-eq` in
 * globals.css) — no per-frame JS, and reduced motion collapses it to a
 * static reading.
 */
export function AudioTrackWave({ fileId }: { fileId: number }) {
	const { isCurrent, isPlaying } = useIsCurrentTrack(fileId);
	if (!isCurrent) {
		return null;
	}

	return (
		<span
			aria-hidden
			className="track-eq shrink-0"
			data-paused={isPlaying ? undefined : ""}
		>
			<span />
			<span />
			<span />
			<span />
			<span />
		</span>
	);
}
