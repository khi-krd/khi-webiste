"use client";

import { FilmIcon } from "@heroicons/react/24/outline";
import NextImage from "next/image";
import { useState } from "react";
import { VideoPlayer } from "@/components/ui/video-player";
import {
	VideoClipList,
	type VideoClipListLabels,
} from "@/components/video/video-clip-list";
import { cn } from "@/lib/utils";
import type {
	ResolvedVideoClip,
	VideoPlayerKind,
	VideoType,
} from "@/types/video";

type VideoPlayerFrameProps = {
	videoType: VideoType;
	playerKind: VideoPlayerKind;
	playableSrc: string | null;
	title: string;
	poster: string | null;
	clips: ResolvedVideoClip[];
	clipLabels: VideoClipListLabels;
	noSourceLabel: string;
	className?: string;
	variant?: "default" | "cinema";
	hideClipList?: boolean;
};

/** Shared 16:9 frame for the non-Vidstack states (iframe embed / no source). */
function PlayerSurface({
	children,
	cinema = false,
}: {
	children: React.ReactNode;
	cinema?: boolean;
}) {
	return (
		<div
			className={cn(
				"relative aspect-video w-full overflow-hidden bg-foreground",
				cinema ? "rounded-none border-0" : "border border-border-strong",
			)}
		>
			{children}
		</div>
	);
}

function NoSource({
	poster,
	label,
	cinema = false,
}: {
	poster: string | null;
	label: string;
	cinema?: boolean;
}) {
	return (
		<PlayerSurface cinema={cinema}>
			{poster ? (
				<NextImage
					src={poster}
					alt=""
					fill
					sizes="(max-width: 1024px) 100vw, 60vw"
					className="object-cover opacity-45"
				/>
			) : null}
			<div className="absolute inset-0 flex flex-col items-center justify-center gap-3 p-6 text-center">
				<FilmIcon className="size-8 text-primary-foreground/70" aria-hidden />
				<p className="max-w-xs text-small text-primary-foreground/85">
					{label}
				</p>
			</div>
		</PlayerSurface>
	);
}

export function VideoPlayerFrame({
	videoType,
	playerKind,
	playableSrc,
	title,
	poster,
	clips,
	clipLabels,
	noSourceLabel,
	className,
	variant = "default",
	hideClipList = false,
}: VideoPlayerFrameProps) {
	const isCinema = variant === "cinema";
	const isClipSeries = videoType === "VIDEO_CLIP" && clips.length > 0;
	const [activeClipNumber, setActiveClipNumber] = useState(
		isClipSeries ? clips[0].clipNumber : 0,
	);

	let surface: React.ReactNode;

	if (isClipSeries) {
		const activeClip =
			clips.find((clip) => clip.clipNumber === activeClipNumber) ?? clips[0];
		surface = (
			<VideoPlayer
				src={activeClip.url}
				title={`${title} — ${activeClip.title}`}
				poster={poster ?? undefined}
				variant="full"
			/>
		);
	} else if (playerKind === "vidstack" && playableSrc) {
		surface = (
			<VideoPlayer
				src={playableSrc}
				title={title}
				poster={poster ?? undefined}
				variant="full"
			/>
		);
	} else if (playerKind === "iframe" && playableSrc) {
		surface = (
			<PlayerSurface cinema={isCinema}>
				<iframe
					src={playableSrc}
					title={title}
					loading="lazy"
					allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
					allowFullScreen
					className="absolute inset-0 size-full border-0"
				/>
			</PlayerSurface>
		);
	} else {
		surface = (
			<NoSource poster={poster} label={noSourceLabel} cinema={isCinema} />
		);
	}

	return (
		<div className={cn(className)}>
			{surface}
			{isClipSeries && !hideClipList ? (
				<VideoClipList
					clips={clips}
					activeClipNumber={activeClipNumber}
					onSelect={setActiveClipNumber}
					labels={clipLabels}
					className="mt-6"
				/>
			) : null}
		</div>
	);
}
