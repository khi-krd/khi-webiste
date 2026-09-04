import { MagnifyingGlassIcon } from "@heroicons/react/24/outline";
import { getTranslations } from "next-intl/server";
import { ActiveFilterChips } from "@/components/search/active-filter-chips";
import { KindTabs } from "@/components/search/kind-tabs";
import { PlatformHitRow } from "@/components/search/platform-hit-row";
import { hasRefinements, RefinePanel } from "@/components/search/refine-panel";
import { RetryButton } from "@/components/search/retry-button";
import { SearchPagination } from "@/components/search/search-pagination";
import { SearchPendingRegion } from "@/components/search/search-transition";
import { SortSelect } from "@/components/search/sort-select";
import { EmptyState } from "@/components/ui/empty-state";
import { ErrorState } from "@/components/ui/error-state";
import { searchPlatformMedia } from "@/lib/api/platform";
import { formatCount } from "@/lib/platform/format";
import {
	countActiveFilters,
	type SearchPageState,
} from "@/lib/platform/search-url";

const PAGE_SIZE = 24;
const RESULTS_ANCHOR_ID = "search-results";

/**
 * The پلاتفۆڕم source — one keyword across sounds, videos, photographs and
 * documents, ranked together on a single scale, with the refine panel counting
 * only what actually matched.
 */
export async function PlatformResults({
	state,
	locale,
}: {
	state: SearchPageState;
	locale: string;
}) {
	const t = await getTranslations("Search");
	const hasQuery = state.q.trim().length > 0;

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
	const showSidebar = hasRefinements(response.facets) || activeFilterCount > 0;

	// The applied sort comes back on the response after defaulting.
	const count = formatCount(locale, response.totalElements);
	const summary = hasQuery
		? response.truncated
			? t("resultsForApprox", { count, query: state.q.trim() })
			: t("resultsFor", { count, query: state.q.trim() })
		: response.truncated
			? t("resultsCountApprox", { count })
			: t("resultsCount", { count });

	return (
		<div id={RESULTS_ANCHOR_ID} className="scroll-mt-26 sm:scroll-mt-30">
			<KindTabs
				state={state}
				counts={response.counts}
				locale={locale}
				scrollTargetId={RESULTS_ANCHOR_ID}
			/>

			<div
				className={
					showSidebar
						? "mt-6 sm:mt-8 lg:grid lg:grid-cols-[15rem_minmax(0,1fr)] lg:gap-12 xl:grid-cols-[16.5rem_minmax(0,1fr)]"
						: "mt-6 sm:mt-8"
				}
			>
				{showSidebar ? (
					<div className="hidden lg:block">
						<SearchPendingRegion>
							<RefinePanel
								state={state}
								facets={response.facets}
								locale={locale}
								variant="sidebar"
							/>
						</SearchPendingRegion>
					</div>
				) : null}

				<div className="min-w-0">
					{showSidebar ? (
						<div className="mb-5 lg:hidden">
							<RefinePanel
								state={state}
								facets={response.facets}
								locale={locale}
								variant="disclosure"
							/>
						</div>
					) : null}

					<div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-3">
						{!hasQuery && isEmpty ? null : (
							<p className="text-body text-foreground">
								{hasQuery ? (
									summary
								) : (
									<span className="font-heading font-semibold">
										{t("browseTitle")}
									</span>
								)}
							</p>
						)}
						{!isEmpty || activeFilterCount > 0 ? (
							<SortSelect state={state} appliedSort={response.sort} />
						) : null}
					</div>

					{!hasQuery && !isEmpty ? (
						<p className="mt-1 text-small text-muted">
							{t("browseDescription")}
						</p>
					) : null}

					{activeFilterCount > 0 ? (
						<div className="mt-4">
							<ActiveFilterChips
								state={state}
								facets={response.facets}
								locale={locale}
							/>
						</div>
					) : null}

					{response.truncated ? (
						<p className="mt-3 text-small text-muted">{t("truncatedNote")}</p>
					) : null}

					<SearchPendingRegion className="mt-2">
						{isEmpty ? (
							<EmptyState
								icon={<MagnifyingGlassIcon />}
								title={t("emptyTitle")}
								description={t("emptyDescription")}
								className="py-20"
							/>
						) : (
							<ol className="mt-1 border-t border-border">
								{hits.map((hit) => (
									<PlatformHitRow
										key={`${hit.type}:${hit.code}`}
										hit={hit}
										locale={locale}
										hasQuery={hasQuery}
									/>
								))}
							</ol>
						)}

						{!isEmpty && response.totalPages > 1 ? (
							<div className="mt-8 flex justify-center sm:mt-10">
								<SearchPagination
									state={state}
									totalPages={response.totalPages}
									scrollTargetId={RESULTS_ANCHOR_ID}
								/>
							</div>
						) : null}
					</SearchPendingRegion>
				</div>
			</div>
		</div>
	);
}
