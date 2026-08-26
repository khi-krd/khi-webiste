import { galleryStripTrayClass } from "@/components/gallery/gallery-album-item";
import { GalleryMarqueeColumn } from "@/components/gallery/gallery-marquee-column";
import type { GalleryHeroColumns } from "@/lib/mock/gallery";
import { cn } from "@/lib/utils";

type GalleryHeroProps = {
	/** Screen-reader name for the wall — it carries no visible text. */
	label: string;
	columns: GalleryHeroColumns;
};

/**
 * Wordless photo wall. Every column is the same pool rotated by a different
 * offset, so no two columns ever show the same frame side by side, and each
 * runs at its own speed so the grid never falls into lockstep.
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

export function GalleryHero({ label, columns }: GalleryHeroProps) {
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
			aria-label={label}
			className="relative w-full overflow-hidden bg-background"
		>
			<div
				className={cn(
					"marquee-zone relative h-svh w-full overflow-hidden",
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
			</div>
		</section>
	);
}
