"use client";

import {
	type ComponentProps,
	createContext,
	type MouseEvent,
	type ReactNode,
	useCallback,
	useContext,
	useMemo,
	useTransition,
} from "react";
import { Link, useRouter } from "@/i18n/navigation";
import { scrollToSection } from "@/lib/scroll-to-section";
import { cn } from "@/lib/utils";

/**
 * Shared pending state for the /search page. Every tab, facet, chip, sort and
 * pager is a REAL link (crawlable, cmd-clickable); a plain left click is
 * intercepted into a router transition so the results region can dim instead
 * of the page freezing with no feedback.
 */

type SearchTransition = {
	pending: boolean;
	navigate: (href: string, options?: { scrollTo?: string }) => void;
};

const SearchTransitionContext = createContext<SearchTransition | null>(null);

export function SearchTransitionProvider({
	children,
}: {
	children: ReactNode;
}) {
	const router = useRouter();
	const [pending, startTransition] = useTransition();

	const navigate = useCallback(
		(href: string, options?: { scrollTo?: string }) => {
			startTransition(() => {
				router.push(href, { scroll: false });
			});
			if (options?.scrollTo) {
				scrollToSection(options.scrollTo);
			}
		},
		[router],
	);

	const value = useMemo(() => ({ pending, navigate }), [pending, navigate]);

	return (
		<SearchTransitionContext.Provider value={value}>
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

/** Locale-aware link that routes through the shared search transition. */
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
		transition.navigate(href, { scrollTo });
	};

	return (
		<Link href={href} onClick={handleClick} {...props}>
			{children}
		</Link>
	);
}

/**
 * The area that dims while a search navigation is in flight. `aria-busy` keeps
 * assistive tech informed; pointer events stay ON so a second click (e.g.
 * switching tabs again) is never swallowed.
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
				"relative transition-opacity duration-200",
				pending && "opacity-55",
				className,
			)}
		>
			{pending ? (
				<span
					aria-hidden
					className="absolute inset-x-0 -top-px z-10 block h-0.5 animate-pulse bg-primary"
				/>
			) : null}
			{children}
		</div>
	);
}
