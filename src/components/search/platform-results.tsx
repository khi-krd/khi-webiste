import { getTranslations } from "next-intl/server";
import type { ReactNode } from "react";
import { ActiveFilterChips } from "@/components/search/active-filter-chips";
import { EmptyResults } from "@/components/search/empty-results";
import { KindTabs } from "@/components/search/kind-tabs";
import { PlatformPlate } from "@/components/search/platform-plate";
import { RefineInlineShell } from "@/components/search/refine-inline-shell";
import { hasRefinements, RefinePanel } from "@/components/search/refine-panel";
import { RefineToggle } from "@/components/search/refine-toggle";
import { RESULTS_ANCHOR_ID } from "@/components/search/results-anchor";
import { RetryButton } from "@/components/search/retry-button";
import { SearchPagination } from "@/components/search/search-pagination";
import {
	AnnounceResults,
	FocusRestore,
	RESULTS_SUMMARY_ID,
	SearchPendingRegion,
} from "@/components/search/search-transition";
import { SortSelect } from "@/components/search/sort-select";
import { ErrorState } from "@/components/ui/error-state";
import {
	getPlatformSuggestions,
	searchPlatformMedia,
} from "@/lib/api/platform";
import { humanizePlatformName, isPlatformCode } from "@/lib/platform/display";
import { formatCount } from "@/lib/platform/format";
import {
	countActiveFilters,
	type SearchPageState,
} from "@/lib/platform/search-url";
import { cn } from "@/lib/utils";

const PAGE_SIZE = 24;

const bdi = (chunks: ReactNode) => <bdi dir="auto">{chunks}</bdi>;

/**
 * The closest spelling the platform knows for a query that found nothing —
 * offered only when it differs from what was typed and is not an item code.
 * The suggest endpoint is best-effort: any failure simply means no hint.
 */
async function findDidYouMean(q: string): Promise<string | null> {
	const query = q.trim();
	try {
		const [suggestion] = await getPlatformSuggestions(query, 1);
		const raw = suggestion?.value.trim();
		if (!raw || isPlatformCode(raw, suggestion?.code)) {
			return null;
		}
		// Project suggestions arrive as folder slugs; the readable form matches
		// the same records, so it is both the label and the query.
		const value =
			suggestion?.kind === "project" ? humanizePlatformName(raw) : raw;
		if (!value || value.toLocaleLowerCase() === query.toLocaleLowerCase()) {
			return null;
		}
		return value;
	} catch {
		return null;
	}
}

/**
 * The پلاتفۆڕم source — one keyword across sounds, videos, photographs and
 * documents, ranked together on a single scale, with the refine panel counting
 * only what actually matched.
 *
 * Results come FIRST in the DOM; the desktop sidebar is placed into the first
 * grid column by explicit placement, so keyboard and screen-reader order is
 * kind chips → toolbar → active chips → plates → pager → refine.
 */
export async function PlatformResults({
	state,
	locale,
}: {
	state: SearchPageState;
	locale: string;
}) {
	const t = await getTranslations("Search");
	const query = state.q.trim();
	const hasQuery = query.length > 0;

	const response = await searchPlatformMedia({
		q: state.q,
		type: state.kind,
		sort: state.sort,
		page: state.page - 1,
		size: PAGE_SIZE,
		facets: true,
		...state.filters,
	});

	if (!response) {
		return (
			<ErrorState
				framed
				title={t("unavailableTitle")}
				description={t("unavailableDescription")}
				action={<RetryButton label={t("retry")} />}
				className="my-10"
			/>
		);
	}

	const hits = response.content;
	const isEmpty = hits.length === 0;
	const activeFilterCount = countActiveFilters(state.filters);
	// The panel renders nothing without buckets, so an empty column (or a
	// toggle that opens nothing) must never be reserved for it; with filters
	// active but no facets, the chips and the empty state carry "clear".
	const showSidebar = hasRefinements(response.facets);
	const showSummary = hasQuery || !isEmpty;
	const showSort = !isEmpty || activeFilterCount > 0;

	const didYouMean = isEmpty && hasQuery ? await findDidYouMean(query) : null;

	const count = formatCount(locale, response.totalElements);
	// Plain text for the live region and metadata …
	const plainSummary = hasQuery
		? response.truncated
			? t("resultsForApprox", { count, query })
			: t("resultsFor", { count, query })
		: response.truncated
			? t("resultsCountApprox", { count })
			: t("resultsCount", { count });
	// … and the same words with the query isolated for the heading.
	const richSummary = hasQuery
		? t.rich(response.truncated ? "resultsForApproxRich" : "resultsForRich", {
				count,
				query,
				bdi,
			})
		: t("browseTitle");

	return (
		<div id={RESULTS_ANCHOR_ID} className="scroll-mt-26 sm:scroll-mt-30">
			<FocusRestore rootId={RESULTS_ANCHOR_ID} />

			<SearchPendingRegion>
				<KindTabs
					state={state}
					counts={response.counts}
					locale={locale}
					scrollTargetId={RESULTS_ANCHOR_ID}
				/>

				<div
					className={cn(
						"mt-5 sm:mt-6",
						showSidebar &&
							"lg:grid lg:grid-cols-[15rem_minmax(0,1fr)] lg:gap-10 xl:grid-cols-[16.5rem_minmax(0,1fr)] xl:gap-12",
					)}
				>
					{/* Results column — first in the DOM, second in the grid. */}
					<div className="min-w-0 lg:col-start-2 lg:row-start-1">
						{showSummary || showSort ? (
							<div className="flex flex-col gap-3 border-b border-border pb-3 sm:flex-row sm:flex-wrap sm:items-end sm:justify-between">
								<div className="min-w-0">
									{showSummary ? (
										<h2
											id={RESULTS_SUMMARY_ID}
											tabIndex={-1}
											className="font-heading text-lead font-semibold text-foreground focus-visible:outline-none sm:text-h3"
										>
											{richSummary}
										</h2>
									) : null}
									{!hasQuery && !isEmpty ? (
										<p className="mt-0.5 text-small text-muted">
											{t("browseDescription")}
										</p>
									) : null}
									{response.truncated ? (
										<p className="mt-0.5 text-label text-muted">
											{t("truncatedNote")}
										</p>
									) : null}
								</div>
								{showSort ? (
									<div className="flex items-center gap-2 sm:gap-3">
										{showSidebar ? (
											<RefineToggle
												activeCount={activeFilterCount}
												locale={locale}
											/>
										) : null}
										<SortSelect state={state} appliedSort={response.sort} />
									</div>
								) : null}
							</div>
						) : null}

						{activeFilterCount > 0 ? (
							<div className="mt-3">
								<ActiveFilterChips
									state={state}
									facets={response.facets}
									hits={hits}
									locale={locale}
								/>
							</div>
						) : null}

						{showSidebar ? (
							<div className="lg:hidden">
								<RefineInlineShell>
									<RefinePanel
										state={state}
										facets={response.facets}
										locale={locale}
										variant="inline"
										totalElements={response.totalElements}
									/>
								</RefineInlineShell>
							</div>
						) : null}

						{isEmpty ? (
							<EmptyResults
								state={state}
								hasQuery={hasQuery}
								activeFilterCount={activeFilterCount}
								didYouMean={didYouMean}
							/>
						) : (
							<ol
								aria-labelledby={RESULTS_SUMMARY_ID}
								className={cn(
									"mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:gap-5",
									showSidebar
										? "2xl:grid-cols-4"
										: "lg:grid-cols-4 2xl:grid-cols-5",
								)}
							>
								{hits.map((hit, index) => (
									<PlatformPlate
										key={`${hit.type}:${hit.code}`}
										hit={hit}
										index={index}
										locale={locale}
										hasQuery={hasQuery}
									/>
								))}
							</ol>
						)}

						{!isEmpty ? (
							<SearchPagination
								state={state}
								totalPages={response.totalPages}
								scrollTargetId={RESULTS_ANCHOR_ID}
								locale={locale}
							/>
						) : null}
					</div>

					{/* Refine sidebar — second in the DOM, first grid column on lg+. */}
					{showSidebar ? (
						<div className="hidden lg:col-start-1 lg:row-start-1 lg:block">
							<RefinePanel
								state={state}
								facets={response.facets}
								locale={locale}
								variant="sidebar"
								totalElements={response.totalElements}
							/>
						</div>
					) : null}
				</div>
			</SearchPendingRegion>

			<AnnounceResults text={t("announceResults", { summary: plainSummary })} />
		</div>
	);
}
