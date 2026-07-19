import {
	ScrollReveal,
	ScrollRevealBlock,
	ScrollRevealItem,
} from "@/components/motion/scroll-reveal";
import {
	WritingCategoryCarousel,
	type WritingCategoryCarouselItem,
} from "@/components/writing/writing-category-carousel";
import {
	WritingGridCard,
	type WritingGridCardProps,
} from "@/components/writing/writing-grid-card";
import { WritingsFilterBar } from "@/components/writing/writings-filter-bar";
import { WritingsPagination } from "@/components/writing/writings-pagination";
import { homeInsetClass } from "@/lib/layout";
import { cn } from "@/lib/utils";
import type { WritingCategorySlug } from "@/lib/writing/categories";
import type { WritingsSort } from "@/lib/writing/filter";
import type { BookGenre } from "@/types/writing";

type WritingsShellProps = {
	id?: string;
	title: string;
	categorySlug?: WritingCategorySlug | null;
	categoryCarouselItems: WritingCategoryCarouselItem[];
	carouselNavLabel: string;
	cards: WritingGridCardProps[];
	currentPage: number;
	totalPages: number;
	totalElements: number;
	activeGenre?: BookGenre | null;
	activeQuery?: string | null;
	activeSort?: WritingsSort;
	genreLabels: Record<BookGenre, string>;
	noResultsMessage: string;
	paginationLabel: string;
	previousLabel: string;
	nextLabel: string;
	className?: string;
};

export function WritingsShell({
	id = "writings-grid",
	title,
	categorySlug,
	categoryCarouselItems,
	carouselNavLabel,
	cards,
	currentPage,
	totalPages,
	totalElements,
	activeGenre,
	activeQuery,
	activeSort,
	genreLabels,
	noResultsMessage,
	paginationLabel,
	previousLabel,
	nextLabel,
	className,
}: WritingsShellProps) {
	const isEmpty = cards.length === 0;

	return (
		<section
			id={id}
			className={cn(
				"scroll-mt-26 w-full border-t border-border bg-background py-12 sm:scroll-mt-30 sm:py-16 lg:py-20",
				className,
			)}
			aria-labelledby="writings-grid-heading"
		>
			<div className={homeInsetClass}>
				<ScrollRevealBlock>
					<h2
						id="writings-grid-heading"
						className="font-heading text-display font-bold leading-[1.05] text-balance"
					>
						{title}
					</h2>
				</ScrollRevealBlock>

				<WritingCategoryCarousel
					items={categoryCarouselItems}
					activeSlug={categorySlug}
					navLabel={carouselNavLabel}
					className="mt-8 sm:mt-10"
				/>

				<WritingsFilterBar
					categorySlug={categorySlug}
					activeGenre={activeGenre}
					activeQuery={activeQuery}
					activeSort={activeSort}
					genreLabels={genreLabels}
					itemCount={totalElements}
					scrollTargetId={id}
					className="mt-8 sm:mt-10"
				/>

				{isEmpty ? (
					<div className="mt-8 border border-border bg-surface px-6 py-12 text-center sm:px-10 sm:mt-10">
						<p className="text-body text-muted">{noResultsMessage}</p>
					</div>
				) : (
					<ScrollReveal className="mt-8 grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-3 xl:grid-cols-4 sm:mt-10">
						{cards.map((card) => (
							<ScrollRevealItem key={card.id}>
								<WritingGridCard {...card} />
							</ScrollRevealItem>
						))}
					</ScrollReveal>
				)}

				{!isEmpty && totalPages > 1 ? (
					<div className="mt-10 flex justify-center sm:mt-12">
						<WritingsPagination
							currentPage={currentPage}
							totalPages={totalPages}
							categorySlug={categorySlug}
							activeGenre={activeGenre}
							activeQuery={activeQuery}
							activeSort={activeSort}
							label={paginationLabel}
							previousLabel={previousLabel}
							nextLabel={nextLabel}
							scrollTargetId={id}
						/>
					</div>
				) : null}
			</div>
		</section>
	);
}
