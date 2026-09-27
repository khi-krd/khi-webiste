"use client";

import { MagnifyingGlassIcon, XMarkIcon } from "@heroicons/react/24/outline";
import { cn } from "@/lib/utils";

/**
 * Shared single-line filter-bar primitives.
 *
 * Every listing page composes the SAME continuous row out of these pieces —
 * pills, group labels, selects and the search box all flow in one
 * `flex flex-wrap` line instead of being partitioned into stacked sections.
 * The row wraps naturally on narrow screens; nothing expands or collapses.
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
				"flex flex-wrap items-center gap-2 transition-opacity",
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
