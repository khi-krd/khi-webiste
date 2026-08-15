import { ArrowUpRightIcon } from "@heroicons/react/24/outline";
import {
	ScrollReveal,
	ScrollRevealItem,
} from "@/components/motion/scroll-reveal";
import { DirectionalIcon } from "@/components/ui/directional-icon";
import { Link } from "@/i18n/navigation";
import { projectsHref } from "@/lib/projects-url";
import { cn } from "@/lib/utils";

type ProjectsHeroProps = {
	title: string;
	titleEmphasis: string;
	countLabel: string;
	years: string[];
	activeYear: string | null;
	activeTag: string | null;
	activeQuery: string | null;
	allYearsLabel: string;
	showEmphasisItalic?: boolean;
};

const yearLinkClass =
	"font-heading text-small font-medium transition-colors duration-200";

export function ProjectsHero({
	title,
	titleEmphasis,
	countLabel,
	years,
	activeYear,
	activeTag,
	activeQuery,
	allYearsLabel,
	showEmphasisItalic = false,
}: ProjectsHeroProps) {
	return (
		<section
			aria-labelledby="projects-hero-heading"
			className="border-b border-border bg-background"
		>
			<div className="mx-auto max-w-[88rem] px-6 pt-10 pb-10 sm:px-8 sm:pt-12 sm:pb-12">
				<div className="flex flex-col gap-8 lg:flex-row lg:items-start lg:justify-between lg:gap-16">
					<nav aria-label={allYearsLabel} className="min-w-0">
						<ul className="flex flex-wrap items-center gap-x-5 gap-y-2">
							<li>
								<Link
									href={projectsHref({ tag: activeTag, q: activeQuery })}
									className={cn(
										yearLinkClass,
										!activeYear
											? "text-foreground"
											: "text-muted fine-hover:text-foreground",
									)}
									aria-current={!activeYear ? "page" : undefined}
								>
									{allYearsLabel}
								</Link>
							</li>
							{years.map((year) => (
								<li key={year}>
									<Link
										href={projectsHref({
											year,
											tag: activeTag,
											q: activeQuery,
										})}
										className={cn(
											yearLinkClass,
											activeYear === year
												? "text-foreground"
												: "text-muted fine-hover:text-foreground",
										)}
										aria-current={activeYear === year ? "page" : undefined}
									>
										{year}
									</Link>
								</li>
							))}
						</ul>
					</nav>

					<ScrollReveal className="flex shrink-0 flex-col items-start lg:items-end lg:text-end">
						<ScrollRevealItem className="flex items-start gap-3 lg:items-center">
							<h1
								id="projects-hero-heading"
								// display-title's clamp ceiling (5rem) saturates by ~1440px;
								// the 2xl bump keeps the heading anchoring the wider band.
								className="display-title text-balance 2xl:text-[5.5rem]"
							>
								{title}
							</h1>
							<DirectionalIcon
								icon={ArrowUpRightIcon}
								className="mt-2 size-8 shrink-0 text-foreground lg:mt-0 lg:size-9 2xl:size-10"
								aria-hidden
							/>
						</ScrollRevealItem>
						<ScrollRevealItem>
							<p
								className={cn(
									"mt-3 max-w-md text-lead leading-relaxed text-muted lg:ms-auto",
									showEmphasisItalic && "italic",
								)}
							>
								{titleEmphasis}
							</p>
						</ScrollRevealItem>
						<ScrollRevealItem>
							<p className="label mt-4 font-medium text-muted">{countLabel}</p>
						</ScrollRevealItem>
					</ScrollReveal>
				</div>
			</div>
		</section>
	);
}
