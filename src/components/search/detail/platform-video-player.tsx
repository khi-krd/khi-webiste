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

/**
 * The platform serves files from `/api/guest/video/{code}/stream` — a URL with
 * no extension. Declared as MP4 so Vidstack binds its native video provider
 * straight away instead of sniffing headers cross-origin (which the
 * platform's CORS policy blocks; see `mimeType` on VideoPlayer). The browser
 * decodes by container, so a WebM served from the same route still plays.
 */
const PLATFORM_VIDEO_MIME = "video/mp4";

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
			mimeType={PLATFORM_VIDEO_MIME}
			title={title}
			poster={poster}
			variant="full"
			className={className}
		/>
	);
}
