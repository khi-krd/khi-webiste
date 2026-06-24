"use client";

import { ProjectCoverImage } from "@/components/projects/project-cover-image";
import { VideoPlayer } from "@/components/ui/video-player";
import type { MediaItem } from "@/types/media";
import { cn } from "@/lib/utils";

type ProjectMediaItemProps = {
	item: MediaItem;
	title: string;
	className?: string;
};

export function ProjectMediaItemBlock({
	item,
	title,
	className,
}: ProjectMediaItemProps) {
	const isWide = item.kind === "VIDEO" || item.kind === "AUDIO";

	return (
		<figure
			className={cn(
				"flex flex-col",
				isWide && "md:col-span-2 lg:col-span-3",
				className,
			)}
		>
			{item.kind === "IMAGE" && (
				<div className="relative aspect-[4/3] overflow-hidden border border-border bg-sunken">
					<ProjectCoverImage
						src={item.url}
						alt={item.caption ?? title}
						className="absolute inset-0"
						sizes="(max-width: 768px) 100vw, 50vw"
					/>
				</div>
			)}

			{item.kind === "VIDEO" && (
				<div className="overflow-hidden border border-border bg-foreground">
					<VideoPlayer
						src={item.url}
						title={item.caption ?? title}
						poster={item.thumbnailUrl ?? undefined}
						posterAlt={item.caption ?? title}
						variant="minimal"
						className="aspect-video w-full"
					/>
				</div>
			)}

			{item.kind === "AUDIO" && (
				<div className="border border-border bg-surface p-5 sm:p-6">
					{/* biome-ignore lint/a11y/useMediaCaption: archival audio — no captions from API */}
					<audio
						controls
						preload="metadata"
						src={item.url}
						className="w-full accent-accent"
						aria-label={item.caption ?? title}
					/>
				</div>
			)}

			{item.caption && (
				<figcaption className="mt-3 text-small leading-relaxed text-muted">
					{item.caption}
				</figcaption>
			)}
		</figure>
	);
}
