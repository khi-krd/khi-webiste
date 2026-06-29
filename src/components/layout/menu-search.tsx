"use client";

import { ArrowLeftIcon } from "@heroicons/react/24/outline";
import { useReducedMotion } from "motion/react";
import { useTranslations } from "next-intl";
import { type FormEvent, useEffect, useMemo, useState } from "react";
import { DirectionalIcon } from "@/components/ui/directional-icon";
import { Input } from "@/components/ui/input";
import { Link } from "@/components/ui/link";
import {
	NAV_ITEMS,
	SEARCH_SCOPE_NAV_KEYS,
	SEARCH_SCOPE_SUGGESTION_KEYS,
	SEARCH_SCOPES,
	type SearchScope,
} from "@/config/site";
import { cn } from "@/lib/utils";

/** Min characters before we filter the catalog or flag a too-short query. */
const MIN_QUERY_LENGTH = 2;

type SearchResult = {
	id: string;
	href: string;
	label: string;
	parentLabel?: string;
	navKey: string;
};

type MenuSearchProps = {
	onBack: () => void;
	onNavigate: () => void;
};

const LAYOUT_MS = 400;

const SEARCH_SCOPE_LABEL_KEYS = {
	main: "searchScopeMain",
	archive: "searchScopeArchive",
	library: "searchScopeLibrary",
} as const satisfies Record<SearchScope, string>;

/** Keeps overlay copy readable when background photos run bright. */
const overlayTextShadow =
	"[text-shadow:0_1px_2px_color-mix(in_oklch,var(--color-foreground)_75%,transparent),0_0_1.75rem_color-mix(in_oklch,var(--color-foreground)_40%,transparent)]";

const scrollbarHiddenClass =
	"[scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden";

function normalizeSearchText(value: string) {
	return value.trim().toLocaleLowerCase();
}

function buildSearchIndex(
	t: ReturnType<typeof useTranslations<"Nav">>,
): SearchResult[] {
	return NAV_ITEMS.flatMap((item) => [
		{
			id: item.key,
			href: item.href,
			label: t(item.key),
			navKey: item.key,
		},
		...item.children.map((child) => ({
			id: `${item.key}-${child.key}`,
			href: child.href,
			label: t(child.key),
			parentLabel: t(item.key),
			navKey: item.key,
		})),
	]);
}

function isInSearchScope(navKey: string, scope: SearchScope): boolean {
	if (scope === "main") {
		return true;
	}

	return SEARCH_SCOPE_NAV_KEYS[scope].includes(navKey);
}

function filterSearchResults(
	index: SearchResult[],
	query: string,
	scope: SearchScope,
): SearchResult[] {
	const normalizedQuery = normalizeSearchText(query);
	if (!normalizedQuery) return [];

	return index.filter((entry) => {
		if (!isInSearchScope(entry.navKey, scope)) {
			return false;
		}

		const haystack = [entry.label, entry.parentLabel].filter(
			(value): value is string => Boolean(value),
		);

		return haystack.some((value) =>
			value.toLocaleLowerCase().includes(normalizedQuery),
		);
	});
}

function SearchResultsList({
	results,
	isSearching,
	onNavigate,
	noResultsLabel,
}: {
	results: SearchResult[];
	isSearching: boolean;
	onNavigate: () => void;
	noResultsLabel: string;
}) {
	if (results.length > 0) {
		return (
			<ul className="flex flex-col pb-4">
				{results.map((result) => (
					<li
						key={result.id}
						className="border-b border-primary-foreground/15 last:border-b-0"
					>
						<Link
							href={result.href}
							variant="nav"
							onClick={onNavigate}
							className={cn(
								"block py-3 text-body text-primary-foreground/80 transition-colors hover:text-primary-foreground",
								overlayTextShadow,
							)}
						>
							<span>{result.label}</span>
							{result.parentLabel && (
								<span className="ms-2 text-small text-primary-foreground/45">
									{result.parentLabel}
								</span>
							)}
						</Link>
					</li>
				))}
			</ul>
		);
	}

	if (isSearching) {
		return (
			<p
				className={cn(
					"py-3 text-body text-primary-foreground/55",
					overlayTextShadow,
				)}
			>
				{noResultsLabel}
			</p>
		);
	}

	return null;
}

/**
 * In-overlay search view. Live-filters the nav catalog as the user types.
 * TODO(search): wire submit + deeper results to a backend endpoint when defined.
 */
export function MenuSearch({ onBack, onNavigate }: MenuSearchProps) {
	const t = useTranslations("Nav");
	const reduceMotion = useReducedMotion();
	const [isExpanded, setIsExpanded] = useState(false);

	const [query, setQuery] = useState("");
	const [scope, setScope] = useState<SearchScope>("main");
	const [submitted, setSubmitted] = useState(false);

	const trimmedQuery = query.trim();
	const hasQuery = trimmedQuery.length > 0;
	const isSearching = trimmedQuery.length >= MIN_QUERY_LENGTH;
	const showError = submitted && trimmedQuery.length < MIN_QUERY_LENGTH;

	const searchIndex = useMemo(() => buildSearchIndex(t), [t]);

	const liveResults = useMemo((): SearchResult[] => {
		if (!isSearching) {
			return SEARCH_SCOPE_SUGGESTION_KEYS[scope].flatMap((key) => {
				const item = NAV_ITEMS.find((entry) => entry.key === key);
				if (!item) return [];

				return [
					{
						id: item.key,
						href: item.href,
						label: t(item.key),
						navKey: item.key,
					} satisfies SearchResult,
				];
			});
		}

		return filterSearchResults(searchIndex, trimmedQuery, scope);
	}, [isSearching, scope, searchIndex, t, trimmedQuery]);

	// Keep the compact layout during the rise animation so the list stays
	// glued under the input; switch to scrollable only after it finishes.
	useEffect(() => {
		if (!hasQuery) {
			setIsExpanded(false);
			return;
		}

		if (reduceMotion) {
			setIsExpanded(true);
			return;
		}

		const id = window.setTimeout(() => setIsExpanded(true), LAYOUT_MS);
		return () => clearTimeout(id);
	}, [hasQuery, reduceMotion]);

	const spacerClass = cn(
		"min-h-0 shrink-0 basis-0",
		!reduceMotion && "transition-[flex-grow] duration-400 ease-out",
	);

	function onSubmit(event: FormEvent<HTMLFormElement>) {
		event.preventDefault();
		setSubmitted(true);
		// TODO(search): replace with API-driven search when endpoint exists.
	}

	return (
		<div className="flex min-h-0 flex-1 flex-col overflow-hidden">
			<div
				aria-hidden
				className={spacerClass}
				style={{ flexGrow: hasQuery ? 0 : 1 }}
			/>

			<div
				className={cn("flex w-full flex-col", isExpanded && "min-h-0 flex-1")}
			>
				<div className="w-full max-w-xl shrink-0 lg:max-w-2xl">
					<button
						type="button"
						onClick={onBack}
						className={cn(
							"mb-8 inline-flex items-center gap-2 text-small text-primary-foreground/60 transition-colors hover:text-primary-foreground sm:mb-10",
							overlayTextShadow,
						)}
					>
						<DirectionalIcon icon={ArrowLeftIcon} className="size-4 shrink-0" />
						{t("searchBack")}
					</button>

					<h2
						className={cn(
							"mb-6 font-heading text-[clamp(1.75rem,2.75vw+0.4rem,2.5rem)] font-bold leading-tight text-primary-foreground",
							overlayTextShadow,
						)}
					>
						{t("searchLabel")}
					</h2>

					<form onSubmit={onSubmit} className="flex w-full flex-col gap-3">
						<label htmlFor="menu-search-input" className="visually-hidden">
							{t("searchLabel")}
						</label>

						<div className="flex flex-col gap-3 sm:flex-row sm:items-stretch">
							<Input
								id="menu-search-input"
								name="q"
								type="search"
								variant="overlay"
								fieldSize="lg"
								autoFocus
								autoComplete="off"
								spellCheck={false}
								placeholder={t("searchPlaceholder")}
								value={query}
								onChange={(event) => setQuery(event.target.value)}
								aria-invalid={showError ? true : undefined}
								aria-describedby={showError ? "menu-search-error" : undefined}
								className="min-w-0 flex-1"
							/>

							<div
								role="radiogroup"
								aria-label={t("searchScopeLabel")}
								className="flex shrink-0 gap-1.5 sm:gap-2"
							>
								{SEARCH_SCOPES.map((option) => {
									const isActive = scope === option;
									const labelKey = SEARCH_SCOPE_LABEL_KEYS[option];

									return (
										<button
											key={option}
											type="button"
											role="radio"
											aria-checked={isActive}
											onClick={() => setScope(option)}
											className={cn(
												"shrink-0 border px-3 py-2.5 font-heading text-small font-semibold transition-[color,background-color,border-color] duration-200 sm:px-3.5 sm:py-3",
												isActive
													? "border-primary-foreground bg-primary-foreground text-foreground"
													: "border-primary-foreground/35 bg-transparent text-primary-foreground/80 fine-hover:border-primary-foreground/60 fine-hover:text-primary-foreground",
												!isActive && overlayTextShadow,
											)}
										>
											{t(labelKey)}
										</button>
									);
								})}
							</div>
						</div>

						{showError && (
							<p
								id="menu-search-error"
								role="alert"
								className={cn(
									"text-small text-primary-foreground/80",
									overlayTextShadow,
								)}
							>
								{t("searchErrorMinLength")}
							</p>
						)}
					</form>
				</div>

				<section
					className={cn(
						"mt-10 flex w-full max-w-xl flex-col lg:max-w-2xl",
						isExpanded ? "min-h-0 flex-1" : "shrink-0",
					)}
					aria-labelledby="menu-search-results"
					aria-live="polite"
				>
					<h3
						id="menu-search-results"
						className={cn(
							"mb-3 shrink-0 text-small text-primary-foreground/55",
							overlayTextShadow,
						)}
					>
						{isSearching ? t("searchResults") : t("secondaryLinkPrefix")}
					</h3>

					<div
						className={cn(
							isExpanded && "min-h-0 flex-1 overflow-y-auto overscroll-contain",
							isExpanded && scrollbarHiddenClass,
						)}
					>
						<SearchResultsList
							results={liveResults}
							isSearching={isSearching}
							onNavigate={onNavigate}
							noResultsLabel={t("searchNoResults")}
						/>
					</div>
				</section>
			</div>

			<div
				aria-hidden
				className={spacerClass}
				style={{ flexGrow: hasQuery ? 0 : 1 }}
			/>
		</div>
	);
}
