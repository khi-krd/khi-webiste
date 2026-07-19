"use client";

import {
	AdjustmentsHorizontalIcon,
	MagnifyingGlassIcon,
	XMarkIcon,
} from "@heroicons/react/24/outline";
import { useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { useCallback, useEffect, useRef, useState, useTransition } from "react";
import { useScrollToSection } from "@/lib/use-scroll-to-section";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useRouter } from "@/i18n/navigation";
import type { NewsCategoryOption } from "@/lib/mock/news";
import { isKnownCategory } from "@/lib/mock/news";
import { buildNewsHref } from "@/lib/news-url";
import { cn } from "@/lib/utils";

type NewsFilterBarProps = {
	categories: NewsCategoryOption[];
	activeCategory?: string | null;
	activeQuery?: string | null;
	className?: string;
};

export function NewsFilterBar({
	categories,
	activeCategory,
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

	const hasActiveCategory =
		Boolean(activeCategory) &&
		isKnownCategory(activeCategory ?? "", categories);
	const activeCategoryLabel = hasActiveCategory
		? categories.find((entry) => entry.key === activeCategory)?.label
		: null;
	const hasActiveQuery = Boolean(activeQuery?.trim());
	const hasActiveFilters = hasActiveCategory || hasActiveQuery;

	useEffect(() => {
		setQuery(activeQuery ?? "");
	}, [activeQuery]);

	const pushFilters = useCallback(
		(category: string | null, q: string) => {
			startTransition(() => {
				router.replace(
					buildNewsHref({
						category,
						q,
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
		[router, searchParams, scrollToSection],
	);

	const handleCategory = (category: string | null) => {
		pushFilters(category, query);
	};

	const handleSearchSubmit = (event: React.FormEvent) => {
		event.preventDefault();
		if (debounceRef.current) clearTimeout(debounceRef.current);
		pushFilters(activeCategory ?? null, query);
	};

	const handleQueryChange = (value: string) => {
		setQuery(value);
		if (debounceRef.current) clearTimeout(debounceRef.current);
		debounceRef.current = setTimeout(() => {
			pushFilters(activeCategory ?? null, value);
		}, 350);
	};

	const handleClearSearch = () => {
		if (debounceRef.current) clearTimeout(debounceRef.current);
		setQuery("");
		pushFilters(activeCategory ?? null, "");
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
			className={cn(
				"border border-border bg-surface transition-opacity",
				isPending && "opacity-80",
				className,
			)}
		>
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
						<span className="flex shrink-0 items-center border-e border-border-strong px-3 text-muted sm:px-4">
							<MagnifyingGlassIcon className="size-5" aria-hidden />
						</span>

						<input
							type="search"
							name="q"
							value={query}
							onChange={(event) => handleQueryChange(event.target.value)}
							placeholder={t("search.placeholder")}
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
						className="h-12 shrink-0 sm:min-w-32"
						disabled={isPending}
					>
						{t("search.submit")}
					</Button>
				</form>
			</div>

			<div className="px-4 py-4 sm:px-5 sm:py-5">
				<div className="flex flex-wrap items-center justify-between gap-3">
					<div className="flex items-center gap-2 text-muted">
						<AdjustmentsHorizontalIcon
							className="size-4 shrink-0"
							aria-hidden
						/>
						<p className="font-heading text-label font-semibold uppercase tracking-[0.14em]">
							{t("filter.label")}
						</p>
					</div>

					{hasActiveFilters ? (
						<button
							type="button"
							onClick={handleClearAll}
							className="font-heading text-label font-medium text-muted underline decoration-border underline-offset-4 transition-colors fine-hover:text-foreground"
						>
							{t("filter.clear")}
						</button>
					) : null}
				</div>

				<div
					className="mt-4 flex flex-wrap gap-2"
					role="group"
					aria-label={t("filter.label")}
				>
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

				{hasActiveFilters ? (
					<div className="mt-4 flex flex-wrap items-center gap-2 border-t border-border pt-4">
						<span className="text-label text-muted">{t("filter.active")}</span>
						{activeCategoryLabel ? (
							<Badge variant="outline" size="sm">
								{activeCategoryLabel}
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
					? "border-foreground bg-primary text-primary-foreground"
					: "border-border-strong bg-background text-foreground fine-hover:border-foreground/40 fine-hover:bg-sunken",
			)}
		>
			{children}
		</button>
	);
}
