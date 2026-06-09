import { ArticlesClearFilters } from "@/components/articles/articles-clear-filters";
import { ArticlesFilterBar } from "@/components/articles/articles-filter-bar";
import { ArticlesSidebarPanel } from "@/components/articles/articles-sidebar-panel";
import { NewsCard } from "@/components/home/news-card";
import { Divider } from "@/components/ui/divider";
import { ArticlesPagination } from "@/components/articles/articles-pagination";
import { homeInsetClass } from "@/lib/layout";
import {
	type ArticleCategory,
	type ArticleItem,
} from "@/lib/mock/articles";
import { cn } from "@/lib/utils";

type ArticlesShellProps = {
	articles: ArticleItem[];
	featured: ArticleItem[];
	latest: ArticleItem[];
	locale: string;
	sectionTitle: string;
	sectionDescription?: string;
	categoryLabels: Record<ArticleCategory, string>;
	currentPage: number;
	totalPages: number;
	activeCategory?: string | null;
	activeQuery?: string | null;
	noResultsMessage: string;
	paginationLabel: string;
	previousLabel: string;
	nextLabel: string;
	featuredLabel: string;
	latestLabel: string;
	className?: string;
};

export function ArticlesShell({
	articles,
	featured,
	latest,
	locale,
	sectionTitle,
	sectionDescription,
	categoryLabels,
	currentPage,
	totalPages,
	activeCategory,
	activeQuery,
	noResultsMessage,
	paginationLabel,
	previousLabel,
	nextLabel,
	featuredLabel,
	latestLabel,
	className,
}: ArticlesShellProps) {
	const hasFilters = Boolean(activeCategory || activeQuery?.trim());
	const isEmpty = articles.length === 0;

	return (
		<section
			id="articles-grid"
			className={cn(
				"w-full border-t border-border bg-background py-12 sm:py-16 lg:py-20",
				className,
			)}
			aria-labelledby="articles-grid-heading"
		>
			<header className={cn(homeInsetClass, "mb-8 sm:mb-10")}>
				<div className="max-w-2xl text-start">
					<h2
						id="articles-grid-heading"
						className="font-heading text-h1 font-bold leading-[1.1] text-balance"
					>
						{sectionTitle}
					</h2>
					{sectionDescription ? (
						<p className="mt-3 text-body text-muted">{sectionDescription}</p>
					) : null}
				</div>
			</header>

			<div
				className={cn(
					homeInsetClass,
					"lg:grid lg:grid-cols-[minmax(0,1fr)_minmax(0,20rem)] lg:items-start lg:gap-8 xl:grid-cols-[minmax(0,1fr)_minmax(0,24rem)] xl:gap-12",
				)}
			>
				<div className="min-w-0">
					<ArticlesFilterBar
						activeCategory={activeCategory}
						activeQuery={activeQuery}
						categoryLabels={categoryLabels}
						className="mb-8 sm:mb-10"
					/>

					{isEmpty ? (
						<div className="border border-border bg-surface px-6 py-12 text-center sm:px-10">
							<p className="text-body text-muted">{noResultsMessage}</p>
							{hasFilters ? (
								<div className="mt-6 flex justify-center">
									<ArticlesClearFilters />
								</div>
							) : null}
						</div>
					) : (
						<div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 xl:grid-cols-3">
							{articles.map((item) => (
								<NewsCard
									key={item.id}
									item={item}
									variant="square"
									categoryLabel={categoryLabels[item.category]}
									className="min-h-64 sm:min-h-72"
								/>
							))}
						</div>
					)}

					{!isEmpty && totalPages > 1 ? (
						<ArticlesPagination
							currentPage={currentPage}
							totalPages={totalPages}
							activeCategory={activeCategory}
							activeQuery={activeQuery}
							label={paginationLabel}
							previousLabel={previousLabel}
							nextLabel={nextLabel}
							className="mt-10 flex justify-start sm:mt-12"
						/>
					) : null}
				</div>

				<aside className="mt-12 lg:mt-0 lg:sticky lg:top-28 lg:self-start">
					<div className="flex flex-col gap-6">
						<ArticlesSidebarPanel
							title={featuredLabel}
							items={featured}
							locale={locale}
							categoryLabels={categoryLabels}
						/>

						<Divider />

						<ArticlesSidebarPanel
							title={latestLabel}
							items={latest}
							locale={locale}
							categoryLabels={categoryLabels}
						/>
					</div>
				</aside>
			</div>
		</section>
	);
}
