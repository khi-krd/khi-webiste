"use client";

import NextImage from "next/image";
import { useEffect, useRef, useState } from "react";
import { isDirectMediaFileUrl } from "@/lib/video/source";

type VideoStillPreviewProps = {
	src: string;
	className?: string;
	fallbackCoverUrl?: string | null;
	/** Seconds into the file to seek for the preview frame. */
	seekSeconds?: number;
	sizes?: string;
};

/**
 * Renders a still frame from a direct video URL (mp4/webm/…).
 * Loaded via {@link video-still-preview-lazy} with `ssr: false`.
 */
export function VideoStillPreview({
	src,
	className,
	fallbackCoverUrl = null,
	seekSeconds = 0.5,
	sizes = "(max-width: 640px) 100vw, 33vw",
}: VideoStillPreviewProps) {
	const videoRef = useRef<HTMLVideoElement>(null);
	const [failed, setFailed] = useState(false);

	useEffect(() => {
		setFailed(false);
		const video = videoRef.current;
		if (!video) {
			return;
		}

		const seekToPreview = () => {
			if (!Number.isFinite(video.duration) || video.duration <= 0) {
				return;
			}
			const target = Math.min(seekSeconds, Math.max(0, video.duration - 0.05));
			if (Math.abs(video.currentTime - target) > 0.05) {
				video.currentTime = target;
			}
		};

		video.addEventListener("loadedmetadata", seekToPreview);
		video.addEventListener("durationchange", seekToPreview);

		return () => {
			video.removeEventListener("loadedmetadata", seekToPreview);
			video.removeEventListener("durationchange", seekToPreview);
		};
	}, [seekSeconds]);

	if (!isDirectMediaFileUrl(src)) {
		return null;
	}

	if (failed && fallbackCoverUrl) {
		return (
			<NextImage
				src={fallbackCoverUrl}
				alt=""
				fill
				sizes={sizes}
				className={className}
			/>
		);
	}

	if (failed) {
		return null;
	}

	return (
		<video
			ref={videoRef}
			src={src}
			muted
			playsInline
			preload="metadata"
			aria-hidden
			onError={() => setFailed(true)}
			className={className}
		/>
	);
}
