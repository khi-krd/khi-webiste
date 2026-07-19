"use client";

import { PlayIcon } from "@heroicons/react/24/solid";
import NextImage from "next/image";
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
	className?: string;
};

const MEDIA_FILE_PATTERN = /\.(mp4|webm|ogg|ogv|mov|m4v|m3u8|mpd)(\?|#|$)/i;

function padScene(n: number): string {
	return String(n).padStart(2, "0");
}

function SceneStill({
	scene,
	isActive,
}: {
	scene: ResolvedVideoClip;
	isActive: boolean;
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
			<video
				src={`${scene.url}#t=0.5`}
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
			className="flex h-full w-full items-center justify-center bg-primary-foreground/5"
		>
			<span className="font-heading text-display font-bold text-primary-foreground/12">
				{padScene(scene.clipNumber)}
			</span>
		</div>
	);
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
	className,
}: FilmSceneListProps) {
	if (scenes.length === 0) {
		return null;
	}

	return (
		<section className={cn(className)} aria-label={labels.title}>
			<div className="flex items-end justify-between gap-4 border-b border-primary-foreground/15 pb-3">
				<div>
					<p className="text-label font-medium tracking-[0.14em] text-primary-foreground/50 uppercase">
						{labels.title}
					</p>
				</div>
				<p
					dir="ltr"
					className="shrink-0 text-label tabular-nums text-primary-foreground/40"
				>
					{padScene(1)}–{padScene(scenes.length)}
				</p>
			</div>

			<ol
				className={cn(
					"mt-5 grid gap-3 sm:mt-6 sm:gap-4",
					scenes.length === 2 && "sm:grid-cols-2",
					scenes.length === 3 && "sm:grid-cols-3",
					scenes.length >= 4 && "grid-cols-2 lg:grid-cols-4",
				)}
			>
				{scenes.map((scene) => {
					const isActive = scene.clipNumber === activeSceneNumber;
					const duration = formatDuration(scene.durationSeconds);
					const sceneLabel = `${labels.scene} ${padScene(scene.clipNumber)}`;

					return (
						<li key={scene.clipNumber} className="min-w-0">
							<button
								type="button"
								onClick={() => onSelect(scene.clipNumber)}
								aria-current={isActive ? "true" : undefined}
								aria-label={
									isActive
										? `${scene.title} — ${labels.nowPlaying}`
										: `${labels.play}: ${scene.title}`
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
									<SceneStill scene={scene} isActive={isActive} />

									{/* Top/bottom cinema bars */}
									<span
										aria-hidden
										className="pointer-events-none absolute inset-x-0 top-0 z-2 h-1.5 bg-foreground/80 sm:h-2"
									/>
									<span
										aria-hidden
										className="pointer-events-none absolute inset-x-0 bottom-0 z-2 h-1.5 bg-foreground/80 sm:h-2"
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

									<div className="absolute inset-x-0 bottom-0 z-3 p-3 pt-8 sm:p-3.5 sm:pt-10">
										<span
											dir="ltr"
											className="mb-1 block text-label tracking-[0.12em] text-primary-foreground/55 uppercase"
										>
											{sceneLabel}
										</span>
										<span className="block font-heading text-small font-semibold leading-snug text-balance text-primary-foreground line-clamp-2 sm:text-body">
											{scene.title}
										</span>
										{isActive ? (
											<span className="mt-1.5 inline-flex items-center gap-1.5 text-label text-primary-foreground/75">
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
