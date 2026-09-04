"use client";

import dynamic from "next/dynamic";
import { Spinner } from "@/components/ui/spinner";

/**
 * Vidstack touches `window` at module scope, so it must never be
 * server-rendered — same pattern as `video-player-frame.tsx`.
 */
const VideoPlayer = dynamic(
	() => import("@/components/ui/video-player").then((mod) => mod.VideoPlayer),
	{
		ssr: false,
		loading: () => (
			<div className="flex aspect-video w-full items-center justify-center bg-foreground">
				<Spinner size="lg" className="text-primary-foreground" />
			</div>
		),
	},
);

/** Client-only shell around the shared Vidstack player for platform videos. */
export function PlatformVideoPlayer({
	src,
	title,
	poster,
	className,
}: {
	src: string;
	title: string;
	poster?: string;
	className?: string;
}) {
	return (
		<VideoPlayer
			src={src}
			title={title}
			poster={poster}
			variant="full"
			className={className}
		/>
	);
}
