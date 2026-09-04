"use client";

import { MagnifyingGlassIcon, XMarkIcon } from "@heroicons/react/24/outline";
import { useTranslations } from "next-intl";
import {
	type FormEvent,
	type KeyboardEvent,
	useEffect,
	useId,
	useRef,
	useState,
} from "react";
import { KindIcon } from "@/components/search/kind-icon";
import { useRouter } from "@/i18n/navigation";
import {
	PLATFORM_MEDIA_KINDS,
	type PlatformMediaKind,
} from "@/lib/platform/constants";
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

/**
 * The page's oversized search field — an editorial underline rather than a
 * boxed control — with platform autocomplete beneath it. A submitted query
 * keeps the source and kind tab but resets sort, page and refinements: they
 * described the previous result set.
 */
export function SearchHeader({ state }: SearchHeaderProps) {
	const t = useTranslations("Search");
	const router = useRouter();
	const listboxId = useId();
	const inputRef = useRef<HTMLInputElement>(null);
	const wrapRef = useRef<HTMLDivElement>(null);
	const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

	const [query, setQuery] = useState(state.q);
	const [suggestions, setSuggestions] = useState<PlatformSuggestion[]>([]);
	const [open, setOpen] = useState(false);
	const [activeIndex, setActiveIndex] = useState(-1);

	// The URL is the source of truth — a back/forward navigation resyncs the field.
	useEffect(() => {
		setQuery(state.q);
	}, [state.q]);

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
				const items = payload.data ?? [];
				setSuggestions(items);
				setActiveIndex(-1);
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
		router.push(
			buildSearchHref({
				source: state.source,
				q: value.trim(),
				kind: state.kind,
				filters: EMPTY_FILTERS,
			}),
			{ scroll: false },
		);
	}

	function acceptSuggestion(suggestion: PlatformSuggestion) {
		setOpen(false);
		setQuery(suggestion.value);
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
		<div ref={wrapRef} className="relative">
			<form
				onSubmit={onSubmit}
				className="flex items-end gap-3 border-b-2 border-foreground pb-3 sm:gap-4"
			>
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
					placeholder={t("inputPlaceholder")}
					onChange={(event) => setQuery(event.target.value)}
					onKeyDown={onKeyDown}
					role="combobox"
					aria-expanded={open}
					aria-controls={open ? listboxId : undefined}
					aria-activedescendant={
						activeIndex >= 0 ? `${listboxId}-${activeIndex}` : undefined
					}
					className={cn(
						"min-w-0 flex-1 bg-transparent font-heading font-semibold text-foreground",
						"text-[clamp(1.375rem,2.2vw+0.5rem,2rem)] leading-tight",
						"placeholder:font-normal placeholder:text-muted/70 focus-visible:outline-none",
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
						className="mb-1 inline-flex size-9 shrink-0 items-center justify-center text-muted transition-colors fine-hover:text-foreground"
					>
						<XMarkIcon className="size-5" aria-hidden />
					</button>
				) : null}

				<button
					type="submit"
					className={cn(
						"inline-flex h-12 shrink-0 items-center gap-2.5 bg-primary px-4 text-primary-foreground",
						"font-heading text-small font-semibold transition-opacity fine-hover:opacity-90 sm:px-6",
					)}
				>
					<MagnifyingGlassIcon className="size-5" aria-hidden />
					<span className="hidden sm:inline">{t("submit")}</span>
					<span className="visually-hidden sm:hidden">{t("submit")}</span>
				</button>
			</form>

			{open ? (
				<div
					id={listboxId}
					role="listbox"
					aria-label={t("suggestLabel")}
					className={cn(
						"absolute inset-x-0 top-[calc(100%+0.5rem)] z-30 border border-border bg-surface py-1",
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
								"flex w-full cursor-pointer items-center gap-3 px-4 py-2.5 text-start transition-colors",
								index === activeIndex ? "bg-sunken" : "fine-hover:bg-sunken",
							)}
						>
							{isMediaKind(suggestion.kind) ? (
								<KindIcon
									kind={suggestion.kind}
									className="size-4 shrink-0 text-muted"
								/>
							) : (
								<MagnifyingGlassIcon
									className="size-4 shrink-0 text-muted"
									aria-hidden
								/>
							)}
							<span className="min-w-0 flex-1 line-clamp-1 text-start text-body text-foreground [overflow-wrap:anywhere]">
								<bdi>{suggestion.value}</bdi>
							</span>
							<span className="shrink-0 text-label text-muted">
								{suggestionKindLabel(suggestion.kind)}
							</span>
						</button>
					))}
				</div>
			) : null}
		</div>
	);
}
