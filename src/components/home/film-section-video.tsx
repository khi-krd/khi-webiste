"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { isDirectMediaFileUrl } from "@/lib/video/source";

const mediaFilterClass =
	"h-full w-full object-cover brightness-[0.72] contrast-[1.15] saturate-[0.55]";

type FilmSectionVideoProps = {
	src: string | null;
};

/**
 * The film section's background video — the counterpart of `SoundSectionVideo`.
 *
 * Deliberately identical to it: same filters, same reduced-motion handling, same
 * dark ground. The two homepage sections sit next to each other, so any drift
 * between them reads as a mistake.
 */
export function FilmSectionVideo({ src }: FilmSectionVideoProps) {
	const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
	const [failed, setFailed] = useState(false);

	useEffect(() => {
		const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
		const updatePreference = () => setPrefersReducedMotion(mediaQuery.matches);
		updatePreference();
		mediaQuery.addEventListener("change", updatePreference);
		return () => mediaQuery.removeEventListener("change", updatePreference);
	}, []);

	// A URL that parses but is not a media file renders as a black rectangle with
	// no error, so guard it the way the video previews do.
	const showVideo =
		isDirectMediaFileUrl(src) && !failed && !prefersReducedMotion;

	return (
		// The dark ground lives on the wrapper: the scrims above are translucent,
		// so until the first frame decodes (or if the file 404s) the section would
		// otherwise flash the cream page background through them.
		<div className="absolute inset-0 isolate bg-foreground" aria-hidden>
			{showVideo ? (
				<video
					autoPlay
					// `prefersReducedMotion` only resolves after hydration, so the
					// server sends the <video> to everyone. This keeps it invisible
					// for reduce users from the first paint; the effect then unmounts
					// it, which is what actually stops the download.
					className={cn(
						"absolute inset-0 motion-reduce:hidden",
						mediaFilterClass,
					)}
					loop
					muted
					onError={() => setFailed(true)}
					playsInline
					preload="metadata"
					src={src}
					tabIndex={-1}
				/>
			) : null}
		</div>
	);
}
