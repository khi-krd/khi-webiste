"use client";

import { PlayIcon } from "@heroicons/react/24/solid";
import dynamic from "next/dynamic";
import NextImage from "next/image";
import { useCallback, useState } from "react";
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
	imagesHeading: string;
	playLabel: string;
	items: DonateArchiveVideoItem[];
};

/**
 * The archive-donors rails on the donate page — clips and photos of the
 * people who handed their archive material to the institute. Videos sit in
 * the upper rail, images get their own lower section; each renders only when
 * it has records.
 *
 * Each card holds back the real player until the poster is pressed, so a rail
 * of several clips costs the page nothing until a visitor actually plays one.
 */
export function DonateArchiveVideos({
	heading,
	imagesHeading,
	playLabel,
	items,
}: DonateArchiveVideosProps) {
	const videos = items.filter((item) => item.mediaKind !== "image");
	const images = items.filter((item) => item.mediaKind === "image");

	if (items.length === 0) {
		return null;
	}

	return (
		<div className="mt-10 sm:mt-12">
			{videos.length > 0 ? (
				<section>
					<h3 className="font-heading text-h3 font-semibold text-foreground">
						{heading}
					</h3>
					<MediaRail items={videos} playLabel={playLabel} />
				</section>
			) : null}
			{images.length > 0 ? (
				<section className="mt-12">
					<h3 className="font-heading text-h3 font-semibold text-foreground">
						{imagesHeading}
					</h3>
					<MediaRail items={images} playLabel={playLabel} />
				</section>
			) : null}
		</div>
	);
}

function MediaRail({
	items,
	playLabel,
}: {
	items: DonateArchiveVideoItem[];
	playLabel: string;
}) {
	const [playingIds, setPlayingIds] = useState<Set<number>>(new Set());

	const setCardPlaying = useCallback((id: number, playing: boolean) => {
		setPlayingIds((prev) => {
			const next = new Set(prev);
			if (playing) {
				next.add(id);
			} else {
				next.delete(id);
			}
			return next;
		});
	}, []);

	return (
		<ScrollReveal className="mt-5 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
			{items.map((item) => (
				<ScrollRevealItem
					key={item.id}
					className={
						playingIds.has(item.id)
							? "col-span-2 sm:col-span-3 lg:col-span-5"
							: undefined
					}
				>
					<ArchiveVideoCard
						item={item}
						playLabel={playLabel}
						onPlayingChange={(playing) => setCardPlaying(item.id, playing)}
					/>
				</ScrollRevealItem>
			))}
		</ScrollReveal>
	);
}

const donateCardKeyframes = `
@keyframes donate-media-in {
	from { opacity: 0; }
	to { opacity: 1; }
}
@keyframes donate-caption-in {
	from { opacity: 0; transform: translateY(-12px); }
	to { opacity: 1; transform: translateY(0); }
}`;

function ArchiveVideoCard({
	item,
	playLabel,
	onPlayingChange,
}: {
	item: DonateArchiveVideoItem;
	playLabel: string;
	onPlayingChange?: (playing: boolean) => void;
}) {
	const [playing, setPlaying] = useState(false);
	const isImage = item.mediaKind === "image";
	const playingVideo = playing && !isImage;

	const togglePlaying = () => {
		if (isImage) return;
		setPlaying(true);
		onPlayingChange?.(true);
	};

	return (
		<figure className="group flex h-full flex-col overflow-hidden rounded-2xl border border-border/60 bg-surface shadow-md transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
			<style>{donateCardKeyframes}</style>
			{/* Media — photo/poster still; the player fades in over it on play. */}
			<div className="relative aspect-video w-full shrink-0 overflow-hidden bg-foreground">
				<button
					type="button"
					onClick={togglePlaying}
					aria-label={isImage ? item.title : playLabel}
					tabIndex={playingVideo ? -1 : 0}
					className={`absolute inset-0 block w-full transition-opacity duration-300 ${
						isImage ? "cursor-default" : "cursor-pointer"
					} ${playingVideo ? "pointer-events-none opacity-0" : "opacity-100"}`}
				>
					{item.posterUrl ? (
						<NextImage
							src={item.posterUrl}
							alt=""
							fill
							sizes="(min-width: 1024px) 20vw, 50vw"
							className="object-cover opacity-90 transition-opacity duration-300 group-hover:opacity-100"
						/>
					) : (
						<span aria-hidden className="absolute inset-0 bg-foreground" />
					)}
					{!isImage ? (
						<span
							aria-hidden
							className="absolute inset-0 grid place-items-center"
						>
							<span className="grid size-12 place-items-center rounded-full border border-white/30 bg-accent text-white shadow-xl backdrop-blur-sm transition-transform duration-300 group-hover:scale-110">
								<PlayIcon className="size-5 translate-x-px" />
							</span>
						</span>
					) : null}
				</button>
				{playingVideo ? (
					<div
						className="absolute inset-0"
						style={{ animation: "donate-media-in 0.45s ease-out 0.08s both" }}
					>
						<VideoPlayer
							src={item.videoUrl}
							title={item.title}
							poster={item.posterUrl ?? undefined}
							autoPlay
							className="size-full"
						/>
					</div>
				) : null}
				<NextImage
					src="/logo.png"
					alt=""
					width={40}
					height={40}
					className="absolute bottom-2.5 left-2.5 z-10 size-10 rounded-full bg-white/90 object-contain p-1 shadow-md"
				/>
			</div>
			{/* Caption — always under the media, visible while playing too. */}
			<figcaption
				className={`flex grow flex-col gap-2 bg-background ${
					playingVideo ? "p-5 sm:p-6" : "p-4"
				}`}
				style={
					playingVideo
						? { animation: "donate-caption-in 0.5s ease-out 0.15s both" }
						: undefined
				}
			>
				<p
					className={`font-heading font-bold leading-snug text-foreground ${
						playingVideo ? "text-h5" : "text-small line-clamp-2"
					}`}
				>
					{item.title}
				</p>
				{item.description ? (
					<p
						className={`leading-relaxed text-muted ${
							playingVideo ? "text-small" : "text-caption line-clamp-3"
						}`}
					>
						{item.description}
					</p>
				) : null}
			</figcaption>
		</figure>
	);
}
