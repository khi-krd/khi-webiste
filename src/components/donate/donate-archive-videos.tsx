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
	mediaKind?: "video" | "image";
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
			<ScrollReveal className="mt-5 grid grid-cols-1 gap-5 lg:grid-cols-2">
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
	const isImage = item.mediaKind === "image";

	if (playing && !isImage) {
		return (
			<figure className="overflow-hidden rounded-2xl border border-border/60 bg-foreground shadow-lg">
				<div className="relative aspect-video">
					<VideoPlayer
						src={item.videoUrl}
						title={item.title}
						poster={item.posterUrl ?? undefined}
						autoPlay
						className="size-full"
					/>
				</div>
			</figure>
		);
	}

	return (
		<figure className="group flex overflow-hidden rounded-2xl border border-border/60 bg-surface shadow-md transition-shadow duration-300 hover:shadow-xl">
			{/* Video half — lands on the right in RTL. */}
			<button
				type="button"
				onClick={() => !isImage && setPlaying(true)}
				aria-label={isImage ? item.title : playLabel}
				className="relative block w-1/2 min-h-44 cursor-pointer self-stretch bg-foreground"
			>
				{item.posterUrl ? (
					<NextImage
						src={item.posterUrl}
						alt=""
						fill
						sizes="(min-width: 1024px) 24vw, 100vw"
						className="object-cover opacity-90 transition-opacity duration-300 group-hover:opacity-100"
					/>
				) : (
					<span aria-hidden className="absolute inset-0 bg-foreground" />
				)}
				<span aria-hidden className="absolute inset-0 grid place-items-center">
					<span className="grid size-14 place-items-center rounded-full border border-white/30 bg-accent text-white shadow-xl backdrop-blur-sm transition-transform duration-300 group-hover:scale-110">
						<PlayIcon className="size-6 translate-x-px" />
					</span>
				</span>
				<NextImage
					src="/logo.png"
					alt=""
					width={44}
					height={44}
					className="absolute bottom-3 left-3 size-11 rounded-full bg-white/90 object-contain p-1 shadow-md"
				/>
			</button>
			{/* Text half — paper panel on the left. */}
			<figcaption className="flex w-1/2 flex-col justify-center gap-3 bg-background p-5 sm:p-6">
				<p className="font-heading text-h5 font-bold leading-snug text-foreground">
					{item.title}
				</p>
				{item.description ? (
					<p className="text-small leading-relaxed text-muted">
						{item.description}
					</p>
				) : null}
			</figcaption>
		</figure>
	);
}
