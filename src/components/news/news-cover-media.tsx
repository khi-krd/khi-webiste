"use client";

import { ArrowsPointingOutIcon } from "@heroicons/react/24/outline";
import { useNewsPostLightbox } from "@/components/news/news-post-lightbox";
import { ProjectCoverMedia } from "@/components/projects/project-cover-media";
import { cn } from "@/lib/utils";
import type { MediaKind } from "@/types/media";

type NewsCoverMediaProps = {
	url: string;
	alt: string;
	kind: MediaKind;
	posterUrl?: string | null;
	priority?: boolean;
	className?: string;
	imageClassName?: string;
	sizes?: string;
};

export function NewsCoverMedia({
	url,
	alt,
	kind,
	posterUrl,
	priority = false,
	className,
	imageClassName,
	sizes,
}: NewsCoverMediaProps) {
	const { openCover } = useNewsPostLightbox();

	const coverMedia = (
		<ProjectCoverMedia
			url={url}
			alt={alt}
			kind={kind}
			posterUrl={posterUrl}
			priority={priority}
			className={className}
			imageClassName={imageClassName}
			sizes={sizes}
		/>
	);

	return kind === "IMAGE" ? (
		<button
			type="button"
			onClick={openCover}
			aria-label={alt}
			className={cn(
				"group block w-full cursor-pointer text-start",
				"transition-opacity fine-hover:opacity-95",
			)}
		>
			{coverMedia}
		</button>
	) : (
		<div className="relative">
			{coverMedia}
			<button
				type="button"
				onClick={openCover}
				aria-label={alt}
				className="absolute end-3 top-3 inline-flex size-9 items-center justify-center border border-primary-foreground/25 bg-primary text-primary-foreground transition-opacity fine-hover:opacity-90"
			>
				<ArrowsPointingOutIcon className="size-4" aria-hidden />
			</button>
		</div>
	);
}
