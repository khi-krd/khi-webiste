"use client";

import { PlayIcon } from "@heroicons/react/24/solid";
import dynamic from "next/dynamic";
import NextImage from "next/image";
import { useState } from "react";
import {
	ScrollReveal,
	ScrollRevealItem,
} from "@/components/motion/scroll-reveal";

const VideoPlayer = dynamic(
	() => import("@/components/ui/video-player").then((mod) => mod.VideoPlayer),
	{ ssr: false },
);

export type DonateArchiveVideoItem = {
	id: number;
	title: string;
	description: string | null;
	/** Uploaded file URL or a YouTube link — the player resolves both. */
	videoUrl: string;
	/** Resolved still: the editor's poster, else the YouTube thumbnail, else none. */
	posterUrl: string | null;
};

type DonateArchiveVideosProps = {
	heading: string;
	playLabel: string;
	items: DonateArchiveVideoItem[];
};

/**
 * The archive-donors rail on the donate page — clips of the people who handed
 * their archive material to the institute. Sits between the participation
 * cards and the closing note; the caller drops it only when items exist.
 *
 * Each card holds back the real player until the poster is pressed, so a rail
 * of several clips costs the page nothing until a visitor actually plays one.
 */
export function DonateArchiveVideos({
	heading,
	playLabel,
	items,
}: DonateArchiveVideosProps) {
	if (items.length === 0) {
		return null;
	}

	return (
		<div className="mt-10 sm:mt-12">
			<h3 className="font-heading text-h3 font-semibold text-foreground">
				{heading}
			</h3>
			<ScrollReveal className="mt-5 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
				{items.map((item) => (
					<ScrollRevealItem key={item.id}>
						<ArchiveVideoCard item={item} playLabel={playLabel} />
					</ScrollRevealItem>
				))}
			</ScrollReveal>
		</div>
	);
}

function ArchiveVideoCard({
	item,
	playLabel,
}: {
	item: DonateArchiveVideoItem;
	playLabel: string;
}) {
	const [playing, setPlaying] = useState(false);

	return (
		<figure className="group relative overflow-hidden rounded-2xl border border-border/60 bg-surface shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-foreground/10">
			{playing ? (
				<div className="relative aspect-video bg-foreground">
					<VideoPlayer
						src={item.videoUrl}
						title={item.title}
						poster={item.posterUrl ?? undefined}
						autoPlay
						className="size-full"
					/>
				</div>
			) : (
				<button
					type="button"
					onClick={() => setPlaying(true)}
					aria-label={playLabel}
					className="relative block aspect-[4/5] w-full cursor-pointer text-start"
				>
					{item.posterUrl ? (
						<NextImage
							src={item.posterUrl}
							alt=""
							fill
							sizes="(min-width: 1024px) 22vw, 50vw"
							className="object-cover transition-transform duration-500 group-hover:scale-105"
						/>
					) : (
						<span
							aria-hidden
							className="absolute inset-0 bg-gradient-to-br from-accent/30 via-sunken to-foreground/15"
						/>
					)}
					{/* Cinematic scrim — deepens at the bottom where the caption lives. */}
					<span
						aria-hidden
						className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-black/5 transition-opacity duration-300 group-hover:from-black/80"
					/>
					<span
						aria-hidden
						className="absolute inset-0 grid place-items-center"
					>
						<span className="grid size-14 place-items-center rounded-full border border-white/35 bg-white/15 text-white shadow-xl backdrop-blur-md transition-all duration-300 group-hover:scale-110 group-hover:bg-accent group-hover:border-accent">
							<PlayIcon className="size-6 translate-x-px" />
						</span>
					</span>
					<figcaption className="absolute inset-x-0 bottom-0 p-4">
						<p className="text-sm font-semibold leading-snug text-white">
							{item.title}
						</p>
						{item.description ? (
							<p className="mt-1 line-clamp-2 text-xs leading-relaxed text-white/80">
								{item.description}
							</p>
						) : null}
					</figcaption>
				</button>
			)}
		</figure>
	);
}
