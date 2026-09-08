"use client";

import { ChevronDownIcon } from "@heroicons/react/24/outline";
import { useTranslations } from "next-intl";
import { useId, useTransition } from "react";
import { useSearchTransition } from "@/components/search/search-transition";
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
	const id = useId();
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
			<label
				htmlFor={id}
				className="sr-only sm:not-sr-only sm:ps-3 sm:text-label sm:text-muted"
			>
				{t("sortLabel")}
			</label>
			<select
				id={id}
				value={value}
				disabled={pending}
				data-focus-key="sort"
				onChange={(event) => {
					const sort = event.target.value as PlatformSort;
					const href = buildSearchHref({ ...state, sort, page: 1 });
					if (shared) {
						shared.navigate(href, { focusKey: "sort" });
						return;
					}
					startTransition(() => {
						router.push(href, { scroll: false });
					});
				}}
				className={cn(
					"h-full cursor-pointer appearance-none bg-transparent ps-3 pe-8 text-small font-medium text-foreground",
					"focus-visible:outline-none disabled:opacity-60",
				)}
			>
				{PLATFORM_SORTS.map((sort) => (
					<option key={sort} value={sort}>
						{t(SORT_LABEL_KEYS[sort])}
					</option>
				))}
			</select>
			<ChevronDownIcon
				aria-hidden
				className="pointer-events-none absolute end-2.5 size-4 text-muted"
			/>
		</div>
	);
}
