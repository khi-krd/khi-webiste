"use client";

import { FilmIcon } from "@heroicons/react/24/outline";
import NextImage from "next/image";
import { type ReactNode, useTransition } from "react";
import { VideoPlayer } from "@/components/ui/video-player";
import {
	VideoClipList,
	type VideoClipListLabels,
} from "@/components/video/video-clip-list";
import { useRouter } from "@/i18n/navigation";
import { cn } from "@/lib/utils";
import { videoDetailHref } from "@/lib/video/resolve";
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
	/** Parent video id — required when a multi-clip playlist is shown. */
	videoId?: number;
	clips?: ResolvedVideoClip[];
	activeClipNumber?: number | null;
	clipLabels?: VideoClipListLabels;
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
 * When multiple clips are present, shows a playlist synced to `?clip=`.
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
	videoId,
	clips = [],
	activeClipNumber = null,
	clipLabels,
}: VideoPlayerFrameProps) {
	const router = useRouter();
	const [isPending, startTransition] = useTransition();
	const isCinema = variant === "cinema";
	const isClipSeries = clips.length > 1 && videoId != null && clipLabels != null;

	const activeClip = isClipSeries
		? (clips.find((clip) => clip.clipNumber === activeClipNumber) ?? clips[0])
		: null;
	const playerTitle =
		activeClip != null ? `${title} — ${activeClip.title}` : title;

	const handleClipSelect = (clipNumber: number) => {
		if (videoId == null || clipNumber === activeClipNumber) {
			return;
		}
		startTransition(() => {
			router.replace(videoDetailHref(videoId, clipNumber), { scroll: false });
		});
	};

	let surface: ReactNode;

	if (playerKind === "vidstack" && playableSrc) {
		surface = (
			<VideoPlayer
				key={playableSrc}
				src={playableSrc}
				title={playerTitle}
				poster={poster ?? undefined}
				variant="full"
			/>
		);
	} else if (playerKind === "iframe" && playableSrc) {
		surface = (
			<PlayerSurface cinema={isCinema}>
				<iframe
					key={playableSrc}
					src={playableSrc}
					title={playerTitle}
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

	const clipList =
		isClipSeries && clipLabels ? (
			<VideoClipList
				clips={clips}
				activeClipNumber={activeClip?.clipNumber ?? clips[0].clipNumber}
				onSelect={handleClipSelect}
				labels={clipLabels}
				className={cn("mt-6 sm:mt-8", isPending && "opacity-70")}
			/>
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
			{/* Full-width under player + meta so 2–3+ clips can sit in one row. */}
			{clipList}
		</div>
	);
}
