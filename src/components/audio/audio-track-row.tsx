"use client";

import { useIsCurrentTrack } from "@/components/audio/audio-player-context";
import { cn } from "@/lib/utils";

/**
 * Tracklist row shell — swaps the card's warm tint for a pale green wash
 * while its track is the one loaded in the player.
 */
export function AudioTrackRow({
	fileId,
	children,
}: {
	fileId: number;
	children: React.ReactNode;
}) {
	const { isCurrent } = useIsCurrentTrack(fileId);

	return (
		<li
			className={cn(
				"rounded-md px-3 py-2.5 transition-colors duration-300 sm:px-4 sm:py-3",
				isCurrent ? "bg-accent/10" : "bg-sunken",
			)}
		>
			{children}
		</li>
	);
}
