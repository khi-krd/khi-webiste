"use client";

import { CheckIcon } from "@heroicons/react/20/solid";
import {
	ArrowLeftIcon,
	ArrowRightIcon,
	ChevronDownIcon,
} from "@heroicons/react/24/outline";
import { useReducedMotion } from "motion/react";
import { useLocale, useTranslations } from "next-intl";
import { type FormEvent, useEffect, useMemo, useRef, useState } from "react";
import { DirectionalIcon } from "@/components/ui/directional-icon";
import { Input } from "@/components/ui/input";
import { Link } from "@/components/ui/link";
import {
	type ClientSearchItem,
	type ClientSearchSectionKey,
	fetchGlobalSearch,
	groupSearchItems,
} from "@/lib/search/client";
import { cn } from "@/lib/utils";

/** Min characters before we query or flag a too-short submission. */
const MIN_QUERY_LENGTH = 2;
const SEARCH_DEBOUNCE_MS = 300;
const SEARCH_SCOPE = "main" as const;

const LAYOUT_MS = 400;

/**
 * Search sources. `site` queries this website's CMS; `library` (Koha) and
 * `archive` have no API yet — their checkboxes render now so the UX is final,
 * and each shows a "coming soon" note under its own heading while checked.
 */
type SearchSource = "site" | "library" | "archive";

const SEARCH_SOURCES: {
	key: SearchSource;
	labelKey: "searchScopeMain" | "searchScopeLibrary" | "searchScopeArchive";
}[] = [
	{ key: "site", labelKey: "searchScopeMain" },
	{ key: "library", labelKey: "searchScopeLibrary" },
	{ key: "archive", labelKey: "searchScopeArchive" },
];

const ALL_SOURCES_ON: Record<SearchSource, boolean> = {
	site: true,
	library: true,
	archive: true,
};

const SEARCH_SECTION_LABEL_KEYS: Record<ClientSearchSectionKey, string> = {
	projects: "projects",
	news: "news",
	videos: "video",
	writings: "writings",
	soundTracks: "sound",
	imageCollections: "gallery",
};

/** Content types the ماڵپەر results can be narrowed to — all on by default. */
const SEARCH_TYPE_KEYS: ClientSearchSectionKey[] = [
	"projects",
	"news",
	"videos",
	"writings",
	"soundTracks",
	"imageCollections",
];

const ALL_TYPES_ON = Object.fromEntries(
	SEARCH_TYPE_KEYS.map((key) => [key, true]),
) as Record<ClientSearchSectionKey, boolean>;

/** Keeps overlay copy readable when background photos run bright. */
const overlayTextShadow =
	"[text-shadow:0_1px_2px_color-mix(in_oklch,var(--color-foreground)_75%,transparent),0_0_1.75rem_color-mix(in_oklch,var(--color-foreground)_40%,transparent)]";

const scrollbarHiddenClass =
	"[scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden";

type MenuSearchProps = {
	onBack: () => void;
	onNavigate: () => void;
};

/** Checkbox chip for one search source — a real checkbox, styled for the overlay. */
function SearchSourceCheckbox({
	label,
	checked,
	onChange,
}: {
	label: string;
	checked: boolean;
	onChange: (next: boolean) => void;
}) {
	return (
		<label
			className={cn(
				"group/source inline-flex h-11 cursor-pointer select-none items-center gap-2.5 border px-4",
				"text-small font-medium backdrop-blur-[2px] transition-colors duration-200",
				checked
					? "border-primary-foreground/75 bg-primary-foreground/12 text-primary-foreground"
					: "border-primary-foreground/30 bg-primary-foreground/5 text-primary-foreground/65 hover:border-primary-foreground/55 hover:text-primary-foreground/85",
				"has-[:focus-visible]:outline has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-primary-foreground",
				overlayTextShadow,
			)}
		>
			<input
				type="checkbox"
				checked={checked}
				onChange={(event) => onChange(event.target.checked)}
				className="visually-hidden"
			/>
			<span
				aria-hidden
				className={cn(
					"flex size-4 shrink-0 items-center justify-center border transition-colors duration-200",
					checked
						? "border-primary-foreground bg-primary-foreground"
						: "border-primary-foreground/50 bg-transparent group-hover/source:border-primary-foreground/75",
				)}
			>
				<CheckIcon
					className={cn(
						"size-3.5 text-foreground transition-opacity duration-150",
						checked ? "opacity-100" : "opacity-0",
					)}
				/>
			</span>
			{label}
		</label>
	);
}

/** Content-type filter for ماڵپەر results — dropdown of checkboxes. */
function SearchTypeFilter({
	buttonLabel,
	listLabel,
	options,
	onToggle,
}: {
	buttonLabel: string;
	listLabel: string;
	options: { key: ClientSearchSectionKey; label: string; checked: boolean }[];
	onToggle: (key: ClientSearchSectionKey, next: boolean) => void;
}) {
	const [open, setOpen] = useState(false);
	const wrapRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		if (!open) return;

		function onPointerDown(event: PointerEvent) {
			if (!wrapRef.current?.contains(event.target as Node)) {
				setOpen(false);
			}
		}
		function onKeyDown(event: KeyboardEvent) {
			if (event.key === "Escape") {
				setOpen(false);
			}
		}

		document.addEventListener("pointerdown", onPointerDown);
		document.addEventListener("keydown", onKeyDown);
		return () => {
			document.removeEventListener("pointerdown", onPointerDown);
			document.removeEventListener("keydown", onKeyDown);
		};
	}, [open]);

	return (
		<div ref={wrapRef} className="relative">
			<button
				type="button"
				aria-haspopup="true"
				aria-expanded={open}
				aria-label={listLabel}
				onClick={() => setOpen((current) => !current)}
				className={cn(
					"inline-flex h-11 cursor-pointer select-none items-center gap-2.5 border px-4",
					"text-small font-medium backdrop-blur-[2px] transition-colors duration-200",
					open
						? "border-primary-foreground/75 bg-primary-foreground/12 text-primary-foreground"
						: "border-primary-foreground/30 bg-primary-foreground/5 text-primary-foreground/75 hover:border-primary-foreground/55 hover:text-primary-foreground",
					"focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-foreground",
					overlayTextShadow,
				)}
			>
				{buttonLabel}
				<ChevronDownIcon
					className={cn(
						"size-4 shrink-0 transition-transform duration-200",
						open && "rotate-180",
					)}
				/>
			</button>

			{open ? (
				<div
					className={cn(
						"absolute start-0 top-[calc(100%+0.375rem)] z-30 min-w-[13rem] border py-1",
						"border-primary-foreground/30 bg-foreground/95 backdrop-blur-md",
						"shadow-[0_12px_32px_color-mix(in_oklch,var(--color-foreground)_60%,transparent)]",
					)}
				>
					{options.map((option) => (
						<label
							key={option.key}
							className={cn(
								"group/type flex h-10 cursor-pointer select-none items-center gap-2.5 px-3.5",
								"text-small transition-colors duration-150",
								option.checked
									? "text-primary-foreground"
									: "text-primary-foreground/60 hover:text-primary-foreground/85",
								"hover:bg-primary-foreground/8",
								"has-[:focus-visible]:outline has-[:focus-visible]:outline-2 has-[:focus-visible]:-outline-offset-2 has-[:focus-visible]:outline-primary-foreground",
							)}
						>
							<input
								type="checkbox"
								checked={option.checked}
								onChange={(event) => onToggle(option.key, event.target.checked)}
								className="visually-hidden"
							/>
							<span
								aria-hidden
								className={cn(
									"flex size-4 shrink-0 items-center justify-center border transition-colors duration-150",
									option.checked
										? "border-primary-foreground bg-primary-foreground"
										: "border-primary-foreground/50 group-hover/type:border-primary-foreground/75",
								)}
							>
								<CheckIcon
									className={cn(
										"size-3.5 text-foreground transition-opacity duration-150",
										option.checked ? "opacity-100" : "opacity-0",
									)}
								/>
							</span>
							{option.label}
						</label>
					))}
				</div>
			) : null}
		</div>
	);
}

/** Scope-tier heading — sits above the per-content-type groups. */
function SearchSourceHeading({ label }: { label: string }) {
	return (
		<div className="mb-3 flex items-center gap-3">
			<h4
				className={cn(
					"shrink-0 text-small font-semibold text-primary-foreground/85",
					overlayTextShadow,
				)}
			>
				{label}
			</h4>
			<span aria-hidden className="h-px flex-1 bg-primary-foreground/20" />
		</div>
	);
}

/** Placeholder section for sources whose API is not wired up yet. */
function SearchSourcePlaceholder({
	label,
	note,
}: {
	label: string;
	note: string;
}) {
	return (
		<section>
			<SearchSourceHeading label={label} />
			<p
				className={cn(
					"py-1 text-small text-primary-foreground/50",
					overlayTextShadow,
				)}
			>
				{note}
			</p>
		</section>
	);
}

/** Real CMS results, grouped by content type. */
function SearchResultsList({
	groups,
	onNavigate,
	getSectionLabel,
}: {
	groups: { key: ClientSearchSectionKey; items: ClientSearchItem[] }[];
	onNavigate: () => void;
	getSectionLabel: (key: ClientSearchSectionKey) => string;
}) {
	return (
		<div className="flex flex-col gap-6">
			{groups.map((group) => (
				<section key={group.key}>
					<h5
						className={cn(
							"mb-1 text-small font-medium text-primary-foreground/55",
							overlayTextShadow,
						)}
					>
						{getSectionLabel(group.key)}
					</h5>
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
										"group/result flex cursor-pointer items-center justify-between gap-3 py-3",
										"text-primary-foreground/80 transition-colors hover:text-primary-foreground",
										overlayTextShadow,
									)}
								>
									<span className="min-w-0 flex-1">
										<span className="block text-body">{result.label}</span>
										{result.description ? (
											<span className="mt-1 block truncate text-small text-primary-foreground/45">
												{result.description}
											</span>
										) : null}
									</span>
									<DirectionalIcon
										icon={ArrowRightIcon}
										className={cn(
											"size-4 shrink-0 text-primary-foreground opacity-0 transition-opacity duration-300",
											"group-hover/result:opacity-70 group-focus-visible/result:opacity-70",
											"motion-reduce:transition-none",
										)}
									/>
								</Link>
							</li>
						))}
					</ul>
				</section>
			))}
		</div>
	);
}

/** In-overlay search — real CMS content only, scoped by source + content type. */
export function MenuSearch({ onBack, onNavigate }: MenuSearchProps) {
	const t = useTranslations("Nav");
	const locale = useLocale();
	const reduceMotion = useReducedMotion();
	const [isExpanded, setIsExpanded] = useState(false);

	const [query, setQuery] = useState("");
	const [submitted, setSubmitted] = useState(false);
	const [apiResults, setApiResults] = useState<ClientSearchItem[] | null>(null);
	const [isLoading, setIsLoading] = useState(false);
	const [contentSearchUnavailable, setContentSearchUnavailable] =
		useState(false);
	// All sources checked by default; only `site` is queryable today.
	const [sources, setSources] =
		useState<Record<SearchSource, boolean>>(ALL_SOURCES_ON);
	const [typeFilter, setTypeFilter] =
		useState<Record<ClientSearchSectionKey, boolean>>(ALL_TYPES_ON);

	const trimmedQuery = query.trim();
	const hasQuery = trimmedQuery.length > 0;
	const isSearching = trimmedQuery.length >= MIN_QUERY_LENGTH;
	const showError = submitted && trimmedQuery.length < MIN_QUERY_LENGTH;

	const filteredGroups = useMemo(() => {
		if (!apiResults) {
			return [];
		}
		return groupSearchItems(apiResults).filter(
			(group) => typeFilter[group.key],
		);
	}, [apiResults, typeFilter]);

	useEffect(() => {
		if (!isSearching || !sources.site) {
			setApiResults(null);
			setIsLoading(false);
			setContentSearchUnavailable(false);
			return;
		}

		const controller = new AbortController();
		// Pending from the moment the debounce is scheduled — otherwise the empty
		// state flashes "no results" for 300ms before the fetch even starts.
		setIsLoading(true);
		const timeoutId = window.setTimeout(async () => {
			try {
				const { items, unavailable } = await fetchGlobalSearch(
					trimmedQuery,
					locale,
					SEARCH_SCOPE,
				);
				if (controller.signal.aborted) {
					return;
				}
				setContentSearchUnavailable(unavailable);
				setApiResults(items.length > 0 ? items : null);
			} catch {
				if (!controller.signal.aborted) {
					setContentSearchUnavailable(true);
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
	}, [isSearching, locale, sources.site, trimmedQuery]);

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

	const hasApiResults = filteredGroups.length > 0;
	const noSourceSelected =
		!sources.site && !sources.library && !sources.archive;
	// The site scope heading only earns its keep next to other source sections.
	const showSourceHeadings = sources.library || sources.archive;
	const showEmptyState =
		isSearching && sources.site && !isLoading && !hasApiResults;

	const selectedTypeCount = SEARCH_TYPE_KEYS.filter(
		(key) => typeFilter[key],
	).length;
	const filterButtonLabel =
		selectedTypeCount === SEARCH_TYPE_KEYS.length
			? t("searchFilterAll")
			: t("searchFilterCount", { count: selectedTypeCount });

	const toggleSource = (key: SearchSource, next: boolean) => {
		setSources((prev) => ({ ...prev, [key]: next }));
	};

	const toggleType = (key: ClientSearchSectionKey, next: boolean) => {
		setTypeFilter((prev) => ({ ...prev, [key]: next }));
	};

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
							className="w-full min-w-0"
						/>

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

						<div className="mt-1 flex flex-wrap items-center gap-2 sm:gap-2.5">
							<fieldset className="contents">
								<legend className="visually-hidden">
									{t("searchScopeLabel")}
								</legend>
								{SEARCH_SOURCES.map((source) => (
									<SearchSourceCheckbox
										key={source.key}
										label={t(source.labelKey)}
										checked={sources[source.key]}
										onChange={(next) => toggleSource(source.key, next)}
									/>
								))}
							</fieldset>

							{sources.site ? (
								<SearchTypeFilter
									buttonLabel={filterButtonLabel}
									listLabel={t("searchFilterLabel")}
									options={SEARCH_TYPE_KEYS.map((key) => ({
										key,
										label: getSectionLabel(key),
										checked: typeFilter[key],
									}))}
									onToggle={toggleType}
								/>
							) : null}
						</div>
					</form>
				</div>

				{isSearching ? (
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
							{t("searchResults")}
						</h3>

						<div
							className={cn(
								isExpanded &&
									"min-h-0 flex-1 overflow-y-auto overscroll-contain",
								isExpanded && scrollbarHiddenClass,
							)}
						>
							{noSourceSelected ? (
								<p
									className={cn(
										"py-3 text-body text-primary-foreground/55",
										overlayTextShadow,
									)}
								>
									{t("searchScopeNoneSelected")}
								</p>
							) : (
								<div className="flex flex-col gap-7 pb-4">
									{sources.site ? (
										<div>
											{showSourceHeadings ? (
												<SearchSourceHeading label={t("searchScopeMain")} />
											) : null}

											{isLoading ? (
												<p
													className={cn(
														"py-3 text-body text-primary-foreground/55",
														overlayTextShadow,
													)}
												>
													{t("searchLoading")}
												</p>
											) : null}

											{contentSearchUnavailable && !isLoading ? (
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
													groups={filteredGroups}
													onNavigate={onNavigate}
													getSectionLabel={getSectionLabel}
												/>
											) : null}

											{showEmptyState && !contentSearchUnavailable ? (
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
									) : null}

									{sources.library ? (
										<SearchSourcePlaceholder
											label={t("searchScopeLibrary")}
											note={t("searchScopeComingSoon")}
										/>
									) : null}

									{sources.archive ? (
										<SearchSourcePlaceholder
											label={t("searchScopeArchive")}
											note={t("searchScopeComingSoon")}
										/>
									) : null}
								</div>
							)}
						</div>
					</section>
				) : null}
			</div>

			<div
				aria-hidden
				className={spacerClass}
				style={{ flexGrow: hasQuery ? 0 : 1 }}
			/>
		</div>
	);
}
