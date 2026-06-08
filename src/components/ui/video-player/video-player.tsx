"use client";

import { MediaPlayer } from "@vidstack/react";
import "@vidstack/react/player/styles/base.css";
import "@vidstack/react/player/styles/default/controls.css";
import "@vidstack/react/player/styles/default/poster.css";
import "@vidstack/react/player/styles/default/sliders.css";
import "@vidstack/react/player/styles/default/time.css";
import dynamic from "next/dynamic";
import { cn } from "@/lib/utils";
import { KhiVideoPlayerLayout } from "./video-player-layout";
import { KhiVideoPlayerLayoutYouTube } from "./video-player-layout-youtube";
import { parseYouTubeVideoId, toVidstackSrc } from "./video-source";
import "./video-player.css";

const KhiVideoPlayerLayoutFull = dynamic(
	() =>
		import("./video-player-layout-full").then(
			(mod) => mod.KhiVideoPlayerLayoutFull,
		),
	{ ssr: false },
);

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
	const youTubeId = parseYouTubeVideoId(src);
	const resolvedSrc = toVidstackSrc(src);
	const embed = youTubeId ? "youtube" : "file";
	const Layout = youTubeId
		? KhiVideoPlayerLayoutYouTube
		: variant === "full"
			? KhiVideoPlayerLayoutFull
			: KhiVideoPlayerLayout;

	return (
		<MediaPlayer
			key={resolvedSrc}
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
			load="visible"
		>
			<Layout embed={embed} poster={poster} posterAlt={posterAlt} />
		</MediaPlayer>
	);
}
