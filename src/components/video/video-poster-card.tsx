"use client";

import { PlayIcon } from "@heroicons/react/24/solid";
import NextImage from "next/image";
import { Link } from "@/components/ui/link";
import { VideoHoverPreview } from "@/components/video/video-hover-preview";
import { VideoStillPreview } from "@/components/video/video-still-preview-lazy";
import { cn } from "@/lib/utils";
import { videoDetailHref } from "@/lib/video/resolve";

export type VideoPosterCardProps = {
	id: number;
	title: string;
	subtitle?: string | null;
	coverUrl: string | null;
	previewVideoUrl?: string | null;
	durationLabel?: string | null;
	/** 0–1 watched fraction → renders a Continue-Watching progress bar. */
	progress?: number | null;
	showPlay?: boolean;
	href?: string;
	dark?: boolean;
	className?: string;
};

export function VideoPosterCard({
	id,
	title,
	subtitle,
	coverUrl,
	previewVideoUrl = null,
	durationLabel,
	progress,
	showPlay = false,
	href,
	dark = false,
	className,
}: VideoPosterCardProps) {
	const progressPct =
		progress != null
			? Math.max(0, Math.min(100, Math.round(progress * 100)))
			: null;
	const detailHref = href ?? videoDetailHref(id);

	return (
		<Link
			href={detailHref}
			variant="nav"
			aria-label={title}
			data-preview-host
			className={cn(
				// `spotlight-item` is inert outside a `.spotlight-grid-dark` scope;
				// the opacity transition makes the beam glide, not flicker.
				"group spotlight-item relative block w-full overflow-hidden no-underline transition-opacity duration-[450ms] ease-[cubic-bezier(0.22,1,0.36,1)]",
				dark
					? "border border-primary-foreground/20"
					: "border border-border bg-sunken",
				className,
			)}
		>
			<div className="relative aspect-video w-full overflow-hidden">
				{coverUrl ? (
					<NextImage
						src={coverUrl}
						alt=""
						fill
						sizes="(max-width: 640px) 100vw, 33vw"
						className="absolute inset-0 size-full object-cover object-center brightness-[0.92] transition-[filter,transform] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-fine:scale-[1.05] group-fine:brightness-100 motion-reduce:transition-none motion-reduce:duration-0 motion-reduce:group-fine:scale-100"
					/>
				) : previewVideoUrl ? (
					<VideoStillPreview
						src={previewVideoUrl}
						sizes="(max-width: 640px) 100vw, 33vw"
						className="absolute inset-0 size-full object-cover object-center brightness-[0.92] transition-[filter,transform] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-fine:scale-[1.05] group-fine:brightness-100 motion-reduce:transition-none motion-reduce:duration-0 motion-reduce:group-fine:scale-100"
					/>
				) : (
					<div
						aria-hidden
						className="flex h-full w-full items-center justify-center bg-sunken"
					>
						<span className="font-heading text-h1 font-bold text-foreground/10">
							{title.charAt(0)}
						</span>
					</div>
				)}

				{/* Hover plays the film itself — the sibling dim from
				    `.spotlight-grid-dark` already isolates it, so the only thing
				    missing was the motion. */}
				{previewVideoUrl ? <VideoHoverPreview src={previewVideoUrl} /> : null}

				<div
					aria-hidden
					className="pointer-events-none absolute inset-0 z-1 bg-linear-to-t from-foreground/90 from-0% via-foreground/25 via-45% to-transparent to-72% transition-opacity duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-fine:from-foreground group-data-[previewing]:from-foreground"
				/>

				{durationLabel ? (
					<span
						dir="ltr"
						className={cn(
							"label absolute top-0 end-0 z-3 border-b border-s px-2 py-1 font-medium tabular-nums backdrop-blur-[1px] transition-colors duration-300",
							dark
								? "border-primary-foreground/20 bg-foreground/70 text-primary-foreground"
								: "border-border bg-surface/90 text-foreground",
							"group-fine:border-primary group-fine:bg-primary group-fine:text-primary-foreground",
						)}
					>
						{durationLabel}
					</span>
				) : null}

				{/* Resting only where the row is explicitly a "continue watching"
				    shelf; everywhere else it fades in under the pointer, and it
				    recedes again once the clip is actually rolling. */}
				<span
					aria-hidden
					className={cn(
						"pointer-events-none absolute inset-0 z-2 flex items-center justify-center transition-opacity duration-300",
						showPlay
							? "opacity-100 group-data-[previewing]:opacity-0"
							: "opacity-0 group-fine:opacity-100 group-data-[previewing]:opacity-0",
					)}
				>
					<span className="inline-flex size-12 items-center justify-center rounded-pill bg-primary/70 text-primary-foreground ring-1 ring-primary-foreground/30 backdrop-blur-[2px] transition-[transform,background-color] duration-300 group-fine:scale-110 group-fine:bg-primary/85 motion-reduce:transition-none motion-reduce:group-fine:scale-100">
						<PlayIcon className="size-5 translate-x-0.5" />
					</span>
				</span>

				<div className="absolute inset-x-0 bottom-0 z-2 p-3.5 transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-fine:-translate-y-0.5 motion-reduce:transition-none motion-reduce:group-fine:translate-y-0 sm:p-4">
					<h3 className="font-heading text-body font-semibold leading-snug text-balance text-primary-foreground line-clamp-2 sm:text-h3">
						{title}
					</h3>
					{subtitle ? (
						<p className="mt-1 line-clamp-1 text-label text-primary-foreground/70 sm:text-small">
							{subtitle}
						</p>
					) : null}
				</div>

				{progressPct != null ? (
					<div className="absolute inset-x-0 bottom-0 z-4 h-[3px] bg-primary-foreground/25">
						<div
							className="h-full bg-accent"
							style={{ width: `${progressPct}%` }}
						/>
					</div>
				) : null}
			</div>
		</Link>
	);
}
