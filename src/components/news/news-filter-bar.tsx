"use client";

import { useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import {
	useCallback,
	useEffect,
	useMemo,
	useRef,
	useState,
	useTransition,
} from "react";
import { Badge } from "@/components/ui/badge";
import {
	FilterBar,
	FilterDivider,
	FilterSearchBox,
} from "@/components/ui/filter-bar";
import { useRouter } from "@/i18n/navigation";
import type { NewsCategoryOption } from "@/lib/mock/news";
import { isKnownCategory } from "@/lib/mock/news";
import { buildNewsHref, type NewsUrlParams } from "@/lib/news-url";
import { useScrollToSection } from "@/lib/use-scroll-to-section";

type NewsFilterBarProps = {
	categories: NewsCategoryOption[];
	subCategories?: NewsCategoryOption[];
	tags?: string[];
	activeCategory?: string | null;
	activeSubCategory?: string | null;
	activeTag?: string | null;
	activeQuery?: string | null;
	className?: string;
};

/**
 * All controls on ONE continuous line: category pills, subcategory and tag
 * groups and the search box flow in a single `flex-wrap` row — no expand
 * panel, no stacked sections. Active-filter chips trail at the row's tail.
 */
export function NewsFilterBar({
	categories,
	subCategories,
	tags: _tags,
	activeCategory,
	activeSubCategory,
	activeTag,
	activeQuery,
	className,
}: NewsFilterBarProps) {
	const t = useTranslations("News");
	const router = useRouter();
	const searchParams = useSearchParams();
	const [isPending, startTransition] = useTransition();
	const [query, setQuery] = useState(activeQuery ?? "");
	const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
	const scrollToSection = useScrollToSection();

	const subCategoryOptions = subCategories ?? [];

	const hasActiveCategory =
		Boolean(activeCategory) &&
		isKnownCategory(activeCategory ?? "", categories);
	const activeCategoryLabel = hasActiveCategory
		? categories.find((entry) => entry.key === activeCategory)?.label
		: null;
	const hasActiveSubCategory =
		Boolean(activeSubCategory) &&
		isKnownCategory(activeSubCategory ?? "", subCategoryOptions);
	const activeSubCategoryLabel = hasActiveSubCategory
		? subCategoryOptions.find((entry) => entry.key === activeSubCategory)?.label
		: null;
	const hasActiveTag = Boolean(activeTag?.trim());
	const hasActiveQuery = Boolean(activeQuery?.trim());
	const hasActiveFilters =
		hasActiveCategory || hasActiveSubCategory || hasActiveTag || hasActiveQuery;

	useEffect(() => {
		setQuery(activeQuery ?? "");
	}, [activeQuery]);

	const activeFilters = useMemo<NewsUrlParams>(
		() => ({
			category: activeCategory ?? null,
			subcategory: activeSubCategory ?? null,
			tag: activeTag ?? null,
			q: activeQuery ?? null,
		}),
		[activeCategory, activeSubCategory, activeTag, activeQuery],
	);

	// Every dimension is carried forward, so changing one filter never silently
	// drops the others from the URL.
	const pushFilters = useCallback(
		(next: NewsUrlParams) => {
			startTransition(() => {
				router.replace(
					buildNewsHref({
						...activeFilters,
						...next,
						page: 1,
					}),
					{ scroll: false },
				);

				const grid = document.getElementById("news-grid");
				if (grid && searchParams.toString()) {
					scrollToSection("news-grid");
				}
			});
		},
		[activeFilters, router, searchParams, scrollToSection],
	);

	const handleSearchSubmit = () => {
		if (debounceRef.current) clearTimeout(debounceRef.current);
		pushFilters({ q: query });
	};

	const handleQueryChange = (value: string) => {
		setQuery(value);
		if (debounceRef.current) clearTimeout(debounceRef.current);
		debounceRef.current = setTimeout(() => {
			pushFilters({ q: value });
		}, 350);
	};

	const handleClearSearch = () => {
		if (debounceRef.current) clearTimeout(debounceRef.current);
		setQuery("");
		pushFilters({ q: "" });
	};

	const handleClearAll = () => {
		if (debounceRef.current) clearTimeout(debounceRef.current);
		setQuery("");
		router.replace(buildNewsHref({}), { scroll: false });
	};

	useEffect(
		() => () => {
			if (debounceRef.current) clearTimeout(debounceRef.current);
		},
		[],
	);

	return (
		<FilterBar
			label={t("filter.label")}
			pending={isPending}
			className={className}
		>
			{/* Filter pills are hidden by request — search remains the only
			    on-page control. URL-driven filters (?category=, ?tag=) still
			    apply and surface through the active-filter chips below. */}

			{/* same line — the row's remaining space goes to search */}
			<FilterSearchBox
				className="sm:max-w-sm"
				value={query}
				onValueChange={handleQueryChange}
				onSubmit={handleSearchSubmit}
				onClear={handleClearSearch}
				busy={isPending}
				searchLabel={t("search.label")}
				clearLabel={t("search.clear")}
				submitLabel={t("search.submit")}
			/>

			{hasActiveFilters ? (
				<>
					<FilterDivider />
					<span className="text-label text-muted">{t("filter.active")}</span>
					{activeCategoryLabel ? (
						<Badge variant="outline" size="sm">
							{activeCategoryLabel}
						</Badge>
					) : null}
					{activeSubCategoryLabel ? (
						<Badge variant="outline" size="sm">
							{activeSubCategoryLabel}
						</Badge>
					) : null}
					{hasActiveTag && activeTag ? (
						<Badge variant="outline" size="sm">
							#{activeTag}
						</Badge>
					) : null}
					{hasActiveQuery && activeQuery ? (
						<Badge variant="outline" size="sm">
							&ldquo;{activeQuery}&rdquo;
						</Badge>
					) : null}
					<button
						type="button"
						onClick={handleClearAll}
						disabled={isPending}
						className="font-heading text-small font-medium text-muted underline decoration-border underline-offset-4 transition-colors fine-hover:text-foreground"
					>
						{t("filter.clear")}
					</button>
				</>
			) : null}
		</FilterBar>
	);
}
