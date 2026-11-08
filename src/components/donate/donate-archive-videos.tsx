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
		<figure className="group overflow-hidden rounded-xl border border-border bg-surface shadow-sm transition-shadow hover:shadow-md">
			<div className="relative aspect-video bg-sunken">
				{playing ? (
					<VideoPlayer
						src={item.videoUrl}
						title={item.title}
						poster={item.posterUrl ?? undefined}
						autoPlay
						className="size-full"
					/>
				) : (
					<button
						type="button"
						onClick={() => setPlaying(true)}
						aria-label={playLabel}
						className="relative block size-full cursor-pointer text-start"
					>
						{item.posterUrl ? (
							<NextImage
								src={item.posterUrl}
								alt=""
								fill
								sizes="(min-width: 1024px) 22vw, 50vw"
								className="object-cover"
							/>
						) : (
							<span
								aria-hidden
								className="absolute inset-0 bg-gradient-to-br from-primary/25 via-sunken to-foreground/10"
							/>
						)}
						<span
							aria-hidden
							className="absolute inset-0 bg-gradient-to-t from-black/45 via-transparent to-transparent transition-opacity group-hover:from-black/55"
						/>
						<span className="absolute inset-0 grid place-items-center">
							<span className="grid size-11 place-items-center rounded-full bg-accent text-white shadow-lg ring-2 ring-white/30 transition-transform duration-200 group-hover:scale-110">
								<PlayIcon className="size-5 translate-x-px" />
							</span>
						</span>
					</button>
				)}
			</div>
			<figcaption className="p-3">
				<p className="text-sm font-semibold leading-snug text-foreground">
					{item.title}
				</p>
				{item.description ? (
					<p className="mt-1 text-small leading-relaxed text-muted">
						{item.description}
					</p>
				) : null}
			</figcaption>
		</figure>
	);
}
