"use client";

import { MagnifyingGlassIcon, XMarkIcon } from "@heroicons/react/24/outline";
import { useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { useCallback, useEffect, useRef, useState, useTransition } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useRouter } from "@/i18n/navigation";
import { projectsHref } from "@/lib/projects-url";
import { useScrollToSection } from "@/lib/use-scroll-to-section";
import { cn } from "@/lib/utils";

type ProjectsFilterBarProps = {
	tags: string[];
	activeYear?: string | null;
	activeTag?: string | null;
	activeQuery?: string | null;
	className?: string;
};

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

	const handleSearchSubmit = (event: React.FormEvent) => {
		event.preventDefault();
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

			{tags.length > 0 ? (
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

					<div
						className="flex flex-wrap gap-2"
						role="group"
						aria-label={t("filter.label")}
					>
						<TagPill active={!activeTag} onClick={() => handleTag(null)}>
							{t("filter.all")}
						</TagPill>
						{tags.map((tag) => (
							<TagPill
								key={tag}
								active={activeTag === tag}
								onClick={() => handleTag(tag)}
							>
								{tag}
							</TagPill>
						))}
					</div>

					{hasActiveFilters ? (
						<div className="mt-4 flex flex-wrap items-center gap-2 border-t border-border pt-4">
							<span className="text-label text-muted">
								{t("filter.active")}
							</span>
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
						</div>
					) : null}
				</div>
			) : hasActiveFilters ? (
				<div className="flex flex-wrap items-center justify-between gap-3 px-4 py-4 sm:px-5 sm:py-5">
					<div className="flex flex-wrap items-center gap-2">
						<span className="text-label text-muted">{t("filter.active")}</span>
						{activeYear ? (
							<Badge variant="outline" size="sm">
								{activeYear}
							</Badge>
						) : null}
						{hasActiveQuery && activeQuery ? (
							<Badge variant="outline" size="sm">
								&ldquo;{activeQuery}&rdquo;
							</Badge>
						) : null}
					</div>
					<button
						type="button"
						onClick={handleClearAll}
						className="font-heading text-label font-medium text-muted underline decoration-border underline-offset-4 transition-colors fine-hover:text-foreground"
					>
						{t("filter.clear")}
					</button>
				</div>
			) : null}
		</div>
	);
}

type TagPillProps = {
	active: boolean;
	onClick: () => void;
	children: React.ReactNode;
};

function TagPill({ active, onClick, children }: TagPillProps) {
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
