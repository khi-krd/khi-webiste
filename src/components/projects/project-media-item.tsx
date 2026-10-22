"use client";

import { ProjectCoverImage } from "@/components/projects/project-cover-image";
import { CoverLightbox } from "@/components/ui/cover-lightbox";
import {
	ExternalMediaLink,
	MediaEmbedFrame,
} from "@/components/ui/media-source";
import dynamic from "next/dynamic";

const VideoPlayer = dynamic(
	() => import("@/components/ui/video-player").then((mod) => mod.VideoPlayer),
	{ ssr: false },
);
import { cn } from "@/lib/utils";
import type { MediaItem } from "@/types/media";

type ProjectMediaItemProps = {
	item: MediaItem;
	title: string;
	closeLabel: string;
	className?: string;
};

export function ProjectMediaItemBlock({
	item,
	title,
	closeLabel,
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
				<CoverLightbox
					src={item.url}
					alt={item.caption ?? title}
					closeLabel={closeLabel}
					caption={item.caption}
				>
					<div className="relative aspect-[4/3] overflow-hidden border border-border bg-sunken">
						<ProjectCoverImage
							src={item.url}
							alt={item.caption ?? title}
							className="h-full w-full"
							sizes="(max-width: 768px) 100vw, 50vw"
						/>
					</div>
				</CoverLightbox>
			)}

			{item.kind === "VIDEO" &&
				(item.embedUrl ? (
					<div className="overflow-hidden border border-border bg-foreground">
						<MediaEmbedFrame
							src={item.embedUrl}
							title={item.caption ?? title}
							kind="VIDEO"
						/>
					</div>
				) : item.url ? (
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
				) : item.externalUrl ? (
					<ExternalMediaLink
						href={item.externalUrl}
						label={item.caption ?? title}
						kind="VIDEO"
					/>
				) : null)}

			{item.kind === "AUDIO" &&
				(item.embedUrl ? (
					<div className="overflow-hidden border border-border">
						<MediaEmbedFrame
							src={item.embedUrl}
							title={item.caption ?? title}
							kind="AUDIO"
						/>
					</div>
				) : item.url ? (
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
				) : item.externalUrl ? (
					<ExternalMediaLink
						href={item.externalUrl}
						label={item.caption ?? title}
						kind="AUDIO"
					/>
				) : null)}

			{item.caption && (
				<figcaption className="mt-3 text-small leading-relaxed text-muted">
					{item.caption}
				</figcaption>
			)}
		</figure>
	);
}
