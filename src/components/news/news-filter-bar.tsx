"use client";

import {
	AdjustmentsHorizontalIcon,
	MagnifyingGlassIcon,
	XMarkIcon,
} from "@heroicons/react/24/outline";
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
import { Button } from "@/components/ui/button";
import { useRouter } from "@/i18n/navigation";
import type { NewsCategoryOption } from "@/lib/mock/news";
import { isKnownCategory } from "@/lib/mock/news";
import { buildNewsHref, type NewsUrlParams } from "@/lib/news-url";
import { useScrollToSection } from "@/lib/use-scroll-to-section";
import { cn } from "@/lib/utils";

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

/** Keep an active term clickable even when it falls outside the derived chip cap. */
function withActiveTerm(terms: string[], active?: string | null): string[] {
	const value = active?.trim();
	if (!value) {
		return terms;
	}

	const needle = value.toLocaleLowerCase();
	return terms.some((term) => term.toLocaleLowerCase() === needle)
		? terms
		: [value, ...terms];
}

export function NewsFilterBar({
	categories,
	subCategories,
	tags,
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
	const [expanded, setExpanded] = useState(true);
	const [query, setQuery] = useState(activeQuery ?? "");
	const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
	const scrollToSection = useScrollToSection();

	const subCategoryOptions = subCategories ?? [];
	const tagOptions = useMemo(
		() => withActiveTerm(tags ?? [], activeTag),
		[tags, activeTag],
	);

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

	const handleCategory = (category: string | null) => {
		pushFilters({ category, q: query });
	};

	const handleSubCategory = (subcategory: string | null) => {
		pushFilters({ subcategory, q: query });
	};

	const handleTag = (tag: string | null) => {
		pushFilters({ tag, q: query });
	};

	const handleSearchSubmit = (event: React.FormEvent) => {
		event.preventDefault();
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
		<div
			className={cn("transition-opacity", isPending && "opacity-80", className)}
		>
			<div
				className="flex flex-wrap items-center gap-2"
				role="group"
				aria-label={t("filter.label")}
			>
				<button
					type="button"
					onClick={() => setExpanded((open) => !open)}
					aria-expanded={expanded}
					aria-label={t("filter.label")}
					title={t("filter.label")}
					className={cn(
						"inline-flex size-11 shrink-0 items-center justify-center border transition-colors",
						"focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
						expanded
							? "border-primary bg-primary text-primary-foreground"
							: "border-border-strong bg-surface text-foreground fine-hover:border-foreground/40 fine-hover:bg-sunken",
					)}
				>
					<AdjustmentsHorizontalIcon className="size-5" aria-hidden />
				</button>
				<CategoryPill
					active={!activeCategory}
					onClick={() => handleCategory(null)}
				>
					{t("filter.all")}
				</CategoryPill>
				{categories.map((category) => (
					<CategoryPill
						key={category.key}
						active={activeCategory === category.key}
						onClick={() => handleCategory(category.key)}
					>
						{category.label}
					</CategoryPill>
				))}
			</div>

			{expanded ? (
				<div className="mt-6 border border-border bg-surface">
					<div className="border-b border-border bg-background px-4 py-4 sm:px-5 sm:py-5">
						<form
							onSubmit={handleSearchSubmit}
							className="flex flex-col gap-3 sm:flex-row sm:items-stretch"
							role="search"
						>
							<div
								className={cn(
									"flex h-12 min-w-0 flex-1 items-stretch border border-border-strong bg-surface",
									"transition-colors focus-within:border-foreground",
								)}
							>
								<input
									type="search"
									name="q"
									value={query}
									onChange={(event) => handleQueryChange(event.target.value)}
									aria-label={t("search.label")}
									autoComplete="off"
									className="h-full min-w-0 flex-1 bg-transparent px-3 py-0 text-body text-foreground placeholder:text-muted focus:outline-none sm:px-4"
								/>

								{query ? (
									<button
										type="button"
										onClick={handleClearSearch}
										className="flex shrink-0 items-center px-3 text-muted transition-colors fine-hover:text-foreground"
										aria-label={t("search.clear")}
									>
										<XMarkIcon className="size-4" aria-hidden />
									</button>
								) : null}
							</div>

							<Button
								type="submit"
								variant="primary"
								size="lg"
								leadingIcon={<MagnifyingGlassIcon aria-hidden />}
								className="h-12 shrink-0 sm:min-w-32"
								disabled={isPending}
							>
								{t("search.submit")}
							</Button>
						</form>
					</div>

					{subCategoryOptions.length > 0 ||
					tagOptions.length > 0 ||
					hasActiveFilters ? (
						<div className="px-4 py-4 sm:px-5 sm:py-5">
							{hasActiveFilters ? (
								<div className="mb-4 flex justify-end">
									<button
										type="button"
										onClick={handleClearAll}
										className="font-heading text-label font-medium text-muted underline decoration-border underline-offset-4 transition-colors fine-hover:text-foreground"
									>
										{t("filter.clear")}
									</button>
								</div>
							) : null}

							{subCategoryOptions.length > 0 ? (
								<FilterRow label={t("filter.subcategories")}>
									{subCategoryOptions.map((subCategory) => {
										const active = activeSubCategory === subCategory.key;
										return (
											<CategoryPill
												key={subCategory.key}
												active={active}
												onClick={() =>
													handleSubCategory(active ? null : subCategory.key)
												}
											>
												{subCategory.label}
											</CategoryPill>
										);
									})}
								</FilterRow>
							) : null}

							{tagOptions.length > 0 ? (
								<FilterRow label={t("filter.tags")}>
									{tagOptions.map((tag) => {
										const active = activeTag === tag;
										return (
											<CategoryPill
												key={tag}
												active={active}
												onClick={() => handleTag(active ? null : tag)}
											>
												#{tag}
											</CategoryPill>
										);
									})}
								</FilterRow>
							) : null}

							{hasActiveFilters ? (
								<div className="mt-4 flex flex-wrap items-center gap-2 border-t border-border pt-4">
									<span className="text-label text-muted">
										{t("filter.active")}
									</span>
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
								</div>
							) : null}
						</div>
					) : null}
				</div>
			) : null}
		</div>
	);
}

type FilterRowProps = {
	label: string;
	children: React.ReactNode;
};

function FilterRow({ label, children }: FilterRowProps) {
	return (
		<div className="mt-4 border-t border-border pt-4">
			<p className="font-heading text-label font-semibold uppercase tracking-[0.14em] text-muted">
				{label}
			</p>
			<div
				className="mt-3 flex flex-wrap gap-2"
				role="group"
				aria-label={label}
			>
				{children}
			</div>
		</div>
	);
}

type CategoryPillProps = {
	active: boolean;
	onClick: () => void;
	children: React.ReactNode;
};

function CategoryPill({ active, onClick, children }: CategoryPillProps) {
	return (
		<button
			type="button"
			onClick={onClick}
			aria-pressed={active}
			className={cn(
				"shrink-0 border px-3.5 py-2 font-heading text-small font-medium transition-colors sm:px-4",
				active
					? "border-primary bg-primary text-primary-foreground"
					: "border-border-strong bg-background text-foreground fine-hover:border-foreground/40 fine-hover:bg-sunken",
			)}
		>
			{children}
		</button>
	);
}
