"use client";

import {
	ArrowsPointingOutIcon,
	ChevronLeftIcon,
	ChevronRightIcon,
	FilmIcon,
	MusicalNoteIcon,
	PhotoIcon,
} from "@heroicons/react/24/outline";
import NextImage from "next/image";
import { MediaMark } from "@/components/ui/media-mark";
import { useEffect, useMemo, useRef, useState } from "react";
import { CoverLightbox } from "@/components/ui/cover-lightbox";
import { DirectionalIcon } from "@/components/ui/directional-icon";
import {
	ExternalMediaLink,
	MediaEmbedFrame,
} from "@/components/ui/media-source";
import dynamic from "next/dynamic";

const VideoPlayer = dynamic(
	() => import("@/components/ui/video-player").then((mod) => mod.VideoPlayer),
	{ ssr: false },
);
import { VideoStillPreview } from "@/components/video/video-still-preview-lazy";
import { cn } from "@/lib/utils";
import type { MediaItem, MediaKind } from "@/types/media";

export type ProjectMediaPlaylistLabels = {
	playlist: string;
	all: string;
	kinds: Record<MediaKind, string>;
	details: string;
	kind: string;
	format: string;
	source: string;
	position: string;
	sources: { file: string; embed: string; external: string };
	enlarge: string;
	previous: string;
	next: string;
	nowShowing: string;
	close: string;
};

type ProjectMediaPlaylistProps = {
	items: MediaItem[];
	projectTitle: string;
	labels: ProjectMediaPlaylistLabels;
};

type Filter = MediaKind | "ALL";

const KIND_ORDER: MediaKind[] = ["IMAGE", "VIDEO", "AUDIO"];

const MEDIA_FILE_PATTERN = /\.(mp4|webm|ogg|ogv|mov|m4v)(\?|#|$)/i;

function isRemote(src: string): boolean {
	return /^https?:\/\//i.test(src);
}

function KindIcon({
	kind,
	className,
}: {
	kind: MediaKind;
	className?: string;
}) {
	const Icon =
		kind === "VIDEO"
			? FilmIcon
			: kind === "AUDIO"
				? MusicalNoteIcon
				: PhotoIcon;
	return <Icon aria-hidden className={className} />;
}

/** "JPG", "MP4"… from the file path; null for extension-less sources. */
function fileFormat(item: MediaItem): string | null {
	const src = item.url || "";
	const path = src.split(/[?#]/)[0] ?? "";
	const match = /\.([a-z0-9]{2,5})$/i.exec(path);
	return match ? match[1].toUpperCase() : null;
}

function hostOf(src: string): string | null {
	try {
		return new URL(isRemote(src) ? src : `https://${src}`).hostname.replace(
			/^www\./,
			"",
		);
	} catch {
		return null;
	}
}

function sourceLabel(
	item: MediaItem,
	labels: ProjectMediaPlaylistLabels,
): string {
	if (item.url && isRemote(item.url) && fileFormat(item)) {
		return labels.sources.file;
	}
	const provider = hostOf(item.embedUrl ?? item.externalUrl ?? item.url ?? "");
	if (item.embedUrl) {
		return provider
			? `${labels.sources.embed} · ${provider}`
			: labels.sources.embed;
	}
	return provider
		? `${labels.sources.external} · ${provider}`
		: labels.sources.external;
}

function pad(n: number): string {
	return String(n).padStart(2, "0");
}

/**
 * Poster for a non-image item: its own thumbnail, else a neighbouring photo
 * with the same caption — editors upload each interview as a photo + video
 * pair, so the photo is the natural still for the video.
 */
function posterFor(items: MediaItem[], index: number): string | null {
	const item = items[index];
	if (!item || item.kind === "IMAGE") return null;
	if (item.thumbnailUrl) return item.thumbnailUrl;
	const caption = item.caption?.trim();
	if (!caption) return null;
	for (const neighbour of [items[index - 1], items[index + 1]]) {
		if (
			neighbour?.kind === "IMAGE" &&
			neighbour.url &&
			neighbour.caption?.trim() === caption
		) {
			return neighbour.url;
		}
	}
	return null;
}

/** Rail thumbnail — real picture for images, a decoded still for files. */
function Thumb({ item, poster }: { item: MediaItem; poster: string | null }) {
	const media = "absolute inset-0 size-full object-cover";
	const still = item.kind === "IMAGE" ? item.url : poster;
	if (still) {
		return (
			<NextImage
				src={still}
				alt=""
				fill
				sizes="7rem"
				unoptimized={isRemote(still)}
				className={media}
			/>
		);
	}
	return (
		<>
			{/* Branded tile underneath — stays visible until (or unless) the
			    video's own first frame decodes over it. */}
			<span className="absolute inset-0 flex items-center justify-center bg-foreground text-primary-foreground/60">
				<KindIcon kind={item.kind} className="size-6" />
			</span>
			{item.kind === "VIDEO" &&
			item.url &&
			MEDIA_FILE_PATTERN.test(item.url) ? (
				<VideoStillPreview src={item.url} sizes="7rem" className={media} />
			) : null}
		</>
	);
}

/** The big viewer: image / player / audio deck for the selected item. */
function Stage({
	item,
	title,
	poster,
	labels,
}: {
	item: MediaItem;
	title: string;
	poster: string | null;
	labels: ProjectMediaPlaylistLabels;
}) {
	if (item.kind === "IMAGE") {
		return (
			<div className="relative aspect-video w-full overflow-hidden bg-foreground">
				{/* Soft blurred fill so portrait or odd-ratio photos sit in a frame
				    of their own colour instead of black bars. */}
				<NextImage
					src={item.url}
					alt=""
					aria-hidden
					fill
					sizes="10vw"
					unoptimized={isRemote(item.url)}
					className="scale-110 object-cover opacity-45 blur-2xl"
				/>
				<NextImage
					src={item.url}
					alt={title}
					fill
					sizes="(max-width: 1024px) 100vw, 66vw"
					unoptimized={isRemote(item.url)}
					className="object-contain"
				/>
				<CoverLightbox
					src={item.url}
					alt={title}
					caption={item.caption}
					closeLabel={labels.close}
					triggerLabel={labels.enlarge}
					className="absolute end-3 top-3 z-10 max-w-fit"
				>
					<span className="inline-flex size-9 items-center justify-center border border-primary-foreground/25 bg-primary text-primary-foreground transition-opacity fine-hover:opacity-90">
						<ArrowsPointingOutIcon aria-hidden className="size-4" />
					</span>
				</CoverLightbox>
			</div>
		);
	}

	if (item.kind === "VIDEO") {
		if (item.embedUrl) {
			return <MediaEmbedFrame src={item.embedUrl} title={title} kind="VIDEO" />;
		}
		if (item.url) {
			return (
				<div className="relative aspect-video w-full overflow-hidden bg-foreground">
					<VideoPlayer
						key={item.url}
						src={item.url}
						title={title}
						poster={poster ?? undefined}
						posterAlt={title}
						variant="full"
						className="absolute inset-0 size-full"
					/>
					<MediaMark className="top-0 bottom-auto z-20" />
				</div>
			);
		}
		return item.externalUrl ? (
			<ExternalMediaLink
				href={item.externalUrl}
				label={title}
				kind="VIDEO"
				className="aspect-video"
			/>
		) : null;
	}

	// AUDIO — a listening deck rather than a bare browser control.
	if (item.embedUrl) {
		return <MediaEmbedFrame src={item.embedUrl} title={title} kind="AUDIO" />;
	}
	return (
		<div className="relative flex aspect-video w-full flex-col items-center justify-center gap-6 overflow-hidden bg-foreground p-6 text-primary-foreground sm:p-10">
			<span className="inline-flex size-20 items-center justify-center bg-primary text-primary-foreground shadow-[0_18px_40px_-18px_rgb(0_0_0/0.7)]">
				<MusicalNoteIcon aria-hidden className="size-9" />
			</span>
			<p className="max-w-md text-center font-heading text-h3 font-semibold leading-snug text-balance">
				{title}
			</p>
			{item.url ? (
				// biome-ignore lint/a11y/useMediaCaption: archival audio — no captions from API
				<audio
					key={item.url}
					controls
					preload="metadata"
					src={item.url}
					className="w-full max-w-lg accent-primary"
					aria-label={title}
				/>
			) : item.externalUrl ? (
				<ExternalMediaLink
					href={item.externalUrl}
					label={title}
					kind="AUDIO"
					className="max-w-lg"
				/>
			) : null}
		</div>
	);
}

/**
 * Playlist-style project media: a stage for the selected item, an info card
 * under it, and a scrollable rail of every item (filterable by kind) on the
 * side. Selecting a rail row swaps the stage and the info card in place.
 */
export function ProjectMediaPlaylist({
	items,
	projectTitle,
	labels,
}: ProjectMediaPlaylistProps) {
	const [filter, setFilter] = useState<Filter>("ALL");
	const [selected, setSelected] = useState(0);
	const listRef = useRef<HTMLOListElement>(null);

	const counts = useMemo(() => {
		const c: Record<MediaKind, number> = { IMAGE: 0, VIDEO: 0, AUDIO: 0 };
		for (const item of items) c[item.kind] += 1;
		return c;
	}, [items]);
	const presentKinds = KIND_ORDER.filter((kind) => counts[kind] > 0);

	/** Per-kind running number — "Video 3" for an uncaptioned third video. */
	const kindOrdinals = useMemo(() => {
		const running: Record<MediaKind, number> = { IMAGE: 0, VIDEO: 0, AUDIO: 0 };
		return items.map((item) => {
			running[item.kind] += 1;
			return running[item.kind];
		});
	}, [items]);

	const visible = useMemo(
		() =>
			items
				.map((item, index) => ({ item, index }))
				.filter(({ item }) => filter === "ALL" || item.kind === filter),
		[items, filter],
	);

	const current = items[selected] ?? items[0];
	const titleFor = (index: number) =>
		items[index]?.caption?.trim() ||
		`${labels.kinds[items[index].kind]} ${kindOrdinals[index]}`;

	const visiblePos = visible.findIndex(({ index }) => index === selected);

	const selectFilter = (next: Filter) => {
		setFilter(next);
		if (next !== "ALL" && items[selected]?.kind !== next) {
			const first = items.findIndex((item) => item.kind === next);
			if (first >= 0) setSelected(first);
		}
	};

	const step = (delta: number) => {
		if (visible.length === 0) return;
		const pos = visiblePos < 0 ? 0 : visiblePos;
		const nextPos = (pos + delta + visible.length) % visible.length;
		setSelected(visible[nextPos].index);
	};

	// Keep the active row in view inside the rail (never scroll the page).
	useEffect(() => {
		const list = listRef.current;
		const row = list?.querySelector<HTMLElement>(`[data-index="${selected}"]`);
		if (!list || !row) return;
		const top = row.offsetTop - list.offsetTop;
		const bottom = top + row.offsetHeight;
		if (top < list.scrollTop) {
			list.scrollTo({ top, behavior: "smooth" });
		} else if (bottom > list.scrollTop + list.clientHeight) {
			list.scrollTo({
				top: bottom - list.clientHeight,
				behavior: "smooth",
			});
		}
	}, [selected]);

	if (!current) return null;

	const format = fileFormat(current);
	const currentTitle = titleFor(selected);

	return (
		<div className="grid gap-6 pt-6 lg:grid-cols-[minmax(0,1fr)_minmax(18rem,24rem)] lg:gap-8">
			{/* ── Stage + info card ─────────────────────────────────────── */}
			<div className="min-w-0">
				<div className="overflow-hidden border border-border bg-foreground">
					<Stage
						key={`${current.kind}-${selected}`}
						item={current}
						title={currentTitle}
						poster={posterFor(items, selected)}
						labels={labels}
					/>
				</div>

				<section
					aria-live="polite"
					aria-label={labels.details}
					className="border border-t-0 border-border bg-surface p-5 sm:p-6"
				>
					<div className="flex flex-wrap items-center justify-between gap-3">
						<div className="flex items-center gap-3">
							<span className="inline-flex items-center gap-1.5 bg-primary px-2.5 py-1 label font-semibold text-primary-foreground">
								<KindIcon kind={current.kind} className="size-3.5" />
								{labels.kinds[current.kind]}
							</span>
							<span
								dir="ltr"
								className="label font-medium tabular-nums text-muted"
							>
								{pad(selected + 1)} / {pad(items.length)}
							</span>
						</div>
						{visible.length > 1 ? (
							<div className="flex items-center gap-1.5">
								<button
									type="button"
									onClick={() => step(-1)}
									aria-label={labels.previous}
									className="inline-flex size-9 items-center justify-center border border-border text-foreground transition-colors fine-hover:border-primary fine-hover:bg-primary fine-hover:text-primary-foreground"
								>
									<DirectionalIcon icon={ChevronLeftIcon} className="size-4" />
								</button>
								<button
									type="button"
									onClick={() => step(1)}
									aria-label={labels.next}
									className="inline-flex size-9 items-center justify-center border border-border text-foreground transition-colors fine-hover:border-primary fine-hover:bg-primary fine-hover:text-primary-foreground"
								>
									<DirectionalIcon icon={ChevronRightIcon} className="size-4" />
								</button>
							</div>
						) : null}
					</div>

					<h3 className="mt-4 font-heading text-h3 font-bold leading-snug text-balance text-foreground">
						{currentTitle}
					</h3>

					<dl className="mt-4 grid grid-cols-2 gap-px overflow-hidden border border-border bg-border sm:grid-cols-4">
						{[
							{ label: labels.kind, value: labels.kinds[current.kind] },
							{ label: labels.format, value: format ?? "—", ltr: true },
							{ label: labels.source, value: sourceLabel(current, labels) },
							{
								label: labels.position,
								value: `${pad(selected + 1)} / ${pad(items.length)}`,
								ltr: true,
							},
						].map((row) => (
							<div key={row.label} className="min-w-0 bg-sunken px-3.5 py-3">
								<dt className="label font-medium text-muted">{row.label}</dt>
								<dd className="mt-1 truncate text-small font-bold text-foreground">
									{row.ltr ? (
										<span dir="ltr" className="tabular-nums">
											{row.value}
										</span>
									) : (
										row.value
									)}
								</dd>
							</div>
						))}
					</dl>
				</section>
			</div>

			{/* ── Playlist rail ─────────────────────────────────────────── */}
			<div className="relative min-w-0">
				<div className="flex flex-col border border-border bg-surface lg:absolute lg:inset-0">
					<div className="border-b border-border p-4">
						<div className="flex items-baseline justify-between gap-3">
							<p className="font-heading text-body font-bold text-foreground">
								{labels.playlist}
							</p>
							<span
								dir="ltr"
								className="label font-medium tabular-nums text-muted"
							>
								{pad(visible.length)}
							</span>
						</div>
						{presentKinds.length > 1 ? (
							<div className="mt-3 flex flex-wrap gap-1.5">
								{(["ALL", ...presentKinds] as Filter[]).map((kind) => {
									const active = filter === kind;
									return (
										<button
											key={kind}
											type="button"
											aria-pressed={active}
											onClick={() => selectFilter(kind)}
											className={cn(
												"inline-flex items-center gap-1.5 border px-2.5 py-1 label font-semibold transition-colors",
												active
													? "border-primary bg-primary text-primary-foreground"
													: "border-border text-muted fine-hover:border-foreground/40 fine-hover:text-foreground",
											)}
										>
											{kind === "ALL" ? null : (
												<KindIcon kind={kind} className="size-3.5" />
											)}
											{kind === "ALL" ? labels.all : labels.kinds[kind]}
											<span dir="ltr" className="tabular-nums opacity-70">
												{kind === "ALL" ? items.length : counts[kind]}
											</span>
										</button>
									);
								})}
							</div>
						) : null}
					</div>

					<ol
						ref={listRef}
						aria-label={`${labels.playlist} — ${projectTitle}`}
						className="max-h-[28rem] flex-1 overflow-y-auto overscroll-contain lg:max-h-none"
					>
						{visible.map(({ item, index }) => {
							const active = index === selected;
							return (
								<li key={`${item.kind}-${item.url}-${item.sortOrder}`}>
									<button
										type="button"
										data-index={index}
										onClick={() => setSelected(index)}
										aria-current={active ? "true" : undefined}
										className={cn(
											"group relative grid w-full grid-cols-[auto_7rem_minmax(0,1fr)] items-center gap-3 border-b border-border/70 px-4 py-3 text-start transition-colors",
											active ? "bg-sunken" : "fine-hover:bg-sunken/60",
										)}
									>
										{/* Active rail marker on the start edge. */}
										<span
											aria-hidden
											className={cn(
												"absolute inset-y-0 start-0 w-1 bg-primary transition-opacity",
												active ? "opacity-100" : "opacity-0",
											)}
										/>
										<span
											dir="ltr"
											className={cn(
												"w-6 text-center label font-semibold tabular-nums",
												active ? "text-primary" : "text-muted",
											)}
										>
											{pad(index + 1)}
										</span>
										<span
											className={cn(
												"relative aspect-video w-28 overflow-hidden border bg-sunken",
												active ? "border-primary" : "border-border",
											)}
										>
											<Thumb item={item} poster={posterFor(items, index)} />
											<span className="absolute bottom-0 end-0 z-1 inline-flex size-6 items-center justify-center bg-foreground/80 text-primary-foreground">
												<KindIcon kind={item.kind} className="size-3.5" />
											</span>
										</span>
										<span className="min-w-0">
											<span
												className={cn(
													"block text-small font-semibold leading-snug line-clamp-2",
													active ? "text-foreground" : "text-foreground/85",
												)}
											>
												{titleFor(index)}
											</span>
											<span className="mt-1 flex items-center gap-1.5 label font-medium text-muted">
												{active ? (
													<>
														<span className="size-1.5 animate-pulse bg-primary motion-reduce:animate-none" />
														<span className="text-primary">
															{labels.nowShowing}
														</span>
													</>
												) : (
													<>
														{labels.kinds[item.kind]}
														{fileFormat(item) ? (
															<>
																<span aria-hidden>·</span>
																<span dir="ltr">{fileFormat(item)}</span>
															</>
														) : null}
													</>
												)}
											</span>
										</span>
									</button>
								</li>
							);
						})}
					</ol>
				</div>
			</div>
		</div>
	);
}
