import { XMarkIcon } from "@heroicons/react/24/outline";
import { getTranslations } from "next-intl/server";
import { SearchNavLink } from "@/components/search/search-transition";
import { formatDecadeLabel } from "@/lib/platform/format";
import {
	buildSearchHref,
	countActiveFilters,
	type RepeatedFilterParam,
	type SearchPageState,
	type SingleFilterParam,
	withClearedFilters,
	withSingleFilter,
	withToggledFilter,
} from "@/lib/platform/search-url";
import type { PlatformFacets } from "@/types/platform";

type Chip = {
	key: string;
	group: string;
	label: string;
	href: string;
};

/** Resolve a person/project code to its display name via the facet buckets. */
function bucketLabel(
	facets: PlatformFacets | null | undefined,
	list: "persons" | "projects",
	code: string,
): string {
	const bucket = facets?.[list]?.find((entry) => entry.code === code);
	return bucket?.label ?? code;
}

/**
 * Every applied refinement as a removable chip — the state of the search,
 * spelled out, one click from undone.
 */
export async function ActiveFilterChips({
	state,
	facets,
	locale,
}: {
	state: SearchPageState;
	facets: PlatformFacets | null | undefined;
	locale: string;
}) {
	const t = await getTranslations("Search");
	const activeCount = countActiveFilters(state.filters);
	if (activeCount === 0) {
		return null;
	}

	const chips: Chip[] = [];

	const singles: { param: SingleFilterParam; group: string; label?: string }[] =
		[
			{
				param: "personCode",
				group: t("facetPerson"),
				label: state.filters.personCode
					? bucketLabel(facets, "persons", state.filters.personCode)
					: undefined,
			},
			{
				param: "projectCode",
				group: t("facetProject"),
				label: state.filters.projectCode
					? bucketLabel(facets, "projects", state.filters.projectCode)
					: undefined,
			},
			{ param: "language", group: t("facetLanguage") },
			{ param: "dialect", group: t("facetDialect") },
			{ param: "region", group: t("facetRegion") },
			{
				param: "decade",
				group: t("facetDecade"),
				label: state.filters.decade
					? formatDecadeLabel(locale, state.filters.decade)
					: undefined,
			},
		];

	for (const single of singles) {
		const value = state.filters[single.param];
		if (value) {
			chips.push({
				key: `${single.param}`,
				group: single.group,
				label: single.label ?? value,
				href: buildSearchHref(withSingleFilter(state, single.param, null)),
			});
		}
	}

	const repeated: { param: RepeatedFilterParam; group: string }[] = [
		{ param: "subject", group: t("facetSubject") },
		{ param: "genre", group: t("facetGenre") },
		{ param: "tag", group: t("facetTag") },
		{ param: "keyword", group: t("facetKeyword") },
	];

	for (const entry of repeated) {
		for (const value of state.filters[entry.param]) {
			chips.push({
				key: `${entry.param}-${value}`,
				group: entry.group,
				label: value,
				href: buildSearchHref(withToggledFilter(state, entry.param, value)),
			});
		}
	}

	return (
		<div className="flex flex-wrap items-center gap-2">
			{chips.map((chip) => (
				<SearchNavLink
					key={chip.key}
					href={chip.href}
					aria-label={t("filterRemove", { label: chip.label })}
					className={
						"group/chip inline-flex items-center gap-1.5 bg-primary py-1.5 ps-3 pe-2 " +
						"text-small font-medium text-primary-foreground transition-opacity fine-hover:opacity-85"
					}
				>
					<span className="text-primary-foreground/65">{chip.group}:</span>
					<span dir="auto">{chip.label}</span>
					<XMarkIcon className="size-3.5 shrink-0" aria-hidden />
				</SearchNavLink>
			))}

			{chips.length > 1 ? (
				<SearchNavLink
					href={buildSearchHref(withClearedFilters(state))}
					className="inline-flex items-center py-1.5 px-2 text-small text-muted underline decoration-border underline-offset-4 transition-colors fine-hover:text-foreground fine-hover:decoration-current"
				>
					{t("filtersClear")}
				</SearchNavLink>
			) : null}
		</div>
	);
}
