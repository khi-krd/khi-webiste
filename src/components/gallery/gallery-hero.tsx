import { ChevronDownIcon } from "@heroicons/react/24/outline";
import { galleryStripTrayClass } from "@/components/gallery/gallery-album-item";
import { GalleryMarqueeColumn } from "@/components/gallery/gallery-marquee-column";
import { ScrollRevealBlock } from "@/components/motion/scroll-reveal";
import { homeInsetClass } from "@/lib/layout";
import type { GalleryHeroColumns } from "@/lib/mock/gallery";
import { cn } from "@/lib/utils";

type GalleryHeroProps = {
	/** The wall's own name, carried as the page h1 — the card's only text. */
	title: string;
	/** Accessible name for the wordless jump down to the collections grid. */
	scrollCueLabel: string;
	columns: GalleryHeroColumns;
};

/**
 * Photo wall under a title card. Every column is the same pool rotated by a
 * different offset, so no two columns ever show the same frame side by side,
 * and each runs at its own speed so the grid never falls into lockstep.
 */
function rotate<T>(items: T[], by: number): T[] {
	if (items.length === 0) {
		return items;
	}
	const offset = by % items.length;
	return [...items.slice(offset), ...items.slice(0, offset)];
}

/** Per-column drift, seconds. Deliberately co-prime-ish — no shared beat. */
const COLUMN_DURATIONS = [58, 75, 67, 91, 83] as const;

const MIN_COLUMNS = 2;

/** Static class strings — Tailwind cannot see an interpolated column count. */
const gridColumnsClass: Record<number, string> = {
	2: "grid-cols-2",
	3: "grid-cols-2 sm:grid-cols-3",
	4: "grid-cols-2 sm:grid-cols-3 lg:grid-cols-4",
	5: "grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 2xl:grid-cols-5",
};

/** Columns past a breakpoint's budget are hidden, never squeezed. */
function visibilityClass(index: number): string {
	if (index < 2) return "block";
	if (index === 2) return "hidden sm:block";
	if (index === 3) return "hidden lg:block";
	return "hidden 2xl:block";
}

export function GalleryHero({
	title,
	scrollCueLabel,
	columns,
}: GalleryHeroProps) {
	// One pool, five phases. The old split-pool arrangement only had enough
	// material for the two columns that sat beside the headline; with the text
	// gone the wall spans the full canvas and needs the whole set.
	const pool = [...columns.up, ...columns.down];

	if (pool.length === 0) {
		return null;
	}

	// Never run more columns than the pool can tell apart: the CMS set is short,
	// and a sixth phase of four images is just the same photo again one column
	// over.
	const columnCount = Math.min(
		COLUMN_DURATIONS.length,
		Math.max(MIN_COLUMNS, pool.length),
	);

	// Phase AND sequence both differ per column. Rotating by a fixed step alone
	// put the same frame in neighbouring columns whenever the pool was small
	// (the CMS set is short), so odd columns also walk the pool backwards.
	const columnItems = (index: number) => {
		const offset = Math.round((index * pool.length) / columnCount);
		return index % 2 === 1
			? rotate([...pool].reverse(), offset)
			: rotate(pool, offset);
	};

	return (
		<section
			aria-labelledby="gallery-hero-heading"
			className="relative w-full overflow-hidden bg-background"
		>
			<div
				className={cn(
					// Minus the sticky header the wall starts under, per --header-h:
					// at a plain 100svh the cue at its foot sits below the fold.
					"marquee-zone relative h-[calc(100svh-var(--header-h,5rem))] w-full overflow-hidden",
					galleryStripTrayClass,
				)}
			>
				<div
					className={cn(
						"grid h-full gap-1.5",
						gridColumnsClass[columnCount] ?? gridColumnsClass[2],
					)}
				>
					{COLUMN_DURATIONS.slice(0, columnCount).map(
						(durationSeconds, index) => (
							<GalleryMarqueeColumn
								key={durationSeconds}
								items={columnItems(index)}
								direction={index % 2 === 1 ? "down" : "up"}
								durationSeconds={durationSeconds}
								className={visibilityClass(index)}
							/>
						),
					)}
				</div>

				{/* Scrims. Direction-agnostic (top/bottom only) so the card reads
				    the same in both scripts, and light enough that the wall keeps
				    its colour. */}
				<div
					aria-hidden
					className="pointer-events-none absolute inset-0 z-1 bg-foreground/30"
				/>
				<div
					aria-hidden
					className="pointer-events-none absolute inset-x-0 top-0 z-1 h-40 bg-linear-to-b from-foreground/75 to-transparent sm:h-56"
				/>
				<div
					aria-hidden
					className="pointer-events-none absolute inset-x-0 bottom-0 z-1 h-40 bg-linear-to-t from-foreground/80 to-transparent sm:h-56"
				/>

				{/* The placard: a full-bleed band ruled top and bottom, the way a
				    room title is set on a gallery wall. `pointer-events-none` so
				    the photographs behind it stay clickable and the marquee still
				    pauses on hover. */}
				<div className="pointer-events-none absolute inset-0 z-2 flex items-center justify-center">
					<ScrollRevealBlock className="w-full border-y border-white/20 bg-foreground/45 py-7 backdrop-blur-[2px] sm:py-9">
						<div className={cn(homeInsetClass, "text-center text-white")}>
							<h1 id="gallery-hero-heading" className="hero-slide-title">
								{title}
							</h1>
						</div>
					</ScrollRevealBlock>
				</div>

				{/* A full-height wall hides the grid below it, so the way down is
				    marked — wordlessly, since the card is the only text here; the
				    label is left for assistive tech. Plain anchor: same page, no
				    locale to resolve, and `scroll-padding-top` clears the header. */}
				<div className="absolute inset-x-0 bottom-5 z-2 flex justify-center sm:bottom-7">
					<a
						href="#gallery-content"
						aria-label={scrollCueLabel}
						className="inline-flex size-9 items-center justify-center border border-primary-foreground/25 bg-primary text-primary-foreground no-underline transition-opacity duration-300 fine-hover:opacity-90"
					>
						<ChevronDownIcon className="size-4 animate-bounce" aria-hidden />
					</a>
				</div>
			</div>
		</section>
	);
}
