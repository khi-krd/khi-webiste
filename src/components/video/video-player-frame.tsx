"use client";

import { FilmIcon } from "@heroicons/react/24/outline";
import dynamic from "next/dynamic";
import NextImage from "next/image";
import { type ReactNode, useState } from "react";
import { MediaMark } from "@/components/ui/media-mark";
import {
	FilmSceneList,
	type FilmSceneListLabels,
} from "@/components/video/film-scene-list";
import {
	VideoClipList,
	type VideoClipListLabels,
} from "@/components/video/video-clip-list";
import { cn } from "@/lib/utils";
import { classifyPlayableSource, toCleanEmbedSrc } from "@/lib/video/source";
import type { ResolvedVideoClip, VideoPlayerKind } from "@/types/video";

const VideoPlayer = dynamic(
	() => import("@/components/ui/video-player").then((mod) => mod.VideoPlayer),
	{ ssr: false },
);

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
	/** Optional overlay pinned over the player surface (e.g. an expand button). */
	surfaceOverlay?: ReactNode;
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
	mark = true,
}: {
	children: ReactNode;
	cinema?: boolean;
	/**
	 * Iframe / no-source surfaces get the brand mark here; Vidstack surfaces
	 * skip it — the player stamps its own mark internally so it survives
	 * fullscreen.
	 */
	mark?: boolean;
}) {
	return (
		<div
			className={cn(
				"relative aspect-video w-full overflow-hidden bg-foreground",
				cinema ? "rounded-none" : "rounded-md",
			)}
		>
			{children}
			{/* Brand mark over every playback surface — top-left so it never
			    sits on the control bar; pointer-events-none, so controls and
			    the iframe still take the click. */}
			{mark ? <MediaMark className="top-0 bottom-auto z-20" /> : null}
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
	surfaceOverlay,
	clips = [],
	activeClipNumber = null,
	clipLabels,
	sceneLabels,
}: VideoPlayerFrameProps) {
	const isCinema = variant === "cinema";
	const hasGalleryLabels =
		(isCinema && sceneLabels != null) || (!isCinema && clipLabels != null);
	const isGallery = clips.length > 1 && hasGalleryLabels;

	const initialClipNumber = activeClipNumber ?? clips[0]?.clipNumber ?? null;
	const [selectedClipNumber, setSelectedClipNumber] =
		useState(initialClipNumber);
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
			<PlayerSurface cinema={isCinema} mark={false}>
				{surfacePoster ? (
					<NextImage
						src={surfacePoster}
						alt=""
						fill
						sizes="(max-width: 1024px) 100vw, 60vw"
						className="object-cover"
						priority
					/>
				) : null}
				<VideoPlayer
					key={`clip-${selectedClipNumber ?? "single"}-${surfaceSrc}`}
					src={surfaceSrc}
					title={title}
					poster={surfacePoster}
					variant="full"
					autoPlay={isGallery && autoPlaySelected}
					className="absolute inset-0 z-1 size-full"
				/>
			</PlayerSurface>
		);
	} else if (surfaceKind === "iframe" && surfaceSrc) {
		surface = (
			<PlayerSurface cinema={isCinema}>
				<iframe
					key={`clip-${selectedClipNumber ?? "single"}-${surfaceSrc}`}
					src={toCleanEmbedSrc(surfaceSrc)}
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

	/**
	 * Selected clip's own description — swaps with the rail selection. Lives in
	 * the dark hero, so chrome keys off primary-foreground like the rail.
	 */
	const clipCaption =
		isGallery &&
		activeClip != null &&
		(activeClip.descriptionHtml || activeClip.description) ? (
			<div
				aria-live="polite"
				className="mt-4 border-t border-primary-foreground/15 pt-4 sm:mt-5"
			>
				{activeClip.descriptionHtml ? (
					<div
						className="text-small leading-relaxed text-primary-foreground/80 [&_:is(h1,h2,h3,h4,h5,h6)]:font-semibold [&_:is(h1,h2,h3,h4,h5,h6)]:text-primary-foreground [&_a]:text-primary-foreground [&_a]:decoration-primary-foreground/40 fine-hover:[&_a]:decoration-primary-foreground [&_blockquote]:border-primary-foreground/25 [&_blockquote]:text-primary-foreground/70 [&_code]:bg-primary-foreground/10 [&_code]:text-primary-foreground [&_figcaption]:text-primary-foreground/60 [&_hr]:border-primary-foreground/25 [&_li::marker]:text-primary-foreground/60 [&_strong]:text-primary-foreground"
						// biome-ignore lint/security/noDangerouslySetInnerHtml: descriptionHtml is sanitized by renderRichText during resolve (sanitize-html allowlist) — never raw CMS markup.
						dangerouslySetInnerHTML={{ __html: activeClip.descriptionHtml }}
					/>
				) : (
					<p className="text-small leading-relaxed text-primary-foreground/80">
						{activeClip.description}
					</p>
				)}
			</div>
		) : null;

	const clipList =
		isGallery && activeClip != null ? (
			isCinema && sceneLabels ? (
				<FilmSceneList
					scenes={clips}
					activeSceneNumber={activeClip.clipNumber}
					onSelect={handleClipSelect}
					labels={sceneLabels}
					fallbackCoverUrl={poster}
					className="mt-6 sm:mt-8"
				/>
			) : clipLabels ? (
				<VideoClipList
					clips={clips}
					activeClipNumber={activeClip.clipNumber}
					onSelect={handleClipSelect}
					labels={clipLabels}
					fallbackCoverUrl={poster}
					className="mt-6 sm:mt-8"
				/>
			) : null
		) : null;

	const framedSurface = surfaceOverlay ? (
		<div className="relative">
			{surface}
			{surfaceOverlay}
		</div>
	) : (
		surface
	);

	if (!aside) {
		return (
			<div className={cn(className)}>
				{framedSurface}
				{clipList}
				{clipCaption}
			</div>
		);
	}

	return (
		<div className={cn(className)}>
			<div className="grid items-start gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(16rem,22rem)] lg:gap-6">
				<div className="min-w-0">{framedSurface}</div>
				<div className="min-w-0 lg:sticky lg:top-24">{aside}</div>
			</div>
			{clipList}
			{clipCaption}
		</div>
	);
}
