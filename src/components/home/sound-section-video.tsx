"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { isDirectMediaFileUrl } from "@/lib/video/source";

const mediaFilterClass =
	"h-full w-full object-cover brightness-[0.72] contrast-[1.15] saturate-[0.55]";

type SoundSectionVideoProps = {
	src: string | null;
};

export function SoundSectionVideo({ src }: SoundSectionVideoProps) {
	const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
	const [failed, setFailed] = useState(false);

	useEffect(() => {
		const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
		const updatePreference = () => setPrefersReducedMotion(mediaQuery.matches);
		updatePreference();
		mediaQuery.addEventListener("change", updatePreference);
		return () => mediaQuery.removeEventListener("change", updatePreference);
	}, []);

	// A URL that parses but is not a media file — a YouTube watch page, an HTML
	// page — renders as a black rectangle with no error. The detail-page video
	// previews guard the same way.
	const showVideo =
		isDirectMediaFileUrl(src) && !failed && !prefersReducedMotion;

	return (
		// The dark ground lives on the wrapper, not only on the no-video branch:
		// the scrims above are translucent, so until the first frame decodes (or
		// if the file 404s) the section would flash the cream page background.
		<div className="home-band absolute inset-0 isolate" aria-hidden>
			{showVideo ? (
				<video
					autoPlay
					// `prefersReducedMotion` only resolves after hydration, so the
					// server sends the <video> to everyone. This keeps it invisible
					// for reduce users from the very first paint; the effect above
					// then unmounts it, which is what actually stops the download.
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
