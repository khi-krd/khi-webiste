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
	tags: string[];
	activeYear?: string | null;
	activeTag?: string | null;
	activeQuery?: string | null;
	className?: string;
};

/**
 * All controls on ONE continuous line: tag pills and the search box flow in a
 * single `flex-wrap` row — no expand panel, no stacked sections. Active-filter
 * chips trail at the row's tail.
 */
export function ProjectsFilterBar({
	tags,
	activeYear,
	activeTag,
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

	const hasActiveTag = Boolean(activeTag);
	const hasActiveQuery = Boolean(activeQuery?.trim());
	const hasActiveYear = Boolean(activeYear);
	const hasActiveFilters = hasActiveTag || hasActiveQuery || hasActiveYear;

	useEffect(() => {
		setQuery(activeQuery ?? "");
	}, [activeQuery]);

	const pushFilters = useCallback(
		(tag: string | null, q: string) => {
			startTransition(() => {
				router.replace(
					projectsHref({
						year: activeYear,
						tag,
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

	const handleTag = (tag: string | null) => {
		pushFilters(tag, query);
	};

	const handleSearchSubmit = () => {
		if (debounceRef.current) clearTimeout(debounceRef.current);
		pushFilters(activeTag ?? null, query);
	};

	const handleQueryChange = (value: string) => {
		setQuery(value);
		if (debounceRef.current) clearTimeout(debounceRef.current);
		debounceRef.current = setTimeout(() => {
			pushFilters(activeTag ?? null, value);
		}, 350);
	};

	const handleClearSearch = () => {
		if (debounceRef.current) clearTimeout(debounceRef.current);
		setQuery("");
		pushFilters(activeTag ?? null, "");
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
			{/* primary browse axis — the project tags */}
			{tags.length > 0 ? (
				<>
					<FilterPill active={!activeTag} onClick={() => handleTag(null)}>
						{t("filter.all")}
					</FilterPill>
					{tags.map((tag) => (
						<FilterPill
							key={tag}
							active={activeTag === tag}
							onClick={() => handleTag(tag)}
						>
							{tag}
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
					{activeTag ? (
						<Badge variant="outline" size="sm">
							{activeTag}
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
