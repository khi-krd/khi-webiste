import { MagnifyingGlassIcon } from "@heroicons/react/24/outline";
import { getTranslations } from "next-intl/server";
import type { ReactNode } from "react";
import { kindChipClass } from "@/components/search/chip-styles";
import { SearchNavLink } from "@/components/search/search-transition";
import { viewAllCtaClass } from "@/components/ui/cta-styles";
import { EmptyState } from "@/components/ui/empty-state";
import {
	buildSearchHref,
	EMPTY_FILTERS,
	type SearchPageState,
	withClearedFilters,
} from "@/lib/platform/search-url";

const bdi = (chunks: ReactNode) => <bdi dir="auto">{chunks}</bdi>;

/**
 * No hits — with the ways out spelled as links: the closest spelling the
 * platform knows, dropping the filters, widening to every kind, or asking the
 * website instead. Nothing here depends on counts; a recovery link is only
 * offered when it changes the search.
 */
export async function EmptyResults({
	state,
	hasQuery,
	activeFilterCount,
	didYouMean,
}: {
	state: SearchPageState;
	hasQuery: boolean;
	activeFilterCount: number;
	didYouMean: string | null;
}) {
	const t = await getTranslations("Search");
	const query = state.q.trim();

	return (
		<EmptyState
			icon={<MagnifyingGlassIcon />}
			title={activeFilterCount > 0 ? t("emptyFilteredTitle") : t("emptyTitle")}
			titleLevel={3}
			description={t("emptyDescription")}
			className="search-rise py-16 sm:py-20"
		>
			{didYouMean ? (
				<p className="mb-4 text-body">
					<SearchNavLink
						href={buildSearchHref({
							source: "archive",
							q: didYouMean,
							kind: state.kind,
							filters: EMPTY_FILTERS,
						})}
						className="font-semibold text-foreground underline decoration-border underline-offset-4 transition-colors fine-hover:text-brand fine-hover:decoration-current"
					>
						{t.rich("emptyDidYouMean", { suggestion: didYouMean, bdi })}
					</SearchNavLink>
				</p>
			) : null}

			<div className="flex flex-wrap justify-center gap-2">
				{activeFilterCount > 0 ? (
					<SearchNavLink
						href={buildSearchHref(withClearedFilters(state))}
						className={viewAllCtaClass}
					>
						{t("emptyClearFilters")}
					</SearchNavLink>
				) : null}
				{state.kind ? (
					<SearchNavLink
						href={buildSearchHref({ ...state, kind: null, page: 1 })}
						className={kindChipClass(false)}
					>
						{t("emptyAllKinds")}
					</SearchNavLink>
				) : null}
				{hasQuery ? (
					<SearchNavLink
						href={buildSearchHref({ source: "main", q: query })}
						className={kindChipClass(false)}
					>
						<span>{t.rich("emptySearchSite", { query, bdi })}</span>
					</SearchNavLink>
				) : null}
			</div>
		</EmptyState>
	);
}
