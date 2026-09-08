"use client";

import { useTranslations } from "next-intl";
import { RESULTS_ANCHOR_ID } from "@/components/search/results-anchor";
import { useSearchTransition } from "@/components/search/search-transition";
import { formatCount } from "@/lib/platform/format";
import { scrollToSection } from "@/lib/scroll-to-section";

/**
 * The inline panel's "show N results" button. Every facet tap already
 * navigated, so this only folds the panel away and glides back to the
 * results — the count on it is live (`totalElements` of the current page).
 */
export function RefineDone({
	count,
	locale,
}: {
	count: number;
	locale: string;
}) {
	const t = useTranslations("Search");
	const transition = useSearchTransition();

	return (
		<button
			type="button"
			data-focus-key="refine-done"
			onClick={() => {
				transition?.setRefineOpen(false);
				scrollToSection(RESULTS_ANCHOR_ID);
			}}
			className="inline-flex h-12 flex-1 items-center justify-center bg-primary px-4 font-heading text-small font-semibold text-primary-foreground transition-opacity fine-hover:opacity-90"
		>
			{count > 0
				? t("refineDone", { count: formatCount(locale, count) })
				: t("refineDoneEmpty")}
		</button>
	);
}
