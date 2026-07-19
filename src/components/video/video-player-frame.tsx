"use client";

import { FilmIcon } from "@heroicons/react/24/outline";
import NextImage from "next/image";
import { type ReactNode, useState } from "react";
import { VideoPlayer } from "@/components/ui/video-player";
import { classifyPlayableSource } from "@/components/ui/video-player/video-source";
import {
	FilmSceneList,
	type FilmSceneListLabels,
} from "@/components/video/film-scene-list";
import {
	VideoClipList,
	type VideoClipListLabels,
} from "@/components/video/video-clip-list";
import { cn } from "@/lib/utils";
import type { ResolvedVideoClip, VideoPlayerKind } from "@/types/video";

type VideoPlayerFrameProps = {
	playerKind: VideoPlayerKind;
	playableSrc: string | null;
	title: string;
	poster: string | null;
	noSourceLabel: string;
	className?: string;
	variant?: "default" | "cinema";
	/** Optional sidebar (metadata) rendered beside the player. */
	aside?: ReactNode;
	clips?: ResolvedVideoClip[];
	/** Initial gallery selection (e.g. from `?clip=` deep-link). */
	activeClipNumber?: number | null;
	clipLabels?: VideoClipListLabels;
	/** Cinema reel labels — used when `variant="cinema"` and multiple clips. */
	sceneLabels?: FilmSceneListLabels;
};

/** Shared 16:9 frame for the non-Vidstack states (iframe embed / no source). */
function PlayerSurface({
	children,
	cinema = false,
}: {
	children: ReactNode;
	cinema?: boolean;
}) {
	return (
		<div
			className={cn(
				"relative aspect-video w-full overflow-hidden bg-foreground",
				cinema
					? "rounded-none border-0"
					: "rounded-md border border-border-strong",
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

/**
 * Player frame for FILM and VIDEO_CLIP detail pages.
 * Multiple clips are a same-page gallery: click a tile to play it on top.
 */
export function VideoPlayerFrame({
	playerKind,
	playableSrc,
	title,
	poster,
	noSourceLabel,
	className,
	variant = "default",
	aside,
	clips = [],
	activeClipNumber = null,
	clipLabels,
	sceneLabels,
}: VideoPlayerFrameProps) {
	const isCinema = variant === "cinema";
	const hasGalleryLabels =
		(isCinema && sceneLabels != null) || (!isCinema && clipLabels != null);
	const isGallery = clips.length > 1 && hasGalleryLabels;

	const initialClipNumber =
		activeClipNumber ?? clips[0]?.clipNumber ?? null;
	const [selectedClipNumber, setSelectedClipNumber] = useState(
		initialClipNumber,
	);
	/** Autoplay only after the user picks a gallery tile — not on first paint. */
	const [autoPlaySelected, setAutoPlaySelected] = useState(false);

	const activeClip = isGallery
		? (clips.find((clip) => clip.clipNumber === selectedClipNumber) ??
			clips[0] ??
			null)
		: null;

	const gallerySource = activeClip
		? classifyPlayableSource(activeClip.url)
		: null;
	const surfaceKind: VideoPlayerKind = isGallery
		? (gallerySource?.kind ?? "none")
		: playerKind;
	const surfaceSrc = isGallery ? (gallerySource?.src ?? null) : playableSrc;
	/**
	 * In gallery mode never reuse the parent cover — it made every clip look
	 * like the first one was still “active”. Prefer the clip still, else none
	 * so Vidstack shows the selected file’s own frame.
	 */
	const surfacePoster = isGallery
		? (activeClip?.coverUrl ?? undefined)
		: (poster ?? undefined);

	const handleClipSelect = (clipNumber: number) => {
		if (clipNumber === selectedClipNumber) {
			return;
		}
		setSelectedClipNumber(clipNumber);
		setAutoPlaySelected(true);
	};

	let surface: ReactNode;

	if (surfaceKind === "vidstack" && surfaceSrc) {
		surface = (
			<VideoPlayer
				key={`clip-${selectedClipNumber ?? "single"}-${surfaceSrc}`}
				src={surfaceSrc}
				title={title}
				poster={surfacePoster}
				variant="full"
				autoPlay={isGallery && autoPlaySelected}
			/>
		);
	} else if (surfaceKind === "iframe" && surfaceSrc) {
		surface = (
			<PlayerSurface cinema={isCinema}>
				<iframe
					key={`clip-${selectedClipNumber ?? "single"}-${surfaceSrc}`}
					src={surfaceSrc}
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
			<NoSource
				poster={surfacePoster ?? poster}
				label={noSourceLabel}
				cinema={isCinema}
			/>
		);
	}

	const clipList =
		isGallery && activeClip != null ? (
			isCinema && sceneLabels ? (
				<FilmSceneList
					scenes={clips}
					activeSceneNumber={activeClip.clipNumber}
					onSelect={handleClipSelect}
					labels={sceneLabels}
					className="mt-6 sm:mt-8"
				/>
			) : clipLabels ? (
				<VideoClipList
					clips={clips}
					activeClipNumber={activeClip.clipNumber}
					onSelect={handleClipSelect}
					labels={clipLabels}
					className="mt-6 sm:mt-8"
				/>
			) : null
		) : null;

	if (!aside) {
		return (
			<div className={cn(className)}>
				{surface}
				{clipList}
			</div>
		);
	}

	return (
		<div className={cn(className)}>
			<div className="grid items-start gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(16rem,22rem)] lg:gap-6">
				<div className="min-w-0">{surface}</div>
				<div className="min-w-0 lg:sticky lg:top-24">{aside}</div>
			</div>
			{clipList}
		</div>
	);
}
