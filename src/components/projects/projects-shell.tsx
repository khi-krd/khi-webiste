import { ProjectCard } from "@/components/projects/project-card";
import { ProjectsPagination } from "@/components/projects/projects-pagination";
import { ProjectsTagBar } from "@/components/projects/projects-tag-bar";
import {
	ScrollReveal,
	ScrollRevealItem,
} from "@/components/motion/scroll-reveal";
import { EmptyState } from "@/components/ui/empty-state";
import type { ProjectListItem } from "@/lib/mock/projects";

type ProjectsShellProps = {
	items: ProjectListItem[];
	currentPage: number;
	totalPages: number;
	tags: string[];
	activeYear: string | null;
	activeTag: string | null;
	activeQuery: string | null;
	previewLabel: string;
	tagsFilterLabel: string;
	noResultsMessage: string;
	paginationLabel: string;
	previousLabel: string;
	nextLabel: string;
};

export function ProjectsShell({
	items,
	currentPage,
	totalPages,
	tags,
	activeYear,
	activeTag,
	activeQuery,
	previewLabel,
	tagsFilterLabel,
	noResultsMessage,
	paginationLabel,
	previousLabel,
	nextLabel,
}: ProjectsShellProps) {
	return (
		<section
			id="projects-content"
			data-snap-section
			className="scroll-mt-26 sm:scroll-mt-30"
		>
			<ProjectsTagBar
				tags={tags}
				activeYear={activeYear}
				activeTag={activeTag}
				activeQuery={activeQuery}
				tagsLabel={tagsFilterLabel}
			/>

			<div className="mx-auto max-w-[88rem] px-6 py-12 sm:px-8 sm:py-16 lg:py-20">
				{items.length === 0 ? (
					<EmptyState title={noResultsMessage} />
				) : (
					<ScrollReveal>
						<ul className="grid grid-cols-1 gap-12 md:grid-cols-2 md:gap-x-10 lg:grid-cols-3 lg:gap-x-0 lg:divide-x lg:divide-border">
							{items.map((item, index) => (
								<ScrollRevealItem
									key={item.id}
									className="min-w-0 lg:px-8 lg:first:ps-0 lg:last:pe-0"
								>
									<ProjectCard
										item={item}
										copy={{ preview: previewLabel }}
										priority={index < 3}
									/>
								</ScrollRevealItem>
							))}
						</ul>
					</ScrollReveal>
				)}

				<ProjectsPagination
					currentPage={currentPage}
					totalPages={totalPages}
					activeYear={activeYear}
					activeTag={activeTag}
					activeQuery={activeQuery}
					label={paginationLabel}
					previousLabel={previousLabel}
					nextLabel={nextLabel}
					className="mt-14 flex justify-center sm:mt-16"
				/>
			</div>
		</section>
	);
}
