"use client";

import {
	FilmIcon,
	PlayIcon,
	RectangleStackIcon,
} from "@heroicons/react/24/solid";
import NextImage from "next/image";
import { Link } from "@/components/ui/link";
import { VideoStillPreview } from "@/components/video/video-still-preview-lazy";
import { cn } from "@/lib/utils";
import { videoDetailHref } from "@/lib/video/resolve";
import type { VideoType } from "@/types/video";

export type VideoCardProps = {
	id: number;
	title: string;
	/** Director — the card's quiet sub-line. */
	subtitle: string | null;
	coverUrl: string | null;
	previewVideoUrl?: string | null;
	hoverCoverUrl: string | null;
	videoType: VideoType;
	/** Translated type word ("Film" / "Clip"). */
	typeLabel: string;
	topicLabel?: string | null;
	/** Timecode, e.g. "12:00" — rendered LTR. */
	durationLabel: string | null;
	memories?: boolean;
	memoriesLabel?: string | null;
	/** Override detail href (e.g. short-films route or clip deep-link). */
	href?: string;
	/** featured = full-bleed cinemascope hero with overlaid text. */
	variant?: "featured" | "grid";
	className?: string;
};

/** Aged-photograph tint for Album-of-Memories covers — subtle, archival. */
const memoriesCoverClass = "sepia-[0.28] contrast-[0.97]";

const imageBase =
	"absolute inset-0 size-full object-cover object-center brightness-[0.93] saturate-[0.88] transition-[filter,transform] duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] group-fine:scale-[1.04] group-fine:brightness-100 group-fine:saturate-100 motion-reduce:transition-none motion-reduce:duration-0 motion-reduce:group-fine:scale-100";

/** Square chip with a film-cell sprocket strip — the catalogue's signature mark. */
function FrameChip({
	children,
	className,
}: {
	children: React.ReactNode;
	className?: string;
}) {
	return (
		<span
			className={cn(
				"label inline-flex items-center gap-1.5 border border-border bg-surface/95 px-2 py-1 font-medium text-foreground backdrop-blur-[1px]",
				className,
			)}
		>
			{children}
		</span>
	);
}

function PlayMark({ large = false }: { large?: boolean }) {
	return (
		<span
			aria-hidden
			className="pointer-events-none absolute inset-0 z-2 flex items-center justify-center"
		>
			<span
				className={cn(
					"inline-flex items-center justify-center rounded-pill bg-foreground/65 text-primary-foreground ring-1 ring-primary-foreground/30 backdrop-blur-[2px] transition-[transform,background-color,opacity] duration-300 group-fine:bg-foreground/80 group-fine:opacity-100 motion-reduce:transition-none motion-reduce:group-fine:scale-100",
					large ? "size-16" : "size-12",
					"opacity-0 scale-90 group-fine:scale-100 sm:opacity-80",
				)}
			>
				<PlayIcon
					className={cn(large ? "size-7" : "size-5", "translate-x-0.5")}
				/>
			</span>
		</span>
	);
}

function CoverLayer({
	coverUrl,
	previewVideoUrl = null,
	hoverCoverUrl,
	title,
	memories,
	sizes,
}: {
	coverUrl: string | null;
	previewVideoUrl?: string | null;
	hoverCoverUrl: string | null;
	title: string;
	memories: boolean;
	sizes: string;
}) {
	if (!coverUrl && !previewVideoUrl) {
		return (
			<div
				aria-hidden
				className="flex h-full w-full items-center justify-center bg-sunken"
			>
				<span className="font-heading text-display font-bold text-foreground/10">
					{title.charAt(0)}
				</span>
			</div>
		);
	}

	const showHoverCover = Boolean(hoverCoverUrl && hoverCoverUrl !== coverUrl);

	return (
		<>
			{coverUrl ? (
				<NextImage
					src={coverUrl}
					alt=""
					fill
					sizes={sizes}
					className={cn(imageBase, memories && memoriesCoverClass)}
				/>
			) : previewVideoUrl ? (
				<VideoStillPreview
					src={previewVideoUrl}
					sizes={sizes}
					className={cn(imageBase, memories && memoriesCoverClass)}
				/>
			) : null}
			{showHoverCover && hoverCoverUrl ? (
				<div
					aria-hidden
					className="absolute inset-0 opacity-0 transition-opacity duration-500 group-fine:opacity-100 motion-reduce:transition-none"
				>
					<NextImage
						src={hoverCoverUrl}
						alt=""
						fill
						sizes={sizes}
						className={cn(
							"absolute inset-0 size-full object-cover object-center",
							memories && memoriesCoverClass,
						)}
					/>
				</div>
			) : null}
		</>
	);
}

export function VideoCard({
	id,
	title,
	subtitle,
	coverUrl,
	previewVideoUrl = null,
	hoverCoverUrl,
	videoType,
	typeLabel,
	topicLabel,
	durationLabel,
	memories = false,
	memoriesLabel,
	href,
	variant = "grid",
	className,
}: VideoCardProps) {
	const detailHref = href ?? videoDetailHref(id);
	const isFeatured = variant === "featured";
	const isClip = videoType === "VIDEO_CLIP";
	const TypeIcon = isClip ? RectangleStackIcon : FilmIcon;
	const footerMeta = [typeLabel, topicLabel].filter(Boolean).join(" · ");

	const corners = (
		<>
			<FrameChip className="absolute top-0 start-0 z-2 border-s-0 border-t-0">
				<TypeIcon className="size-3.5 text-muted" aria-hidden />
				{typeLabel}
			</FrameChip>
			{memories && memoriesLabel ? (
				<span className="label absolute top-0 end-0 z-2 border-b border-s border-border bg-surface/95 px-2 py-1 font-medium text-muted backdrop-blur-[1px]">
					{memoriesLabel}
				</span>
			) : null}
			{durationLabel ? (
				<span
					dir="ltr"
					className="label absolute bottom-0 end-0 z-2 border-s border-t border-border bg-surface/95 px-2 py-1 font-medium text-foreground tabular-nums backdrop-blur-[1px]"
				>
					{durationLabel}
				</span>
			) : null}
		</>
	);

	// Featured — full-bleed cinemascope marquee with overlaid text.
	if (isFeatured) {
		return (
			<Link
				href={detailHref}
				variant="nav"
				aria-label={title}
				className={cn(
					"group relative block w-full overflow-hidden border border-border bg-sunken no-underline transition-shadow duration-300 fine-hover:shadow-[0_8px_24px_-12px_rgba(26,24,19,0.12)]",
					className,
				)}
			>
				<div className="relative aspect-video w-full sm:aspect-[2.4/1]">
					<CoverLayer
						coverUrl={coverUrl}
						previewVideoUrl={previewVideoUrl}
						hoverCoverUrl={hoverCoverUrl}
						title={title}
						memories={memories}
						sizes="100vw"
					/>
					<div
						aria-hidden
						className="pointer-events-none absolute inset-0 z-1 bg-linear-to-t from-foreground/85 from-0% via-foreground/35 via-45% to-transparent to-75%"
					/>
					{corners}
					<PlayMark large />

					<div className="absolute inset-x-0 bottom-0 z-2 p-5 text-primary-foreground sm:p-7 lg:p-9">
						<div className="max-w-2xl">
							<h3 className="font-heading text-h2 font-bold leading-tight text-balance lg:text-display">
								{title}
							</h3>
							{subtitle ? (
								<p className="mt-2 text-small text-primary-foreground/80 sm:text-body">
									{subtitle}
								</p>
							) : null}
						</div>
					</div>
				</div>
			</Link>
		);
	}

	// Grid — 16:9 frame with the text block sitting below it.
	return (
		<Link
			href={detailHref}
			variant="nav"
			aria-label={title}
			className={cn(
				"group relative flex h-full w-full flex-col items-stretch overflow-hidden border border-border bg-surface no-underline transition-[border-color,box-shadow] duration-300 fine-hover:border-foreground/30 fine-hover:shadow-[0_8px_24px_-12px_rgba(26,24,19,0.12)]",
				className,
			)}
		>
			<div className="relative aspect-video w-full shrink-0 overflow-hidden bg-sunken">
				<CoverLayer
					coverUrl={coverUrl}
					previewVideoUrl={previewVideoUrl}
					hoverCoverUrl={hoverCoverUrl}
					title={title}
					memories={memories}
					sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
				/>
				{corners}
				<PlayMark />
			</div>

			<div className="flex w-full flex-1 flex-col gap-1.5 px-4 py-4 text-start sm:px-5">
				<p className="label text-muted">{footerMeta}</p>
				<h3 className="font-heading text-h3 font-bold leading-snug text-foreground">
					{title}
				</h3>
				{subtitle ? (
					<p className="text-small text-foreground/80">{subtitle}</p>
				) : null}
			</div>
		</Link>
	);
}
