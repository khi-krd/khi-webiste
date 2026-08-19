"use client";

import { useIsCurrentTrack } from "@/components/audio/audio-player-context";
import { cn } from "@/lib/utils";

/**
 * Tracklist row shell — flat by default (rows are separated by hairline rules,
 * not by recessed cards) and taking a pale green wash while its track is the
 * one loaded in the player.
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
			// Short-circuit rather than a `bg-transparent` fallback: `cn()` is a
			// plain joiner, so a second bg-* utility would be resolved by
			// stylesheet order instead of by argument order.
			className={cn(
				"px-2 py-3 transition-colors duration-300 sm:px-3 sm:py-4",
				isCurrent && "bg-accent/10",
			)}
		>
			{children}
		</li>
	);
}
