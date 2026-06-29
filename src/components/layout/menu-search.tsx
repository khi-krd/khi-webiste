"use client";

import { ArrowLeftIcon } from "@heroicons/react/24/outline";
import { useReducedMotion } from "motion/react";
import { useLocale, useTranslations } from "next-intl";
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
import {
	type ClientSearchItem,
	type ClientSearchSectionKey,
	fetchGlobalSearch,
	groupSearchItems,
} from "@/lib/search/client";
import { cn } from "@/lib/utils";

/** Min characters before we filter the catalog or flag a too-short query. */
const MIN_QUERY_LENGTH = 2;
const SEARCH_DEBOUNCE_MS = 300;

type NavSearchResult = {
	id: string;
	href: string;
	label: string;
	parentLabel?: string;
	navKey: string;
	searchText: string;
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

const SEARCH_SECTION_LABEL_KEYS: Record<ClientSearchSectionKey, string> = {
	projects: "projects",
	news: "news",
	videos: "video",
	writings: "writings",
	soundTracks: "sound",
	imageCollections: "gallery",
};

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
): NavSearchResult[] {
	return NAV_ITEMS.flatMap((item) => {
		const parentLabel = t(item.key);
		const parentDescription = t(item.descriptionKey);
		const parentSearchText = `${parentLabel} ${parentDescription}`;

		return [
			{
				id: item.key,
				href: item.href,
				label: parentLabel,
				navKey: item.key,
				searchText: parentSearchText,
			},
			...item.children.map((child) => {
				const childLabel = t(child.key);
				return {
					id: `${item.key}-${child.key}`,
					href: child.href,
					label: childLabel,
					parentLabel,
					navKey: item.key,
					searchText: `${childLabel} ${parentSearchText}`,
				};
			}),
		];
	});
}

function isInSearchScope(navKey: string, scope: SearchScope): boolean {
	if (scope === "main") {
		return true;
	}

	return SEARCH_SCOPE_NAV_KEYS[scope].includes(navKey);
}

function filterNavSearchResults(
	index: NavSearchResult[],
	query: string,
	scope: SearchScope,
): NavSearchResult[] {
	const normalizedQuery = normalizeSearchText(query);
	if (!normalizedQuery) return [];

	return index.filter((entry) => {
		if (!isInSearchScope(entry.navKey, scope)) {
			return false;
		}

		const haystack = [entry.searchText, entry.label, entry.parentLabel].filter(
			(value): value is string => Boolean(value),
		);

		return haystack.some((value) =>
			normalizeSearchText(value).includes(normalizedQuery),
		);
	});
}

function SearchResultsList({
	groups,
	isSearching,
	isLoading,
	onNavigate,
	noResultsLabel,
	loadingLabel,
	getSectionLabel,
}: {
	groups: { key: ClientSearchSectionKey; items: ClientSearchItem[] }[];
	isSearching: boolean;
	isLoading: boolean;
	onNavigate: () => void;
	noResultsLabel: string;
	loadingLabel: string;
	getSectionLabel: (key: ClientSearchSectionKey) => string;
}) {
	if (isLoading) {
		return (
			<p
				className={cn(
					"py-3 text-body text-primary-foreground/55",
					overlayTextShadow,
				)}
			>
				{loadingLabel}
			</p>
		);
	}

	if (groups.length > 0) {
		return (
			<div className="flex flex-col gap-6 pb-4">
				{groups.map((group) => (
					<section key={group.key}>
						<h4
							className={cn(
								"mb-2 text-small font-medium text-primary-foreground/55",
								overlayTextShadow,
							)}
						>
							{getSectionLabel(group.key)}
						</h4>
						<ul className="flex flex-col">
							{group.items.map((result) => (
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
										{result.description ? (
											<span className="mt-1 block text-small text-primary-foreground/45">
												{result.description}
											</span>
										) : null}
									</Link>
								</li>
							))}
						</ul>
					</section>
				))}
			</div>
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

function NavFallbackResultsList({
	results,
	isSearching,
	onNavigate,
	noResultsLabel,
}: {
	results: NavSearchResult[];
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

/** In-overlay search — API results when available; nav catalog fallback otherwise. */
export function MenuSearch({ onBack, onNavigate }: MenuSearchProps) {
	const t = useTranslations("Nav");
	const locale = useLocale();
	const reduceMotion = useReducedMotion();
	const [isExpanded, setIsExpanded] = useState(false);

	const [query, setQuery] = useState("");
	const [scope, setScope] = useState<SearchScope>("main");
	const [submitted, setSubmitted] = useState(false);
	const [apiResults, setApiResults] = useState<ClientSearchItem[] | null>(null);
	const [isLoading, setIsLoading] = useState(false);
	const [contentSearchUnavailable, setContentSearchUnavailable] = useState(false);

	const trimmedQuery = query.trim();
	const hasQuery = trimmedQuery.length > 0;
	const isSearching = trimmedQuery.length >= MIN_QUERY_LENGTH;
	const showError = submitted && trimmedQuery.length < MIN_QUERY_LENGTH;

	const searchIndex = useMemo(() => buildSearchIndex(t), [t]);

	const navFallbackResults = useMemo((): NavSearchResult[] => {
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
						searchText: `${t(item.key)} ${t(item.descriptionKey)}`,
					} satisfies NavSearchResult,
				];
			});
		}

		return filterNavSearchResults(searchIndex, trimmedQuery, scope);
	}, [isSearching, scope, searchIndex, t, trimmedQuery]);

	const groupedApiResults = useMemo(() => {
		if (!apiResults) {
			return [];
		}
		return groupSearchItems(apiResults);
	}, [apiResults]);

	useEffect(() => {
		if (!isSearching) {
			setApiResults(null);
			setIsLoading(false);
			setContentSearchUnavailable(false);
			return;
		}

		const controller = new AbortController();
		const timeoutId = window.setTimeout(async () => {
			setIsLoading(true);
			try {
				const { items, unavailable } = await fetchGlobalSearch(
					trimmedQuery,
					locale,
					scope,
				);
				if (controller.signal.aborted) {
					return;
				}
				setContentSearchUnavailable(unavailable);
				if (items.length > 0) {
					setApiResults(items);
				} else {
					setApiResults(null);
				}
			} finally {
				if (!controller.signal.aborted) {
					setIsLoading(false);
				}
			}
		}, SEARCH_DEBOUNCE_MS);

		return () => {
			controller.abort();
			window.clearTimeout(timeoutId);
		};
	}, [isSearching, locale, scope, trimmedQuery]);

	useEffect(() => {
		if (!hasQuery && !isSearching) {
			setIsExpanded(false);
			return;
		}

		if (reduceMotion || isSearching) {
			setIsExpanded(true);
			return;
		}

		const id = window.setTimeout(() => setIsExpanded(true), LAYOUT_MS);
		return () => clearTimeout(id);
	}, [hasQuery, isSearching, reduceMotion]);

	const hasApiResults = groupedApiResults.length > 0;
	const showNavResults = !isLoading && !hasApiResults;
	const visibleNavResults = showNavResults ? navFallbackResults : [];
	const showEmptyState =
		isSearching &&
		!isLoading &&
		!hasApiResults &&
		visibleNavResults.length === 0;

	const spacerClass = cn(
		"min-h-0 shrink-0 basis-0",
		!reduceMotion && "transition-[flex-grow] duration-400 ease-out",
	);

	function onSubmit(event: FormEvent<HTMLFormElement>) {
		event.preventDefault();
		setSubmitted(true);
	}

	const getSectionLabel = (key: ClientSearchSectionKey) =>
		t(SEARCH_SECTION_LABEL_KEYS[key]);

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
						{isSearching && isLoading ? (
							<p
								className={cn(
									"py-3 text-body text-primary-foreground/55",
									overlayTextShadow,
								)}
							>
								{t("searchLoading")}
							</p>
						) : null}

						{contentSearchUnavailable && isSearching && !isLoading ? (
							<p
								className={cn(
									"mb-3 text-small text-primary-foreground/55",
									overlayTextShadow,
								)}
							>
								{t("searchContentUnavailable")}
							</p>
						) : null}

						{hasApiResults ? (
							<SearchResultsList
								groups={groupedApiResults}
								isSearching={isSearching}
								isLoading={false}
								onNavigate={onNavigate}
								noResultsLabel={t("searchNoResults")}
								loadingLabel={t("searchLoading")}
								getSectionLabel={getSectionLabel}
							/>
						) : null}

						{visibleNavResults.length > 0 ? (
							<div className={hasApiResults ? "mt-6" : undefined}>
								{isSearching && hasApiResults ? (
									<h4
										className={cn(
											"mb-2 text-small font-medium text-primary-foreground/55",
											overlayTextShadow,
										)}
									>
										{t("searchNavFallback")}
									</h4>
								) : null}
								<NavFallbackResultsList
									results={visibleNavResults}
									isSearching={isSearching}
									onNavigate={onNavigate}
									noResultsLabel={t("searchNoResults")}
								/>
							</div>
						) : null}

						{showEmptyState ? (
							<p
								className={cn(
									"py-3 text-body text-primary-foreground/55",
									overlayTextShadow,
								)}
							>
								{t("searchNoResults")}
							</p>
						) : null}
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
