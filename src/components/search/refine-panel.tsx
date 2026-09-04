import {
	AdjustmentsHorizontalIcon,
	CheckIcon,
	ChevronDownIcon,
} from "@heroicons/react/24/outline";
import { getTranslations } from "next-intl/server";
import { SearchNavLink } from "@/components/search/search-transition";
import { formatCount, formatDecadeLabel } from "@/lib/platform/format";
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
import type { PlatformFacetBucket, PlatformFacets } from "@/types/platform";

/** Buckets shown before the group folds the rest behind "زیاتر". */
const VISIBLE_BUCKETS = 8;

type FacetLabelKey =
	| "facetPerson"
	| "facetProject"
	| "facetLanguage"
	| "facetDialect"
	| "facetRegion"
	| "facetSubject"
	| "facetGenre"
	| "facetTag"
	| "facetKeyword";

type GroupDef = {
	facet: keyof PlatformFacets;
	labelKey: FacetLabelKey;
	/** Single-select facets replace; repeated ones toggle alongside others. */
	mode:
		| { kind: "single"; param: SingleFilterParam; useCode?: boolean }
		| { kind: "repeated"; param: RepeatedFilterParam };
};

/**
 * Persons lead — in a heritage archive the person IS the query most of the
 * time — then collections, then language/place, then the finer taxonomies.
 */
const GROUPS: GroupDef[] = [
	{
		facet: "persons",
		labelKey: "facetPerson",
		mode: { kind: "single", param: "personCode", useCode: true },
	},
	{
		facet: "projects",
		labelKey: "facetProject",
		mode: { kind: "single", param: "projectCode", useCode: true },
	},
	{
		facet: "languages",
		labelKey: "facetLanguage",
		mode: { kind: "single", param: "language" },
	},
	{
		facet: "dialects",
		labelKey: "facetDialect",
		mode: { kind: "single", param: "dialect" },
	},
	{
		facet: "regions",
		labelKey: "facetRegion",
		mode: { kind: "single", param: "region" },
	},
	{
		facet: "subjects",
		labelKey: "facetSubject",
		mode: { kind: "repeated", param: "subject" },
	},
	{
		facet: "genres",
		labelKey: "facetGenre",
		mode: { kind: "repeated", param: "genre" },
	},
	{
		facet: "tags",
		labelKey: "facetTag",
		mode: { kind: "repeated", param: "tag" },
	},
	{
		facet: "keywords",
		labelKey: "facetKeyword",
		mode: { kind: "repeated", param: "keyword" },
	},
];

function bucketValue(bucket: PlatformFacetBucket, useCode?: boolean): string {
	return (useCode ? bucket.code : bucket.label) ?? bucket.label;
}

function bucketState(
	state: SearchPageState,
	def: GroupDef,
	bucket: PlatformFacetBucket,
): { active: boolean; href: string } {
	const value = bucketValue(
		bucket,
		def.mode.kind === "single" ? def.mode.useCode : false,
	);
	if (def.mode.kind === "single") {
		const active = state.filters[def.mode.param] === value;
		return {
			active,
			href: buildSearchHref(
				withSingleFilter(state, def.mode.param, active ? null : value),
			),
		};
	}
	const active = state.filters[def.mode.param].includes(value);
	return {
		active,
		href: buildSearchHref(withToggledFilter(state, def.mode.param, value)),
	};
}

function FacetRow({
	active,
	href,
	label,
	count,
	locale,
}: {
	active: boolean;
	href: string;
	label: string;
	count: number;
	locale: string;
}) {
	return (
		<li>
			<SearchNavLink
				href={href}
				aria-pressed={active}
				className={cn(
					"group/facet flex w-full items-center gap-2.5 py-1.5 text-small transition-colors",
					active ? "text-foreground" : "text-muted fine-hover:text-foreground",
				)}
			>
				<span
					aria-hidden
					className={cn(
						"flex size-4 shrink-0 items-center justify-center border transition-colors",
						active
							? "border-primary bg-primary"
							: "border-border-strong bg-transparent group-fine-hover/facet:border-foreground/50",
					)}
				>
					<CheckIcon
						className={cn(
							"size-3 text-primary-foreground transition-opacity",
							active ? "opacity-100" : "opacity-0",
						)}
					/>
				</span>
				<span className="min-w-0 flex-1 truncate text-start">
					<bdi>{label}</bdi>
				</span>
				<span className="shrink-0 text-label tabular-nums text-muted/80">
					{formatCount(locale, count)}
				</span>
			</SearchNavLink>
		</li>
	);
}

function FacetGroup({
	title,
	moreLabel,
	def,
	buckets,
	state,
	locale,
}: {
	title: string;
	moreLabel: string;
	def: GroupDef;
	buckets: PlatformFacetBucket[];
	state: SearchPageState;
	locale: string;
}) {
	const visible = buckets.slice(0, VISIBLE_BUCKETS);
	const folded = buckets.slice(VISIBLE_BUCKETS);

	return (
		<section className="border-t border-border pt-4 first:border-t-0 first:pt-0">
			<h4 className="label mb-2 font-medium">{title}</h4>
			<ul>
				{visible.map((bucket) => {
					const { active, href } = bucketState(state, def, bucket);
					return (
						<FacetRow
							key={`${bucket.code ?? ""}${bucket.label}`}
							active={active}
							href={href}
							label={bucket.label}
							count={bucket.count}
							locale={locale}
						/>
					);
				})}
			</ul>
			{folded.length > 0 ? (
				<details className="group/more mt-1">
					<summary
						className={cn(
							"flex cursor-pointer list-none items-center gap-1.5 py-1 text-label text-muted",
							"transition-colors fine-hover:text-foreground [&::-webkit-details-marker]:hidden",
						)}
					>
						{moreLabel}
						<ChevronDownIcon
							className="size-3.5 transition-transform group-open/more:rotate-180"
							aria-hidden
						/>
					</summary>
					<ul>
						{folded.map((bucket) => {
							const { active, href } = bucketState(state, def, bucket);
							return (
								<FacetRow
									key={`${bucket.code ?? ""}${bucket.label}`}
									active={active}
									href={href}
									label={bucket.label}
									count={bucket.count}
									locale={locale}
								/>
							);
						})}
					</ul>
				</details>
			) : null}
		</section>
	);
}

/** The decades read as a timeline — chips in chronological order. */
function DecadeGroup({
	title,
	buckets,
	state,
	locale,
}: {
	title: string;
	buckets: PlatformFacetBucket[];
	state: SearchPageState;
	locale: string;
}) {
	return (
		<section className="border-t border-border pt-4">
			<h4 className="label mb-2.5 font-medium">{title}</h4>
			<ul className="flex flex-wrap gap-1.5">
				{buckets.map((bucket) => {
					const active = state.filters.decade === bucket.label;
					const href = buildSearchHref(
						withSingleFilter(state, "decade", active ? null : bucket.label),
					);
					return (
						<li key={bucket.label}>
							<SearchNavLink
								href={href}
								aria-pressed={active}
								className={cn(
									"inline-flex items-center gap-1.5 border px-2.5 py-1 text-label transition-colors",
									active
										? "border-primary bg-primary text-primary-foreground"
										: cn(
												"border-border-strong text-muted",
												"fine-hover:border-foreground/50 fine-hover:text-foreground",
											),
								)}
							>
								<span dir="ltr" className="tabular-nums">
									{formatDecadeLabel(locale, bucket.label)}
								</span>
								<span
									className={cn(
										"tabular-nums",
										active ? "text-primary-foreground/70" : "text-muted/70",
									)}
								>
									{formatCount(locale, bucket.count)}
								</span>
							</SearchNavLink>
						</li>
					);
				})}
			</ul>
		</section>
	);
}

type RefinePanelProps = {
	state: SearchPageState;
	facets: PlatformFacets | null | undefined;
	locale: string;
	/** "sidebar" = always-open desktop column; "disclosure" = mobile fold. */
	variant: "sidebar" | "disclosure";
};

/** True when there is anything to refine by at all. */
export function hasRefinements(
	facets: PlatformFacets | null | undefined,
): boolean {
	if (!facets) {
		return false;
	}
	return [...GROUPS.map((group) => group.facet), "decades" as const].some(
		(key) => (facets[key]?.length ?? 0) > 0,
	);
}

/**
 * The refine panel — facet counts computed over the matched set, so every
 * number is a promise: click it and that is exactly how many results remain.
 */
export async function RefinePanel({
	state,
	facets,
	locale,
	variant,
}: RefinePanelProps) {
	const t = await getTranslations("Search");
	if (!facets || !hasRefinements(facets)) {
		return null;
	}

	const activeCount = countActiveFilters(state.filters);

	const body = (
		<div className="flex flex-col gap-4">
			{GROUPS.map((def) => {
				const buckets = facets[def.facet] ?? [];
				if (buckets.length === 0) {
					return null;
				}
				return (
					<FacetGroup
						key={def.facet}
						title={t(def.labelKey)}
						moreLabel={t("facetMore")}
						def={def}
						buckets={buckets}
						state={state}
						locale={locale}
					/>
				);
			})}
			{(facets.decades?.length ?? 0) > 0 ? (
				<DecadeGroup
					title={t("facetDecade")}
					buckets={facets.decades ?? []}
					state={state}
					locale={locale}
				/>
			) : null}
			{activeCount > 0 ? (
				<div className="border-t border-border pt-4">
					<SearchNavLink
						href={buildSearchHref(withClearedFilters(state))}
						className="text-small text-muted underline decoration-border underline-offset-4 transition-colors fine-hover:text-foreground fine-hover:decoration-current"
					>
						{t("filtersClear")}
					</SearchNavLink>
				</div>
			) : null}
		</div>
	);

	if (variant === "disclosure") {
		return (
			<details className="group/refine border border-border bg-surface">
				<summary
					className={cn(
						"flex cursor-pointer list-none items-center gap-2.5 px-4 py-3",
						"font-heading text-small font-semibold text-foreground",
						"[&::-webkit-details-marker]:hidden",
					)}
				>
					<AdjustmentsHorizontalIcon
						className="size-4.5 shrink-0"
						aria-hidden
					/>
					{t("filtersShow")}
					{activeCount > 0 ? (
						<span className="inline-flex min-w-5 items-center justify-center bg-primary px-1.5 py-0.5 text-label tabular-nums text-primary-foreground">
							{formatCount(locale, activeCount)}
						</span>
					) : null}
					<ChevronDownIcon
						className="ms-auto size-4 shrink-0 text-muted transition-transform group-open/refine:rotate-180"
						aria-hidden
					/>
				</summary>
				<div className="border-t border-border px-4 py-4">{body}</div>
			</details>
		);
	}

	return (
		<aside aria-label={t("filtersTitle")}>
			<h3 className="mb-4 font-heading text-body font-semibold text-foreground">
				{t("filtersTitle")}
			</h3>
			{body}
		</aside>
	);
}
