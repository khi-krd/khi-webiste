"use client";

import { MediaPlayer } from "@vidstack/react";
import "@vidstack/react/player/styles/base.css";
import "@vidstack/react/player/styles/default/controls.css";
import "@vidstack/react/player/styles/default/poster.css";
import "@vidstack/react/player/styles/default/sliders.css";
import "@vidstack/react/player/styles/default/time.css";
import { cn } from "@/lib/utils";
import { VideoPlayerErrorBoundary } from "./video-player-error-boundary";
import { KhiVideoPlayerLayout } from "./video-player-layout";
import { KhiVideoPlayerLayoutFull } from "./video-player-layout-full";
import { KhiVideoPlayerLayoutYouTube } from "./video-player-layout-youtube";
import { parseYouTubeVideoId, toVidstackSrc } from "./video-source";
import "./video-player.css";

export type VideoPlayerVariant = "minimal" | "full";

export type VideoPlayerProps = {
	/** MP4/HLS path or YouTube URL / ID / `youtube/VIDEO_ID`. */
	src: string;
	title: string;
	poster?: string;
	posterAlt?: string;
	variant?: VideoPlayerVariant;
	className?: string;
};

export function VideoPlayer({
	src,
	title,
	poster,
	posterAlt,
	variant = "minimal",
	className,
}: VideoPlayerProps) {
	const trimmedSrc = src.trim();
	if (!trimmedSrc) {
		return null;
	}

	const youTubeId = parseYouTubeVideoId(trimmedSrc);
	const resolvedSrc = toVidstackSrc(trimmedSrc);
	const embed = youTubeId ? "youtube" : "file";
	const Layout = youTubeId
		? KhiVideoPlayerLayoutYouTube
		: variant === "full"
			? KhiVideoPlayerLayoutFull
			: KhiVideoPlayerLayout;

	return (
		<VideoPlayerErrorBoundary fallback={null}>
			<MediaPlayer
				className={cn(
					"khi-player",
					youTubeId && "khi-player--youtube",
					variant === "full" && "khi-player--full",
					className,
				)}
				title={title}
				src={resolvedSrc}
				poster={poster}
				playsInline
				streamType="on-demand"
				load="idle"
			>
				<Layout embed={embed} poster={poster} posterAlt={posterAlt} />
			</MediaPlayer>
		</VideoPlayerErrorBoundary>
	);
}
