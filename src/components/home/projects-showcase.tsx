/* biome-ignore-all lint/a11y/useSemanticElements: carousel slide semantics require role="group". */
"use client";

import { ArrowRightIcon } from "@heroicons/react/24/outline";
import useEmblaCarousel from "embla-carousel-react";
import { useEffect } from "react";
import { ProjectCard } from "@/components/home/project-card";
import {
	ScrollReveal,
	ScrollRevealBlock,
	ScrollRevealItem,
} from "@/components/motion/scroll-reveal";
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
	"min-w-0 shrink-0 basis-[88%] pe-5 sm:basis-[60%] sm:pe-6 md:basis-[46%] lg:basis-[40%] xl:basis-[36%] last:pe-6 sm:last:pe-8";

const emblaViewportClass =
	"touch-pan-y overflow-hidden ps-6 [touch-action:pan-y_pinch-zoom] sm:ps-8";

const emblaContainerClass = "flex transform-gpu";

const viewAllClass =
	"group/viewall relative inline-flex h-10 w-fit shrink-0 items-center gap-2.5 overflow-hidden border border-foreground px-5 font-heading text-small font-semibold text-foreground no-underline transition-[color,gap,box-shadow] duration-300 ease-out before:absolute before:inset-0 before:z-0 before:origin-bottom before:scale-y-0 before:bg-foreground before:transition-transform before:duration-300 before:ease-[cubic-bezier(0.22,1,0.36,1)] fine-hover:gap-3.5 fine-hover:text-primary-foreground fine-hover:shadow-[0_8px_24px_-12px_rgba(26,24,19,0.35)] fine-hover:before:scale-y-100 motion-reduce:before:transition-none motion-reduce:fine-hover:before:scale-y-100 motion-reduce:fine-hover:gap-2.5";

export function ProjectsShowcase({
	projects,
	direction,
	copy,
}: ProjectsShowcaseProps) {
	const [emblaRef, emblaApi] = useEmblaCarousel({
		align: "start",
		containScroll: "trimSnaps",
		direction,
		dragFree: false,
		slidesToScroll: 1,
		duration: 32,
	});

	useEffect(() => {
		if (!emblaApi) return;
		emblaApi.reInit();
	}, [projects, direction, emblaApi]);

	return (
		<div>
			<ScrollRevealBlock className="mb-8 px-6 sm:mb-10 sm:px-8">
				<header>
					<div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between sm:gap-8">
						<div className="max-w-xl text-start">
							<p className="text-label font-medium text-muted">{copy.eyebrow}</p>
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

			<div className={emblaViewportClass} ref={emblaRef}>
				<ScrollReveal className={emblaContainerClass}>
					{projects.map((project) => (
						<ScrollRevealItem
							key={project.id}
							role="group"
							aria-roledescription="slide"
							className={slideClass}
						>
							<ProjectCard item={project} variant="carousel" />
						</ScrollRevealItem>
					))}
				</ScrollReveal>
			</div>
		</div>
	);
}
