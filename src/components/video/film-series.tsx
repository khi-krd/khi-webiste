"use client";

import { FilmIcon } from "@heroicons/react/24/outline";
import dynamic from "next/dynamic";
import NextImage from "next/image";
import { type ReactNode, useCallback, useEffect, useRef, useState } from "react";
import { VideoStillPreview } from "@/components/video/video-still-preview";
import { cn } from "@/lib/utils";
import { classifyPlayableSource, toCleanEmbedSrc } from "@/lib/video/source";
import type { ResolvedVideoClip, VideoPlayerKind } from "@/types/video";

const VideoPlayer = dynamic(
	() => import("@/components/ui/video-player").then((mod) => mod.VideoPlayer),
	{ ssr: false },
);

const MEDIA_FILE_PATTERN = /\.(mp4|webm|ogg|ogv|mov|m4v|m3u8|mpd)(\?|#|$)/i;

function formatClock(seconds: number | null): string {
	if (seconds == null || seconds <= 0) return "0:00";
	const total = Math.round(seconds);
	const h = Math.floor(total / 3600);
	const m = Math.floor((total % 3600) / 60);
	const s = total % 60;
	const pad = (n: number) => String(n).padStart(2, "0");
	return h > 0 ? `${h}:${pad(m)}:${pad(s)}` : `${m}:${pad(s)}`;
}

/** Playing-state equalizer bars — pulses while the active episode plays. */
function Equalizer({ playing, size = 14 }: { playing: boolean; size?: number }) {
	return (
		<svg
			width={size}
			height={size}
			viewBox="0 0 24 24"
			fill="currentColor"
			aria-hidden="true"
			className={cn("text-brand", playing && "animate-pulse")}
		>
			<rect x="4" y="9" width="4" height="11" rx="1" />
			<rect x="10" y="4" width="4" height="16" rx="1" />
			<rect x="16" y="12" width="4" height="8" rx="1" />
		</svg>
	);
}

export type FilmSeriesLabels = {
	episodes: string;
	partOfTemplate: string;
	nowPlaying: string;
	previousPart: string;
	nextPart: string;
	autoplay: string;
};

type FilmSeriesProps = {
	clips: ResolvedVideoClip[];
	activeClipNumber?: number | null;
	seriesTitle: string;
	playerKind: VideoPlayerKind;
	playableSrc: string | null;
	poster: string | null;
	noSourceLabel: string;
	labels: FilmSeriesLabels;
	className?: string;
};

/**
 * Series layout for multi-source films (کورتەفیلمی زنجیرە): player + episode
 * details on the main column, numbered playlist with autoplay switch and a
 * duration-proportional segment bar on the side. Mirrors the reference
 * series page using the site's own colors and button shapes.
 */
export function FilmSeries({
	clips,
	activeClipNumber = null,
	seriesTitle,
	playerKind,
	playableSrc,
	poster,
	noSourceLabel,
	labels,
	className,
}: FilmSeriesProps) {
	const initialClipNumber =
		activeClipNumber ?? clips.find((c) => c.main)?.clipNumber ?? clips[0]?.clipNumber ?? null;
	const [selectedClipNumber, setSelectedClipNumber] = useState(initialClipNumber);
	const [autoPlaySelected, setAutoPlaySelected] = useState(false);
	const [autoplay, setAutoplay] = useState(true);
	const [isPlaying, setIsPlaying] = useState(false);
	const [progress, setProgress] = useState<Record<number, number>>({});
	const listRef = useRef<HTMLOListElement>(null);

	const activeIndex = Math.max(
		0,
		clips.findIndex((c) => c.clipNumber === selectedClipNumber),
	);
	const activeClip = clips[activeIndex] ?? null;
	const previous = activeIndex > 0 ? clips[activeIndex - 1] : null;
	const next = activeIndex < clips.length - 1 ? clips[activeIndex + 1] : null;

	const gallerySource = activeClip
		? classifyPlayableSource(activeClip.url)
		: null;
	const surfaceKind: VideoPlayerKind = gallerySource?.kind ?? "none";
	const surfaceSrc = gallerySource?.src ?? null;
	const surfacePoster = activeClip?.coverUrl ?? undefined;

	const goTo = useCallback(
		(index: number) => {
			const target = clips[index];
			if (!target) return;
			setAutoPlaySelected(true);
			setSelectedClipNumber(target.clipNumber);
		},
		[clips],
	);

	const handleEnded = useCallback(() => {
		setIsPlaying(false);
		if (autoplay && next) goTo(activeIndex + 1);
	}, [autoplay, next, goTo, activeIndex]);

	const handleProgress = useCallback(
		(currentTime: number) => {
			const clip = activeClip;
			const duration = clip?.durationSeconds;
			if (!clip || !duration || duration <= 0) return;
			const fraction = Math.min(1, currentTime / duration);
			setProgress((prev) =>
				Math.abs((prev[clip.clipNumber] ?? 0) - fraction) < 0.005
					? prev
					: { ...prev, [clip.clipNumber]: fraction },
			);
		},
		[activeClip],
	);

	// Long playlists scroll inside the panel: keep the active episode in view.
	useEffect(() => {
		const list = listRef.current;
		if (!list || list.scrollHeight <= list.clientHeight) return;
		const item = list.querySelector<HTMLElement>('[aria-current="true"]');
		if (!item) return;
		list.scrollTo({
			top: item.offsetTop - list.clientHeight / 2 + item.offsetHeight / 2,
			behavior: "smooth",
		});
	}, [activeIndex]);

	let surface: ReactNode;
	if (surfaceKind === "vidstack" && surfaceSrc) {
		surface = (
			<div className="relative aspect-video w-full overflow-hidden bg-foreground">
				{surfacePoster ? (
					<NextImage
						src={surfacePoster}
						alt=""
						fill
						sizes="(max-width: 1024px) 100vw, 60vw"
						className="object-cover"
						priority
					/>
				) : null}
				<VideoPlayer
					key={`part-${selectedClipNumber ?? "single"}-${surfaceSrc}`}
					src={surfaceSrc}
					title={activeClip?.title ?? seriesTitle}
					poster={surfacePoster}
					variant="full"
					autoPlay={autoPlaySelected}
					onEnded={handleEnded}
					onTimeUpdate={handleProgress}
					className="absolute inset-0 z-1 size-full"
				/>
			</div>
		);
	} else if (surfaceKind === "iframe" && surfaceSrc) {
		surface = (
			<div className="relative aspect-video w-full overflow-hidden bg-foreground">
				<iframe
					key={`part-${selectedClipNumber ?? "single"}-${surfaceSrc}`}
					src={toCleanEmbedSrc(surfaceSrc)}
					title={activeClip?.title ?? seriesTitle}
					loading="lazy"
					allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
					allowFullScreen
					className="absolute inset-0 size-full border-0"
				/>
			</div>
		);
	} else {
		surface = (
			<div className="relative aspect-video w-full overflow-hidden bg-foreground">
				{poster ? (
					<NextImage
						src={poster}
						alt=""
						fill
						sizes="(max-width: 1024px) 100vw, 60vw"
						className="object-cover opacity-45"
					/>
				) : null}
				<div className="absolute inset-0 flex flex-col items-center justify-center gap-3 p-6 text-center">
					<FilmIcon
						className="size-8 text-primary-foreground/70"
						aria-hidden
					/>
					<p className="max-w-xs text-small text-primary-foreground/85">
						{noSourceLabel}
					</p>
				</div>
			</div>
		);
	}

	return (
		<div
			className={cn(
				"grid items-start gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(17rem,21rem)] xl:gap-10",
				className,
			)}
		>
			<div className="min-w-0">
				{surface}

				{/* Episode details — meta line, title, description, prev/next. */}
				<section
					aria-label={labels.episodes}
					className="mt-5 border-t border-primary-foreground/15 pt-4 sm:mt-6"
				>
					<div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-label text-primary-foreground/55">
						<span className="inline-flex items-center gap-1.5 text-brand">
							<Equalizer playing={isPlaying} />
							{labels.nowPlaying}
						</span>
						<span>
							{labels.partOfTemplate
								.replace("{n}", String(activeIndex + 1))
								.replace("{total}", String(clips.length))}
						</span>
						<span aria-hidden="true" className="text-primary-foreground/30">
							·
						</span>
						<span dir="ltr" className="tabular-nums">
							{formatClock(activeClip?.durationSeconds ?? null)}
						</span>
					</div>

					<p className="mt-3 text-label text-primary-foreground/50">
						{seriesTitle}
					</p>
					<h2 className="mt-1 font-heading text-h3 font-bold leading-snug text-balance text-primary-foreground">
						{activeClip?.title ?? seriesTitle}
					</h2>

					{activeClip?.descriptionHtml ? (
						<div
							className="mt-3 text-small leading-relaxed text-primary-foreground/80 [&_:is(h1,h2,h3,h4,h5,h6)]:font-semibold [&_:is(h1,h2,h3,h4,h5,h6)]:text-primary-foreground [&_a]:text-primary-foreground [&_a]:decoration-primary-foreground/40 [&_blockquote]:border-primary-foreground/25 [&_blockquote]:text-primary-foreground/70 [&_code]:bg-primary-foreground/10 [&_strong]:text-primary-foreground"
							// biome-ignore lint/security/noDangerouslySetInnerHtml: sanitized during resolve (sanitize-html allowlist), never raw CMS markup.
							dangerouslySetInnerHTML={{
								__html: activeClip.descriptionHtml,
							}}
						/>
					) : activeClip?.description ? (
						<p className="mt-3 text-small leading-relaxed text-primary-foreground/80">
							{activeClip.description}
						</p>
					) : null}

					{(previous || next) && (
						<nav
							className="mt-5 flex items-stretch justify-between gap-4"
							aria-label={labels.episodes}
						>
							{previous ? (
								<button
									type="button"
									onClick={() => goTo(activeIndex - 1)}
									className="group min-w-0 max-w-[48%] border border-primary-foreground/20 px-4 py-3 text-start transition-colors fine-hover:border-brand"
								>
									<span className="block text-label text-primary-foreground/50 transition-colors group-fine:text-brand">
										{labels.previousPart}
									</span>
									<span className="mt-1 block truncate text-small font-medium text-primary-foreground">
										{previous.title}
									</span>
								</button>
							) : (
								<span />
							)}
							{next ? (
								<button
									type="button"
									onClick={() => goTo(activeIndex + 1)}
									className="group min-w-0 max-w-[48%] border border-primary-foreground/20 px-4 py-3 text-end transition-colors fine-hover:border-brand"
								>
									<span className="block text-label text-primary-foreground/50 transition-colors group-fine:text-brand">
										{labels.nextPart}
									</span>
									<span className="mt-1 block truncate text-small font-medium text-primary-foreground">
										{next.title}
									</span>
								</button>
							) : null}
						</nav>
					)}
				</section>
			</div>

			{/* Playlist — sticky panel matching the reference design. */}
			<aside className="min-w-0 border border-primary-foreground/15 bg-primary-foreground/3 p-4 lg:sticky lg:top-24">
				<div className="flex items-start justify-between gap-3">
					<div className="min-w-0">
						<h2 className="font-heading text-small font-semibold text-primary-foreground">
							{labels.episodes}
						</h2>
						<p className="mt-0.5 text-label text-primary-foreground/50">
							{seriesTitle} ·{" "}
							<span dir="ltr" className="tabular-nums">
								{activeIndex + 1} / {clips.length}
							</span>
						</p>
					</div>
					<label className="flex shrink-0 cursor-pointer items-center gap-2 text-label text-primary-foreground/60">
						<span>{labels.autoplay}</span>
						<input
							type="checkbox"
							role="switch"
							checked={autoplay}
							onChange={(e) => setAutoplay(e.target.checked)}
							className="size-4 accent-[var(--color-brand)]"
						/>
					</label>
				</div>

				{/* Duration-proportional segment bar — where this part sits. */}
				<div
					aria-hidden="true"
					className="mt-3 flex h-1 gap-0.5 overflow-hidden"
				>
					{clips.map((clip, i) => (
						<span
							key={clip.clipNumber}
							style={{ flexGrow: clip.durationSeconds ?? 1 }}
							className={cn(
								"h-full",
								i === activeIndex
									? "bg-brand"
									: "bg-primary-foreground/15",
							)}
						/>
					))}
				</div>

				<ol
					ref={listRef}
					className="mt-3 max-h-[26rem] space-y-1 overflow-y-auto"
				>
					{clips.map((clip, i) => {
						const isActive = i === activeIndex;
						const watched = progress[clip.clipNumber] ?? 0;
						return (
							<li key={clip.clipNumber}>
								<button
									type="button"
									aria-current={isActive ? "true" : undefined}
									onClick={() => goTo(i)}
									className={cn(
										"flex w-full items-stretch gap-3 border p-2 text-start transition-colors",
										isActive
											? "border-brand/60 bg-brand/10"
											: "border-transparent fine-hover:border-primary-foreground/20 fine-hover:bg-primary-foreground/5",
									)}
								>
									<span className="flex w-5 shrink-0 items-start justify-center pt-1 text-label tabular-nums text-primary-foreground/50">
										{isActive ? (
											<Equalizer playing={isPlaying} size={16} />
										) : (
											i + 1
										)}
									</span>
									<span className="relative aspect-video w-24 shrink-0 overflow-hidden bg-primary-foreground/10">
										{clip.coverUrl ? (
											<NextImage
												src={clip.coverUrl}
												alt=""
												fill
												sizes="6rem"
												className="object-cover"
											/>
										) : clip.url && MEDIA_FILE_PATTERN.test(clip.url) ? (
											<VideoStillPreview
												src={clip.url}
												fallbackCoverUrl={poster}
												className="absolute inset-0 size-full object-cover"
											/>
										) : poster ? (
											<NextImage
												src={poster}
												alt=""
												fill
												sizes="6rem"
												className="object-cover opacity-70"
											/>
										) : null}
										{clip.durationSeconds ? (
											<span
												dir="ltr"
												className="absolute bottom-0.5 end-0.5 bg-black/70 px-1 py-px text-[10px] tabular-nums text-white"
											>
												{formatClock(clip.durationSeconds)}
											</span>
										) : null}
										{watched > 0 ? (
											<span
												dir="ltr"
												aria-hidden="true"
												className="absolute inset-x-0 bottom-0 h-0.5 bg-primary-foreground/20"
											>
												<span
													className="block h-full bg-brand"
													style={{ width: `${Math.min(100, watched * 100)}%` }}
												/>
											</span>
										) : null}
									</span>
									<span className="min-w-0 flex-1 py-0.5">
										<span
											className={cn(
												"block truncate text-small font-medium leading-snug",
												isActive
													? "text-brand"
													: "text-primary-foreground",
											)}
										>
											{clip.title}
										</span>
										{isActive ? (
											<span className="mt-0.5 block text-label text-brand/80">
												{labels.nowPlaying}
											</span>
										) : null}
									</span>
								</button>
							</li>
						);
					})}
				</ol>
			</aside>
		</div>
	);
}
