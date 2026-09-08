"use client";

import { useTranslations } from "next-intl";
import { useTransition } from "react";
import { useSearchTransition } from "@/components/search/search-transition";
import { Pagination } from "@/components/ui/pagination";
import { useRouter } from "@/i18n/navigation";
import { formatCount } from "@/lib/platform/format";
import {
	buildSearchHref,
	type SearchPageState,
} from "@/lib/platform/search-url";
import { scrollToSection } from "@/lib/scroll-to-section";

/**
 * URL-driven pager for the results list. Pages render as real links (SEO);
 * plain clicks become a soft navigation plus a scroll back to the top of the
 * results, so the visitor never lands mid-list. 44px targets throughout —
 * the pager is a secondary control and reads fine at that size on paper.
 */
export function SearchPagination({
	state,
	totalPages,
	scrollTargetId,
	locale,
}: {
	state: SearchPageState;
	totalPages: number;
	scrollTargetId: string;
	locale: string;
}) {
	const t = useTranslations("Search");
	const router = useRouter();
	const [, startTransition] = useTransition();
	const shared = useSearchTransition();

	if (totalPages <= 1) {
		return null;
	}

	return (
		<div className="mt-8 flex flex-col items-center gap-2 sm:mt-10">
			<Pagination
				currentPage={state.page}
				totalPages={totalPages}
				createHref={(page) => buildSearchHref({ ...state, page })}
				label={t("paginationLabel")}
				previousLabel={t("paginationPrevious")}
				nextLabel={t("paginationNext")}
				formatPage={(page) => formatCount(locale, page)}
				size="lg"
				onPageChange={(page) => {
					const href = buildSearchHref({ ...state, page });
					if (shared) {
						shared.navigate(href, { scrollTo: scrollTargetId });
						return;
					}
					startTransition(() => {
						router.push(href, { scroll: false });
					});
					scrollToSection(scrollTargetId);
				}}
			/>
			<p className="text-label tabular-nums text-muted">
				{t("pageOf", {
					page: formatCount(locale, state.page),
					total: formatCount(locale, totalPages),
				})}
			</p>
		</div>
	);
}
