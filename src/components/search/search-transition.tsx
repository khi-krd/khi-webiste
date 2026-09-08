"use client";

import { useTranslations } from "next-intl";
import {
	type ComponentProps,
	createContext,
	type MouseEvent,
	type ReactNode,
	useCallback,
	useContext,
	useEffect,
	useMemo,
	useRef,
	useState,
	useTransition,
} from "react";
import { Link, useRouter } from "@/i18n/navigation";
import { scrollToSection } from "@/lib/scroll-to-section";
import { cn } from "@/lib/utils";

/**
 * Shared client state for the /search page — the ONLY client state it has.
 *
 * Every tab, facet, chip, sort and pager is a REAL link (crawlable,
 * cmd-clickable); a plain left click is intercepted into a router transition
 * so the results region can dim instead of the page freezing with no feedback.
 *
 * The results subtree lives inside a keyed <Suspense>, so it REMOUNTS on every
 * state change. Anything that must survive that — which control had focus,
 * whether the mobile refine panel is open, which facet groups the visitor
 * folded — lives here, above the boundary, and never in the DOM.
 */

/** Quick transitions stay silent; only a noticeably long one says "loading". */
const LOADING_ANNOUNCE_DELAY_MS = 400;

/** The results summary heading — the focus fallback after a navigation. */
export const RESULTS_SUMMARY_ID = "search-results-summary";

type NavigateOptions = {
	/** Scroll this section id into view alongside the navigation. */
	scrollTo?: string;
	/**
	 * `data-focus-key` of the control that triggered the navigation. After the
	 * new results mount, focus returns to the control carrying the same key.
	 */
	focusKey?: string;
};

type SearchTransition = {
	pending: boolean;
	navigate: (href: string, options?: NavigateOptions) => void;
	/** Mobile / tablet inline refine panel. */
	refineOpen: boolean;
	setRefineOpen: (open: boolean) => void;
	/** Explicit fold/unfold choices per facet group; `fallback` = default rule. */
	isGroupOpen: (key: string, fallback: boolean) => boolean;
	setGroupOpen: (key: string, open: boolean) => void;
	/** Returns and clears the stored focus key (stable identity). */
	takeFocusKey: () => string | null;
	/** Speak through the page's live region (stable identity). */
	announce: (text: string) => void;
};

const SearchTransitionContext = createContext<SearchTransition | null>(null);

export function SearchTransitionProvider({
	source,
	children,
}: {
	/** Active search source — a new source has different facets. */
	source: string;
	children: ReactNode;
}) {
	const t = useTranslations("Search");
	const router = useRouter();
	const [pending, startTransition] = useTransition();
	const [refineOpen, setRefineOpen] = useState(false);
	const [openGroups, setOpenGroups] = useState<ReadonlyMap<string, boolean>>(
		() => new Map(),
	);
	const [announcement, setAnnouncement] = useState("");
	const focusKeyRef = useRef<string | null>(null);
	const navigatedRef = useRef(false);
	const announceFrameRef = useRef<number | null>(null);

	// Switching source forgets the panel state (React's adjust-during-render
	// pattern: no effect, no extra commit).
	const [seenSource, setSeenSource] = useState(source);
	if (seenSource !== source) {
		setSeenSource(source);
		setRefineOpen(false);
		setOpenGroups(new Map());
	}

	const announce = useCallback((text: string) => {
		// Only after the visitor has actually navigated: a hard load already
		// reads the page; repeating its summary would be noise.
		if (!navigatedRef.current) {
			return;
		}
		// Clear, then set on the next frame, so an identical text re-announces.
		setAnnouncement("");
		if (announceFrameRef.current != null) {
			cancelAnimationFrame(announceFrameRef.current);
		}
		announceFrameRef.current = requestAnimationFrame(() => {
			announceFrameRef.current = null;
			setAnnouncement(text);
		});
	}, []);

	useEffect(
		() => () => {
			if (announceFrameRef.current != null) {
				cancelAnimationFrame(announceFrameRef.current);
			}
		},
		[],
	);

	useEffect(() => {
		if (!pending) {
			return;
		}
		const id = window.setTimeout(
			() => announce(t("loading")),
			LOADING_ANNOUNCE_DELAY_MS,
		);
		return () => window.clearTimeout(id);
	}, [pending, announce, t]);

	const navigate = useCallback(
		(href: string, options?: NavigateOptions) => {
			navigatedRef.current = true;
			focusKeyRef.current = options?.focusKey ?? null;
			startTransition(() => {
				router.push(href, { scroll: false });
			});
			if (options?.scrollTo) {
				scrollToSection(options.scrollTo);
			}
		},
		[router],
	);

	const takeFocusKey = useCallback(() => {
		const key = focusKeyRef.current;
		focusKeyRef.current = null;
		return key;
	}, []);

	const isGroupOpen = useCallback(
		(key: string, fallback: boolean) => openGroups.get(key) ?? fallback,
		[openGroups],
	);

	const setGroupOpen = useCallback((key: string, open: boolean) => {
		setOpenGroups((current) => {
			const next = new Map(current);
			next.set(key, open);
			return next;
		});
	}, []);

	const value = useMemo<SearchTransition>(
		() => ({
			pending,
			navigate,
			refineOpen,
			setRefineOpen,
			isGroupOpen,
			setGroupOpen,
			takeFocusKey,
			announce,
		}),
		[
			pending,
			navigate,
			refineOpen,
			isGroupOpen,
			setGroupOpen,
			takeFocusKey,
			announce,
		],
	);

	return (
		<SearchTransitionContext.Provider value={value}>
			{/* Outside the Suspense subtree on purpose: a live region that
			    remounts with the results would never be heard. */}
			<div
				role="status"
				aria-live="polite"
				aria-atomic="true"
				className="visually-hidden"
			>
				{announcement}
			</div>
			{children}
		</SearchTransitionContext.Provider>
	);
}

export function useSearchTransition(): SearchTransition | null {
	return useContext(SearchTransitionContext);
}

type SearchNavLinkProps = {
	href: string;
	/** Scroll this section id into view alongside the navigation. */
	scrollTo?: string;
} & Omit<ComponentProps<typeof Link>, "href">;

/**
 * Locale-aware link that routes through the shared search transition. A
 * `data-focus-key` on the link is what brings focus back to it once the new
 * results have mounted.
 */
export function SearchNavLink({
	href,
	scrollTo,
	onClick,
	children,
	...props
}: SearchNavLinkProps) {
	const transition = useSearchTransition();

	const handleClick = (event: MouseEvent<HTMLAnchorElement>) => {
		onClick?.(event);
		if (
			!transition ||
			event.defaultPrevented ||
			event.button !== 0 ||
			event.metaKey ||
			event.ctrlKey ||
			event.shiftKey ||
			event.altKey
		) {
			return;
		}
		event.preventDefault();
		transition.navigate(href, {
			scrollTo,
			focusKey: event.currentTarget.dataset.focusKey,
		});
	};

	return (
		<Link href={href} onClick={handleClick} {...props}>
			{children}
		</Link>
	);
}

/**
 * Renders nothing. Mounted at the root of every fresh results tree: moves
 * focus back to the control that triggered the navigation (by
 * `data-focus-key`), else to the results summary. Hard loads stored no key
 * and are left alone.
 */
export function FocusRestore({ rootId }: { rootId: string }) {
	const transition = useSearchTransition();
	// Stable identity — the effect must not re-run when `pending` flips, or
	// the OLD tree would consume the key before the new one mounts.
	const takeFocusKey = transition?.takeFocusKey;

	useEffect(() => {
		const key = takeFocusKey?.();
		if (!key) {
			return;
		}
		const root = document.getElementById(rootId) ?? document;
		const target =
			root.querySelector<HTMLElement>(
				`[data-focus-key="${CSS.escape(key)}"]`,
			) ?? document.getElementById(RESULTS_SUMMARY_ID);
		target?.focus({ preventScroll: true });
	}, [rootId, takeFocusKey]);

	return null;
}

/** Renders nothing. Speaks the new result summary once the results mount. */
export function AnnounceResults({ text }: { text: string }) {
	const transition = useSearchTransition();
	const announce = transition?.announce;

	useEffect(() => {
		announce?.(text);
	}, [announce, text]);

	return null;
}

/**
 * The area that dims while a search navigation is in flight. `aria-busy`
 * keeps assistive tech informed; pointer events stay ON so a second click
 * (e.g. switching tabs again) is never swallowed.
 */
export function SearchPendingRegion({
	children,
	className,
}: {
	children: ReactNode;
	className?: string;
}) {
	const transition = useSearchTransition();
	const pending = transition?.pending ?? false;

	return (
		<div
			aria-busy={pending || undefined}
			className={cn(
				"relative transition-opacity duration-200 delay-75",
				pending && "opacity-60",
				className,
			)}
		>
			{pending ? (
				<span
					aria-hidden
					className="absolute inset-x-0 -top-px z-10 block h-0.5 overflow-hidden"
				>
					<span className="search-scan block h-full w-1/3 bg-primary" />
				</span>
			) : null}
			{children}
		</div>
	);
}
