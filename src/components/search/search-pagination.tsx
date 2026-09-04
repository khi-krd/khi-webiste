"use client";

import { useTranslations } from "next-intl";
import { useTransition } from "react";
import { useSearchTransition } from "@/components/search/search-transition";
import { Pagination } from "@/components/ui/pagination";
import { useRouter } from "@/i18n/navigation";
import {
	buildSearchHref,
	type SearchPageState,
} from "@/lib/platform/search-url";
import { scrollToSection } from "@/lib/scroll-to-section";

/**
 * URL-driven pager for the results list. Pages render as real links (SEO);
 * plain clicks become a soft navigation plus a scroll back to the top of the
 * results, so the visitor never lands mid-list.
 */
export function SearchPagination({
	state,
	totalPages,
	scrollTargetId,
}: {
	state: SearchPageState;
	totalPages: number;
	scrollTargetId: string;
}) {
	const t = useTranslations("Search");
	const router = useRouter();
	const [, startTransition] = useTransition();
	const shared = useSearchTransition();

	return (
		<Pagination
			currentPage={state.page}
			totalPages={totalPages}
			createHref={(page) => buildSearchHref({ ...state, page })}
			label={t("paginationLabel")}
			previousLabel={t("paginationPrevious")}
			nextLabel={t("paginationNext")}
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
	);
}
