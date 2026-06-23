/* biome-ignore-all lint/a11y/useSemanticElements: carousel slide semantics require role="group". */
"use client";

import { ArrowRightIcon } from "@heroicons/react/24/outline";
import useEmblaCarousel from "embla-carousel-react";
import { ProjectCard } from "@/components/home/project-card";
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
	direction: "ltr" | "rtl";
	copy: ProjectsShowcaseCopy;
};

const slideClass =
	"min-w-0 shrink-0 basis-[86%] pe-5 sm:basis-[58%] sm:pe-6 lg:basis-[46%] lg:pe-7 xl:basis-[42%] last:pe-6 sm:last:pe-8";

const viewAllClass =
	"group/viewall relative inline-flex h-10 w-fit shrink-0 items-center gap-2.5 overflow-hidden border border-foreground px-5 font-heading text-small font-semibold text-foreground no-underline transition-[color,gap,box-shadow] duration-300 ease-out before:absolute before:inset-0 before:z-0 before:origin-bottom before:scale-y-0 before:bg-foreground before:transition-transform before:duration-300 before:ease-[cubic-bezier(0.22,1,0.36,1)] fine-hover:gap-3.5 fine-hover:text-primary-foreground fine-hover:shadow-[0_8px_24px_-12px_rgba(26,24,19,0.35)] fine-hover:before:scale-y-100 motion-reduce:before:transition-none motion-reduce:fine-hover:before:scale-y-100 motion-reduce:fine-hover:gap-2.5";

export function ProjectsShowcase({
	projects,
	direction,
	copy,
}: ProjectsShowcaseProps) {
	const [emblaRef] = useEmblaCarousel({
		align: "start",
		containScroll: "trimSnaps",
		direction,
		dragFree: false,
		slidesToScroll: 1,
		duration: 25,
	});

	return (
		<div>
			<ScrollRevealBlock className="mb-8 px-6 sm:mb-10 sm:px-8">
				<header>
					<div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between sm:gap-8">
						<div className="max-w-2xl text-start">
							<p className="label font-medium">{copy.eyebrow}</p>
							<h2
								id="projects-heading"
								className="mt-2 font-heading text-h1 font-bold leading-[1.1] text-balance"
							>
								{copy.title}
							</h2>
							<p className="mt-3 text-body text-muted">{copy.description}</p>
						</div>

						<Link href="/about" variant="nav" className={viewAllClass}>
							<span className="relative z-1">{copy.viewAll}</span>
							<DirectionalIcon
								icon={ArrowRightIcon}
								className="relative z-1 size-4"
							/>
						</Link>
					</div>
				</header>
			</ScrollRevealBlock>

			<div
				className="touch-pan-y overflow-hidden ps-6 sm:ps-8"
				ref={emblaRef}
				data-lenis-prevent-horizontal
				data-lenis-prevent-touch
			>
				<ScrollRevealBlock>
					<ul className="flex touch-pan-y">
						{projects.map((project) => (
							<li
								key={project.id}
								role="group"
								aria-roledescription="slide"
								className={slideClass}
							>
								<ProjectCard item={project} />
							</li>
						))}
					</ul>
				</ScrollRevealBlock>
			</div>
		</div>
	);
}
