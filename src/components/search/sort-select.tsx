"use client";

import { useTranslations } from "next-intl";
import { useTransition } from "react";
import { useSearchTransition } from "@/components/search/search-transition";
import { ListSelect } from "@/components/ui/list-select";
import { useRouter } from "@/i18n/navigation";
import { PLATFORM_SORTS, type PlatformSort } from "@/lib/platform/constants";
import {
	buildSearchHref,
	type SearchPageState,
} from "@/lib/platform/search-url";
import { cn } from "@/lib/utils";

const SORT_LABEL_KEYS: Record<
	PlatformSort,
	"sortRelevance" | "sortNewest" | "sortOldest" | "sortTitle" | "sortTrending"
> = {
	relevance: "sortRelevance",
	newest: "sortNewest",
	oldest: "sortOldest",
	title: "sortTitle",
	trending: "sortTrending",
};

/**
 * Order dropdown, bound to the sort the API actually APPLIED (its response
 * echoes it after defaulting), so the control never lies about the list.
 * A bordered box like the kind chips; focus returns to it after the new
 * results mount (`data-focus-key="sort"`).
 */
export function SortSelect({
	state,
	appliedSort,
}: {
	state: SearchPageState;
	appliedSort: string;
}) {
	const t = useTranslations("Search");
	const router = useRouter();
	const [localPending, startTransition] = useTransition();
	const shared = useSearchTransition();
	const pending = shared?.pending ?? localPending;

	const value = PLATFORM_SORTS.includes(appliedSort as PlatformSort)
		? (appliedSort as PlatformSort)
		: "relevance";

	return (
		<div
			className={cn(
				"relative inline-flex h-11 items-center border border-border-strong bg-surface",
				"transition-colors fine-hover:border-foreground/40 focus-within:border-foreground lg:h-10",
			)}
		>
			<span className="sr-only sm:not-sr-only sm:ps-3 sm:text-label sm:text-muted">
				{t("sortLabel")}
			</span>
			<ListSelect
				label={t("sortLabel")}
				value={value}
				disabled={pending}
				focusKey="sort"
				onChange={(next) => {
					const sort = next as PlatformSort;
					const href = buildSearchHref({ ...state, sort, page: 1 });
					if (shared) {
						shared.navigate(href, { focusKey: "sort" });
						return;
					}
					startTransition(() => {
						router.push(href, { scroll: false });
					});
				}}
				options={PLATFORM_SORTS.map((sort) => ({
					value: sort,
					label: t(SORT_LABEL_KEYS[sort]),
				}))}
				className="h-full"
				buttonClassName="h-full rounded-none border-0 bg-transparent py-0 ps-3 pe-8 text-small font-medium fine-hover:border-0"
			/>
		</div>
	);
}
