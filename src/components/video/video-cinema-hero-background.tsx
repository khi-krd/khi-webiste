"use client";

import NextImage from "next/image";
import { VideoStillPreview } from "@/components/video/video-still-preview-lazy";
import { cn } from "@/lib/utils";

type VideoCinemaHeroBackgroundProps = {
	coverUrl: string | null;
	previewVideoUrl?: string | null;
	hoverCoverUrl?: string | null;
};

export function VideoCinemaHeroBackground({
	coverUrl,
	previewVideoUrl = null,
	hoverCoverUrl,
}: VideoCinemaHeroBackgroundProps) {
	const showHoverCover = Boolean(
		hoverCoverUrl && hoverCoverUrl !== coverUrl,
	);

	return (
		<>
			{coverUrl ? (
				<NextImage
					src={coverUrl}
					alt=""
					fill
					priority
					sizes="100vw"
					className={cn(
						"object-cover object-center",
						showHoverCover &&
							"transition-opacity duration-700 group-fine:opacity-0 motion-reduce:transition-none",
					)}
				/>
			) : previewVideoUrl ? (
				<VideoStillPreview
					src={previewVideoUrl}
					sizes="100vw"
					className={cn(
						"absolute inset-0 size-full object-cover object-center",
						showHoverCover &&
							"transition-opacity duration-700 group-fine:opacity-0 motion-reduce:transition-none",
					)}
				/>
			) : null}
			{showHoverCover && hoverCoverUrl ? (
				<NextImage
					src={hoverCoverUrl}
					alt=""
					fill
					priority
					sizes="100vw"
					className="object-cover object-center opacity-0 transition-opacity duration-700 group-fine:opacity-100 motion-reduce:opacity-100"
				/>
			) : null}
		</>
	);
}
