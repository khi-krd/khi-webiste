"use client";

import { VideoPlayer } from "@/components/ui/video-player";
import type { ResolvedAlbumVideo } from "@/types/audio";

type AudioAlbumVideoProps = {
	title: string;
	video: ResolvedAlbumVideo;
	className?: string;
};

/**
 * Album video section using the shared KHI Vidstack player.
 */
export function AudioAlbumVideo({
	title,
	video,
	className,
}: AudioAlbumVideoProps) {
	return (
		<section aria-label={title} className={className}>
			<h2 className="font-heading text-h3 font-bold">{title}</h2>

			<div className="mt-5 overflow-hidden border border-border bg-foreground">
				<VideoPlayer
					src={video.url}
					title={title}
					poster={video.posterUrl ?? undefined}
					posterAlt={title}
					variant="full"
					className="aspect-video w-full"
				/>
			</div>
		</section>
	);
}
