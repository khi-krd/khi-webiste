"use client";

import NextImage from "next/image";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

const FALLBACK = "/menu/1.jpg";

/** Frame shape before the cover reports its own dimensions. */
const FALLBACK_RATIO = 4 / 3;

function isRemoteSrc(src: string): boolean {
	return src.startsWith("http://") || src.startsWith("https://");
}

type ProjectCoverImageProps = {
	src: string;
	alt: string;
	className?: string;
	imageClassName?: string;
	priority?: boolean;
	sizes?: string;
	/**
	 * Shape the frame to the cover's OWN aspect ratio once it loads, instead of
	 * a fixed one. The covers are book jackets in wildly different formats, so a
	 * hardcoded ratio either crops the artwork (object-cover) or leaves it
	 * floating in dead space (object-contain) — with the real ratio the frame
	 * fits the image exactly and does neither.
	 *
	 * Measured client-side because the CMS returns no intrinsic dimensions; the
	 * fallback ratio holds the space until the first frame is decoded.
	 */
	naturalRatio?: boolean;
};

export function ProjectCoverImage({
	src,
	alt,
	className,
	imageClassName,
	priority = false,
	sizes = "(max-width: 768px) 100vw, 33vw",
	naturalRatio = false,
}: ProjectCoverImageProps) {
	const [currentSrc, setCurrentSrc] = useState(src || FALLBACK);
	const [ratio, setRatio] = useState<number | null>(null);

	useEffect(() => {
		setCurrentSrc(src || FALLBACK);
		setRatio(null);
	}, [src]);

	return (
		<div
			className={cn("relative overflow-hidden bg-sunken", className)}
			style={
				naturalRatio
					? { aspectRatio: String(ratio ?? FALLBACK_RATIO) }
					: undefined
			}
		>
			<NextImage
				src={currentSrc}
				alt={alt}
				fill
				priority={priority}
				sizes={sizes}
				unoptimized={isRemoteSrc(currentSrc)}
				className={cn("object-cover", imageClassName)}
				onLoad={(event) => {
					if (!naturalRatio) return;
					const { naturalWidth, naturalHeight } = event.currentTarget;
					if (naturalWidth > 0 && naturalHeight > 0) {
						setRatio(naturalWidth / naturalHeight);
					}
				}}
				onError={() => {
					if (currentSrc !== FALLBACK) {
						setCurrentSrc(FALLBACK);
					}
				}}
			/>
		</div>
	);
}
