"use client";

import { PlayIcon } from "@heroicons/react/24/solid";
import NextImage from "next/image";
import { type RefObject, useEffect, useMemo, useRef, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Link } from "@/components/ui/link";
import { cn } from "@/lib/utils";

const imageEase = "ease-[cubic-bezier(0.25,0.46,0.45,0.94)]";

/** Minimal shape the home video stage needs — fed from a `ResolvedVideoCard`. */
export type HomeVideoCardItem = {
	/**
	 * Stable identity. NOT `id`: one video expands into several cards, one per
	 * clip, and they all carry the parent's id — keying on it collapsed the
	 * queue into duplicates and broke the swap.
	 */
	key: string;
	id: number;
	title: string;
	subtitle: string | null;
	durationLabel: string | null;
	coverUrl: string | null;
	coverAlt?: string | null;
	/** Direct media URL. Without one the card can only link out. */
	previewVideoUrl: string | null;
	categoryLabel: string;
	href: string;
};

/** Square black play affordance — the same mark at both stage sizes. */
function PlayMark({ size }: { size: "sm" | "lg" }) {
	return (
		<span
			className={cn(
				"inline-flex items-center justify-center bg-foreground text-white shadow-[0_6px_18px_-8px_rgba(0,0,0,0.8)]",
				"transition-[transform,background-color] duration-300 ease-out",
				"motion-reduce:transition-none",
				size === "lg"
					? "size-14 group-fine:scale-105 lg:size-18"
					: "size-9 group-fine:scale-110",
			)}
		>
			<PlayIcon
				className={cn(
					"translate-x-px",
					size === "lg" ? "size-6 lg:size-7" : "size-4",
				)}
			/>
		</span>
	);
}

/**
 * The stage's hero cell. Nothing here navigates on its own: the cover plays the
 * video IN PLACE, and only the title is a link out to the video's page — so a
 * click on the artwork is never an accidental page change.
 */
function StageHero({
	item,
	playing,
	onPlay,
	videoRef,
}: {
	item: HomeVideoCardItem;
	playing: boolean;
	onPlay: () => void;
	/** The live player, shared with the stage so Space can reach it. */
	videoRef: RefObject<HTMLVideoElement | null>;
}) {
	const live = playing && Boolean(item.previewVideoUrl);

	// Focus follows the clip onto the stage. The player is what the user just
	// asked for, so it should be what the keyboard is holding — Space then goes
	// straight to the native controls instead of paging the document.
	// `preventScroll` because taking focus must never move the page under them.
	useEffect(() => {
		if (!live) return;
		videoRef.current?.focus({ preventScroll: true });
	}, [live, videoRef]);

	if (live && item.previewVideoUrl) {
		return (
			<div className="absolute inset-0 bg-black">
				{/* biome-ignore lint/a11y/useMediaCaption: archive clips ship without caption tracks */}
				<video
					ref={videoRef}
					key={item.key}
					src={item.previewVideoUrl}
					controls
					autoPlay
					playsInline
					preload="metadata"
					aria-label={item.title}
					className="absolute inset-0 h-full w-full object-contain"
				/>
			</div>
		);
	}

	return (
		<div className="group absolute inset-0 overflow-hidden bg-surface">
			<div className="absolute inset-0 isolate overflow-hidden">
				<div
					className={cn(
						"absolute inset-[-5%] origin-center",
						"transition-transform duration-[1.35s]",
						imageEase,
						"group-fine:scale-[1.06] motion-reduce:transition-none motion-reduce:duration-0 motion-reduce:group-fine:scale-100",
					)}
				>
					{item.coverUrl ? (
						<NextImage
							src={item.coverUrl}
							alt={item.coverAlt ?? item.title}
							fill
							sizes="(max-width: 1024px) 100vw, 62vw"
							className="object-cover brightness-[0.78] contrast-[1.1] saturate-[0.65]"
						/>
					) : (
						<div
							aria-hidden
							className="flex h-full w-full items-center justify-center bg-foreground"
						>
							<span className="font-heading text-display font-bold text-primary-foreground/15">
								{item.title.charAt(0)}
							</span>
						</div>
					)}
				</div>

				<div
					className="pointer-events-none absolute inset-0 z-1 bg-foreground/25 transition-opacity duration-500 ease-out group-fine:bg-foreground/40 motion-reduce:transition-none"
					aria-hidden
				/>
				<div
					className="pointer-events-none absolute inset-0 z-1 bg-linear-to-t from-foreground from-0% via-foreground/70 via-38% to-transparent to-72% transition-opacity duration-500 ease-out group-fine:via-foreground/80 motion-reduce:transition-none"
					aria-hidden
				/>
			</div>

			<div className="absolute inset-x-0 top-0 z-10 p-4 sm:p-5">
				<Badge
					variant="subtle"
					size="sm"
					className="w-fit border border-white/20 bg-white/10 text-white/90"
				>
					{item.categoryLabel}
				</Badge>
			</div>

			{/* Fills the cell so the whole still is the play target. */}
			<button
				type="button"
				onClick={onPlay}
				disabled={!item.previewVideoUrl}
				aria-label={item.title}
				className="absolute inset-0 z-10 flex cursor-pointer items-center justify-center focus-visible:outline focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-white disabled:cursor-default"
			>
				<PlayMark size="lg" />
			</button>

			<div className="pointer-events-none absolute inset-x-0 bottom-0 z-20 flex items-end justify-between gap-4 p-4 sm:p-5 lg:p-6">
				<div className="min-w-0 flex-1 text-start text-white">
					<h3 className="font-heading text-h2 font-semibold leading-snug text-balance lg:text-h1">
						<Link
							href={item.href}
							variant="nav"
							className="pointer-events-auto text-inherit no-underline hover:text-white! focus-visible:underline fine-hover:underline fine-hover:decoration-white/50 fine-hover:underline-offset-4"
						>
							{item.title}
						</Link>
					</h3>
					{item.subtitle ? (
						<p className="mt-1.5 line-clamp-2 text-small text-white/85">
							{item.subtitle}
						</p>
					) : null}
				</div>

				{item.durationLabel ? (
					<span className="shrink-0 text-label font-medium text-white/80">
						{item.durationLabel}
					</span>
				) : null}
			</div>
		</div>
	);
}

/**
 * One line of the queue beside the hero.
 *
 * The still is flush to the card — no inset, no rounding of its own — so it
 * meets the frame on the same line the hero's cover does. The still swaps the
 * clip onto the stage; the title is the only thing that leaves the page.
 */
function PlaylistRow({
	item,
	onActivate,
	className,
}: {
	item: HomeVideoCardItem;
	onActivate: () => void;
	className?: string;
}) {
	return (
		<article
			className={cn(
				"group relative flex min-h-20 min-w-0 items-stretch overflow-hidden border border-border/70 bg-surface/60 text-start sm:min-h-24",
				"transition-[background-color,border-color,box-shadow] duration-300 ease-out",
				"fine-hover:border-foreground/25 fine-hover:bg-surface fine-hover:shadow-[0_10px_28px_-18px_rgba(26,24,19,0.5)]",
				"lg:min-h-0 lg:flex-1",
				// A row repaints on its own account — a hover on one is never a reflow
				// of the queue above it, however many rows are in the column.
				"[contain:layout_paint]",
				className,
			)}
		>
			<button
				type="button"
				onClick={onActivate}
				disabled={!item.previewVideoUrl}
				aria-label={item.title}
				className="relative w-28 shrink-0 cursor-pointer self-stretch overflow-hidden bg-foreground/10 focus-visible:outline focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-ring disabled:cursor-default sm:w-36 lg:w-44"
			>
				{item.coverUrl ? (
					<NextImage
						src={item.coverUrl}
						alt=""
						fill
						sizes="(max-width: 640px) 30vw, (max-width: 1024px) 20vw, 260px"
						className={cn(
							"object-cover transition-[filter,scale] duration-[620ms]",
							imageEase,
							"brightness-[0.9] group-fine:scale-[1.05] group-fine:brightness-100",
							"motion-reduce:transition-none motion-reduce:group-fine:scale-100",
						)}
					/>
				) : (
					<div
						aria-hidden
						className="flex h-full w-full items-center justify-center bg-foreground"
					>
						<span className="font-heading text-h3 font-bold text-primary-foreground/20">
							{item.title.charAt(0)}
						</span>
					</div>
				)}

				<span
					aria-hidden
					className="absolute inset-0 flex items-center justify-center bg-foreground/20 transition-colors duration-300 ease-out group-fine:bg-foreground/35 motion-reduce:transition-none"
				>
					<PlayMark size="sm" />
				</span>

				{item.durationLabel ? (
					<span className="absolute bottom-1 end-1 bg-foreground/80 px-1.5 py-px text-label font-medium text-white/90 tabular-nums">
						{item.durationLabel}
					</span>
				) : null}
			</button>

			<div className="flex min-w-0 flex-1 flex-col justify-center gap-1 px-3 py-2 lg:px-4">
				<p className="truncate text-label font-medium text-muted">
					{item.categoryLabel}
				</p>
				<h3 className="line-clamp-2 font-heading text-small font-semibold leading-snug text-foreground sm:text-body">
					<Link
						href={item.href}
						variant="nav"
						className="text-inherit no-underline hover:text-foreground! fine-hover:underline fine-hover:decoration-foreground/30 fine-hover:underline-offset-4"
					>
						{item.title}
					</Link>
				</h3>
				{item.subtitle ? (
					<p className="line-clamp-1 text-label text-muted">{item.subtitle}</p>
				) : null}
			</div>
		</article>
	);
}

/** Wheel silence that ends a scroll, before hover is handed back. Long enough
 *  to cover the gap between notches in a continuous flick, short enough that
 *  the row under the cursor lights up as soon as the queue is at rest. */
const SCROLL_IDLE_MS = 140;

/**
 * Native scrolling for the queue column, with nothing standing between the
 * notch and the movement.
 *
 * The queue scrolls itself — no wheel is ever translated into a scroll here.
 * Everything below exists to keep the browser's own scroll from being made to
 * wait, and none of it goes through React: a notch must never cost a render.
 *
 *  - THE WHEEL HANDLER READS NOTHING FROM THE DOM. `scrollHeight`, `clientHeight`
 *    and `scrollTop` are layout reads, and on a page with Motion animations
 *    running there is nearly always a pending style invalidation when a notch
 *    lands — so reading them here forces a synchronous style-and-layout pass
 *    BEFORE the browser is allowed to scroll. That is felt exactly as "it does
 *    not move until I nudge the mouse". The three numbers are cached instead
 *    and refreshed only where layout has already settled and the same reads
 *    cost nothing: the `scroll` event and a ResizeObserver, both of which the
 *    browser runs after layout. What is left in the handler is arithmetic on
 *    three local variables.
 *
 *  - A wheel the queue can consume stops propagating. The page's
 *    <SectionScroll/> holds a NON-passive wheel listener on window, so every
 *    notch over this column waited on a handler that walked the ancestor chain
 *    through `getComputedStyle` before the queue was allowed to move. Stopping
 *    the event here skips that entirely. At either end the event is let through
 *    untouched, so the page carries on exactly as it does anywhere else.
 *
 *  - Hover inside the column freezes while it moves. Scrolling drags rows under
 *    a stationary cursor, and every row that passes it starts its own
 *    scale/brightness/shadow transitions — a dozen animated image filters is
 *    what turned a flick into a stutter. Raised from the `scroll` event rather
 *    than the wheel, so the style invalidation lands after the scroll it
 *    belongs to instead of in front of it.
 *
 * Both listeners are passive: nothing here ever calls `preventDefault`, so the
 * scrolling itself is never taken off the compositor.
 */
function useNativeQueueScroll() {
	const ref = useRef<HTMLDivElement>(null);

	useEffect(() => {
		const element = ref.current;
		if (!element) return;

		let idleTimer = 0;
		/** Scroll geometry as of the last settled layout — see the note above. */
		let maxScroll = 0;
		let position = 0;

		const measure = () => {
			maxScroll = element.scrollHeight - element.clientHeight;
			position = element.scrollTop;
		};

		/** Flag on, idle countdown restarted. Written straight to the DOM: the
		 *  flag is nothing React owns, and a scroll must not re-render the queue. */
		const markScrolling = () => {
			// Guarded — re-writing the same value would invalidate style again on
			// every event of the gesture for no change at all.
			if (element.dataset.scrolling === undefined) {
				element.dataset.scrolling = "";
			}
			window.clearTimeout(idleTimer);
			idleTimer = window.setTimeout(() => {
				delete element.dataset.scrolling;
			}, SCROLL_IDLE_MS);
		};

		// Covers every way the column moves — wheel, keys, a drag of the scrollbar.
		// Fires after the scroll has been applied, so both reads are free here.
		const onScroll = () => {
			measure();
			markScrolling();
		};

		const onWheel = (event: WheelEvent) => {
			// Zoom and horizontal intent are not this column's business.
			if (event.ctrlKey || event.deltaY === 0) return;
			if (Math.abs(event.deltaX) > Math.abs(event.deltaY)) return;
			if (maxScroll <= 0) return;

			// Only the direction being asked for counts: at the bottom, an upward
			// notch is still ours. `deltaMode` is irrelevant — only the sign is read.
			// A cached position can trail the live one by at most the frame in hand,
			// and the only thing riding on that is which side of an end a single
			// notch falls — never whether the queue moves.
			const room = event.deltaY > 0 ? maxScroll - position : position;
			if (room > 1) event.stopPropagation();
		};

		// Both run after layout, so `measure` is free from inside them. The column
		// resizing covers the viewport; its children resizing covers a clip being
		// promoted in or out of the queue, which is the only thing that changes how
		// far it can scroll.
		const resize = new ResizeObserver(measure);
		const observeAll = () => {
			resize.disconnect();
			resize.observe(element);
			for (const child of Array.from(element.children)) resize.observe(child);
		};
		const rows = new MutationObserver(observeAll);

		measure();
		observeAll();
		rows.observe(element, { childList: true });
		element.addEventListener("scroll", onScroll, { passive: true });
		element.addEventListener("wheel", onWheel, { passive: true });

		return () => {
			window.clearTimeout(idleTimer);
			resize.disconnect();
			rows.disconnect();
			element.removeEventListener("scroll", onScroll);
			element.removeEventListener("wheel", onWheel);
			delete element.dataset.scrolling;
		};
	}, []);

	return ref;
}

/**
 * The home video stage: one clip large, the rest queued beside it.
 *
 * Picking from the queue swaps it straight onto the stage and starts it
 * playing — a plain state swap, no transition standing between the click and
 * the change.
 */
export function VideoStage({
	items,
	mobileQueueCount,
}: {
	items: HomeVideoCardItem[];
	/** Queue lines that ride along when the column is stacked under the hero. */
	mobileQueueCount: number;
}) {
	const byKey = useMemo(
		() => new Map(items.map((item) => [item.key, item])),
		[items],
	);
	const [order, setOrder] = useState(() => items.map((item) => item.key));
	const [playingKey, setPlayingKey] = useState<string | null>(null);
	/** The queue column scrolls itself, natively, with no state behind it. */
	const queueScrollRef = useNativeQueueScroll();
	/** The clip currently on stage, for the Space key below. */
	const videoRef = useRef<HTMLVideoElement>(null);

	/**
	 * Space belongs to the clip on stage, not to the page.
	 *
	 * Once a clip is playing, Space is a transport control: it pauses and it
	 * resumes. Left to the document it scrolls instead, and on the home page a
	 * scroll is a whole section change — so watching a clip and reaching for
	 * pause threw the viewer off the video entirely.
	 *
	 * Only while the stage is actually on screen. Space has to go back to being
	 * page-down once the viewer has moved on to another section, or a clip left
	 * paused at the top of the page would hold the key hostage for the whole
	 * document.
	 */
	useEffect(() => {
		if (!playingKey) return;

		const onKeyDown = (event: KeyboardEvent) => {
			if (event.key !== " " && event.code !== "Space") return;
			if (event.ctrlKey || event.metaKey || event.altKey) return;

			const video = videoRef.current;
			if (!video) return;

			// The player already has it: the native controls toggle playback on
			// Space themselves, and swallow the scroll while they do.
			if (event.target === video) return;
			// Anything else that answers to Space keeps it — a focused button is
			// being pressed, a field is being typed into.
			if (
				event.target instanceof HTMLElement &&
				event.target.closest(
					"input, textarea, select, button, a, summary, [role='button'], [contenteditable=''], [contenteditable='true']",
				)
			) {
				return;
			}

			// Off screen, or barely on it, Space is the page's again.
			const box = video.getBoundingClientRect();
			const onScreen =
				Math.min(box.bottom, window.innerHeight) - Math.max(box.top, 0);
			if (onScreen < box.height / 2) return;

			event.preventDefault();
			if (video.paused) {
				// Autoplay policy can still refuse; nothing to do but leave it paused.
				void video.play().catch(() => {});
			} else {
				video.pause();
			}
		};

		window.addEventListener("keydown", onKeyDown);
		return () => window.removeEventListener("keydown", onKeyDown);
	}, [playingKey]);

	const hero = byKey.get(order[0]);

	const queue = order
		.slice(1)
		.map((key) => byKey.get(key))
		.filter((item): item is HomeVideoCardItem => Boolean(item));

	const promote = (key: string) => {
		setOrder((current) => {
			const index = current.indexOf(key);
			if (index <= 0) return current;
			const next = [...current];
			next[0] = current[index];
			next[index] = current[0];
			return next;
		});
		setPlayingKey(key);
	};

	if (!hero) return null;

	return (
		<div className="overflow-hidden border border-border bg-border">
			<div className="grid grid-cols-1 gap-px lg:h-[min(74svh,52rem)] lg:grid-cols-[minmax(0,1fr)_clamp(22rem,30vw,30rem)]">
				<div className="relative aspect-video min-h-0 overflow-hidden lg:aspect-auto lg:h-full">
					<StageHero
						item={hero}
						playing={playingKey === hero.key}
						onPlay={() => setPlayingKey(hero.key)}
						videoRef={videoRef}
					/>
				</div>

				{queue.length > 0 ? (
					<div className="flex min-h-0 flex-col bg-background lg:h-full">
						<div
							ref={queueScrollRef}
							data-wheel-scrollable=""
							className={cn(
								"flex min-h-0 flex-1 flex-col gap-2.5 overflow-y-auto p-3 lg:gap-3 lg:p-4",
								// NOT `overscroll-contain`. The rows are `lg:flex-1`, so a short
								// queue stretches to fill the column and never overflows — and
								// `contain` still applies to a scroll container with nothing to
								// scroll. It swallowed the wheel and refused to chain to the
								// page, and the browser latches that for the whole gesture, so
								// the page sat dead until the mouse moved and re-hit-tested.
								// Propagation is handled per-notch in `useNativeQueueScroll`
								// instead, which can tell "we have room" from "we are done".
								//
								// `scroll-auto` keeps the wheel on the browser's own 1:1
								// response — a smooth scroll-behavior would put an animation
								// between the notch and the movement.
								"scroll-auto",
								// Style and paint invalidation stay inside the column, so a long
								// queue costs no more per frame than a short one.
								"[contain:layout_paint]",
								// Hover frozen for the length of a scroll (see
								// `useNativeQueueScroll`). Non-layout properties only: flipping
								// these invalidates style, never geometry.
								"[&[data-scrolling]_*]:pointer-events-none [&[data-scrolling]_*]:transition-none",
							)}
						>
							{queue.map((item, index) => (
								<div
									key={item.key}
									className={cn(
										"flex min-h-0 flex-col lg:flex-1",
										index >= mobileQueueCount ? "max-lg:hidden" : "",
									)}
								>
									<PlaylistRow
										item={item}
										onActivate={() => promote(item.key)}
										className="lg:h-full"
									/>
								</div>
							))}
						</div>
					</div>
				) : null}
			</div>
		</div>
	);
}
