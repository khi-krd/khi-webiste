"use client";

import {
	ChevronLeftIcon,
	ChevronRightIcon,
	XMarkIcon,
} from "@heroicons/react/24/outline";
import { PlayIcon } from "@heroicons/react/24/solid";
import dynamic from "next/dynamic";
import NextImage from "next/image";
import { useLocale } from "next-intl";
import {
	type KeyboardEvent,
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

const pad = (n: number) => String(n).padStart(2, "0");

/**
 * The archive-donors showcase on the donate page. Each block is a fixed 16:9
 * preview on top of a horizontal, swipe/arrow-key scrollable strip of
 * thumbnail cards — videos on the right, images on the left. An images-only
 * archive renders the standalone gallery instead. Each block renders only
 * when it has records.
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
						heading={heading}
					/>
				</section>
			) : (
				<section>
					<SectionHeading title={imagesHeading} count={images.length} />
					<ImageGallery
						items={images}
						closeLabel={closeLabel}
						stripLabel={imagesHeading}
						previousLabel={previousLabel}
						nextLabel={nextLabel}
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

/* ─────────────── Shared: horizontal thumbnail strip ─────────────── */

/**
 * The one scrollable row under every preview. Native overflow scrolling
 * carries touch swipe + trackpad; a mouse-drag handler gives desktop the same
 * flick; scroll-snap settles each card on an edge. Keyboard: the strip itself
 * is focusable and every card is a button — Left/Right move the selection
 * (mirrored in RTL), Enter/Space select natively.
 */
function MediaStrip({
	items,
	active,
	dir,
	label,
	previousLabel,
	nextLabel,
	playingId,
	onSelect,
}: {
	items: DonateArchiveVideoItem[];
	active: number;
	dir: "rtl" | "ltr";
	label: string;
	previousLabel: string;
	nextLabel: string;
	/** When the active video is playing, its card carries the eq bars. */
	playingId?: number | null;
	onSelect: (index: number) => void;
}) {
	const listRef = useRef<HTMLOListElement>(null);
	const dragRef = useRef<{ x: number; y: number; moved: boolean } | null>(null);
	const suppressClick = useRef(false);
	const n = items.length;

	// Keep the selected card visible when it changes, without scrolling the page.
	useEffect(() => {
		const selected = listRef.current?.children[active];
		selected?.scrollIntoView({
			block: "nearest",
			inline: "nearest",
			behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches
				? "instant"
				: "smooth",
		});
	}, [active]);

	const onKeyDown = (e: KeyboardEvent) => {
		if (e.key !== "ArrowLeft" && e.key !== "ArrowRight") return;
		// In RTL the strip runs right-to-left, so Left is "next" there.
		const forward = e.key === (dir === "rtl" ? "ArrowLeft" : "ArrowRight");
		e.preventDefault();
		const next = (((active + (forward ? 1 : -1)) % n) + n) % n;
		onSelect(next);
		(
			listRef.current?.children[next]?.querySelector("button") as
				| HTMLButtonElement
				| null
				| undefined
		)?.focus();
	};

	// Mouse drag-to-scroll; touch uses the native pan. `scrollBy` follows the
	// physical axis in every browser, so RTL needs the opposite sign.
	const onPointerDown = (e: PointerEvent) => {
		if (e.pointerType !== "mouse" || e.button !== 0) return;
		dragRef.current = { x: e.clientX, y: e.clientY, moved: false };
	};
	const onPointerMove = (e: PointerEvent) => {
		const drag = dragRef.current;
		const list = listRef.current;
		if (!drag || !list) return;
		const dx = e.clientX - drag.x;
		if (!drag.moved && Math.abs(dx) < 6 && Math.abs(e.clientY - drag.y) < 6) {
			return;
		}
		drag.moved = true;
		list.scrollBy({ left: dir === "rtl" ? dx : -dx });
		drag.x = e.clientX;
	};
	const endDrag = () => {
		if (dragRef.current?.moved) suppressClick.current = true;
		dragRef.current = null;
	};

	const step = (delta: number) => {
		if (!n) return;
		onSelect((((active + delta) % n) + n) % n);
	};

	return (
		<div className="ms-stripwrap">
			{n > 1 ? (
				<button
					type="button"
					className="ms-arrow"
					onClick={() => step(-1)}
					aria-label={previousLabel}
				>
					<DirectionalIcon icon={ChevronLeftIcon} className="size-4" />
				</button>
			) : null}
			<ol
				ref={listRef}
				className="ms-strip"
				aria-label={label}
				// biome-ignore lint/a11y/noNoninteractiveTabindex: spec requires the strip itself focusable so arrow keys can move the selection without tabbing into a card first.
				tabIndex={0}
				onKeyDown={onKeyDown}
				onPointerDown={onPointerDown}
				onPointerMove={onPointerMove}
				onPointerUp={endDrag}
				onPointerCancel={endDrag}
				onPointerLeave={endDrag}
				onClickCapture={(e) => {
					if (suppressClick.current) {
						suppressClick.current = false;
						e.preventDefault();
						e.stopPropagation();
					}
				}}
			>
				{items.map((item, index) => (
					<li key={item.id}>
						<button
							type="button"
							aria-current={index === active ? "true" : undefined}
							title={item.title}
							className={cn("ms-card", index === active && "is-active")}
							onClick={() => onSelect(index)}
						>
							<span className="ms-thumb">
								{item.posterUrl ? (
									<NextImage
										src={item.posterUrl}
										alt=""
										width={160}
										height={90}
										sizes="160px"
										loading="lazy"
										draggable={false}
									/>
								) : item.videoUrl ? (
									<VideoStill src={item.videoUrl} />
								) : null}
								{playingId === item.id ? (
									<span className="vpl-eq is-playing" aria-hidden>
										<span />
										<span />
										<span />
									</span>
								) : null}
							</span>
							<span className="ms-title">{item.title}</span>
						</button>
					</li>
				))}
			</ol>
			{n > 1 ? (
				<button
					type="button"
					className="ms-arrow"
					onClick={() => step(1)}
					aria-label={nextLabel}
				>
					<DirectionalIcon icon={ChevronRightIcon} className="size-4" />
				</button>
			) : null}
		</div>
	);
}

/* ─────────────────────────── Video block ─────────────────────────── */

function VideoQueue({
	items,
	images,
	imagesHeading,
	playLabel,
	playlistLabel,
	previousLabel,
	nextLabel,
	closeLabel,
	heading,
}: {
	items: DonateArchiveVideoItem[];
	images: DonateArchiveVideoItem[];
	imagesHeading: string;
	playLabel: string;
	playlistLabel: string;
	previousLabel: string;
	nextLabel: string;
	closeLabel: string;
	heading: string;
}) {
	const locale = useLocale();
	const dir: "rtl" | "ltr" = locale === "ckb" ? "rtl" : "ltr";
	const n = items.length;

	const [active, setActive] = useState(0);
	const [playing, setPlaying] = useState(false);

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
			<section dir={dir} className="vpl" aria-label={heading}>
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

				<div className={cn("vpl-row", images.length > 0 && "vpl-row--split")}>
					<div className="vpl-main" dir={dir}>
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

						{n > 1 ? (
							<MediaStrip
								items={items}
								active={active}
								dir={dir}
								label={playlistLabel}
								previousLabel={previousLabel}
								nextLabel={nextLabel}
								playingId={playing ? activeItem.id : null}
								onSelect={(index) => go(index, true)}
							/>
						) : null}

						<div key={`info-${activeItem.id}`} className="vpl-info">
							<h3 className="vpl-title">{activeItem.title}</h3>
							{activeItem.description ? (
								<p className="vpl-desc">{activeItem.description}</p>
							) : null}
						</div>
					</div>
					{images.length > 0 ? (
						<ImagePanel
							items={images}
							stripLabel={imagesHeading}
							previousLabel={previousLabel}
							nextLabel={nextLabel}
							closeLabel={closeLabel}
						/>
					) : null}
				</div>
			</section>
		</div>
	);
}

/**
 * The image column inside the dark band: 16:9 stage (tap for the lightbox,
 * swipe to switch), thumbnail strip, caption.
 */
function ImagePanel({
	items,
	stripLabel,
	previousLabel,
	nextLabel,
	closeLabel,
}: {
	items: DonateArchiveVideoItem[];
	stripLabel: string;
	previousLabel: string;
	nextLabel: string;
	closeLabel: string;
}) {
	const locale = useLocale();
	const dir: "rtl" | "ltr" = locale === "ckb" ? "rtl" : "ltr";
	const n = items.length;

	const [active, setActive] = useState(0);
	const swipe = useRef<{ x: number; y: number } | null>(null);
	const lightboxRef = useRef<HTMLDialogElement>(null);

	const go = useCallback(
		(i: number) => {
			if (!n) return;
			setActive(((i % n) + n) % n);
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
		<div className="vpl-gallery" dir={dir}>
			<div
				className="vpl-igstage"
				onPointerDown={onPointerDown}
				onPointerUp={onPointerUp}
				onPointerCancel={() => {
					swipe.current = null;
				}}
			>
				<button
					type="button"
					className="vpl-image-open"
					aria-label={item.title}
					onClick={(event) => {
						if (event.detail === 0) lightboxRef.current?.showModal();
					}}
				/>
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
				<MediaStrip
					items={items}
					active={active}
					dir={dir}
					label={stripLabel}
					previousLabel={previousLabel}
					nextLabel={nextLabel}
					onSelect={go}
				/>
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

/* ─────────────── Standalone gallery (images-only archive) ─────────────── */

/**
 * Same preview-first structure as the dark-band image column, on the paper
 * surface: 16:9 stage, thumbnail strip, caption, lightbox.
 */
function ImageGallery({
	items,
	closeLabel,
	stripLabel,
	previousLabel,
	nextLabel,
}: {
	items: DonateArchiveVideoItem[];
	closeLabel: string;
	stripLabel: string;
	previousLabel: string;
	nextLabel: string;
}) {
	const locale = useLocale();
	const dir: "rtl" | "ltr" = locale === "ckb" ? "rtl" : "ltr";
	const n = items.length;

	const [active, setActive] = useState(0);
	const swipe = useRef<{ x: number; y: number } | null>(null);
	const lightboxRef = useRef<HTMLDialogElement>(null);

	const go = useCallback(
		(i: number) => {
			if (!n) return;
			setActive(((i % n) + n) % n);
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

	return (
		<div className="ipl-wrap">
			<section dir={dir} className="ipl">
				<div className="ipl-row">
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
						</div>
					</div>

					{n > 1 ? (
						<MediaStrip
							items={items}
							active={active}
							dir={dir}
							label={stripLabel}
							previousLabel={previousLabel}
							nextLabel={nextLabel}
							onSelect={go}
						/>
					) : null}

					<div key={`caption-${item.id}`} className="ipl-caption">
						<h3 className="ipl-title">{item.title}</h3>
						{item.description ? (
							<p className="ipl-desc">{item.description}</p>
						) : null}
					</div>
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
