import { getTranslations } from "next-intl/server";
import { SOURCE_DESCRIPTION_KEYS } from "@/components/search/source-links";
import type { SearchPageState } from "@/lib/platform/search-url";

/**
 * Row A of the search page: the h1 with the active source's one-line
 * description beside it (below it under `lg`, hidden on phones). The
 * description is the only explanation of scope and re-renders with the URL.
 */
export async function HeadingRow({ state }: { state: SearchPageState }) {
	const t = await getTranslations("Search");

	return (
		<div className="flex flex-col gap-1 lg:flex-row lg:items-baseline lg:gap-4">
			<h1 className="font-heading text-h2 font-bold text-foreground lg:text-h1">
				{t("heading")}
			</h1>
			<p className="hidden text-small text-muted sm:block">
				{t(SOURCE_DESCRIPTION_KEYS[state.source])}
			</p>
		</div>
	);
}
