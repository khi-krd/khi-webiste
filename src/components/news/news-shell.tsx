import { NewsCard } from "@/components/home/news-card";
import {
	ScrollReveal,
	ScrollRevealBlock,
	ScrollRevealItem,
} from "@/components/motion/scroll-reveal";
import { NewsClearFilters } from "@/components/news/news-clear-filters";
import { NewsFilterBar } from "@/components/news/news-filter-bar";
import { NewsPagination } from "@/components/news/news-pagination";
import { NewsSidebarPanel } from "@/components/news/news-sidebar-panel";
import { homeInsetClass } from "@/lib/layout";
import {
	type NewsCategoryOption,
	type NewsItem,
	newsItemCategoryLabel,
} from "@/lib/mock/news";
import { cn } from "@/lib/utils";

type NewsShellProps = {
	items: NewsItem[];
	featured: NewsItem[];
	latest: NewsItem[];
	locale: string;
	sectionTitle: string;
	categories: NewsCategoryOption[];
	subCategories?: NewsCategoryOption[];
	tags?: string[];
	currentPage: number;
	totalPages: number;
	activeCategory?: string | null;
	activeSubCategory?: string | null;
	activeTag?: string | null;
	activeQuery?: string | null;
	noResultsMessage: string;
	paginationLabel: string;
	previousLabel: string;
	nextLabel: string;
	latestLabel: string;
	className?: string;
};

export function NewsShell({
	items,
	featured,
	latest,
	locale,
	sectionTitle,
	categories,
	subCategories,
	tags,
	currentPage,
	totalPages,
	activeCategory,
	activeSubCategory,
	activeTag,
	activeQuery,
	noResultsMessage,
	paginationLabel,
	previousLabel,
	nextLabel,
	latestLabel,
	className,
}: NewsShellProps) {
	const hasFilters = Boolean(
		activeCategory ||
			activeSubCategory ||
			activeTag?.trim() ||
			activeQuery?.trim(),
	);
	const isEmpty = items.length === 0;

	// One aside column instead of two: featured picks lead, the rest of the
	// latest run follows, deduped by id and ordered newest first.
	const seenSidebarIds = new Set<string>();
	const sidebarItems = [...featured, ...latest]
		.filter((item) => {
			if (seenSidebarIds.has(item.id)) {
				return false;
			}
			seenSidebarIds.add(item.id);
			return true;
		})
		.sort(
			(a, b) =>
				new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime(),
		)
		.slice(0, 6);

	return (
		<section
			id="news-grid"
			className={cn(
				"w-full border-t border-border bg-background py-12 sm:py-16 lg:py-20",
				className,
			)}
			aria-labelledby="news-grid-heading"
		>
			<ScrollRevealBlock className={cn(homeInsetClass, "mb-8 sm:mb-10")}>
				<header>
					<div className="max-w-2xl text-start">
						<h2
							id="news-grid-heading"
							className="font-heading text-h1 font-bold leading-[1.1] text-balance"
						>
							{sectionTitle}
						</h2>
					</div>
				</header>
			</ScrollRevealBlock>

			<div
				className={cn(
					homeInsetClass,
					"lg:grid lg:grid-cols-[minmax(0,1fr)_minmax(0,20rem)] lg:items-start lg:gap-8 xl:grid-cols-[minmax(0,1fr)_minmax(0,24rem)] xl:gap-12",
				)}
			>
				<div className="min-w-0">
					<NewsFilterBar
						categories={categories}
						subCategories={subCategories}
						tags={tags}
						activeCategory={activeCategory}
						activeSubCategory={activeSubCategory}
						activeTag={activeTag}
						activeQuery={activeQuery}
						className="mb-8 sm:mb-10"
					/>

					{isEmpty ? (
						<div className="border border-border bg-surface px-6 py-12 text-center sm:px-10">
							<p className="text-body text-muted">{noResultsMessage}</p>
							{hasFilters ? (
								<div className="mt-6 flex justify-center">
									<NewsClearFilters />
								</div>
							) : null}
						</div>
					) : (
						<ScrollReveal className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 xl:grid-cols-3">
							{items.map((item) => (
								<ScrollRevealItem key={item.id}>
									<NewsCard
										item={item}
										variant="square"
										categoryLabel={newsItemCategoryLabel(item, categories)}
										className="min-h-64 sm:min-h-72 2xl:min-h-80"
									/>
								</ScrollRevealItem>
							))}
						</ScrollReveal>
					)}

					{!isEmpty && totalPages > 1 ? (
						<NewsPagination
							currentPage={currentPage}
							totalPages={totalPages}
							activeCategory={activeCategory}
							activeSubCategory={activeSubCategory}
							activeTag={activeTag}
							activeQuery={activeQuery}
							label={paginationLabel}
							previousLabel={previousLabel}
							nextLabel={nextLabel}
							className="mt-10 flex justify-start sm:mt-12"
						/>
					) : null}
				</div>

				<aside className="mt-12 lg:mt-0 lg:sticky lg:top-28 lg:self-start">
					<NewsSidebarPanel
						title={latestLabel}
						items={sidebarItems}
						locale={locale}
						categories={categories}
					/>
				</aside>
			</div>
		</section>
	);
}
