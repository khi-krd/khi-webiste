"use client";

import {
	AdjustmentsHorizontalIcon,
	MagnifyingGlassIcon,
	XMarkIcon,
} from "@heroicons/react/24/outline";
import { useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { useCallback, useEffect, useRef, useState, useTransition } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { useRouter } from "@/i18n/navigation";
import { useScrollToSection } from "@/lib/use-scroll-to-section";
import { cn } from "@/lib/utils";
import type { WritingCategorySlug } from "@/lib/writing/categories";
import { getGenresForCategory } from "@/lib/writing/categories";
import type { WritingsSort } from "@/lib/writing/filter";
import { BOOK_GENRES } from "@/lib/writing/genres";
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

function CategoryPill({
	active,
	onClick,
	children,
}: {
	active: boolean;
	onClick: () => void;
	children: React.ReactNode;
}) {
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
	const [expanded, setExpanded] = useState(false);
	const [query, setQuery] = useState(activeQuery ?? "");
	const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
	const scrollToSection = useScrollToSection();

	const availableGenres = getGenresForCategory(categorySlug) ?? BOOK_GENRES;

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
		<div
			className={cn("transition-opacity", isPending && "opacity-80", className)}
		>
			<div className="flex border-b border-border pb-4">
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
			</div>

			{expanded ? (
				<div className="mt-6 space-y-6 border border-border bg-surface">
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
									aria-label={t("filter.searchLabel")}
									autoComplete="off"
									className="h-full min-w-0 flex-1 bg-transparent px-3 py-0 text-body text-foreground placeholder:text-muted focus:outline-none sm:px-4"
								/>

								{query ? (
									<button
										type="button"
										onClick={handleClearSearch}
										className="flex shrink-0 items-center px-3 text-muted transition-colors fine-hover:text-foreground"
										aria-label={t("filter.searchClear")}
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
								{t("filter.searchSubmit")}
							</Button>
						</form>
					</div>

					<div className="px-4 py-4 sm:px-5 sm:py-5">
						<div className="flex flex-wrap items-center justify-between gap-3">
							<p className="font-heading text-label font-semibold uppercase tracking-[0.14em] text-muted">
								{t("filter.genreLabel")}
							</p>
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
							aria-label={t("filter.genreLabel")}
						>
							<CategoryPill
								active={!activeGenre}
								onClick={() => handleGenre(null)}
							>
								{t("filter.all")}
							</CategoryPill>
							{availableGenres.map((genre) => (
								<CategoryPill
									key={genre}
									active={activeGenre === genre}
									onClick={() => handleGenre(genre)}
								>
									{genreLabels[genre]}
								</CategoryPill>
							))}
						</div>

						<div className="mt-6 border-t border-border pt-4">
							<p className="font-heading text-label font-semibold uppercase tracking-[0.14em] text-muted">
								{t("sort.label")}
							</p>
							<div className="mt-4 flex flex-wrap gap-2" role="group">
								<CategoryPill
									active={activeSort === "newest"}
									onClick={() => handleSort("newest")}
								>
									{t("sort.newest")}
								</CategoryPill>
								<CategoryPill
									active={activeSort === "title"}
									onClick={() => handleSort("title")}
								>
									{t("sort.title")}
								</CategoryPill>
							</div>
						</div>

						{writers.length > 0 ? (
							<div className="mt-6 border-t border-border pt-4">
								<label
									htmlFor="writings-writer-select"
									className="font-heading text-label font-semibold uppercase tracking-[0.14em] text-muted"
								>
									{t("filter.writerLabel")}
								</label>
								<div className="mt-4 max-w-xs">
									<Select
										id="writings-writer-select"
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
							</div>
						) : null}

						{hasActiveFilters ? (
							<div className="mt-4 flex flex-wrap items-center gap-2 border-t border-border pt-4">
								<span className="text-label text-muted">
									{t("filter.active")}
								</span>
								{activeGenre ? (
									<Badge variant="outline" size="sm">
										{genreLabels[activeGenre]}
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
								{/* Reset lives beside the chips it clears — the header row
								    above is the filter button alone. */}
								<button
									type="button"
									onClick={handleClearAll}
									disabled={isPending}
									className="ms-auto font-heading text-small font-medium text-muted underline decoration-border underline-offset-4 transition-colors fine-hover:text-foreground"
								>
									{t("filter.reset")}
								</button>
							</div>
						) : null}
					</div>
				</div>
			) : null}
		</div>
	);
}
