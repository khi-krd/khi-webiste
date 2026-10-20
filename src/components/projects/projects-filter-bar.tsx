"use client";

import { useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { useCallback, useEffect, useRef, useState, useTransition } from "react";
import { Badge } from "@/components/ui/badge";
import {
	FilterBar,
	FilterDivider,
	FilterPill,
	FilterSearchBox,
} from "@/components/ui/filter-bar";
import { useRouter } from "@/i18n/navigation";
import { projectsHref } from "@/lib/projects-url";
import { useScrollToSection } from "@/lib/use-scroll-to-section";

type ProjectsFilterBarProps = {
	types: string[];
	activeYear?: string | null;
	activeType?: string | null;
	activeQuery?: string | null;
	className?: string;
};

/**
 * All controls on ONE continuous line: type pills and the search box flow in a
 * single `flex-wrap` row — no expand panel, no stacked sections. Active-filter
 * chips trail at the row's tail.
 */
export function ProjectsFilterBar({
	types,
	activeYear,
	activeType,
	activeQuery,
	className,
}: ProjectsFilterBarProps) {
	const t = useTranslations("ProjectsPage");
	const router = useRouter();
	const searchParams = useSearchParams();
	const [isPending, startTransition] = useTransition();
	const [query, setQuery] = useState(activeQuery ?? "");
	const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
	const scrollToSection = useScrollToSection();

	const hasActiveType = Boolean(activeType);
	const hasActiveQuery = Boolean(activeQuery?.trim());
	const hasActiveYear = Boolean(activeYear);
	const hasActiveFilters = hasActiveType || hasActiveQuery || hasActiveYear;

	useEffect(() => {
		setQuery(activeQuery ?? "");
	}, [activeQuery]);

	const pushFilters = useCallback(
		(type: string | null, q: string) => {
			startTransition(() => {
				router.replace(
					projectsHref({
						year: activeYear,
						type,
						q,
						page: 1,
					}),
					{ scroll: false },
				);

				const grid = document.getElementById("projects-content");
				if (grid && searchParams.toString()) {
					scrollToSection("projects-content");
				}
			});
		},
		[router, searchParams, scrollToSection, activeYear],
	);

	const handleType = (type: string | null) => {
		pushFilters(type, query);
	};

	const handleSearchSubmit = () => {
		if (debounceRef.current) clearTimeout(debounceRef.current);
		pushFilters(activeType ?? null, query);
	};

	const handleQueryChange = (value: string) => {
		setQuery(value);
		if (debounceRef.current) clearTimeout(debounceRef.current);
		debounceRef.current = setTimeout(() => {
			pushFilters(activeType ?? null, value);
		}, 350);
	};

	const handleClearSearch = () => {
		if (debounceRef.current) clearTimeout(debounceRef.current);
		setQuery("");
		pushFilters(activeType ?? null, "");
	};

	const handleClearAll = () => {
		if (debounceRef.current) clearTimeout(debounceRef.current);
		setQuery("");
		router.replace(projectsHref({}), { scroll: false });
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
			{/* primary browse axis — the project types */}
			{types.length > 0 ? (
				<>
					<FilterPill active={!activeType} onClick={() => handleType(null)}>
						{t("filter.all")}
					</FilterPill>
					{types.map((type) => (
						<FilterPill
							key={type}
							active={activeType === type}
							onClick={() => handleType(type)}
						>
							{type}
						</FilterPill>
					))}
					<FilterDivider />
				</>
			) : null}

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
					{activeYear ? (
						<Badge variant="outline" size="sm">
							{activeYear}
						</Badge>
					) : null}
					{activeType ? (
						<Badge variant="outline" size="sm">
							{activeType}
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
