"use client";

import NextImage from "next/image";
import { AudioPlayButton } from "@/components/audio/audio-play-button";
import {
	usePlayer,
	usePlayerTime,
} from "@/components/audio/audio-player-context";
import { AudioWaveform } from "@/components/audio/audio-waveform";
import {
	ScrollReveal,
	ScrollRevealItem,
} from "@/components/motion/scroll-reveal";
import { Link } from "@/components/ui/link";
import { audioDetailHref } from "@/lib/audio/resolve";
import { cn } from "@/lib/utils";
import type { PlayerTrackPayload } from "@/types/audio";

export type SoundSectionCardItem = {
	id: number;
	title: string;
	/** Reader/artist — shown as the "singer" line under the title. */
	subtitle: string | null;
	coverUrl: string | null;
	queue: PlayerTrackPayload[];
};

type SoundSectionCardsProps = {
	items: SoundSectionCardItem[];
	compact?: boolean;
};

/**
 * Same budget rule as the projects grid: always exactly two rows, so the
 * visible card count follows the column count — 2 / 3 / 4 / 5 columns →
 * 4 / 6 / 8 / 10 cards. Cards past a breakpoint's budget are `display:none`,
 * never a half-filled third row.
 *
 * Two rows (not three) because the cards keep a square cover: the grid only
 * gets the height the section has left under the heading, and three rows of
 * that budget would squash every cover to a letterbox strip with an
 * unreadable name under it.
 */
const MAX_COLUMNS = 5;
const MIN_COLUMNS = 2;

/** Widest column count the feed can actually fill twice over. */
function columnsFor(count: number): number {
	return Math.min(MAX_COLUMNS, Math.max(MIN_COLUMNS, Math.floor(count / 2)));
}

/** Static class strings — Tailwind cannot see interpolated variants. */
const gridColumnsClass: Record<number, string> = {
	2: "grid-cols-2",
	3: "grid-cols-2 sm:grid-cols-3",
	4: "grid-cols-2 sm:grid-cols-3 lg:grid-cols-4",
	5: "grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5",
};

/** Cells are `grid` so the card stretches to the row height by alignment. */
function visibilityClass(index: number): string {
	if (index < 4) return "grid"; // 2 cols × 2 rows
	if (index < 6) return "hidden sm:grid"; // 3 cols × 2 rows
	if (index < 8) return "hidden lg:grid"; // 4 cols × 2 rows
	return "hidden xl:grid"; // 5 cols × 2 rows
}

const WAVE_BAR_COUNT = 44;

const waveClassName = "h-6 min-w-0 flex-1 sm:h-7";
const idleBarClassName = "bg-primary-foreground/55";
/** Elapsed fill. `accent` is the token reserved for player progress — the
 *  deeper brand green loses too much contrast against the darkened sleeve. */
const playedBarClassName = "bg-accent";

/** Resting strip: no time subscription, so idle cards never re-render. */
function AlbumWave({ seedId }: { seedId: number }) {
	return (
		<AudioWaveform
			seedId={seedId}
			barCount={WAVE_BAR_COUNT}
			className={waveClassName}
			barClassName={idleBarClassName}
		/>
	);
}

/**
 * Elapsed-aware strip. Split into its own component and mounted ONLY for the
 * album currently playing: `usePlayerTime` ticks 4×/sec, and subscribing every
 * card in the grid would re-render the whole wall on every tick.
 *
 * Reads the CURRENT TRACK, exactly like the bottom bar's seek track — the two
 * are the same playhead shown twice and have to agree. (Spreading the fill over
 * the whole queue instead left a nearly finished track showing a sliver of
 * green on a twenty-track album.) It carries on across track changes because
 * the fill restarts with each new track, until the queue runs out.
 */
function PlayingAlbumWave({ seedId }: { seedId: number }) {
	const { currentTime, duration } = usePlayerTime();

	return (
		<AudioWaveform
			seedId={seedId}
			barCount={WAVE_BAR_COUNT}
			className={waveClassName}
			barClassName={idleBarClassName}
			playedBarClassName={playedBarClassName}
			progress={duration > 0 ? currentTime / duration : 0}
		/>
	);
}

function SoundSectionCard({ item }: { item: SoundSectionCardItem }) {
	const { state } = usePlayer();
	const current = state.queue[state.index];
	const isActive = item.queue.some((track) => track.fileId === current?.fileId);
	const isPlaying = isActive && state.status === "playing";

	return (
		<article
			className={cn(
				// The card takes its HEIGHT from the grid row and its WIDTH from this
				// ratio, which is the sleeves' own 3:2 plus the name plate under it.
				// Sizing off the height (not the column) is what keeps the artwork at
				// its native proportion whatever the viewport leaves for the grid;
				// `max-w-full` caps the card inside its column on tall screens.
				"group relative flex h-full max-w-full min-w-0 flex-col overflow-hidden border border-primary-foreground/15 bg-primary-foreground/6 aspect-[3/2.35]",
				"transition-[border-color,background-color,box-shadow] duration-300 ease-out",
				"fine-hover:border-primary-foreground/35 fine-hover:bg-primary-foreground/10 fine-hover:shadow-[0_18px_38px_-20px_rgba(0,0,0,0.7)]",
				isActive && "border-accent/50 bg-primary-foreground/12",
			)}
		>
			<div className="relative min-h-0 w-full flex-1 overflow-hidden bg-foreground/45">
				{item.coverUrl ? (
					<NextImage
						src={item.coverUrl}
						alt=""
						fill
						sizes="(max-width: 640px) 46vw, (max-width: 1024px) 32vw, 280px"
						className={cn(
							"object-cover transition-[filter,scale] duration-[520ms] ease-[cubic-bezier(0.22,1,0.36,1)]",
							isActive
								? "brightness-100 saturate-100"
								: "brightness-[0.88] saturate-[0.92] group-fine:scale-[1.04] group-fine:brightness-100 group-fine:saturate-100",
						)}
					/>
				) : (
					<div
						aria-hidden
						className="flex h-full w-full items-center justify-center bg-primary-foreground/8"
					>
						<span className="font-heading text-h2 font-bold text-primary-foreground/20">
							{item.title.charAt(0)}
						</span>
					</div>
				)}

				{/* Only the foot of the cover is darkened — enough for the play button
				    to read on a pale sleeve, without washing the artwork out. */}
				<div
					aria-hidden
					className={cn(
						"absolute inset-x-0 bottom-0 h-1/2 bg-linear-to-t from-foreground/90 from-10% via-foreground/45 via-55% to-transparent transition-opacity duration-[420ms] ease-out",
						isPlaying ? "opacity-100" : "opacity-75 group-fine:opacity-100",
					)}
				/>

				{/* Wave + play button, the same pairing the album page puts under its
				    liner — shrunk to a control strip along the foot of the sleeve. */}
				{item.queue.length > 0 ? (
					// `dir-row-unmirrored`: transport controls read left-to-right in
					// every locale — play first, then the strip it drives.
					<div className="dir-row-unmirrored absolute inset-x-0 bottom-0 z-2 flex items-center gap-2 p-2 sm:gap-2.5 sm:p-2.5">
						<AudioPlayButton
							queue={item.queue}
							size="overlay"
							className="shrink-0"
						/>
						{isActive ? (
							<PlayingAlbumWave seedId={item.id} />
						) : (
							<AlbumWave seedId={item.id} />
						)}
					</div>
				) : null}
			</div>

			<div className="min-w-0 shrink-0 border-t border-primary-foreground/12 bg-foreground/35 px-2.5 py-2 text-start sm:px-3 sm:py-2.5">
				<h3 className="truncate font-heading text-small font-semibold leading-tight text-primary-foreground">
					<Link
						href={audioDetailHref(item.id)}
						variant="nav"
						className="text-inherit no-underline after:absolute after:inset-0 after:z-1 after:content-[''] transition-[text-decoration-color] duration-300 hover:text-primary-foreground! group-fine:underline group-fine:decoration-primary-foreground/35 group-fine:underline-offset-[0.2em] motion-reduce:group-fine:no-underline"
					>
						{item.title}
					</Link>
				</h3>
				{item.subtitle ? (
					<p className="truncate text-label leading-tight text-primary-foreground/60">
						{item.subtitle}
					</p>
				) : null}
			</div>
		</article>
	);
}

/**
 * Album wall for the sound section — no card-in-a-card wrapper: the grid sits
 * straight on the section's dark plate and takes the height the heading leaves
 * over (`min-h-0 flex-1` + `grid-rows-2`), so both rows land inside the one
 * viewport the snap scroll gives this section.
 */
export function SoundSectionCards({
	items,
	compact = false,
}: SoundSectionCardsProps) {
	if (items.length < MIN_COLUMNS * 2) {
		return null;
	}

	const columns = compact ? MIN_COLUMNS : columnsFor(items.length);
	const cards = items.slice(0, columns * 2);

	return (
		<ScrollReveal
			className={cn(
				"grid min-h-0 flex-1 grid-rows-2 gap-x-3 gap-y-4 sm:gap-x-4 sm:gap-y-5",
				gridColumnsClass[columns],
			)}
		>
			{cards.map((item, index) => (
				<ScrollRevealItem
					key={item.id}
					className={cn("min-h-0 justify-items-center", visibilityClass(index))}
				>
					<SoundSectionCard item={item} />
				</ScrollRevealItem>
			))}
		</ScrollReveal>
	);
}
