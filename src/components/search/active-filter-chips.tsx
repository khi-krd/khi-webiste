import { XMarkIcon } from "@heroicons/react/24/outline";
import { getTranslations } from "next-intl/server";
import type { CSSProperties } from "react";
import { SearchNavLink } from "@/components/search/search-transition";
import {
	humanizePlatformName,
	isPlatformCode,
	platformPersonName,
} from "@/lib/platform/display";
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
import { cn } from "@/lib/utils";
import type { PlatformFacets, PlatformHit } from "@/types/platform";

type Chip = {
	key: string;
	focusKey: string;
	group: string;
	/** Null when no human name could be found — the group name stands alone. */
	label: string | null;
	href: string;
};

/**
 * A person code → the person's name. The facet bucket is the first source;
 * when the bucket is gone (the filter emptied the matched set) a hit on the
 * page that carries the same person still knows the name. The raw code is
 * never an answer.
 */
function personLabel(
	facets: PlatformFacets | null | undefined,
	hits: PlatformHit[],
	code: string,
	locale: string,
): string | null {
	const bucket = facets?.persons?.find((entry) => entry.code === code);
	if (bucket?.label && !isPlatformCode(bucket.label, code)) {
		return bucket.label;
	}
	const hit = hits.find((entry) => entry.person?.personCode === code);
	const name = hit ? platformPersonName(hit.person, locale) : null;
	return name && !isPlatformCode(name, code) ? name : null;
}

/** A project code → its readable name (slugs → spaces), same fallback chain. */
function projectLabel(
	facets: PlatformFacets | null | undefined,
	hits: PlatformHit[],
	code: string,
): string | null {
	const bucket = facets?.projects?.find((entry) => entry.code === code);
	if (bucket?.label && !isPlatformCode(bucket.label, code)) {
		return humanizePlatformName(bucket.label);
	}
	const hit = hits.find((entry) => entry.projectCode === code);
	const name = hit ? humanizePlatformName(hit.projectName) : null;
	return name && !isPlatformCode(name, code) ? name : null;
}

/**
 * Every applied refinement as a removable chip — the state of the search,
 * spelled out, one click from undone.
 */
export async function ActiveFilterChips({
	state,
	facets,
	hits,
	locale,
}: {
	state: SearchPageState;
	facets: PlatformFacets | null | undefined;
	hits: PlatformHit[];
	locale: string;
}) {
	const t = await getTranslations("Search");
	const activeCount = countActiveFilters(state.filters);
	if (activeCount === 0) {
		return null;
	}

	const chips: Chip[] = [];

	const singles: {
		param: SingleFilterParam;
		group: string;
		label?: string | null;
	}[] = [
		{
			param: "personCode",
			group: t("facetPerson"),
			label: state.filters.personCode
				? personLabel(facets, hits, state.filters.personCode, locale)
				: undefined,
		},
		{
			param: "projectCode",
			group: t("facetProject"),
			label: state.filters.projectCode
				? projectLabel(facets, hits, state.filters.projectCode)
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
				key: single.param,
				focusKey: `chip:${single.param}:${value}`,
				group: single.group,
				// `undefined` = the value is its own label; `null` = nothing found.
				label: single.label === undefined ? value : single.label,
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
				focusKey: `chip:${entry.param}:${value}`,
				group: entry.group,
				label: value,
				href: buildSearchHref(withToggledFilter(state, entry.param, value)),
			});
		}
	}

	return (
		<ul
			aria-label={t("filtersActiveCount", { count: activeCount })}
			className="flex flex-wrap items-center gap-2"
		>
			{chips.map((chip, index) => (
				<li key={chip.key} className="contents">
					<SearchNavLink
						href={chip.href}
						aria-label={t("filterRemove", { label: chip.label ?? chip.group })}
						data-focus-key={chip.focusKey}
						className={cn(
							"search-rise inline-flex h-11 items-center gap-1.5 bg-primary ps-3 pe-2",
							"text-small font-medium text-primary-foreground transition-opacity fine-hover:opacity-85 lg:h-8",
						)}
						style={{ "--i": index } as CSSProperties}
					>
						{chip.label ? (
							<>
								<span className="text-primary-foreground/80">
									{chip.group}:
								</span>
								<bdi dir="auto">{chip.label}</bdi>
							</>
						) : (
							<span>{chip.group}</span>
						)}
						<XMarkIcon className="size-3.5 shrink-0" aria-hidden />
					</SearchNavLink>
				</li>
			))}

			{chips.length > 1 ? (
				<li className="contents">
					<SearchNavLink
						href={buildSearchHref(withClearedFilters(state))}
						data-focus-key="chip:clear"
						className={cn(
							"inline-flex h-11 items-center px-2 text-small text-muted underline decoration-border underline-offset-4",
							"transition-colors fine-hover:text-foreground fine-hover:decoration-current lg:h-8",
						)}
					>
						{t("filtersClear")}
					</SearchNavLink>
				</li>
			) : null}
		</ul>
	);
}
