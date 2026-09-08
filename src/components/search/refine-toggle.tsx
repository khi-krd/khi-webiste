"use client";

import { AdjustmentsHorizontalIcon } from "@heroicons/react/24/outline";
import { useTranslations } from "next-intl";
import { useSearchTransition } from "@/components/search/search-transition";
import { formatCount } from "@/lib/platform/format";
import { cn } from "@/lib/utils";

/**
 * Toolbar button that folds the inline refine panel open below `lg`. The
 * open flag lives in the transition context, so it survives the results
 * remount that every facet tap causes.
 */
export function RefineToggle({
	activeCount,
	locale,
}: {
	activeCount: number;
	locale: string;
}) {
	const t = useTranslations("Search");
	const transition = useSearchTransition();
	const open = transition?.refineOpen ?? false;

	return (
		<button
			type="button"
			aria-expanded={open}
			aria-controls="search-refine"
			data-focus-key="refine-toggle"
			onClick={() => transition?.setRefineOpen(!open)}
			className={cn(
				"inline-flex h-11 flex-1 items-center justify-center gap-2 border px-3.5 font-heading text-small font-medium",
				"transition-colors sm:flex-none lg:hidden",
				open
					? "border-primary bg-primary text-primary-foreground"
					: "border-border-strong bg-surface text-foreground fine-hover:bg-sunken",
			)}
		>
			<AdjustmentsHorizontalIcon className="size-4 shrink-0" aria-hidden />
			<span>{open ? t("filtersHide") : t("filtersShow")}</span>
			{activeCount > 0 ? (
				<span
					className={cn(
						"inline-flex min-w-5 justify-center px-1.5 text-label tabular-nums",
						open
							? "bg-primary-foreground/20 text-primary-foreground"
							: "bg-primary text-primary-foreground",
					)}
				>
					{formatCount(locale, activeCount)}
				</span>
			) : null}
		</button>
	);
}
