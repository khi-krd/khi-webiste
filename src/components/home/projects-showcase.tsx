import { ArrowRightIcon } from "@heroicons/react/24/outline";
import { ProjectCard } from "@/components/home/project-card";
import {
	ScrollReveal,
	ScrollRevealBlock,
	ScrollRevealItem,
} from "@/components/motion/scroll-reveal";
import { viewAllCtaClass } from "@/components/ui/cta-styles";
import { DirectionalIcon } from "@/components/ui/directional-icon";
import { Link } from "@/components/ui/link";
import type { ProjectItem } from "@/lib/mock/projects";
import { cn } from "@/lib/utils";

export type ProjectsShowcaseCopy = {
	title: string;
	viewAll: string;
};

type ProjectsShowcaseProps = {
	projects: ProjectItem[];
	copy: ProjectsShowcaseCopy;
};

/**
 * The grid is always exactly two rows, so the visible card count follows the
 * column count: 2 / 3 / 4 / 5 columns → 4 / 6 / 8 / 10 cards. Cards past a
 * breakpoint's budget are `display:none` (never a third row, never a gap).
 */
const MAX_COLUMNS = 5;
const MIN_COLUMNS = 2;

/**
 * Widest column count the CMS can actually fill twice over. With 6 published
 * projects a 5-up grid would leave four holes in row two, so the grid steps
 * down to 3-up instead — both rows stay complete at every size.
 */
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

/**
 * Cells are `grid`, not `block`: the card then stretches to the row height by
 * grid alignment instead of a `height: 100%` that browsers refuse to resolve.
 */
function visibilityClass(index: number): string {
	if (index < 4) return "grid"; // 2 cols × 2 rows
	if (index < 6) return "hidden sm:grid"; // 3 cols × 2 rows
	if (index < 8) return "hidden lg:grid"; // 4 cols × 2 rows
	return "hidden xl:grid"; // 5 cols × 2 rows
}

/**
 * Static two-row grid of project covers — no ticker, no auto-scroll, no drag.
 *
 * The whole block is a flex column that fills the section, and the grid takes
 * the leftover height (`flex-1` + `grid-rows-2`), so both rows land inside one
 * viewport instead of spilling into the next section.
 */
export function ProjectsShowcase({ projects, copy }: ProjectsShowcaseProps) {
	if (projects.length < MIN_COLUMNS * 2) {
		return null;
	}

	const columns = columnsFor(projects.length);
	const cards = projects.slice(0, columns * 2);

	return (
		<div className="flex min-h-0 flex-1 flex-col">
			<ScrollRevealBlock className="shrink-0 px-6 pb-6 sm:px-8 sm:pb-7">
				<header className="flex flex-row items-center justify-between gap-6">
					<h2
						id="projects-heading"
						className="font-heading text-h2 font-bold leading-[1.15] text-balance sm:text-h1"
					>
						{copy.title}
					</h2>

					<Link href="/projects" variant="nav" className={viewAllCtaClass}>
						<span className="relative z-1">{copy.viewAll}</span>
						<DirectionalIcon
							icon={ArrowRightIcon}
							className="relative z-1 size-4"
						/>
					</Link>
				</header>
			</ScrollRevealBlock>

			{/* The grid is the flex child itself (not a wrapper with `h-full`): a
			    percentage height would not resolve against a flex-grown parent, and
			    the rows would collapse to the cover images' intrinsic height. */}
			<ScrollReveal
				className={cn(
					"grid min-h-0 flex-1 grid-rows-2 gap-6 px-6 pb-10 sm:gap-8 sm:px-8 sm:pb-12",
					gridColumnsClass[columns],
				)}
			>
				{cards.map((project, index) => (
					<ScrollRevealItem
						key={project.id}
						className={cn("min-h-0", visibilityClass(index))}
					>
						<ProjectCard item={project} />
					</ScrollRevealItem>
				))}
			</ScrollReveal>
		</div>
	);
}
