"use client";

import { PlayIcon } from "@heroicons/react/24/solid";
import NextImage from "next/image";
import { useState } from "react";
import { AboutIntroVideoModal } from "@/components/about/about-intro-video-modal";
import { ScrollRevealBlock } from "@/components/motion/scroll-reveal";
import { cn } from "@/lib/utils";

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
					{videoSrc ? (
						<button
							type="button"
							onClick={() => setVideoOpen(true)}
							aria-haspopup="dialog"
							aria-label={playLabel}
							className={cn(
								"mt-8 inline-flex size-14 items-center justify-center rounded-pill bg-foreground/70 text-white backdrop-blur-[2px] sm:mt-9 sm:size-16",
								"transition-[transform,background-color,opacity] duration-300",
								"opacity-90 fine-hover:scale-110 fine-hover:bg-foreground/85 fine-hover:opacity-100",
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
			</section>

			<AboutIntroVideoModal
				open={videoOpen}
				onClose={() => setVideoOpen(false)}
				videoSrc={videoSrc}
				poster={poster}
				title={title}
				closeLabel={closeLabel}
				dialogLabel={playLabel}
			/>
		</>
	);
}
