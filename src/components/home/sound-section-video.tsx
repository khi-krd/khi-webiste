"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

const WAVE_VIDEO_SRC = "/video/wave.mp4";

const mediaFilterClass =
	"h-full w-full object-cover brightness-[0.72] contrast-[1.15] saturate-[0.55]";

export function SoundSectionVideo() {
	const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

	useEffect(() => {
		const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
		const updatePreference = () => setPrefersReducedMotion(mediaQuery.matches);
		updatePreference();
		mediaQuery.addEventListener("change", updatePreference);
		return () => mediaQuery.removeEventListener("change", updatePreference);
	}, []);

	return (
		<div className="absolute inset-0 isolate" aria-hidden>
			{prefersReducedMotion ? (
				<div className="absolute inset-0 bg-foreground" />
			) : (
				<video
					autoPlay
					className={cn("absolute inset-0", mediaFilterClass)}
					loop
					muted
					playsInline
					preload="metadata"
					src={WAVE_VIDEO_SRC}
					tabIndex={-1}
				/>
			)}
		</div>
	);
}
