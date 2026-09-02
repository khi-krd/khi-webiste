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
	href?: string;
	dark?: boolean;
	/**
	 * "overlay" stacks the title on the still — right for the tight related row,
	 * where the poster is the whole card. "caption" sets the text below the
	 * frame instead: at programme-grid size the artwork is busy enough that
	 * overlaid Kurdish titles lose their counters against it, and the caption
	 * also gives the eyebrow and the director a line of their own.
	 */
	variant?: "overlay" | "caption";
	className?: string;
};

const coverClass =
	"absolute inset-0 size-full object-cover object-center brightness-[0.92] transition-[filter,transform] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-fine:scale-[1.05] group-fine:brightness-100 motion-reduce:transition-none motion-reduce:duration-0 motion-reduce:group-fine:scale-100";

export function VideoPosterCard({
	id,
	title,
	subtitle,
	coverUrl,
	previewVideoUrl = null,
	durationLabel,
	href,
	dark = false,
	variant = "overlay",
	className,
}: VideoPosterCardProps) {
	const detailHref = href ?? videoDetailHref(id);
	const isCaption = variant === "caption";
	const sizes = isCaption
		? "(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
		: "(max-width: 640px) 100vw, 33vw";

	return (
		<Link
			href={detailHref}
			variant="nav"
			aria-label={title}
			data-preview-host
			className={cn(
				// `spotlight-item` is inert outside a `.spotlight-grid-dark` scope;
				// the opacity transition makes the beam glide, not flicker.
				"group spotlight-item relative block w-full overflow-hidden no-underline",
				"transition-[opacity,border-color,box-shadow] duration-[450ms] ease-[cubic-bezier(0.22,1,0.36,1)]",
				isCaption && "flex h-full flex-col",
				dark
					? "border border-primary-foreground/20 fine-hover:border-primary-foreground/45"
					: "border border-border bg-sunken fine-hover:border-foreground/30",
				isCaption &&
					(dark
						? "bg-primary-foreground/[0.045] fine-hover:shadow-[0_18px_44px_-26px_rgba(0,0,0,0.9)]"
						: "bg-surface fine-hover:shadow-[0_8px_24px_-12px_rgba(26,24,19,0.12)]"),
				className,
			)}
		>
			<div
				className={cn(
					"relative aspect-video w-full overflow-hidden",
					isCaption && "shrink-0",
					dark ? "bg-primary-foreground/10" : "bg-sunken",
				)}
			>
				{coverUrl ? (
					<NextImage
						src={coverUrl}
						alt=""
						fill
						sizes={sizes}
						className={coverClass}
					/>
				) : previewVideoUrl ? (
					<VideoStillPreview
						src={previewVideoUrl}
						sizes={sizes}
						className={coverClass}
					/>
				) : (
					<div
						aria-hidden
						className={cn(
							"flex h-full w-full items-center justify-center",
							dark ? "bg-primary-foreground/5" : "bg-sunken",
						)}
					>
						<span
							className={cn(
								"font-heading text-h1 font-bold",
								dark ? "text-primary-foreground/15" : "text-foreground/10",
							)}
						>
							{title.charAt(0)}
						</span>
					</div>
				)}

				{/* Hover plays the film itself — the sibling dim from
				    `.spotlight-grid-dark` already isolates it, so the only thing
				    missing was the motion. */}
				{previewVideoUrl ? <VideoHoverPreview src={previewVideoUrl} /> : null}

				{/* The caption layout carries its own text, so the still only needs
				    enough weight at the foot to seat the timecode. */}
				<div
					aria-hidden
					className={cn(
						"pointer-events-none absolute inset-0 z-1 bg-linear-to-t transition-opacity duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]",
						isCaption
							? "from-foreground/55 from-0% via-foreground/10 via-40% to-transparent to-70% group-fine:from-foreground/75"
							: "from-foreground/90 from-0% via-foreground/25 via-45% to-transparent to-72% group-fine:from-foreground group-data-[previewing]:from-foreground",
					)}
				/>

				{durationLabel ? (
					// Timecode: top corner when the title sits on the still, foot
					// corner when it sits below — always the corner the text is not.
					<span
						dir="ltr"
						className={cn(
							"label absolute end-0 z-3 border-s px-2 py-1 font-medium tabular-nums backdrop-blur-[1px] transition-colors duration-300",
							isCaption ? "bottom-0 border-t" : "top-0 border-b",
							dark
								? "border-primary-foreground/20 bg-foreground/70 text-primary-foreground"
								: "border-border bg-surface/90 text-foreground",
							"group-fine:border-primary group-fine:bg-primary group-fine:text-primary-foreground",
						)}
					>
						{durationLabel}
					</span>
				) : null}

				{/* Fades in under the pointer and recedes again once the clip is
				    actually rolling. */}
				<span
					aria-hidden
					className="pointer-events-none absolute inset-0 z-2 flex items-center justify-center opacity-0 transition-opacity duration-300 group-fine:opacity-100 group-focus-visible:opacity-100 group-data-[previewing]:opacity-0"
				>
					<span className="inline-flex size-12 items-center justify-center rounded-pill bg-primary text-primary-foreground ring-1 ring-primary-foreground/25 backdrop-blur-[2px] transition-transform duration-300 group-fine:scale-110 motion-reduce:transition-none motion-reduce:group-fine:scale-100">
						<PlayIcon className="size-5 translate-x-0.5" />
					</span>
				</span>

				{isCaption ? null : (
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
				)}
			</div>

			{isCaption ? (
				// Title only: at grid size the still already carries the subject, and
				// a tag line plus a director line under every card turned the row
				// into three blocks of text competing with the artwork.
				<div className="flex flex-1 flex-col px-4 py-3.5 text-start sm:px-5 sm:py-4">
					<h3
						className={cn(
							"font-heading text-body font-semibold leading-snug text-balance line-clamp-2",
							dark ? "text-primary-foreground" : "text-foreground",
						)}
					>
						{title}
					</h3>
				</div>
			) : null}
		</Link>
	);
}
