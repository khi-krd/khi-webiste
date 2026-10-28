"use client";

import {
	ChevronLeftIcon,
	MagnifyingGlassIcon,
	XMarkIcon,
} from "@heroicons/react/24/outline";
import { useEffect, useRef, useState } from "react";
import { DirectionalIcon } from "@/components/ui/directional-icon";
import { cn } from "@/lib/utils";

/**
 * Shared filter-bar primitives.
 *
 * Every listing page composes the SAME toolbar out of these pieces: the
 * primary browse axis sits in a sideways-scrolling `FilterPillRail` on its own
 * line, and the secondary pills, group labels, selects and the search box flow
 * in one `flex flex-wrap` row beneath it. Nothing expands or collapses.
 */

/** One wrapping row — the whole filter toolbar lives here. */
export function FilterBar({
	label,
	pending = false,
	className,
	children,
}: {
	label: string;
	pending?: boolean;
	className?: string;
	children: React.ReactNode;
}) {
	return (
		<div
			className={cn(
				"flex flex-wrap items-center gap-x-2 gap-y-3 transition-opacity",
				pending && "opacity-80",
				className,
			)}
			role="group"
			aria-label={label}
		>
			{children}
		</div>
	);
}

/** The pill every page was duplicating under its own name. */
export function FilterPill({
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
					: "border-primary bg-background text-foreground fine-hover:bg-sunken",
			)}
		>
			{children}
		</button>
	);
}

/**
 * The primary browse axis (types, genres, topics) on a row of its own: one
 * line that scrolls sideways however many pills the CMS grows to, so it never
 * shoves the sort / select / search controls around. Edges fade where more
 * pills hide, with a chevron to page through them; touch swipes natively.
 * The active pill is brought into view whenever the selection changes.
 */
export function FilterPillRail({
	activeKey,
	className,
	children,
}: {
	/** Changes whenever the selected pill changes — re-centres it. */
	activeKey?: string | number | null;
	className?: string;
	children: React.ReactNode;
}) {
	const scrollerRef = useRef<HTMLDivElement>(null);
	const [edges, setEdges] = useState({ start: false, end: false });

	useEffect(() => {
		const el = scrollerRef.current;
		if (!el) return;
		// |scrollLeft| works in both directions: RTL counts down from 0.
		const update = () => {
			const pos = Math.abs(el.scrollLeft);
			const max = el.scrollWidth - el.clientWidth;
			const next = { start: pos > 1, end: max - pos > 1 };
			setEdges((prev) =>
				prev.start === next.start && prev.end === next.end ? prev : next,
			);
		};
		update();
		el.addEventListener("scroll", update, { passive: true });
		const observer = new ResizeObserver(update);
		observer.observe(el);
		if (el.firstElementChild) observer.observe(el.firstElementChild);
		return () => {
			el.removeEventListener("scroll", update);
			observer.disconnect();
		};
	}, []);

	// biome-ignore lint/correctness/useExhaustiveDependencies: activeKey is the trigger — the active pill is read from the DOM.
	useEffect(() => {
		const el = scrollerRef.current;
		const active = el?.querySelector<HTMLElement>('[aria-pressed="true"]');
		if (!el || !active) return;
		const railBox = el.getBoundingClientRect();
		const pillBox = active.getBoundingClientRect();
		// Raising scrollLeft reveals content further right in LTR and RTL alike.
		el.scrollLeft +=
			pillBox.left + pillBox.width / 2 - (railBox.left + railBox.width / 2);
	}, [activeKey]);

	const page = (towardEnd: boolean) => {
		const el = scrollerRef.current;
		if (!el) return;
		const rtl = getComputedStyle(el).direction === "rtl";
		const reduce = window.matchMedia(
			"(prefers-reduced-motion: reduce)",
		).matches;
		el.scrollBy({
			left: el.clientWidth * 0.75 * (towardEnd !== rtl ? 1 : -1),
			behavior: reduce ? "auto" : "smooth",
		});
	};

	return (
		<div className={cn("relative w-full min-w-0 basis-full", className)}>
			<div
				ref={scrollerRef}
				className="overflow-x-auto overscroll-x-contain [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
			>
				<div className="flex w-max items-center gap-2">{children}</div>
			</div>

			{edges.start ? (
				<RailEdge side="start" onClick={() => page(false)} />
			) : null}
			{edges.end ? <RailEdge side="end" onClick={() => page(true)} /> : null}
		</div>
	);
}

/** Fade + chevron over one end of the rail; pointer convenience only — keyboard users tab along the pills. */
function RailEdge({
	side,
	onClick,
}: {
	side: "start" | "end";
	onClick: () => void;
}) {
	return (
		<div
			className={cn(
				"pointer-events-none absolute inset-y-0 flex w-16 items-center from-background from-45% to-transparent",
				side === "start"
					? "start-0 justify-start bg-linear-to-r rtl:bg-linear-to-l"
					: "end-0 justify-end bg-linear-to-l rtl:bg-linear-to-r",
			)}
		>
			<button
				type="button"
				tabIndex={-1}
				aria-hidden="true"
				onClick={onClick}
				className="pointer-events-auto flex size-9 items-center justify-center border border-primary bg-background text-foreground transition-colors fine-hover:bg-sunken"
			>
				<DirectionalIcon
					icon={ChevronLeftIcon}
					className={cn("size-4", side === "end" && "rotate-180")}
				/>
			</button>
		</div>
	);
}

/** Tiny inline label that names a control group inside the shared row. */
export function FilterGroupLabel({
	children,
	className,
}: {
	children: React.ReactNode;
	className?: string;
}) {
	return (
		<span
			className={cn(
				"font-heading text-label font-semibold uppercase tracking-[0.14em] text-muted",
				className,
			)}
		>
			{children}
		</span>
	);
}

/** Compact separator between control groups on the shared row. */
export function FilterDivider() {
	return <span className="h-6 w-px bg-border" aria-hidden="true" />;
}

/**
 * The search box that sits on the SAME line as the pills — one bordered cell:
 * input, optional clear, icon submit. `onValueChange` fires per keystroke (the
 * caller debounces); Enter or the button submits.
 */
export function FilterSearchBox({
	value,
	onValueChange,
	onSubmit,
	onClear,
	busy = false,
	searchLabel,
	clearLabel,
	submitLabel,
	className,
}: {
	value: string;
	onValueChange: (value: string) => void;
	onSubmit: () => void;
	onClear: () => void;
	busy?: boolean;
	searchLabel: string;
	clearLabel: string;
	submitLabel: string;
	className?: string;
}) {
	return (
		<form
			onSubmit={(event) => {
				event.preventDefault();
				onSubmit();
			}}
			role="search"
			className={cn("min-w-56 flex-1", className)}
		>
			<div
				className={cn(
					"flex h-11 items-stretch border border-border-strong bg-surface",
					"transition-colors focus-within:border-foreground",
				)}
			>
				<input
					type="search"
					name="q"
					value={value}
					onChange={(event) => onValueChange(event.target.value)}
					aria-label={searchLabel}
					autoComplete="off"
					className="h-full min-w-0 flex-1 bg-transparent px-3 py-0 text-body text-foreground placeholder:text-muted focus:outline-none"
				/>

				{value ? (
					<button
						type="button"
						onClick={onClear}
						className="flex shrink-0 items-center px-2.5 text-muted transition-colors fine-hover:text-foreground"
						aria-label={clearLabel}
					>
						<XMarkIcon className="size-4" aria-hidden />
					</button>
				) : null}

				<button
					type="submit"
					disabled={busy}
					aria-label={submitLabel}
					title={submitLabel}
					className="flex h-full shrink-0 items-center border-s border-border-strong bg-primary px-3.5 text-primary-foreground transition-opacity disabled:opacity-60 fine-hover:opacity-90"
				>
					<MagnifyingGlassIcon className="size-5" aria-hidden />
				</button>
			</div>
		</form>
	);
}
