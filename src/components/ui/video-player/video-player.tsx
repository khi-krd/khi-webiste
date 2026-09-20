"use client";

import {
	MediaPlayer,
	type MediaPlayerInstance,
	type VideoMimeType,
} from "@vidstack/react";
import { useRef } from "react";
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
	/**
	 * MIME type of a file `src` whose URL carries no extension (a streaming
	 * endpoint such as the archive platform's `/stream`). Vidstack picks its
	 * provider from the extension or the declared type; with neither it falls
	 * back to a cross-origin HEAD request, which the platform's CORS policy
	 * refuses — and the player never loads. Ignored for YouTube sources.
	 */
	mimeType?: VideoMimeType;
	title: string;
	poster?: string;
	posterAlt?: string;
	variant?: VideoPlayerVariant;
	/** Start playback immediately (e.g. after a gallery clip switch). */
	autoPlay?: boolean;
	className?: string;
};

export function VideoPlayer({
	src,
	mimeType,
	title,
	poster,
	posterAlt,
	variant = "minimal",
	autoPlay = false,
	className,
}: VideoPlayerProps) {
	const playerRef = useRef<MediaPlayerInstance>(null);
	const trimmedSrc = src.trim();
	if (!trimmedSrc) {
		return null;
	}

	const youTubeId = parseYouTubeVideoId(trimmedSrc);
	const resolvedSrc =
		!youTubeId && mimeType
			? { src: trimmedSrc, type: mimeType }
			: toVidstackSrc(trimmedSrc);
	const embed = youTubeId ? "youtube" : "file";
	const Layout = youTubeId
		? KhiVideoPlayerLayoutYouTube
		: variant === "full"
			? KhiVideoPlayerLayoutFull
			: KhiVideoPlayerLayout;

	return (
		<VideoPlayerErrorBoundary fallback={null}>
			<MediaPlayer
				ref={playerRef}
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
				autoPlay={autoPlay}
				streamType="on-demand"
				load={autoPlay ? "eager" : "idle"}
				// The `autoPlay` attribute alone is unreliable when the player
				// mounts asynchronously after the user's gesture (the about-hero
				// modal loads this chunk via dynamic()): some browsers drop the
				// queued autoplay and leave the poster up. Re-issuing play() once
				// the media can play — retrying muted if unmuted is refused —
				// keeps "press play" a single gesture.
				onCanPlay={
					autoPlay
						? () => {
								const player = playerRef.current;
								if (!player) return;
								void player.play().catch(() => {
									player.muted = true;
									void player.play().catch(() => {});
								});
							}
						: undefined
				}
			>
				<Layout embed={embed} poster={poster} posterAlt={posterAlt} />
			</MediaPlayer>
		</VideoPlayerErrorBoundary>
	);
}
