"use client";

import { PlayIcon } from "@heroicons/react/24/solid";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import NextImage from "next/image";
import { useMemo, useState } from "react";
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
				className,
			)}
		>
			<button
				type="button"
				onClick={onActivate}
				disabled={!item.previewVideoUrl}
				aria-label={item.title}
				// The press registers instantly, before the stage has begun to change.
				className="relative w-28 shrink-0 cursor-pointer self-stretch overflow-hidden bg-foreground/10 transition-transform duration-150 ease-out active:scale-[0.97] focus-visible:outline focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-ring motion-reduce:transition-none motion-reduce:active:scale-100 disabled:cursor-default sm:w-36 lg:w-44"
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
 * Picking from the queue does NOT navigate — the chosen clip trades places with
 * the one on stage and starts playing there. The hero crossfades while the
 * queue re-flows around the gap with a layout animation, so the swap reads as
 * one movement rather than two lists blinking.
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
	const reduceMotion = useReducedMotion();

	const hero = byKey.get(order[0]);
	if (!hero) return null;

	const queue = order
		.slice(1)
		.map((key) => byKey.get(key))
		.filter((item): item is HomeVideoCardItem => Boolean(item));

	const activate = (key: string) => {
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

	/** House curve — a fast start that coasts into place. */
	const ease = [0.22, 1, 0.36, 1] as const;
	const queueTransition = reduceMotion
		? { duration: 0 }
		: { duration: 0.5, ease };

	return (
		<div className="overflow-hidden border border-border bg-border">
			<div className="grid grid-cols-1 gap-px lg:h-[min(74svh,52rem)] lg:grid-cols-[minmax(0,1fr)_clamp(22rem,30vw,30rem)]">
				<div className="relative aspect-video min-h-0 overflow-hidden lg:aspect-auto lg:h-full">
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
							initial={reduceMotion ? false : { opacity: 0, scale: 1.07 }}
							animate={{ opacity: 1, scale: 1 }}
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
											// The old clip clears quickly so it never muddies the
											// new one; the new one takes its time arriving.
											opacity: { duration: 0.34, ease: "easeOut" },
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
											className="lg:h-full"
										/>
									</motion.div>
								))}
							</AnimatePresence>
						</div>
					</div>
				) : null}
			</div>
		</div>
	);
}
