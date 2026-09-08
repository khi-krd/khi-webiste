import { getLocale, getTranslations } from "next-intl/server";
import {
	joinSourceLabels,
	SOURCE_DESCRIPTION_KEYS,
	SOURCE_LABEL_KEYS,
} from "@/components/search/source-links";
import { type SearchPageState, singleSource } from "@/lib/platform/search-url";

/**
 * Row A of the search page: the h1 with a one-line description of the scope
 * beside it (below it under `lg`, hidden on phones) — the checked source's
 * own line, or, with several checked, the sources named together. It is the
 * only explanation of scope and re-renders with the URL.
 */
export async function HeadingRow({ state }: { state: SearchPageState }) {
	const [t, locale] = await Promise.all([
		getTranslations("Search"),
		getLocale(),
	]);
	const single = singleSource(state);
	const description = single
		? t(SOURCE_DESCRIPTION_KEYS[single])
		: t("sourcesDescriptionMixed", {
				sources: joinSourceLabels(
					locale,
					state.sources.map((source) => t(SOURCE_LABEL_KEYS[source])),
				),
			});

	return (
		<div className="flex flex-col gap-1 lg:flex-row lg:items-baseline lg:gap-4">
			<h1 className="font-heading text-h2 font-bold text-foreground lg:text-h1">
				{t("heading")}
			</h1>
			<p className="hidden text-small text-muted sm:block">{description}</p>
		</div>
	);
}
