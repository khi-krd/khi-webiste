"use client";

import { ArrowsPointingOutIcon } from "@heroicons/react/24/outline";
import { useCallback, useRef, useState } from "react";
import { NewsMediaModal } from "@/components/news/news-media-modal";
import { ProjectCoverMedia } from "@/components/projects/project-cover-media";
import type { MediaItem, MediaKind } from "@/types/media";
import { cn } from "@/lib/utils";

type NewsCoverMediaProps = {
	url: string;
	alt: string;
	kind: MediaKind;
	posterUrl?: string | null;
	priority?: boolean;
	className?: string;
	imageClassName?: string;
	sizes?: string;
	closeLabel: string;
	previousLabel: string;
	nextLabel: string;
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
	closeLabel,
	previousLabel,
	nextLabel,
}: NewsCoverMediaProps) {
	const dialogRef = useRef<HTMLDialogElement>(null);
	const [activeIndex, setActiveIndex] = useState<number | null>(null);

	const coverItem: MediaItem = {
		url,
		kind,
		thumbnailUrl: posterUrl ?? null,
		caption: null,
		sortOrder: 0,
	};

	const open = useCallback(() => {
		setActiveIndex(0);
		dialogRef.current?.showModal();
	}, []);

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

	return (
		<>
			{kind === "IMAGE" ? (
				<button
					type="button"
					onClick={open}
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
						onClick={open}
						aria-label={alt}
						className="absolute end-3 top-3 inline-flex size-9 items-center justify-center border border-border/80 bg-background/90 text-foreground transition-colors fine-hover:bg-background"
					>
						<ArrowsPointingOutIcon className="size-4" aria-hidden />
					</button>
				</div>
			)}

			<NewsMediaModal
				items={[coverItem]}
				activeIndex={activeIndex}
				onActiveIndexChange={setActiveIndex}
				dialogRef={dialogRef}
				articleTitle={alt}
				closeLabel={closeLabel}
				previousLabel={previousLabel}
				nextLabel={nextLabel}
			/>
		</>
	);
}
