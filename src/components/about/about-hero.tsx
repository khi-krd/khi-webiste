"use client";

import { PlayIcon, XMarkIcon } from "@heroicons/react/24/solid";
import NextImage from "next/image";
import { useCallback, useEffect, useState } from "react";
import { preconnect } from "react-dom";
import { AboutIntroVideoModal } from "@/components/about/about-intro-video-modal";
import { ScrollRevealBlock } from "@/components/motion/scroll-reveal";
import { cn } from "@/lib/utils";
import { parseYouTubeVideoId, toCleanEmbedSrc } from "@/lib/video/source";

type AboutHeroProps = {
	poster: string;
	videoSrc: string;
	title: string;
	playLabel: string;
	closeLabel: string;
	/** Constrained height for UI playground previews. */
	compact?: boolean;
	className?: string;
};

const heroHeightClass = {
	default: "min-h-[68svh] sm:min-h-[72svh]",
	compact: "min-h-112 sm:min-h-144",
} as const;

export function AboutHero({
	poster,
	videoSrc,
	title,
	playLabel,
	closeLabel,
	compact = false,
	className,
}: AboutHeroProps) {
	const heightClass = compact
		? heroHeightClass.compact
		: heroHeightClass.default;
	const [videoOpen, setVideoOpen] = useState(false);
	const youTubeId = videoSrc ? parseYouTubeVideoId(videoSrc) : null;
	const [youTubePlaying, setYouTubePlaying] = useState(false);
	const startYouTube = useCallback(() => {
		if (youTubeId) setYouTubePlaying(true);
	}, [youTubeId]);

	useEffect(() => {
		if (youTubeId) {
			// YouTube plays in-place — the only warm-up that matters is
			// TLS to the nocookie host; the iframe mounts on pointerdown,
			// ahead of the click, so playback is as close to instant as
			// a provider iframe can be.
			preconnect("https://www.youtube-nocookie.com");
			preconnect("https://i.ytimg.com");
			return;
		}
		// Warm the video-player chunk while the hero is on screen so the
		// intro modal mounts an already-loaded player — the click feels
		// instant instead of waiting on a cold dynamic import.
		void import("@/components/ui/video-player");
	}, [youTubeId]);

	return (
		<>
			<section
				className={cn(
					"relative w-full overflow-hidden",
					heightClass,
					className,
				)}
				aria-label={title}
			>
				<div className="absolute inset-0 isolate">
					{/* No CMS poster — the gradients below carry the hero on their own. */}
					{poster ? (
						<div className="absolute inset-0 [&_img]:h-full [&_img]:w-full [&_img]:object-cover [&_img]:brightness-[0.86] [&_img]:contrast-[1.06] [&_img]:saturate-[0.8]">
							<NextImage
								src={poster}
								alt=""
								fill
								sizes="100vw"
								priority
								className="object-cover"
							/>
						</div>
					) : (
						<div className="absolute inset-0 bg-foreground" aria-hidden />
					)}

					<div
						className="pointer-events-none absolute inset-0 z-1 bg-foreground/30"
						aria-hidden
					/>
					<div
						className="pointer-events-none absolute inset-0 z-1 bg-linear-to-t from-foreground/72 from-0% via-foreground/30 via-26% to-transparent to-62%"
						aria-hidden
					/>
					<div
						className="pointer-events-none absolute inset-x-0 top-0 z-1 h-36 bg-linear-to-b from-foreground/48 via-foreground/16 to-transparent sm:h-44"
						aria-hidden
					/>
					<div
						className="pointer-events-none absolute inset-0 z-1 bg-linear-to-r from-foreground/38 from-0% via-foreground/15 via-40% to-transparent to-76% rtl:bg-linear-to-l"
						aria-hidden
					/>
					<div
						className="pointer-events-none absolute inset-0 z-1 bg-[radial-gradient(ellipse_130%_90%_at_50%_115%,var(--color-foreground)_0%,transparent_62%)] opacity-30"
						aria-hidden
					/>
					{/* One local scrim behind the headline instead of dimming the
					    whole photograph: keeps the white title clear of a blown-out
					    sky without turning the frame into a slab. */}
					<div
						className="pointer-events-none absolute inset-0 z-1 bg-[radial-gradient(ellipse_95%_55%_at_50%_48%,color-mix(in_oklch,var(--color-foreground)_40%,transparent)_0%,transparent_72%)]"
						aria-hidden
					/>
				</div>

				<ScrollRevealBlock
					className={cn(
						"relative z-10 flex flex-col items-center justify-center px-4 sm:px-6 lg:px-10",
						heightClass,
					)}
				>
					<h2 className="hero-slide-title max-w-4xl text-center text-balance text-white 2xl:text-[5.5rem]">
						{title}
					</h2>

					{/* Nothing to play until the CMS holds an intro video. */}
					{videoSrc && !youTubePlaying ? (
						<button
							type="button"
							onPointerDown={(event) => {
								// Mounts the iframe on the press, ahead of `click`,
								// shaving the activation wait off provider startup.
								if (event.button === 0) startYouTube();
							}}
							onClick={() => (youTubeId ? startYouTube() : setVideoOpen(true))}
							aria-haspopup={youTubeId ? undefined : "dialog"}
							aria-label={playLabel}
							className={cn(
								"mt-8 inline-flex size-14 items-center justify-center rounded-full bg-primary text-white shadow-[0_12px_32px_-10px_rgb(0_0_0/0.55)] ring-1 ring-primary-foreground/30 backdrop-blur-[2px] sm:mt-9 sm:size-16",
								"transition-[transform,background-color,opacity] duration-300 ease-out",
								"opacity-90 fine-hover:scale-105 fine-hover:bg-primary fine-hover:opacity-100 active:scale-95",
								"focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white",
								"motion-reduce:transition-none motion-reduce:fine-hover:scale-100",
							)}
						>
							<PlayIcon
								className="size-6 translate-x-0.5 sm:size-7"
								aria-hidden
							/>
						</button>
					) : null}
				</ScrollRevealBlock>

				{/* One click plays the intro right here: the nocookie iframe
				    covers the hero and runs until the ✕ returns the poster —
				    no modal, no second play button, no provider pause. */}
				{youTubePlaying && youTubeId ? (
					<>
						<iframe
							src={toCleanEmbedSrc(videoSrc, { autoplay: true })}
							title={title}
							allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
							allowFullScreen
							className="absolute inset-0 z-20 size-full border-0 bg-foreground"
						/>
						<button
							type="button"
							onClick={() => setYouTubePlaying(false)}
							aria-label={closeLabel}
							className="absolute top-4 z-30 inline-flex min-h-11 min-w-11 items-center justify-center border border-primary-foreground/25 bg-foreground/70 p-2 text-white backdrop-blur-[2px] transition-opacity hover:opacity-90 focus-visible:opacity-90 end-4 sm:end-6"
						>
							<XMarkIcon className="size-5 shrink-0" aria-hidden="true" />
						</button>
					</>
				) : null}
			</section>

			{youTubeId ? null : (
				<AboutIntroVideoModal
					open={videoOpen}
					onClose={() => setVideoOpen(false)}
					videoSrc={videoSrc}
					title={title}
					closeLabel={closeLabel}
					dialogLabel={playLabel}
				/>
			)}
		</>
	);
}
