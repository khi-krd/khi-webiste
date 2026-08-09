"use client";

import { PlayIcon } from "@heroicons/react/24/solid";
import NextImage from "next/image";
import { VideoStillPreview } from "@/components/video/video-still-preview-lazy";
import { cn } from "@/lib/utils";
import { formatDuration } from "@/lib/video/format";
import type { ResolvedVideoClip } from "@/types/video";

export type FilmSceneListLabels = {
	title: string;
	play: string;
	nowPlaying: string;
	scene: string;
};

type FilmSceneListProps = {
	scenes: ResolvedVideoClip[];
	activeSceneNumber: number;
	onSelect: (sceneNumber: number) => void;
	labels: FilmSceneListLabels;
	fallbackCoverUrl?: string | null;
	className?: string;
};

const MEDIA_FILE_PATTERN = /\.(mp4|webm|ogg|ogv|mov|m4v|m3u8|mpd)(\?|#|$)/i;

function SceneStill({
	scene,
	isActive,
	fallbackCoverUrl,
}: {
	scene: ResolvedVideoClip;
	isActive: boolean;
	fallbackCoverUrl?: string | null;
}) {
	const mediaClass = cn(
		"absolute inset-0 size-full object-cover object-center transition-[filter,transform] duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none",
		isActive
			? "brightness-[0.92] contrast-[1.05] saturate-[0.9]"
			: "brightness-[0.55] contrast-[1.08] saturate-[0.65] group-fine:scale-[1.04] group-fine:brightness-[0.78] motion-reduce:group-fine:scale-100",
	);

	if (scene.coverUrl) {
		return (
			<NextImage
				src={scene.coverUrl}
				alt=""
				fill
				sizes="(max-width: 640px) 85vw, (max-width: 1024px) 40vw, 28vw"
				className={mediaClass}
			/>
		);
	}

	if (scene.url && MEDIA_FILE_PATTERN.test(scene.url)) {
		return (
			<VideoStillPreview
				src={scene.url}
				fallbackCoverUrl={scene.coverUrl ?? fallbackCoverUrl}
				sizes="(max-width: 640px) 85vw, (max-width: 1024px) 40vw, 28vw"
				className={mediaClass}
			/>
		);
	}

	return <div aria-hidden className="h-full w-full bg-primary-foreground/5" />;
}

/**
 * Cinema reel of playable film scenes — dark, letterboxed tiles that feed
 * the player above (same interaction model as VideoClipList).
 */
export function FilmSceneList({
	scenes,
	activeSceneNumber,
	onSelect,
	labels,
	fallbackCoverUrl = null,
	className,
}: FilmSceneListProps) {
	if (scenes.length === 0) {
		return null;
	}

	return (
		<section className={cn(className)} aria-label={labels.title}>
			{/* Program strip: double hairline frame + two-digit reel count. */}
			<div className="flex items-baseline justify-between gap-4 border-y border-primary-foreground/15 py-2.5">
				<p className="label font-medium text-primary-foreground/55">
					{labels.title}
				</p>
				<span
					aria-hidden="true"
					dir="ltr"
					className="text-label tabular-nums text-primary-foreground/40"
				>
					{String(scenes.length).padStart(2, "0")}
				</span>
			</div>

			<ol
				className={cn(
					"mt-4 grid gap-3 sm:mt-5 sm:gap-4",
					scenes.length === 2 && "sm:grid-cols-2",
					scenes.length === 3 && "sm:grid-cols-3",
					scenes.length >= 4 && "grid-cols-2 lg:grid-cols-4",
				)}
			>
				{scenes.map((scene) => {
					const isActive = scene.clipNumber === activeSceneNumber;
					const duration = formatDuration(scene.durationSeconds);

					return (
						<li key={scene.clipNumber} className="@container min-w-0">
							<button
								type="button"
								onClick={() => onSelect(scene.clipNumber)}
								aria-current={isActive ? "true" : undefined}
								aria-label={
									isActive
										? `${scene.title || labels.title} — ${labels.nowPlaying}`
										: `${labels.play}: ${scene.title || labels.title}`
								}
								className={cn(
									"group relative block w-full overflow-hidden text-start transition-[box-shadow,opacity] duration-300",
									isActive
										? "ring-1 ring-primary-foreground/70 shadow-[0_18px_48px_-28px_rgba(0,0,0,0.9)]"
										: "ring-1 ring-primary-foreground/12 fine-hover:ring-primary-foreground/35",
								)}
							>
								{/* Letterbox frame */}
								<div className="relative aspect-[2.2/1] w-full overflow-hidden bg-foreground">
									<SceneStill
										scene={scene}
										isActive={isActive}
										fallbackCoverUrl={fallbackCoverUrl}
									/>

									{/* Top/bottom cinema bars */}
									<span
										aria-hidden
										className="pointer-events-none absolute inset-x-0 top-0 z-2 h-2 bg-foreground/90 sm:h-2.5"
									/>
									<span
										aria-hidden
										className="pointer-events-none absolute inset-x-0 bottom-0 z-2 h-2 bg-foreground/90 sm:h-2.5"
									/>

									<div
										aria-hidden
										className="pointer-events-none absolute inset-0 bg-linear-to-t from-foreground from-0% via-foreground/45 via-42% to-transparent to-72%"
									/>

									{duration ? (
										<span
											dir="ltr"
											className="absolute top-3 inset-e-2.5 z-3 border border-primary-foreground/25 bg-foreground/70 px-1.5 py-0.5 text-label font-medium tabular-nums text-primary-foreground/85 backdrop-blur-[2px] sm:top-3.5 sm:inset-e-3"
										>
											{duration}
										</span>
									) : null}

									<span
										aria-hidden
										className={cn(
											"pointer-events-none absolute inset-0 z-3 flex items-center justify-center transition-opacity duration-300",
											isActive
												? "opacity-100"
												: "opacity-0 group-fine:opacity-100",
										)}
									>
										<span
											className={cn(
												"inline-flex size-10 items-center justify-center rounded-pill backdrop-blur-[2px] transition-transform duration-300 sm:size-11",
												isActive
													? "bg-primary-foreground text-foreground"
													: "bg-primary-foreground/90 text-foreground ring-1 ring-foreground/10 group-fine:scale-110 motion-reduce:group-fine:scale-100",
											)}
										>
											<PlayIcon className="size-4 translate-x-0.5 sm:size-5" />
										</span>
									</span>

									{/* Overlay rows are gated on TILE width (@container): tiles
									    narrower than ~17.5rem are too short (aspect 2.2/1) to hold
									    the full three-row stack inside overflow-hidden, so they
									    keep only a one-line title. */}
									<div className="absolute inset-x-0 bottom-0 z-3 p-3 pt-8 sm:p-3.5 sm:pt-10">
										{/* Program entry number — decorative; the button label carries meaning. */}
										<span
											aria-hidden
											className="label hidden items-center gap-1.5 font-medium text-primary-foreground/60 @[17.5rem]:flex"
										>
											{labels.scene}
											<span dir="ltr" className="tabular-nums">
												{String(scene.clipNumber).padStart(2, "0")}
											</span>
										</span>
										{scene.title ? (
											<span className="mt-0.5 block font-heading text-small font-semibold leading-snug text-balance text-primary-foreground line-clamp-1 @[17.5rem]:line-clamp-2 sm:text-body">
												{scene.title}
											</span>
										) : null}
										{isActive ? (
											<span className="mt-1.5 hidden items-center gap-1.5 text-label text-primary-foreground/75 @[17.5rem]:inline-flex">
												<span
													aria-hidden
													className="size-1.5 rounded-pill bg-primary-foreground"
												/>
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
