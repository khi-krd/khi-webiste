"use client";

import { ChevronDownIcon } from "@heroicons/react/24/outline";
import { useTranslations } from "next-intl";
import { type ReactNode, useId, useState } from "react";
import { useSearchTransition } from "@/components/search/search-transition";
import { formatCount } from "@/lib/platform/format";
import { cn } from "@/lib/utils";

/** Same tween as every other collapsible on the page (§10). */
const COLLAPSE_CLASS =
	"grid transition-[grid-template-rows,opacity,visibility] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] [&[inert]]:invisible";

type RefineGroupProps = {
	/** `${variant}:${facet}` — the context key the open state is stored under. */
	groupKey: string;
	title: string;
	/** Open when the visitor has not decided yet and nothing in it is active. */
	defaultOpen: boolean;
	activeInGroup: number;
	bucketCount: number;
	locale: string;
	/** The visible rows (a `<ul>` from the server). */
	children: ReactNode;
	/** Rows folded behind "more" (a second `<ul>` from the server). */
	folded?: ReactNode;
	moreLabel: string;
};

/**
 * One facet group: a header button and a 0fr↔1fr collapse. The rows are
 * server-rendered children; only the fold state is client-side, and it lives
 * in the search transition context so it survives the results remount that
 * every facet tap causes.
 */
export function RefineGroup({
	groupKey,
	title,
	defaultOpen,
	activeInGroup,
	bucketCount,
	locale,
	children,
	folded,
	moreLabel,
}: RefineGroupProps) {
	const t = useTranslations("Search");
	const transition = useSearchTransition();
	const id = useId();
	const bodyId = `refine-body${id}`;
	const foldedId = `refine-folded${id}`;

	// Without a provider (never on /search) the state simply lives here.
	const [localOpen, setLocalOpen] = useState<boolean | null>(null);
	const [localMore, setLocalMore] = useState(false);

	const fallbackOpen = activeInGroup > 0 || defaultOpen;
	const moreKey = `${groupKey}:more`;
	const open = transition
		? transition.isGroupOpen(groupKey, fallbackOpen)
		: (localOpen ?? fallbackOpen);
	const more = transition ? transition.isGroupOpen(moreKey, false) : localMore;

	const setOpen = (next: boolean) => {
		if (transition) {
			transition.setGroupOpen(groupKey, next);
		} else {
			setLocalOpen(next);
		}
	};
	const setMore = (next: boolean) => {
		if (transition) {
			transition.setGroupOpen(moreKey, next);
		} else {
			setLocalMore(next);
		}
	};

	return (
		<section
			className="group border-b border-border"
			data-open={open || undefined}
		>
			<button
				type="button"
				aria-expanded={open}
				aria-controls={bodyId}
				data-focus-key={`group:${groupKey}`}
				onClick={() => setOpen(!open)}
				className={cn(
					"flex min-h-11 w-full items-center gap-2 py-2 text-start font-heading text-small font-semibold text-foreground",
					"transition-colors fine-hover:text-brand lg:min-h-10",
				)}
			>
				<span className="flex-1">{title}</span>
				{activeInGroup > 0 ? (
					<span className="inline-flex items-center gap-1 text-label tabular-nums text-foreground">
						<span aria-hidden className="block size-1.5 bg-primary" />
						{formatCount(locale, activeInGroup)}
						<span className="visually-hidden"> {t("facetSelected")}</span>
					</span>
				) : null}
				<span className="text-label tabular-nums text-muted">
					{formatCount(locale, bucketCount)}
				</span>
				<ChevronDownIcon
					aria-hidden
					className="size-4 shrink-0 text-muted transition-transform duration-200 group-data-open:rotate-180"
				/>
			</button>

			<div
				id={bodyId}
				inert={!open}
				className={cn(
					COLLAPSE_CLASS,
					open ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0",
				)}
			>
				<div className="min-h-0 overflow-clip">
					{children}
					{folded ? (
						<>
							<div
								id={foldedId}
								inert={!more}
								className={cn(
									COLLAPSE_CLASS,
									more
										? "grid-rows-[1fr] opacity-100"
										: "grid-rows-[0fr] opacity-0",
								)}
							>
								<div className="min-h-0 overflow-clip">{folded}</div>
							</div>
							<button
								type="button"
								aria-expanded={more}
								aria-controls={foldedId}
								data-focus-key={`more:${groupKey}`}
								onClick={() => setMore(!more)}
								className="mb-1 flex min-h-11 items-center gap-1.5 text-label text-muted transition-colors fine-hover:text-foreground lg:min-h-9"
							>
								{moreLabel}
								<ChevronDownIcon
									aria-hidden
									className={cn(
										"size-3.5 shrink-0 transition-transform duration-200",
										more && "rotate-180",
									)}
								/>
							</button>
						</>
					) : null}
				</div>
			</div>
		</section>
	);
}
