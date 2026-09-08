"use client";

import {
	MagnifyingGlassIcon,
	RectangleStackIcon,
	TagIcon,
	UserIcon,
	XMarkIcon,
} from "@heroicons/react/24/outline";
import { useLocale, useTranslations } from "next-intl";
import {
	type FormEvent,
	type KeyboardEvent,
	useEffect,
	useId,
	useRef,
	useState,
} from "react";
import { KindIcon } from "@/components/search/kind-icon";
import {
	SearchNavLink,
	useSearchTransition,
} from "@/components/search/search-transition";
import {
	SOURCE_LABEL_KEYS,
	SOURCE_ORDER,
} from "@/components/search/source-links";
import { SEARCH_SCOPES } from "@/config/site";
import { useRouter } from "@/i18n/navigation";
import {
	PLATFORM_MEDIA_KINDS,
	type PlatformMediaKind,
} from "@/lib/platform/constants";
import { humanizePlatformName, isPlatformCode } from "@/lib/platform/display";
import { formatCount } from "@/lib/platform/format";
import {
	buildSearchHref,
	EMPTY_FILTERS,
	platformDetailHref,
	type SearchPageState,
} from "@/lib/platform/search-url";
import { cn } from "@/lib/utils";
import type { PlatformSuggestion } from "@/types/platform";

const MIN_SUGGEST_LENGTH = 2;
const SUGGEST_DEBOUNCE_MS = 300;
const SUGGEST_LIMIT = 8;

type SearchHeaderProps = {
	state: SearchPageState;
};

function isMediaKind(kind: string): kind is PlatformMediaKind {
	return PLATFORM_MEDIA_KINDS.includes(kind as PlatformMediaKind);
}

/** Where one accepted suggestion navigates to. */
function suggestionHref(suggestion: PlatformSuggestion): string {
	if (isMediaKind(suggestion.kind)) {
		return platformDetailHref(suggestion.kind, suggestion.code);
	}
	const filters = { ...EMPTY_FILTERS };
	if (suggestion.kind === "person") {
		filters.personCode = suggestion.code;
	} else if (suggestion.kind === "project") {
		filters.projectCode = suggestion.code;
	}
	// Categories have no dedicated facet on this page; fall back to the name.
	if (suggestion.kind === "category") {
		return buildSearchHref({ source: "archive", q: suggestion.value, filters });
	}
	return buildSearchHref({ source: "archive", filters });
}

/** Project suggestions arrive as folder slugs; readers get the spaced form. */
function suggestionLabel(suggestion: PlatformSuggestion): string {
	return suggestion.kind === "project"
		? (humanizePlatformName(suggestion.value) ?? suggestion.value)
		: suggestion.value;
}

/** The glyph in a suggestion's tile: the media kind, else what the row is. */
function SuggestionTileIcon({ kind }: { kind: string }) {
	if (isMediaKind(kind)) {
		return <KindIcon kind={kind} />;
	}
	switch (kind) {
		case "person":
			return <UserIcon aria-hidden />;
		case "project":
			return <RectangleStackIcon aria-hidden />;
		case "category":
			return <TagIcon aria-hidden />;
		default:
			return <MagnifyingGlassIcon aria-hidden />;
	}
}

/**
 * The source switcher — ماڵپەر / پلاتفۆڕم / کتێبخانە — living INSIDE the
 * command bar. Rendered twice by the bar (a row of cells beside the input on
 * `sm+`, a three-column strip under it on phones) and never reordered with
 * flex order: only one instance is displayed, so only one is in the
 * accessibility tree. Switching keeps the query and drops everything that
 * described the previous source's result set (kind, sort, refinements, page).
 */
function ScopeSegment({
	state,
	className,
}: {
	state: SearchPageState;
	className?: string;
}) {
	const t = useTranslations("Search");

	return (
		<nav aria-label={t("sourceLabel")} className={cn(className)}>
			<ul className="contents sm:flex">
				{SOURCE_ORDER.filter((source) => SEARCH_SCOPES.includes(source)).map(
					(source) => {
						const active = state.source === source;
						return (
							<li
								key={source}
								className="contents sm:[&:not(:last-child)>a]:border-e sm:[&:not(:last-child)>a]:border-border"
							>
								<SearchNavLink
									href={buildSearchHref({
										source,
										q: state.q,
										filters: EMPTY_FILTERS,
									})}
									aria-current={active ? "page" : undefined}
									className={cn(
										"inline-flex h-11 items-center justify-center gap-1.5 px-3 font-heading text-small font-semibold",
										"transition-colors duration-200 focus-visible:outline-offset-[-3px] sm:h-full sm:px-4",
										active
											? "bg-primary text-primary-foreground"
											: "text-muted fine-hover:bg-sunken fine-hover:text-foreground",
									)}
								>
									<span className="line-clamp-1 [overflow-wrap:anywhere]">
										{t(SOURCE_LABEL_KEYS[source])}
									</span>
									{source === "library" ? (
										<span className="visually-hidden">
											{t("librarySoonTitle")}
										</span>
									) : null}
								</SearchNavLink>
							</li>
						);
					},
				)}
			</ul>
		</nav>
	);
}

/**
 * The page's command bar: one crisp bordered box on the paper holding the
 * scope segment, the query field, its clear control and the green submit —
 * with platform autocomplete floating beneath it (the page's only floating
 * element). A submitted query keeps the source and kind tab but resets sort,
 * page and refinements: they described the previous result set.
 */
export function SearchHeader({ state }: SearchHeaderProps) {
	const t = useTranslations("Search");
	const locale = useLocale();
	const router = useRouter();
	const transition = useSearchTransition();
	const listboxId = useId();
	const inputRef = useRef<HTMLInputElement>(null);
	const wrapRef = useRef<HTMLDivElement>(null);
	const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
	const openRef = useRef(false);

	const [query, setQuery] = useState(state.q);
	const [suggestions, setSuggestions] = useState<PlatformSuggestion[]>([]);
	const [open, setOpen] = useState(false);
	const [activeIndex, setActiveIndex] = useState(-1);
	// How many suggestions the list held when it last OPENED — the status
	// line speaks that once, not on every keystroke while it stays open.
	const [openedCount, setOpenedCount] = useState(0);

	// The URL is the source of truth — a back/forward navigation resyncs the field.
	useEffect(() => {
		setQuery(state.q);
	}, [state.q]);

	useEffect(() => {
		openRef.current = open;
	}, [open]);

	// Platform autocomplete only makes sense against the platform.
	const suggestEnabled = state.source === "archive";

	useEffect(() => {
		if (!suggestEnabled) {
			return;
		}
		const trimmed = query.trim();
		if (trimmed.length < MIN_SUGGEST_LENGTH || trimmed === state.q.trim()) {
			setSuggestions([]);
			setOpen(false);
			return;
		}

		const controller = new AbortController();
		debounceRef.current = setTimeout(async () => {
			try {
				const params = new URLSearchParams({
					q: trimmed,
					limit: String(SUGGEST_LIMIT),
				});
				const response = await fetch(`/api/platform-suggest?${params}`, {
					signal: controller.signal,
				});
				if (!response.ok) {
					return;
				}
				const payload: { data?: PlatformSuggestion[] } = await response.json();
				if (controller.signal.aborted) {
					return;
				}
				// Item codes are routing keys, never copy — a suggestion that
				// is only its code has nothing to show.
				const items = (payload.data ?? []).filter(
					(suggestion) => !isPlatformCode(suggestion.value, suggestion.code),
				);
				setSuggestions(items);
				setActiveIndex(-1);
				if (items.length > 0 && !openRef.current) {
					setOpenedCount(items.length);
				}
				setOpen(items.length > 0);
			} catch {
				// Autocomplete is a convenience — a failed fetch just stays quiet.
			}
		}, SUGGEST_DEBOUNCE_MS);

		return () => {
			controller.abort();
			if (debounceRef.current) {
				clearTimeout(debounceRef.current);
			}
		};
	}, [query, state.q, suggestEnabled]);

	// Click-away closes the listbox.
	useEffect(() => {
		if (!open) {
			return;
		}
		function onPointerDown(event: PointerEvent) {
			if (!wrapRef.current?.contains(event.target as Node)) {
				setOpen(false);
			}
		}
		document.addEventListener("pointerdown", onPointerDown);
		return () => document.removeEventListener("pointerdown", onPointerDown);
	}, [open]);

	function submitQuery(value: string) {
		setOpen(false);
		const href = buildSearchHref({
			source: state.source,
			q: value.trim(),
			kind: state.kind,
			filters: EMPTY_FILTERS,
		});
		// Through the shared transition when the page provides one, so the
		// results dim and the new summary is announced like every other change.
		if (transition) {
			transition.navigate(href);
		} else {
			router.push(href, { scroll: false });
		}
	}

	function acceptSuggestion(suggestion: PlatformSuggestion) {
		setOpen(false);
		setQuery(suggestionLabel(suggestion));
		router.push(suggestionHref(suggestion));
	}

	function onSubmit(event: FormEvent<HTMLFormElement>) {
		event.preventDefault();
		if (activeIndex >= 0 && suggestions[activeIndex]) {
			acceptSuggestion(suggestions[activeIndex]);
			return;
		}
		submitQuery(query);
	}

	function onKeyDown(event: KeyboardEvent<HTMLInputElement>) {
		if (!open || suggestions.length === 0) {
			return;
		}
		if (event.key === "ArrowDown") {
			event.preventDefault();
			setActiveIndex((index) => (index + 1) % suggestions.length);
		} else if (event.key === "ArrowUp") {
			event.preventDefault();
			setActiveIndex(
				(index) => (index - 1 + suggestions.length) % suggestions.length,
			);
		} else if (event.key === "Home") {
			event.preventDefault();
			setActiveIndex(0);
		} else if (event.key === "End") {
			event.preventDefault();
			setActiveIndex(suggestions.length - 1);
		} else if (event.key === "Escape") {
			setOpen(false);
			setActiveIndex(-1);
		}
	}

	function suggestionKindLabel(kind: string): string {
		switch (kind) {
			case "person":
				return t("suggestKindPerson");
			case "project":
				return t("suggestKindProject");
			case "category":
				return t("suggestKindCategory");
			case "audio":
				return t("kindAudio");
			case "video":
				return t("kindVideo");
			case "image":
				return t("kindImage");
			case "text":
				return t("kindText");
			default:
				return kind;
		}
	}

	const showClear = query.trim().length > 0;

	return (
		<div ref={wrapRef} className="relative mt-3 sm:mt-4">
			<form
				onSubmit={onSubmit}
				className={cn(
					"group/bar flex flex-col border border-border-strong bg-surface transition-colors duration-200",
					"focus-within:border-foreground sm:h-14 sm:flex-row sm:items-stretch",
				)}
			>
				{/* Scope segment, sm+ — DOM first so it is focused first. */}
				<ScopeSegment
					state={state}
					className="hidden sm:flex sm:border-e sm:border-border"
				/>

				<div className="flex h-12 min-w-0 flex-1 items-center sm:h-full">
					<MagnifyingGlassIcon
						aria-hidden
						className="ms-3.5 size-5 shrink-0 text-muted transition-colors group-focus-within/bar:text-foreground sm:ms-4"
					/>
					<label htmlFor="search-page-input" className="visually-hidden">
						{t("inputLabel")}
					</label>
					<input
						ref={inputRef}
						id="search-page-input"
						name="q"
						type="search"
						autoComplete="off"
						spellCheck={false}
						enterKeyHint="search"
						value={query}
						placeholder={
							state.source === "main"
								? t("inputPlaceholderMain")
								: t("inputPlaceholder")
						}
						onChange={(event) => setQuery(event.target.value)}
						onKeyDown={onKeyDown}
						role="combobox"
						aria-expanded={open}
						aria-controls={open ? listboxId : undefined}
						aria-activedescendant={
							activeIndex >= 0 ? `${listboxId}-${activeIndex}` : undefined
						}
						className={cn(
							"h-full min-w-0 flex-1 bg-transparent px-3 font-heading text-lead font-semibold text-foreground",
							"placeholder:font-normal placeholder:text-muted focus-visible:outline-none sm:text-h3",
							"[&::-webkit-search-cancel-button]:hidden [&::-webkit-search-decoration]:hidden",
						)}
					/>

					{showClear ? (
						<button
							type="button"
							onClick={() => {
								setQuery("");
								setOpen(false);
								inputRef.current?.focus();
								if (state.q.trim()) {
									submitQuery("");
								}
							}}
							aria-label={t("clearQuery")}
							className={cn(
								"inline-flex h-full w-11 shrink-0 items-center justify-center text-muted transition-colors",
								"fine-hover:text-foreground focus-visible:outline-offset-[-3px]",
							)}
						>
							<XMarkIcon className="size-5" aria-hidden />
						</button>
					) : null}

					<button
						type="submit"
						className={cn(
							"inline-flex h-full w-12 shrink-0 items-center justify-center gap-2.5 bg-primary font-heading text-small font-semibold",
							"text-primary-foreground transition-opacity fine-hover:opacity-90 focus-visible:outline-offset-[-3px] sm:w-auto sm:px-6",
						)}
					>
						<MagnifyingGlassIcon className="size-5 sm:hidden" aria-hidden />
						<span className="hidden sm:inline">{t("submit")}</span>
						<span className="visually-hidden sm:hidden">{t("submit")}</span>
					</button>
				</div>

				{/* Scope segment, <640 — rendered a second time under the input
				    row; the sm+ instance above is display:none here, so only
				    one <nav> is ever in the accessibility tree. */}
				<ScopeSegment
					state={state}
					className="grid grid-cols-3 border-t border-border sm:hidden"
				/>
			</form>

			{/* Spoken once per opening of the list — silent while it stays open. */}
			<div
				role="status"
				aria-live="polite"
				aria-atomic="true"
				className="visually-hidden"
			>
				{open
					? t("suggestCount", { count: formatCount(locale, openedCount) })
					: null}
			</div>

			{open ? (
				<div
					id={listboxId}
					role="listbox"
					aria-label={t("suggestLabel")}
					className={cn(
						"search-pop absolute inset-x-0 top-[calc(100%+0.25rem)] z-30 max-h-[50dvh] overflow-y-auto overscroll-contain",
						"border border-border-strong bg-surface py-1",
						"shadow-[0_16px_40px_-16px_color-mix(in_oklch,var(--color-foreground)_35%,transparent)]",
					)}
				>
					{suggestions.map((suggestion, index) => (
						<button
							key={`${suggestion.kind}-${suggestion.code}`}
							type="button"
							role="option"
							id={`${listboxId}-${index}`}
							aria-selected={index === activeIndex}
							tabIndex={-1}
							onMouseDown={(event) => event.preventDefault()}
							onClick={() => acceptSuggestion(suggestion)}
							onMouseEnter={() => setActiveIndex(index)}
							className={cn(
								"relative flex min-h-11 w-full items-center gap-3 px-3 py-2 text-start transition-colors sm:min-h-10",
								"before:absolute before:inset-y-1 before:start-0 before:w-0.5 before:bg-primary before:opacity-0 before:transition-opacity",
								"aria-selected:bg-sunken aria-selected:before:opacity-100 fine-hover:bg-sunken",
							)}
						>
							<span className="flex size-8 shrink-0 items-center justify-center bg-sunken text-muted [&_svg]:size-4">
								<SuggestionTileIcon kind={suggestion.kind} />
							</span>
							<span className="min-w-0 flex-1 line-clamp-1 text-start text-body text-foreground [overflow-wrap:anywhere]">
								<bdi>{suggestionLabel(suggestion)}</bdi>
							</span>
							<span className="label shrink-0">
								{suggestionKindLabel(suggestion.kind)}
							</span>
						</button>
					))}
				</div>
			) : null}
		</div>
	);
}
