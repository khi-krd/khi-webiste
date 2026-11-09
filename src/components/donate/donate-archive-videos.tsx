"use client";

import {
	ChevronDownIcon,
	ChevronLeftIcon,
	ChevronRightIcon,
	ChevronUpIcon,
	PhotoIcon,
	QueueListIcon,
	XMarkIcon,
} from "@heroicons/react/24/outline";
import { PlayIcon } from "@heroicons/react/24/solid";
import dynamic from "next/dynamic";
import NextImage from "next/image";
import { useLocale } from "next-intl";
import {
	type CSSProperties,
	type PointerEvent,
	useCallback,
	useEffect,
	useRef,
	useState,
} from "react";
import { pageXClass } from "@/components/donate/donate-shell";
import { DirectionalIcon } from "@/components/ui/directional-icon";
import { cn } from "@/lib/utils";
import "./donate-video-playlist.css";
import "./donate-image-playlist.css";
import { useContainerWidth } from "./use-container-width";

const VideoPlayer = dynamic(
	() => import("@/components/ui/video-player").then((mod) => mod.VideoPlayer),
	{ ssr: false },
);

export type DonateArchiveVideoItem = {
	mediaKind?: "video" | "image";
	id: number;
	title: string;
	description: string | null;
	/** Uploaded file URL or a YouTube link — the player resolves both. */
	videoUrl: string;
	/** Resolved still: the editor's poster, else the YouTube thumbnail, else none. */
	posterUrl: string | null;
};

type DonateArchiveVideosProps = {
	heading: string;
	imagesHeading: string;
	playLabel: string;
	playlistLabel: string;
	previousLabel: string;
	nextLabel: string;
	closeLabel: string;
	items: DonateArchiveVideoItem[];
};

type NavLabels = { previousLabel: string; nextLabel: string };

const pad = (n: number) => String(n).padStart(2, "0");
const KU_DIGITS = "٠١٢٣٤٥٦٧٨٩";
const toKu = (v: string) => v.replace(/[0-9]/g, (d) => KU_DIGITS[Number(d)]);

/** Signed distance on a loop of n items: result is in [-floor(n/2), ceil(n/2) - 1]. */
const loopRel = (k: number, n: number) => {
	const h = Math.floor(n / 2);
	return ((((k + h) % n) + n) % n) - h;
};

/**
 * The archive-donors showcase on the donate page. Videos play on a big stage
 * beside a scrollable queue; when donor images exist too, they share the same
 * dark band as a compact gallery under the queue — so the left column never
 * sits empty. An images-only archive falls back to the standalone "Fan"
 * gallery. Each block renders only when it has records.
 */
export function DonateArchiveVideos({
	heading,
	imagesHeading,
	playLabel,
	playlistLabel,
	previousLabel,
	nextLabel,
	closeLabel,
	items,
}: DonateArchiveVideosProps) {
	const videos = items.filter((item) => item.mediaKind !== "image");
	const images = items.filter((item) => item.mediaKind === "image");

	if (items.length === 0) {
		return null;
	}

	return (
		<div className="mt-10 space-y-14 sm:mt-12">
			{videos.length > 0 ? (
				<section>
					<SectionHeading title={heading} count={items.length} />
					<VideoQueue
						items={videos}
						images={images}
						imagesHeading={imagesHeading}
						playLabel={playLabel}
						playlistLabel={playlistLabel}
						previousLabel={previousLabel}
						nextLabel={nextLabel}
						closeLabel={closeLabel}
					/>
				</section>
			) : (
				<section>
					<SectionHeading title={imagesHeading} count={images.length} />
					<ImageFan
						items={images}
						previousLabel={previousLabel}
						nextLabel={nextLabel}
						closeLabel={closeLabel}
					/>
				</section>
			)}
		</div>
	);
}

function SectionHeading({ title, count }: { title: string; count: number }) {
	return (
		<div className={cn(pageXClass, "mb-5 flex items-end gap-4")}>
			<h3 className="font-heading text-h3 font-semibold text-foreground">
				{title}
			</h3>
			<span className="mb-1.5 h-px grow bg-gradient-to-l from-transparent via-border to-border" />
			<span className="mb-1 font-heading text-small font-bold tabular-nums text-accent">
				{pad(count)}
			</span>
		</div>
	);
}

/**
 * First-frame still for an uploaded clip with no poster — the browser fetches
 * only the metadata + one frame. YouTube clips always resolve a thumbnail
 * upstream, so they never land here.
 */
function VideoStill({ src, className }: { src: string; className?: string }) {
	return (
		<video
			src={`${src}#t=0.5`}
			preload="metadata"
			muted
			playsInline
			tabIndex={-1}
			aria-hidden
			className={cn("pointer-events-none size-full object-cover", className)}
		/>
	);
}

/* ─────────────────────────── Video: queue playlist ─────────────────────────── */

function VideoQueue({
	items,
	images,
	imagesHeading,
	playLabel,
	playlistLabel,
	previousLabel,
	nextLabel,
	closeLabel,
}: NavLabels & {
	items: DonateArchiveVideoItem[];
	images: DonateArchiveVideoItem[];
	imagesHeading: string;
	playLabel: string;
	playlistLabel: string;
	closeLabel: string;
}) {
	const locale = useLocale();
	const dir: "rtl" | "ltr" = locale === "ckb" ? "rtl" : "ltr";
	const n = items.length;

	const [active, setActive] = useState(0);
	const [playing, setPlaying] = useState(false);

	const sideRef = useRef<HTMLDivElement>(null);
	const num = useCallback(
		(v: string | number) => (dir === "rtl" ? toKu(String(v)) : String(v)),
		[dir],
	);

	const go = useCallback(
		(i: number, play: boolean) => {
			if (!n) return;
			setPlaying(play);
			setActive(((i % n) + n) % n);
		},
		[n],
	);

	if (!n) return null;
	const activeItem = items[active];

	return (
		<div className="vpl-wrap">
			<section dir={dir} className="vpl" aria-label={playlistLabel}>
				{activeItem.posterUrl ? (
					<div key={`glow-${activeItem.id}`} className="vpl-glow" aria-hidden>
						<NextImage
							src={activeItem.posterUrl}
							alt=""
							fill
							sizes="100vw"
							className="size-full"
						/>
					</div>
				) : null}
				<span aria-hidden className="vpl-glow-tint" />

				<div className="vpl-row">
					<div className="vpl-main">
						<div className="vpl-stage">
							{playing ? (
								<div key={`player-${activeItem.id}`} className="vpl-embed">
									<VideoPlayer
										src={activeItem.videoUrl}
										title={activeItem.title}
										poster={activeItem.posterUrl ?? undefined}
										autoPlay
										className="size-full"
									/>
								</div>
							) : (
								<button
									type="button"
									onClick={() => setPlaying(true)}
									aria-label={`${playLabel}: ${activeItem.title}`}
									className="absolute inset-0 block size-full cursor-pointer border-0 p-0"
								>
									{activeItem.posterUrl ? (
										<NextImage
											key={`poster-${activeItem.id}`}
											src={activeItem.posterUrl}
											alt=""
											fill
											sizes="(min-width: 1024px) 40vw, 100vw"
											className="vpl-poster"
										/>
									) : (
										<VideoStill
											src={activeItem.videoUrl}
											className="vpl-poster"
										/>
									)}
									<span className="vpl-bigplay">
										<PlayIcon className="size-9 translate-x-0.5" />
									</span>
								</button>
							)}
							{/* While playing, the player draws its own mark
							    (khi-player__mark) — the badge would double it. */}
							{!playing ? (
								<NextImage
									src="/logo.png"
									alt=""
									width={72}
									height={72}
									className="vpl-logo"
									aria-hidden
								/>
							) : null}
						</div>

						<div key={`info-${activeItem.id}`} className="vpl-info">
							<h3 className="vpl-title">{activeItem.title}</h3>
							{activeItem.description ? (
								<p className="vpl-desc">{activeItem.description}</p>
							) : null}
						</div>
					</div>

					{n > 1 || images.length > 0 ? (
						<aside ref={sideRef} className="vpl-side">
							{n > 1 ? (
								<>
									<header className="vpl-queue-head">
										<QueueListIcon
											className="vpl-queue-icon"
											aria-hidden="true"
										/>
										<span className="vpl-queue-label">{playlistLabel}</span>
										<span className="vpl-queue-count">
											{num(pad(active + 1))}
											<span className="vpl-queue-sep">/</span>
											<span className="vpl-queue-total">{num(pad(n))}</span>
										</span>
										<button
											type="button"
											className="vpl-round"
											onClick={() => go(active - 1, playing)}
											aria-label={previousLabel}
										>
											<ChevronUpIcon className="size-4" />
										</button>
										<button
											type="button"
											className="vpl-round"
											onClick={() => go(active + 1, playing)}
											aria-label={nextLabel}
										>
											<ChevronDownIcon className="size-4" />
										</button>
									</header>
									<ol className="vpl-queue">
										{items.map((it, i) => {
											const on = i === active;
											return (
												<li key={it.id}>
													<button
														type="button"
														className={cn("vpl-track", on && "is-active")}
														onClick={() => go(i, true)}
														aria-current={on ? "true" : undefined}
													>
														<span className="vpl-num">{num(pad(i + 1))}</span>
														<span className="vpl-thumb">
															{it.posterUrl ? (
																<NextImage
																	src={it.posterUrl}
																	alt=""
																	fill
																	sizes="96px"
																/>
															) : (
																<VideoStill src={it.videoUrl} />
															)}
															{on ? (
																<span
																	className={cn(
																		"vpl-eq",
																		playing && "is-playing",
																	)}
																	aria-hidden="true"
																>
																	<span />
																	<span />
																	<span />
																</span>
															) : null}
														</span>
														<span className="vpl-track-text">
															<span className="vpl-track-title">
																{it.title}
															</span>
														</span>
													</button>
												</li>
											);
										})}
									</ol>
								</>
							) : null}
							{images.length > 0 ? (
								<SideImageGallery
									items={images}
									heading={imagesHeading}
									previousLabel={previousLabel}
									nextLabel={nextLabel}
									closeLabel={closeLabel}
									num={num}
								/>
							) : null}
						</aside>
					) : null}
				</div>
			</section>
		</div>
	);
}

/**
 * Compact donor-image gallery that lives inside the video band's side column —
 * a small stage with arrows + swipe, a thumbnail strip, and the same lightbox
 * as the standalone fan gallery. Keeps the image records visible even when the
 * queue only holds a couple of clips.
 */
function SideImageGallery({
	items,
	heading,
	previousLabel,
	nextLabel,
	closeLabel,
	num,
}: NavLabels & {
	items: DonateArchiveVideoItem[];
	heading: string;
	closeLabel: string;
	num: (v: string | number) => string;
}) {
	const locale = useLocale();
	const dir: "rtl" | "ltr" = locale === "ckb" ? "rtl" : "ltr";
	const n = items.length;

	const [nav, setNav] = useState({ active: 0, prev: 0 });
	const { active } = nav;
	const swipe = useRef<{ x: number; y: number } | null>(null);
	const lightboxRef = useRef<HTMLDialogElement>(null);

	const go = useCallback(
		(i: number) => {
			if (!n) return;
			setNav((s) => {
				const next = ((i % n) + n) % n;
				return next === s.active ? s : { prev: s.active, active: next };
			});
		},
		[n],
	);

	// Preload the neighbours so switching feels instant.
	useEffect(() => {
		if (n < 2) return;
		for (const k of [active + 1, active - 1]) {
			const it = items[((k % n) + n) % n];
			if (it?.posterUrl) {
				const img = new Image();
				img.src = it.posterUrl;
			}
		}
	}, [active, items, n]);

	if (!n) return null;
	const item = items[active];

	const onPointerDown = (e: PointerEvent) => {
		swipe.current = { x: e.clientX, y: e.clientY };
	};
	const onPointerUp = (e: PointerEvent) => {
		const s = swipe.current;
		swipe.current = null;
		if (!s) return;
		const dx = e.clientX - s.x;
		const dy = e.clientY - s.y;
		if (Math.abs(dx) >= 50 && Math.abs(dx) >= Math.abs(dy)) {
			const forward = dir === "rtl" ? dx > 0 : dx < 0;
			go(forward ? active + 1 : active - 1);
			return;
		}
		if (Math.abs(dx) < 10 && Math.abs(dy) < 10) {
			lightboxRef.current?.showModal();
		}
	};

	return (
		<div className="vpl-gallery">
			<header className="vpl-queue-head">
				<PhotoIcon className="vpl-queue-icon" aria-hidden="true" />
				<span className="vpl-queue-label">{heading}</span>
				<span className="vpl-queue-count">
					{num(pad(active + 1))}
					<span className="vpl-queue-sep">/</span>
					<span className="vpl-queue-total">{num(pad(n))}</span>
				</span>
				{n > 1 ? (
					<>
						<button
							type="button"
							className="vpl-round"
							onClick={() => go(active - 1)}
							aria-label={previousLabel}
						>
							<DirectionalIcon icon={ChevronRightIcon} className="size-4" />
						</button>
						<button
							type="button"
							className="vpl-round"
							onClick={() => go(active + 1)}
							aria-label={nextLabel}
						>
							<DirectionalIcon icon={ChevronLeftIcon} className="size-4" />
						</button>
					</>
				) : null}
			</header>

			<div
				className="vpl-igstage"
				onPointerDown={onPointerDown}
				onPointerUp={onPointerUp}
				onPointerCancel={() => {
					swipe.current = null;
				}}
			>
				{item.posterUrl ? (
					<NextImage
						key={`igstage-${item.id}`}
						src={item.posterUrl}
						alt={item.title}
						fill
						sizes="(min-width: 1024px) 30vw, 90vw"
						className="vpl-igimg"
						draggable={false}
					/>
				) : null}
				{n > 1 ? (
					<>
						<button
							type="button"
							className="vpl-igarrow vpl-igarrow--prev"
							onClick={() => go(active - 1)}
							onPointerDown={(e) => e.stopPropagation()}
							aria-label={previousLabel}
						>
							<DirectionalIcon icon={ChevronRightIcon} className="size-4" />
						</button>
						<button
							type="button"
							className="vpl-igarrow vpl-igarrow--next"
							onClick={() => go(active + 1)}
							onPointerDown={(e) => e.stopPropagation()}
							aria-label={nextLabel}
						>
							<DirectionalIcon icon={ChevronLeftIcon} className="size-4" />
						</button>
					</>
				) : null}
				<NextImage
					src="/logo.png"
					alt=""
					width={56}
					height={56}
					className="vpl-iglogo"
					aria-hidden
				/>
			</div>

			{n > 1 ? (
				<ol className="vpl-ithumbs">
					{items.map((it, i) => (
						<li key={it.id}>
							<button
								type="button"
								className={cn("vpl-ithumb", i === active && "is-active")}
								onClick={() => go(i)}
								aria-current={i === active ? "true" : undefined}
								aria-label={it.title}
							>
								{it.posterUrl ? (
									<NextImage
										src={it.posterUrl}
										alt=""
										fill
										sizes="56px"
										draggable={false}
									/>
								) : null}
							</button>
						</li>
					))}
				</ol>
			) : null}

			<div key={`iginfo-${item.id}`} className="vpl-iginfo">
				<h4 className="vpl-igtitle">{item.title}</h4>
				{item.description ? (
					<p className="vpl-igdesc">{item.description}</p>
				) : null}
			</div>

			{/* biome-ignore lint/a11y/useKeyWithClickEvents: native <dialog> backdrop click-to-close, Escape already closes it natively */}
			<dialog
				ref={lightboxRef}
				className="ipl-lightbox"
				aria-label={item.title}
				onClick={(e) => {
					if (e.target === lightboxRef.current) lightboxRef.current?.close();
				}}
			>
				<button
					type="button"
					className="ipl-lightbox-close"
					onClick={() => lightboxRef.current?.close()}
					aria-label={closeLabel}
				>
					<XMarkIcon className="size-5" />
				</button>
				<div className="ipl-lightbox-frame">
					{item.posterUrl ? (
						// biome-ignore lint/performance/noImgElement: unknown aspect ratio — the frame must hug the image's own rendered box so the logo lands on it, which next/image's `fill` (forced inset:0) can't do.
						<img
							key={`iglightbox-${item.id}`}
							src={item.posterUrl}
							alt={item.title}
							className="ipl-lightbox-img"
						/>
					) : null}
					<NextImage
						src="/logo.png"
						alt=""
						width={72}
						height={72}
						className="ipl-logo"
						aria-hidden
					/>
				</div>
			</dialog>
		</div>
	);
}

/* ─────────────────────────── Image: "Fan" gallery ─────────────────────────── */

const FAN_OPACITY = [1, 0.92, 0.78, 0.55];

function ImageFan({
	items,
	previousLabel,
	nextLabel,
	closeLabel,
}: NavLabels & { items: DonateArchiveVideoItem[]; closeLabel: string }) {
	const locale = useLocale();
	const dir: "rtl" | "ltr" = locale === "ckb" ? "rtl" : "ltr";
	const n = items.length;

	const [nav, setNav] = useState({ active: 0, prev: 0 });
	const { active, prev } = nav;

	const wrapRef = useRef<HTMLDivElement>(null);
	const width = useContainerWidth(wrapRef);
	const mid = width > 0 && width < 900;
	const compact = width > 0 && width < 560;
	const swipe = useRef<{ x: number; y: number } | null>(null);
	const lightboxRef = useRef<HTMLDialogElement>(null);

	const go = useCallback(
		(i: number) => {
			if (!n) return;
			setNav((s) => {
				const next = ((i % n) + n) % n;
				return next === s.active ? s : { prev: s.active, active: next };
			});
		},
		[n],
	);

	// Preload the neighbours so switching feels instant.
	useEffect(() => {
		if (n < 2) return;
		for (const k of [active + 1, active - 1]) {
			const it = items[((k % n) + n) % n];
			if (it?.posterUrl) {
				const img = new Image();
				img.src = it.posterUrl;
			}
		}
	}, [active, items, n]);

	if (!n) return null;
	const item = items[active];

	const onPointerDown = (e: PointerEvent) => {
		swipe.current = { x: e.clientX, y: e.clientY };
	};
	const onPointerUp = (e: PointerEvent) => {
		const s = swipe.current;
		swipe.current = null;
		if (!s) return;
		const dx = e.clientX - s.x;
		const dy = e.clientY - s.y;
		if (Math.abs(dx) >= 50 && Math.abs(dx) >= Math.abs(dy)) {
			const forward = dir === "rtl" ? dx > 0 : dx < 0;
			go(forward ? active + 1 : active - 1);
			return;
		}
		// Not a swipe — a plain tap/click opens the full image.
		if (Math.abs(dx) < 10 && Math.abs(dy) < 10) {
			lightboxRef.current?.showModal();
		}
	};

	/* ---------- fan geometry ---------- */
	const spread = compact ? 68 : mid ? 120 : 150; // horizontal distance between cards
	const drop = compact ? 4 : mid ? 6 : 7; // how much the cards dip toward the edges
	const lift = compact ? -10 : -16; // how far the selected card rises
	const maxVisible = compact ? 2 : 3;
	const shift = loopRel(prev - active, n);
	const sign = dir === "rtl" ? -1 : 1;

	const fan = items.map((it, i) => {
		const rel = loopRel(i - active, n);
		const prel = loopRel(i - prev, n);
		const m = Math.abs(rel);
		const on = rel === 0;
		const jumped = rel - prel !== shift; // wrapped around the loop: move without animating
		const x = sign * -rel * spread;
		const y = on ? lift : rel * rel * drop;
		const r = sign * -rel * 5;
		const s = on ? 1.2 : 1 - 0.04 * m;
		const visible = m <= maxVisible;
		return {
			it,
			i,
			on,
			visible,
			style: {
				transform: `translateX(${x}px) translateY(${y}px) rotate(${r}deg) scale(${s.toFixed(3)})`,
				opacity: visible ? FAN_OPACITY[m] : 0,
				zIndex: 10 - m,
				pointerEvents: visible ? undefined : "none",
				transition: jumped ? "none" : undefined,
			} as CSSProperties,
		};
	});

	return (
		<div ref={wrapRef} className="ipl-wrap">
			<section dir={dir} className="ipl">
				<div className="ipl-row">
					<div className="ipl-top">
						<div className="ipl-stagewrap">
							{item.posterUrl ? (
								<div className="ipl-glow" aria-hidden>
									<NextImage
										key={`glow-${item.id}`}
										src={item.posterUrl}
										alt=""
										fill
										sizes="100vw"
										className="size-full"
									/>
								</div>
							) : null}
							<div
								className="ipl-stage"
								onPointerDown={onPointerDown}
								onPointerUp={onPointerUp}
								onPointerCancel={() => {
									swipe.current = null;
								}}
							>
								{item.posterUrl ? (
									<NextImage
										key={`stage-${item.id}`}
										src={item.posterUrl}
										alt={item.title}
										fill
										sizes="(min-width: 1024px) 60vw, 100vw"
										className="ipl-img"
										draggable={false}
									/>
								) : null}

								{n > 1 ? (
									<>
										<button
											type="button"
											className="ipl-arrow ipl-arrow--prev"
											onClick={() => go(active - 1)}
											onPointerDown={(e) => e.stopPropagation()}
											aria-label={previousLabel}
										>
											<DirectionalIcon
												icon={ChevronRightIcon}
												className="size-5"
											/>
										</button>
										<button
											type="button"
											className="ipl-arrow ipl-arrow--next"
											onClick={() => go(active + 1)}
											onPointerDown={(e) => e.stopPropagation()}
											aria-label={nextLabel}
										>
											<DirectionalIcon
												icon={ChevronLeftIcon}
												className="size-5"
											/>
										</button>
									</>
								) : null}
							</div>
						</div>

						<div key={`caption-${item.id}`} className="ipl-caption">
							<h3 className="ipl-title">{item.title}</h3>
							{item.description ? (
								<p className="ipl-desc">{item.description}</p>
							) : null}
						</div>
					</div>

					{n > 1 ? (
						<ul className="ipl-fan">
							{fan.map(({ it, i, on, visible, style }) => (
								<li key={it.id} className="ipl-fan-item" style={style}>
									<button
										type="button"
										className={cn("ipl-card", on && "is-active")}
										onClick={() => go(i)}
										aria-current={on ? "true" : undefined}
										aria-label={it.title}
										tabIndex={visible ? 0 : -1}
									>
										{it.posterUrl ? (
											<NextImage
												src={it.posterUrl}
												alt=""
												fill
												sizes="124px"
												draggable={false}
											/>
										) : null}
									</button>
								</li>
							))}
						</ul>
					) : null}
				</div>
			</section>

			{/* biome-ignore lint/a11y/useKeyWithClickEvents: native <dialog> backdrop click-to-close, Escape already closes it natively */}
			<dialog
				ref={lightboxRef}
				className="ipl-lightbox"
				aria-label={item.title}
				onClick={(e) => {
					if (e.target === lightboxRef.current) lightboxRef.current?.close();
				}}
			>
				<button
					type="button"
					className="ipl-lightbox-close"
					onClick={() => lightboxRef.current?.close()}
					aria-label={closeLabel}
				>
					<XMarkIcon className="size-5" />
				</button>
				<div className="ipl-lightbox-frame">
					{item.posterUrl ? (
						// biome-ignore lint/performance/noImgElement: unknown aspect ratio — the frame must hug the image's own rendered box so the logo lands on it, which next/image's `fill` (forced inset:0) can't do.
						<img
							key={`lightbox-${item.id}`}
							src={item.posterUrl}
							alt={item.title}
							className="ipl-lightbox-img"
						/>
					) : null}
					<NextImage
						src="/logo.png"
						alt=""
						width={72}
						height={72}
						className="ipl-logo"
						aria-hidden
					/>
				</div>
			</dialog>
		</div>
	);
}
