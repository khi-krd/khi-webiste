import {
	ScrollReveal,
	ScrollRevealItem,
} from "@/components/motion/scroll-reveal";
import { ProjectCard } from "@/components/projects/project-card";
import { ProjectsClearFilters } from "@/components/projects/projects-clear-filters";
import { ProjectsFilterBar } from "@/components/projects/projects-filter-bar";
import { ProjectsPagination } from "@/components/projects/projects-pagination";
import type { ProjectListItem } from "@/lib/mock/projects";

type ProjectsShellProps = {
	items: ProjectListItem[];
	currentPage: number;
	totalPages: number;
	types: string[];
	activeYear: string | null;
	activeType: string | null;
	activeQuery: string | null;
	noResultsMessage: string;
	paginationLabel: string;
	previousLabel: string;
	nextLabel: string;
};

export function ProjectsShell({
	items,
	currentPage,
	totalPages,
	types,
	activeYear,
	activeType,
	activeQuery,
	noResultsMessage,
	paginationLabel,
	previousLabel,
	nextLabel,
}: ProjectsShellProps) {
	const hasFilters = Boolean(activeYear || activeType || activeQuery?.trim());
	const isEmpty = items.length === 0;

	return (
		<section id="projects-content" className="scroll-mt-26 sm:scroll-mt-30">
			<div className="mx-auto max-w-[88rem] px-6 py-12 sm:px-8 sm:py-16 lg:py-20">
				<ProjectsFilterBar
					types={types}
					activeYear={activeYear}
					activeType={activeType}
					activeQuery={activeQuery}
					className="mb-8 sm:mb-10"
				/>

				{isEmpty ? (
					<div className="border border-border bg-surface px-6 py-12 text-center sm:px-10">
						<p className="text-body text-muted">{noResultsMessage}</p>
						{hasFilters ? (
							<div className="mt-6 flex justify-center">
								<ProjectsClearFilters />
							</div>
						) : null}
					</div>
				) : (
					<ScrollReveal>
						{/* Equal px on every column (row edges pulled back with -mx) so
						    all three cards get the same content width — and therefore
						    the same fixed-ratio cover height. */}
						<ul className="grid grid-cols-1 gap-12 md:grid-cols-2 md:gap-x-10 lg:-mx-8 lg:grid-cols-3 lg:gap-x-0 lg:divide-x lg:divide-border">
							{items.map((item, index) => (
								<ScrollRevealItem key={item.id} className="min-w-0 lg:px-8">
									<ProjectCard item={item} priority={index < 3} />
								</ScrollRevealItem>
							))}
						</ul>
					</ScrollReveal>
				)}

				{!isEmpty && totalPages > 1 ? (
					<ProjectsPagination
						currentPage={currentPage}
						totalPages={totalPages}
						activeYear={activeYear}
						activeType={activeType}
						activeQuery={activeQuery}
						label={paginationLabel}
						previousLabel={previousLabel}
						nextLabel={nextLabel}
						className="mt-14 flex justify-center sm:mt-16"
					/>
				) : null}
			</div>
		</section>
	);
}
