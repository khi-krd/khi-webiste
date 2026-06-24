"use client";

import NextImage from "next/image";
import { useState } from "react";
import { cn } from "@/lib/utils";

const FALLBACK = "/menu/1.jpg";

type ProjectCoverImageProps = {
	src: string;
	alt: string;
	className?: string;
	imageClassName?: string;
	priority?: boolean;
	sizes?: string;
};

export function ProjectCoverImage({
	src,
	alt,
	className,
	imageClassName,
	priority = false,
	sizes = "(max-width: 768px) 100vw, 33vw",
}: ProjectCoverImageProps) {
	const [currentSrc, setCurrentSrc] = useState(src || FALLBACK);

	return (
		<div className={cn("relative overflow-hidden bg-sunken", className)}>
			<NextImage
				src={currentSrc}
				alt={alt}
				fill
				priority={priority}
				sizes={sizes}
				className={cn("object-cover", imageClassName)}
				onError={() => {
					if (currentSrc !== FALLBACK) {
						setCurrentSrc(FALLBACK);
					}
				}}
			/>
		</div>
	);
}
