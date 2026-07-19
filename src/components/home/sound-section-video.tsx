"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

const mediaFilterClass =
	"h-full w-full object-cover brightness-[0.72] contrast-[1.15] saturate-[0.55]";

type SoundSectionVideoProps = {
	src: string | null;
};

export function SoundSectionVideo({ src }: SoundSectionVideoProps) {
	const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

	useEffect(() => {
		const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
		const updatePreference = () => setPrefersReducedMotion(mediaQuery.matches);
		updatePreference();
		mediaQuery.addEventListener("change", updatePreference);
		return () => mediaQuery.removeEventListener("change", updatePreference);
	}, []);

	const showVideo = src != null && !prefersReducedMotion;

	return (
		<div className="absolute inset-0 isolate" aria-hidden>
			{showVideo ? (
				<video
					autoPlay
					className={cn("absolute inset-0", mediaFilterClass)}
					loop
					muted
					playsInline
					preload="metadata"
					src={src}
					tabIndex={-1}
				/>
			) : (
				<div className="absolute inset-0 bg-foreground" />
			)}
		</div>
	);
}
