"use client";

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
	const [pending, startTransition] = useTransition();
	const shared = useSearchTransition();
	const id = useId();

	const value = PLATFORM_SORTS.includes(appliedSort as PlatformSort)
		? (appliedSort as PlatformSort)
		: "relevance";

	return (
		<div className="flex items-center gap-2.5">
			<label htmlFor={id} className="shrink-0 text-small text-muted">
				{t("sortLabel")}
			</label>
			<div className="relative">
				<select
					id={id}
					value={value}
					disabled={pending}
					onChange={(event) => {
						const sort = event.target.value as PlatformSort;
						const href = buildSearchHref({ ...state, sort, page: 1 });
						if (shared) {
							shared.navigate(href);
							return;
						}
						startTransition(() => {
							router.push(href, { scroll: false });
						});
					}}
					className={cn(
						"cursor-pointer appearance-none border-b border-border-strong bg-transparent py-1 pe-5",
						"text-small font-medium text-foreground transition-colors",
						"fine-hover:border-foreground disabled:opacity-60",
					)}
				>
					{PLATFORM_SORTS.map((sort) => (
						<option key={sort} value={sort}>
							{t(SORT_LABEL_KEYS[sort])}
						</option>
					))}
				</select>
				<svg
					aria-hidden="true"
					viewBox="0 0 20 20"
					fill="currentColor"
					className="pointer-events-none absolute end-0 top-1/2 size-3.5 -translate-y-1/2 text-muted"
				>
					<path
						fillRule="evenodd"
						d="M5.22 8.22a.75.75 0 0 1 1.06 0L10 11.94l3.72-3.72a.75.75 0 1 1 1.06 1.06l-4.25 4.25a.75.75 0 0 1-1.06 0L5.22 9.28a.75.75 0 0 1 0-1.06Z"
						clipRule="evenodd"
					/>
				</svg>
			</div>
		</div>
	);
}
