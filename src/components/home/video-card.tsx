"use client";

import { PlayIcon } from "@heroicons/react/24/solid";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import NextImage from "next/image";
import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Badge } from "@/components/ui/badge";
import { Link } from "@/components/ui/link";
import { cn } from "@/lib/utils";

const imageEase = "ease-[cubic-bezier(0.25,0.46,0.45,0.94)]";

/** Travel time for the still flying from the queue onto the stage. */
const FLIGHT_DURATION = 0.52;

/** Ease-out with a long tail — quick to leave, gentle to arrive. */
const FLIGHT_EASE = [0.22, 1, 0.36, 1] as const;

/** Dissolve that hands the landed still over to the live player underneath. */
const HANDOVER_DURATION = 0.18;

/** A still in transit from its queue slot to the stage. */
type Flight = {
	item: HomeVideoCardItem;
	from: DOMRect;
	to: DOMRect;
	fromRadius: string;
	toRadius: string;
	/** True once it has arrived and the stage below has taken over. */
	landed: boolean;
};

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
}: {
	item: HomeVideoCardItem;
	playing: boolean;
	onPlay: () => void;
}) {
	if (playing && item.previewVideoUrl) {
		return (
			<div className="absolute inset-0 bg-black">
				{/* biome-ignore lint/a11y/useMediaCaption: archive clips ship without caption tracks */}
				<video
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
	stillRef,
	inFlight = false,
	className,
}: {
	item: HomeVideoCardItem;
	onActivate: () => void;
	/** The still itself — measured for the flight's starting box. */
	stillRef?: (node: HTMLButtonElement | null) => void;
	/** This still is currently in the air, so its slot sits empty. */
	inFlight?: boolean;
	className?: string;
}) {
	return (
		<article
			className={cn(
				"group relative flex min-h-20 min-w-0 items-stretch overflow-hidden border border-border/70 bg-surface/60 text-start sm:min-h-24",
				"transition-[background-color,border-color,box-shadow] duration-300 ease-out",
				"fine-hover:border-foreground/25 fine-hover:bg-surface fine-hover:shadow-[0_10px_28px_-18px_rgba(26,24,19,0.5)]",
				"lg:min-h-0 lg:flex-1",
				className,
			)}
		>
			<button
				ref={stillRef}
				type="button"
				onClick={onActivate}
				disabled={!item.previewVideoUrl}
				aria-label={item.title}
				// The press registers instantly, before the stage has begun to change.
				// `inFlight` empties the slot: the copy the user is watching travel is
				// the one in the portal, and two of them at once breaks the illusion.
				className={cn(
					"relative w-28 shrink-0 cursor-pointer self-stretch overflow-hidden bg-foreground/10 transition-transform duration-150 ease-out active:scale-[0.97] focus-visible:outline focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-ring motion-reduce:transition-none motion-reduce:active:scale-100 disabled:cursor-default sm:w-36 lg:w-44",
					inFlight && "opacity-0",
				)}
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

/**
 * The home video stage: one clip large, the rest queued beside it.
 *
 * Picking from the queue does NOT navigate, and does not cut either. The still
 * you clicked LIFTS OUT of its slot and flies to the stage, growing into it, and
 * the clip already playing dissolves underneath it. Only when it lands does the
 * chosen clip become the active video and start playing — so the stage is never
 * empty and nothing jumps.
 *
 * The flight is a FLIP: measure the still's box and the stage's box before
 * anything changes, then animate the gap between them. It runs in a PORTAL on a
 * fixed-position layer because the two boxes live in different `overflow:hidden`
 * containers — the queue column clips its rows and the stage clips its cover, so
 * anything animating between them inside the tree gets cut in half. Motion's own
 * `layoutId` has the same problem for the same reason.
 *
 * Position is a transform and the dissolve is opacity, both composited. Width
 * and height animate directly: the still is 4:3-ish and the stage is 16:9, so a
 * single scale factor cannot serve both axes without visibly squashing faces.
 * On a fixed-position element that costs one isolated layout per frame and no
 * document reflow.
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
	const [flight, setFlight] = useState<Flight | null>(null);
	const [mounted, setMounted] = useState(false);
	const reduceMotion = useReducedMotion();

	const stageRef = useRef<HTMLDivElement>(null);
	const stillRefs = useRef(new Map<string, HTMLButtonElement>());
	/** Set for the clip that arrived by flight, so the stage does not re-animate
	 *  it in underneath a still that is already sitting exactly on top of it. */
	const arrivedByFlight = useRef<string | null>(null);
	/** Mirrors `flight` synchronously. Two clicks inside one tick both read the
	 *  pre-render state, so guarding on the state alone lets the LAST one win —
	 *  the ref makes it the first, which is the one the user aimed at. */
	const inFlightRef = useRef(false);

	useEffect(() => setMounted(true), []);

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

	const activate = (key: string) => {
		// One flight at a time — a second launch mid-air would measure boxes that
		// are already moving and land somewhere nonsensical.
		if (inFlightRef.current) return;

		const item = byKey.get(key);
		const still = stillRefs.current.get(key);
		const stage = stageRef.current;

		if (reduceMotion || !item || !still || !stage) {
			arrivedByFlight.current = null;
			promote(key);
			return;
		}

		const from = still.getBoundingClientRect();
		const to = stage.getBoundingClientRect();
		if (from.width === 0 || to.width === 0) {
			arrivedByFlight.current = null;
			promote(key);
			return;
		}

		inFlightRef.current = true;
		setFlight({
			item,
			from,
			to,
			fromRadius: getComputedStyle(still).borderTopLeftRadius,
			toRadius: getComputedStyle(stage).borderTopLeftRadius,
			landed: false,
		});
	};

	/**
	 * Two beats, both ending here: the still finishes travelling, so the clip it
	 * carried takes the stage and starts playing UNDERNEATH it; then the still
	 * dissolves off the top, revealing the live player already in place.
	 */
	const onFlightSettled = () => {
		if (!flight) return;

		if (!flight.landed) {
			arrivedByFlight.current = flight.item.key;
			promote(flight.item.key);
			setFlight({ ...flight, landed: true });
			return;
		}

		inFlightRef.current = false;
		setFlight(null);
	};

	/** House curve — a fast start that coasts into place. */
	const ease = [0.22, 1, 0.36, 1] as const;
	const queueTransition = reduceMotion
		? { duration: 0 }
		: { duration: 0.5, ease };

	if (!hero) return null;

	/** A still is on its way here, so the clip on stage bows out under it. */
	const handingOver = Boolean(flight && flight.item.key !== hero.key);
	/** This clip was carried in — the still is already sitting on top of it at
	 *  exactly this size, so fading it up would show through as a double image. */
	const arrived = arrivedByFlight.current === hero.key;

	return (
		<div className="overflow-hidden border border-border bg-border">
			<div className="grid grid-cols-1 gap-px lg:h-[min(74svh,52rem)] lg:grid-cols-[minmax(0,1fr)_clamp(22rem,30vw,30rem)]">
				<div
					ref={stageRef}
					className="relative aspect-video min-h-0 overflow-hidden lg:aspect-auto lg:h-full"
				>
					{/*
					 * No `mode="wait"`. Waiting for the old clip to leave before the new
					 * one arrives puts an empty frame between them, which reads as a cut
					 * rather than a change. Both are absolutely positioned, so they can
					 * occupy the cell together and genuinely cross-dissolve.
					 *
					 * The incoming clip settles in from slightly oversized while the
					 * outgoing one recedes: the pair reads as one picture being replaced,
					 * not two pictures blinking.
					 */}
					<AnimatePresence initial={false}>
						<motion.div
							key={hero.key}
							className="absolute inset-0"
							initial={
								reduceMotion || arrived ? false : { opacity: 0, scale: 1.07 }
							}
							animate={{ opacity: handingOver ? 0 : 1, scale: 1 }}
							exit={
								reduceMotion
									? { opacity: 0 }
									: { opacity: 0, scale: 0.965, filter: "blur(6px)" }
							}
							transition={
								reduceMotion
									? { duration: 0 }
									: {
											duration: 0.62,
											ease,
											// Bowing out under an incoming still is a crossfade timed
											// to the flight; a plain swap clears fast so the old clip
											// never muddies the new one.
											opacity: {
												duration: handingOver ? FLIGHT_DURATION * 0.8 : 0.34,
												ease: "easeOut",
											},
										}
							}
						>
							<StageHero
								item={hero}
								playing={playingKey === hero.key}
								onPlay={() => setPlayingKey(hero.key)}
							/>
						</motion.div>
					</AnimatePresence>
				</div>

				{queue.length > 0 ? (
					<div className="flex min-h-0 flex-col bg-background lg:h-full">
						<div className="flex min-h-0 flex-1 flex-col gap-2.5 overflow-y-auto p-3 lg:gap-3 lg:p-4">
							{/* `layout` on every row so the ones that stay slide to their new
							    place instead of jumping; the clip leaving for the stage and
							    the one arriving from it trade in the same beat. */}
							<AnimatePresence initial={false} mode="popLayout">
								{queue.map((item, index) => (
									<motion.div
										key={item.key}
										layout={!reduceMotion}
										initial={
											reduceMotion ? false : { opacity: 0, scale: 0.94, y: 8 }
										}
										// `popLayout` takes the leaving row out of flow, so it
										// overlaps its replacement. Clear it out fast and hold the
										// arrival back a beat, or both titles are legible at once
										// and the slot turns to mush.
										animate={{
											opacity: 1,
											scale: 1,
											y: 0,
											transition: reduceMotion
												? { duration: 0 }
												: { duration: 0.42, ease, delay: 0.12 },
										}}
										exit={
											reduceMotion
												? { opacity: 0 }
												: {
														opacity: 0,
														scale: 0.92,
														y: -8,
														transition: { duration: 0.2, ease: "easeOut" },
													}
										}
										transition={queueTransition}
										className={cn(
											"flex min-h-0 flex-col lg:flex-1",
											index >= mobileQueueCount ? "max-lg:hidden" : "",
										)}
									>
										<PlaylistRow
											item={item}
											onActivate={() => activate(item.key)}
											stillRef={(node) => {
												if (node) stillRefs.current.set(item.key, node);
												else stillRefs.current.delete(item.key);
											}}
											inFlight={flight?.item.key === item.key}
											className="lg:h-full"
										/>
									</motion.div>
								))}
							</AnimatePresence>
						</div>
					</div>
				) : null}
			</div>

			{/*
			 * The still in transit. Portalled to <body> on a fixed layer so it is
			 * clipped by nothing: its start box is inside the queue's scroll
			 * container and its end box is inside the stage's, and either one would
			 * otherwise slice it in half on the way across.
			 */}
			{mounted && flight
				? createPortal(
						<motion.div
							aria-hidden
							className="pointer-events-none fixed top-0 left-0 z-[60] overflow-hidden bg-foreground shadow-[0_40px_90px_-40px_rgba(0,0,0,0.7)]"
							style={{ willChange: "transform, width, height" }}
							initial={{
								x: flight.from.left,
								y: flight.from.top,
								width: flight.from.width,
								height: flight.from.height,
								borderRadius: flight.fromRadius,
								opacity: 1,
							}}
							animate={{
								x: flight.to.left,
								y: flight.to.top,
								width: flight.to.width,
								height: flight.to.height,
								borderRadius: flight.toRadius,
								opacity: flight.landed ? 0 : 1,
							}}
							transition={{
								duration: FLIGHT_DURATION,
								ease: FLIGHT_EASE,
								// Opaque for the whole journey; the dissolve only runs on the
								// second beat, once the player below is already in place.
								opacity: {
									duration: flight.landed ? HANDOVER_DURATION : 0,
									ease: "easeOut",
								},
							}}
							onAnimationComplete={onFlightSettled}
						>
							{flight.item.coverUrl ? (
								<NextImage
									src={flight.item.coverUrl}
									alt=""
									fill
									sizes="100vw"
									className="object-cover"
								/>
							) : null}
						</motion.div>,
						document.body,
					)
				: null}
		</div>
	);
}
