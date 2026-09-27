"use client";

import { useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { useCallback, useEffect, useRef, useState, useTransition } from "react";
import { Badge } from "@/components/ui/badge";
import {
	FilterBar,
	FilterDivider,
	FilterGroupLabel,
	FilterPill,
	FilterSearchBox,
} from "@/components/ui/filter-bar";
import { Select } from "@/components/ui/select";
import { useRouter } from "@/i18n/navigation";
import { useScrollToSection } from "@/lib/use-scroll-to-section";
import type { WritingCategorySlug } from "@/lib/writing/categories";
import type { WritingsSort } from "@/lib/writing/filter";
import { buildWritingsHref } from "@/lib/writings-url";
import type { BookGenre } from "@/types/writing";

type WritingsFilterBarProps = {
	categorySlug?: WritingCategorySlug | null;
	activeGenre?: BookGenre | null;
	activeQuery?: string | null;
	activeWriter?: string | null;
	activeTag?: string | null;
	activeKeyword?: string | null;
	activeSort?: WritingsSort;
	genreLabels: Record<BookGenre, string>;
	writers?: string[];
	scrollTargetId?: string;
	className?: string;
};

/**
 * All controls on ONE continuous line: genre chips, sort, writer select and
 * the search box flow in a single `flex-wrap` row — no expand panel, no
 * stacked sections. Active-filter chips trail at the row's tail.
 */
export function WritingsFilterBar({
	categorySlug,
	activeGenre,
	activeQuery,
	activeWriter,
	activeTag,
	activeKeyword,
	activeSort = "newest",
	genreLabels,
	writers = [],
	scrollTargetId = "writings-grid",
	className,
}: WritingsFilterBarProps) {
	const t = useTranslations("Writings");
	const router = useRouter();
	const searchParams = useSearchParams();
	const [isPending, startTransition] = useTransition();
	const [query, setQuery] = useState(activeQuery ?? "");
	const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
	const scrollToSection = useScrollToSection();

	// The page builds `genreLabels` per surface (CMS chips, or the category's
	// curated subset) — its insertion order IS the chip order.
	const availableGenres = Object.keys(genreLabels);

	const hasActiveGenre = Boolean(activeGenre);
	const hasActiveQuery = Boolean(activeQuery?.trim());
	const hasActiveSort = activeSort !== "newest";
	const hasActiveFilters =
		hasActiveGenre ||
		hasActiveQuery ||
		hasActiveSort ||
		Boolean(activeWriter) ||
		Boolean(activeTag) ||
		Boolean(activeKeyword);

	useEffect(() => {
		setQuery(activeQuery ?? "");
	}, [activeQuery]);

	const pushFilters = useCallback(
		(opts: {
			genre?: BookGenre | null;
			q?: string;
			writer?: string | null;
			sort?: WritingsSort;
		}) => {
			startTransition(() => {
				router.replace(
					buildWritingsHref({
						category: categorySlug,
						genre: "genre" in opts ? opts.genre : activeGenre,
						q: opts.q ?? query,
						writer: "writer" in opts ? opts.writer : activeWriter,
						tag: activeTag,
						keyword: activeKeyword,
						sort: opts.sort ?? activeSort,
						page: 1,
					}),
					{ scroll: false },
				);

				const grid = document.getElementById(scrollTargetId);
				if (grid && searchParams.toString()) {
					scrollToSection(scrollTargetId);
				}
			});
		},
		[
			router,
			searchParams,
			categorySlug,
			activeGenre,
			activeWriter,
			activeTag,
			activeKeyword,
			query,
			activeSort,
			scrollTargetId,
			scrollToSection,
		],
	);

	const handleGenre = (genre: BookGenre | null) => {
		pushFilters({ genre });
	};

	const handleSort = (sort: WritingsSort) => {
		pushFilters({ sort });
	};

	const handleWriter = (writer: string) => {
		pushFilters({ writer: writer || null });
	};

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
		router.replace(buildWritingsHref({ category: categorySlug }), {
			scroll: false,
		});
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
			{/* genre chips — the row's primary browse axis */}
			<FilterPill active={!activeGenre} onClick={() => handleGenre(null)}>
				{t("filter.all")}
			</FilterPill>
			{availableGenres.map((genre) => (
				<FilterPill
					key={genre}
					active={activeGenre === genre}
					onClick={() => handleGenre(genre)}
				>
					{genreLabels[genre]}
				</FilterPill>
			))}

			<FilterDivider />
			<FilterGroupLabel>{t("sort.label")}</FilterGroupLabel>
			<FilterPill
				active={activeSort === "newest"}
				onClick={() => handleSort("newest")}
			>
				{t("sort.newest")}
			</FilterPill>
			<FilterPill
				active={activeSort === "title"}
				onClick={() => handleSort("title")}
			>
				{t("sort.title")}
			</FilterPill>

			{writers.length > 0 ? (
				<>
					<FilterDivider />
					<FilterGroupLabel>{t("filter.writerLabel")}</FilterGroupLabel>
					<div className="w-44 min-w-36">
						<Select
							aria-label={t("filter.writerLabel")}
							value={activeWriter ?? ""}
							onChange={(event) => handleWriter(event.target.value)}
						>
							<option value="">{t("filter.writerAll")}</option>
							{writers.map((writer) => (
								<option key={writer} value={writer}>
									{writer}
								</option>
							))}
						</Select>
					</div>
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
				searchLabel={t("filter.searchLabel")}
				clearLabel={t("filter.searchClear")}
				submitLabel={t("filter.searchSubmit")}
			/>

			{hasActiveFilters ? (
				<>
					<FilterDivider />
					<span className="text-label text-muted">{t("filter.active")}</span>
					{activeGenre ? (
						<Badge variant="outline" size="sm">
							{genreLabels[activeGenre] ?? activeGenre}
						</Badge>
					) : null}
					{hasActiveQuery && activeQuery ? (
						<Badge variant="outline" size="sm">
							&ldquo;{activeQuery}&rdquo;
						</Badge>
					) : null}
					{activeWriter ? (
						<Badge variant="outline" size="sm">
							{activeWriter}
						</Badge>
					) : null}
					{activeTag ? (
						<Badge variant="outline" size="sm">
							{t("filter.tagLabel")}: #{activeTag}
						</Badge>
					) : null}
					{activeKeyword ? (
						<Badge variant="outline" size="sm">
							{t("filter.keywordLabel")}: {activeKeyword}
						</Badge>
					) : null}
					{hasActiveSort ? (
						<Badge variant="outline" size="sm">
							{t(`sort.${activeSort}`)}
						</Badge>
					) : null}
					<button
						type="button"
						onClick={handleClearAll}
						disabled={isPending}
						className="font-heading text-small font-medium text-muted underline decoration-border underline-offset-4 transition-colors fine-hover:text-foreground"
					>
						{t("filter.reset")}
					</button>
				</>
			) : null}
		</FilterBar>
	);
}
