"use client";

import { FilmIcon, MusicalNoteIcon } from "@heroicons/react/24/outline";
import { ProjectCoverImage } from "@/components/projects/project-cover-image";
import { VideoPlayer } from "@/components/ui/video-player";
import { cn } from "@/lib/utils";
import type { MediaKind } from "@/types/media";

type ProjectCoverMediaProps = {
	url: string;
	alt: string;
	kind: MediaKind;
	posterUrl?: string | null;
	priority?: boolean;
	className?: string;
	imageClassName?: string;
	sizes?: string;
	/** Dark hero treatment for detail pages. */
	variant?: "card" | "hero";
};

export function ProjectCoverMedia({
	url,
	alt,
	kind,
	posterUrl,
	priority = false,
	className,
	imageClassName,
	sizes,
	variant = "card",
}: ProjectCoverMediaProps) {
	const isHero = variant === "hero";

	if (kind === "VIDEO") {
		return (
			<div className={cn("relative overflow-hidden bg-foreground", className)}>
				<VideoPlayer
					src={url}
					title={alt}
					poster={posterUrl ?? undefined}
					posterAlt={alt}
					variant={isHero ? "full" : "minimal"}
					className={cn("h-full w-full", isHero && "min-h-[min(72svh,40rem)]")}
				/>
				{!isHero && (
					<span className="pointer-events-none absolute start-3 top-3 inline-flex items-center gap-1.5 border border-border/80 bg-background/90 px-2 py-1 label font-semibold uppercase tracking-[0.12em] text-foreground">
						<FilmIcon className="size-3.5" aria-hidden />
						Video
					</span>
				)}
			</div>
		);
	}

	if (kind === "AUDIO") {
		const poster = posterUrl ?? "/menu/5.jpg";
		return (
			<div
				className={cn(
					"relative flex flex-col justify-end overflow-hidden bg-sunken",
					className,
				)}
			>
				<ProjectCoverImage
					src={poster}
					alt={alt}
					priority={priority}
					sizes={sizes}
					className="absolute inset-0"
					imageClassName={cn(
						"brightness-[0.82] saturate-[0.7]",
						imageClassName,
					)}
				/>
				<div
					className={cn(
						"relative z-10 border-t border-border bg-surface/95 p-4 backdrop-blur-[2px] sm:p-5",
						isHero &&
							"mx-auto w-full max-w-3xl border-x-0 border-b-0 bg-surface/90",
					)}
				>
					<div className="mb-3 flex items-center gap-2 label font-semibold uppercase tracking-[0.12em] text-muted">
						<MusicalNoteIcon className="size-3.5" aria-hidden />
						Audio
					</div>
					{/* biome-ignore lint/a11y/useMediaCaption: archival audio — no captions from API */}
					<audio
						controls
						preload="metadata"
						src={url}
						className="w-full accent-accent"
						aria-label={alt}
					/>
				</div>
			</div>
		);
	}

	return (
		<ProjectCoverImage
			src={url}
			alt={alt}
			priority={priority}
			sizes={sizes}
			className={className}
			imageClassName={imageClassName}
		/>
	);
}
