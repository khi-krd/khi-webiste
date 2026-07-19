"use client";

import { PlayIcon, SpeakerWaveIcon } from "@heroicons/react/24/solid";
import NextImage from "next/image";
import { cn } from "@/lib/utils";
import { formatDuration } from "@/lib/video/format";
import type { ResolvedVideoClip } from "@/types/video";

export type VideoClipListLabels = {
	title: string;
	play: string;
	nowPlaying: string;
};

type VideoClipListProps = {
	clips: ResolvedVideoClip[];
	activeClipNumber: number;
	onSelect: (clipNumber: number) => void;
	labels: VideoClipListLabels;
	className?: string;
};

const MEDIA_FILE_PATTERN = /\.(mp4|webm|ogg|ogv|mov|m4v|m3u8|mpd)(\?|#|$)/i;

function ClipStill({
	clip,
	isActive,
}: {
	clip: ResolvedVideoClip;
	isActive: boolean;
}) {
	const mediaClass = cn(
		"absolute inset-0 size-full object-cover object-center transition-[filter,transform] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none",
		isActive
			? "brightness-100"
			: "brightness-[0.88] group-fine:scale-[1.04] group-fine:brightness-100 motion-reduce:group-fine:scale-100",
	);

	if (clip.coverUrl) {
		return (
			<NextImage
				src={clip.coverUrl}
				alt=""
				fill
				sizes="(max-width: 640px) 100vw, 33vw"
				className={mediaClass}
			/>
		);
	}

	// Distinct still from the clip’s own file — never reuse the parent cover.
	if (clip.url && MEDIA_FILE_PATTERN.test(clip.url)) {
		return (
			<video
				src={`${clip.url}#t=0.5`}
				muted
				playsInline
				preload="metadata"
				aria-hidden
				className={mediaClass}
			/>
		);
	}

	return (
		<div
			aria-hidden
			className="flex h-full w-full items-center justify-center bg-sunken"
		>
			<span className="font-heading text-h1 font-bold text-foreground/10">
				{clip.clipNumber}
			</span>
		</div>
	);
}

export function VideoClipList({
	clips,
	activeClipNumber,
	onSelect,
	labels,
	className,
}: VideoClipListProps) {
	if (clips.length === 0) {
		return null;
	}

	return (
		<section className={cn(className)} aria-label={labels.title}>
			<p className="label font-medium">{labels.title}</p>
			<ol
				className={cn(
					"mt-4 grid gap-3 sm:mt-5 sm:gap-4",
					clips.length === 2 && "sm:grid-cols-2",
					clips.length >= 3 && "sm:grid-cols-3",
				)}
			>
				{clips.map((clip) => {
					const isActive = clip.clipNumber === activeClipNumber;
					const duration = formatDuration(clip.durationSeconds);

					return (
						<li key={clip.clipNumber} className="min-w-0">
							<button
								type="button"
								onClick={() => onSelect(clip.clipNumber)}
								aria-current={isActive ? "true" : undefined}
								aria-label={
									isActive
										? `${clip.title} — ${labels.nowPlaying}`
										: `${labels.play}: ${clip.title}`
								}
								className={cn(
									"group relative block w-full overflow-hidden rounded-md border text-start transition-[border-color,box-shadow,opacity] duration-300",
									isActive
										? "border-foreground ring-1 ring-foreground"
										: "border-border bg-sunken fine-hover:border-border-strong",
								)}
							>
								<div className="relative aspect-video w-full overflow-hidden">
									<ClipStill clip={clip} isActive={isActive} />

									<div
										aria-hidden
										className="pointer-events-none absolute inset-0 bg-linear-to-t from-foreground/85 from-0% via-foreground/20 via-45% to-transparent to-70%"
									/>

									{duration ? (
										<span
											dir="ltr"
											className="label absolute top-0 end-0 z-2 border-b border-s border-border bg-surface/90 px-2 py-1 font-medium tabular-nums text-foreground backdrop-blur-[1px]"
										>
											{duration}
										</span>
									) : null}

									<span
										aria-hidden
										className={cn(
											"pointer-events-none absolute inset-0 z-2 flex items-center justify-center transition-opacity duration-300",
											isActive
												? "opacity-100"
												: "opacity-0 group-fine:opacity-100",
										)}
									>
										<span
											className={cn(
												"inline-flex size-11 items-center justify-center rounded-pill ring-1 backdrop-blur-[2px] transition-transform duration-300",
												isActive
													? "bg-primary text-primary-foreground ring-foreground/10"
													: "bg-primary-foreground/90 text-foreground ring-foreground/10 group-fine:scale-110 motion-reduce:group-fine:scale-100",
											)}
										>
											{isActive ? (
												<SpeakerWaveIcon className="size-5" />
											) : (
												<PlayIcon className="size-5 translate-x-0.5" />
											)}
										</span>
									</span>

									<div className="absolute inset-x-0 bottom-0 z-1 p-3 sm:p-3.5">
										<span className="mb-1 block text-label tabular-nums text-primary-foreground/65">
											{clip.clipNumber}
										</span>
										<span className="block font-heading text-small font-semibold leading-snug text-balance text-primary-foreground line-clamp-2 sm:text-body">
											{clip.title}
										</span>
										{isActive ? (
											<span className="mt-1 block text-label text-primary-foreground/75">
												{labels.nowPlaying}
											</span>
										) : null}
									</div>
								</div>
							</button>
						</li>
					);
				})}
			</ol>
		</section>
	);
}
