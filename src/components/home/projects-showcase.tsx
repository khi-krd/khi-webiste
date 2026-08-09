import { ArrowRightIcon } from "@heroicons/react/24/outline";
import { ProjectCard } from "@/components/home/project-card";
import { ProjectsTicker } from "@/components/home/projects-ticker";
import { ScrollRevealBlock } from "@/components/motion/scroll-reveal";
import { DirectionalIcon } from "@/components/ui/directional-icon";
import { Link } from "@/components/ui/link";
import type { ProjectItem } from "@/lib/mock/projects";

export type ProjectsShowcaseCopy = {
	eyebrow: string;
	title: string;
	description: string;
	viewAll: string;
};

type ProjectsShowcaseProps = {
	projects: ProjectItem[];
	copy: ProjectsShowcaseCopy;
};

/**
 * One copy of the loop must be wider than any viewport or the seam shows —
 * tile a short CMS list until it carries at least this many cards.
 */
const MIN_TICKER_ITEMS = 8;

/** Ticker speed: seconds per card in one loop — slow, steady TV-ticker pace. */
const SECONDS_PER_CARD = 7;

/** Spacing lives INSIDE each item (`pe-*`) — the -50% loop depends on it. */
const slideClass = "w-[17rem] shrink-0 pe-4 sm:w-[19rem] sm:pe-5 lg:w-[21rem]";

const viewAllClass =
	"group/viewall relative inline-flex h-10 w-fit shrink-0 items-center gap-2.5 overflow-hidden border border-foreground px-5 font-heading text-small font-semibold text-foreground no-underline transition-[color,gap,box-shadow] duration-300 ease-out before:absolute before:inset-0 before:z-0 before:origin-bottom before:scale-y-0 before:bg-foreground before:transition-transform before:duration-300 before:ease-[cubic-bezier(0.22,1,0.36,1)] fine-hover:gap-3.5 fine-hover:text-primary-foreground fine-hover:shadow-[0_8px_24px_-12px_rgba(26,24,19,0.35)] fine-hover:before:scale-y-100 motion-reduce:before:transition-none motion-reduce:fine-hover:before:scale-y-100 motion-reduce:fine-hover:gap-2.5";

/**
 * Continuous news-ticker of project cards, draggable left/right.
 *
 * The cards stay server-rendered and are handed to {@link ProjectsTicker} as
 * children — only the ~150-line motion layer ships as client JS. The track
 * holds the tiled list twice; the duplicate copy is aria-hidden and untabbable
 * so keyboard and screen-reader users only meet each project once.
 */
export function ProjectsShowcase({ projects, copy }: ProjectsShowcaseProps) {
	if (projects.length === 0) {
		return null;
	}

	// Tiling repeats ids, so stamp each entry with its repeat pass for keys.
	const tiled: { project: ProjectItem; key: string }[] = [];
	let pass = 0;
	while (tiled.length < MIN_TICKER_ITEMS) {
		for (const project of projects) {
			tiled.push({ project, key: `${project.id}-r${pass}` });
		}
		pass += 1;
	}

	// The duplicate copy is on screen as much as the original, so it must stay
	// clickable — `inert` would make half the visible cards dead links. It is
	// hidden from assistive tech and taken out of the tab order instead.
	const renderCopy = (duplicate: boolean) => (
		<ul className="flex" aria-hidden={duplicate || undefined}>
			{tiled.map((entry) => (
				<li
					key={`${duplicate ? "dup" : "orig"}-${entry.key}`}
					className={slideClass}
				>
					<ProjectCard
						item={entry.project}
						variant="carousel"
						tabIndex={duplicate ? -1 : undefined}
					/>
				</li>
			))}
		</ul>
	);

	return (
		<div>
			<ScrollRevealBlock className="mb-8 px-6 sm:mb-10 sm:px-8">
				<header>
					<div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between sm:gap-8">
						<div className="max-w-xl text-start">
							<p className="text-label font-medium text-muted">
								{copy.eyebrow}
							</p>
							<h2
								id="projects-heading"
								className="mt-2 font-heading text-h3 font-semibold leading-snug text-balance sm:text-h2 sm:leading-[1.2]"
							>
								{copy.title}
							</h2>
							<p className="mt-2.5 text-small leading-relaxed text-muted">
								{copy.description}
							</p>
						</div>

						<Link href="/projects" variant="nav" className={viewAllClass}>
							<span className="relative z-1">{copy.viewAll}</span>
							<DirectionalIcon
								icon={ArrowRightIcon}
								className="relative z-1 size-4"
							/>
						</Link>
					</div>
				</header>
			</ScrollRevealBlock>

			<ScrollRevealBlock delay={0.06}>
				<ProjectsTicker secondsPerCopy={tiled.length * SECONDS_PER_CARD}>
					{renderCopy(false)}
					{renderCopy(true)}
				</ProjectsTicker>
			</ScrollRevealBlock>
		</div>
	);
}
