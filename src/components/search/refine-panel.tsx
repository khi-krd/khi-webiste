import { CheckIcon } from "@heroicons/react/20/solid";
import { getTranslations } from "next-intl/server";
import { RefineDone } from "@/components/search/refine-done";
import { RefineGroup } from "@/components/search/refine-group";
import { RefineInlineShell } from "@/components/search/refine-inline-shell";
import { SearchNavLink } from "@/components/search/search-transition";
import { Badge } from "@/components/ui/badge";
import { humanizePlatformName } from "@/lib/platform/display";
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

/**
 * Buckets shown before the group folds the rest behind "زیاتر". Keywords and
 * tags are mostly spelling variants; persons and projects rarely exceed five.
 */
const VISIBLE_BUCKETS = 5;

type RefineVariant = "sidebar" | "inline";

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

/** Groups that start open in the sidebar; the inline panel starts folded. */
const SIDEBAR_DEFAULT_OPEN = new Set<keyof PlatformFacets>([
	"persons",
	"projects",
	"decades",
]);

/**
 * The filter VALUE — for persons/projects the code (never shown; it lives in
 * the URL only), for everything else the label itself.
 */
function bucketValue(bucket: PlatformFacetBucket, useCode?: boolean): string {
	return (useCode ? bucket.code : bucket.label) ?? bucket.label;
}

function bucketState(
	state: SearchPageState,
	def: GroupDef,
	bucket: PlatformFacetBucket,
): { active: boolean; href: string; value: string } {
	const value = bucketValue(
		bucket,
		def.mode.kind === "single" ? def.mode.useCode : false,
	);
	if (def.mode.kind === "single") {
		const active = state.filters[def.mode.param] === value;
		return {
			active,
			value,
			href: buildSearchHref(
				withSingleFilter(state, def.mode.param, active ? null : value),
			),
		};
	}
	const active = state.filters[def.mode.param].includes(value);
	return {
		active,
		value,
		href: buildSearchHref(withToggledFilter(state, def.mode.param, value)),
	};
}

/** How many of this group's filters are set — decides its default fold. */
function activeInGroup(state: SearchPageState, def: GroupDef): number {
	if (def.mode.kind === "single") {
		return state.filters[def.mode.param] ? 1 : 0;
	}
	return state.filters[def.mode.param].length;
}

/**
 * A facet row: a real link with a radio (single-select) or check
 * (multi-select) square. The full row is the hit area.
 */
function FacetRow({
	active,
	href,
	focusKey,
	label,
	count,
	locale,
	single,
	selectedLabel,
}: {
	active: boolean;
	href: string;
	focusKey: string;
	label: string;
	count: number;
	locale: string;
	single: boolean;
	selectedLabel: string;
}) {
	const glyphClass = cn(
		"transition-transform duration-200 ease-[cubic-bezier(0.34,1.56,0.64,1)]",
		active ? "scale-100" : "scale-0",
	);

	return (
		<li>
			<SearchNavLink
				href={href}
				aria-current={active ? "true" : undefined}
				data-focus-key={focusKey}
				className={cn(
					"flex min-h-11 w-full items-center gap-2.5 py-1 text-small transition-colors lg:min-h-9",
					active
						? "text-foreground"
						: "text-muted fine-hover:text-foreground fine-hover:[&_[data-square]]:border-foreground/50",
				)}
			>
				<span
					aria-hidden
					data-square
					className={cn(
						"flex size-4 shrink-0 items-center justify-center border transition-[background-color,border-color] duration-200",
						active ? "border-primary bg-primary" : "border-border-strong",
					)}
				>
					{single ? (
						<span
							className={cn("block size-2 bg-primary-foreground", glyphClass)}
						/>
					) : (
						<CheckIcon
							className={cn("size-3 text-primary-foreground", glyphClass)}
						/>
					)}
				</span>
				<span className="min-w-0 flex-1 line-clamp-1 text-start [overflow-wrap:anywhere]">
					<bdi dir="auto">{label}</bdi>
				</span>
				<span
					className={cn(
						"shrink-0 text-label tabular-nums",
						active ? "text-foreground" : "text-muted",
					)}
				>
					{formatCount(locale, count)}
				</span>
				{active ? (
					<span className="visually-hidden">{selectedLabel}</span>
				) : null}
			</SearchNavLink>
		</li>
	);
}

/** One list facet group: visible rows, folded rows, client fold shell. */
function FacetGroup({
	def,
	buckets,
	state,
	locale,
	variant,
	title,
	moreLabel,
	selectedLabel,
}: {
	def: GroupDef;
	buckets: PlatformFacetBucket[];
	state: SearchPageState;
	locale: string;
	variant: RefineVariant;
	title: string;
	moreLabel: string;
	selectedLabel: string;
}) {
	const single = def.mode.kind === "single";
	const param = def.mode.param;
	const visible = buckets.slice(0, VISIBLE_BUCKETS);
	const folded = buckets.slice(VISIBLE_BUCKETS);

	const renderRows = (list: PlatformFacetBucket[]) =>
		list.map((bucket) => {
			const { active, href, value } = bucketState(state, def, bucket);
			return (
				<FacetRow
					key={`${bucket.code ?? ""}:${bucket.label}`}
					active={active}
					href={href}
					focusKey={`facet:${variant}:${param}:${value}`}
					label={
						def.facet === "projects"
							? (humanizePlatformName(bucket.label) ?? bucket.label)
							: bucket.label
					}
					count={bucket.count}
					locale={locale}
					single={single}
					selectedLabel={selectedLabel}
				/>
			);
		});

	return (
		<RefineGroup
			groupKey={`${variant}:${def.facet}`}
			title={title}
			defaultOpen={variant === "sidebar" && SIDEBAR_DEFAULT_OPEN.has(def.facet)}
			activeInGroup={activeInGroup(state, def)}
			bucketCount={buckets.length}
			locale={locale}
			moreLabel={moreLabel}
			folded={
				folded.length > 0 ? (
					<ul className="pb-2">{renderRows(folded)}</ul>
				) : undefined
			}
		>
			<ul className={cn(folded.length > 0 ? "pb-0" : "pb-2")}>
				{renderRows(visible)}
			</ul>
		</RefineGroup>
	);
}

/** The decades read as a timeline — chips in chronological order. */
function DecadeGroup({
	buckets,
	state,
	locale,
	variant,
	title,
	moreLabel,
	selectedLabel,
}: {
	buckets: PlatformFacetBucket[];
	state: SearchPageState;
	locale: string;
	variant: RefineVariant;
	title: string;
	moreLabel: string;
	selectedLabel: string;
}) {
	return (
		<RefineGroup
			groupKey={`${variant}:decades`}
			title={title}
			defaultOpen={variant === "sidebar"}
			activeInGroup={state.filters.decade ? 1 : 0}
			bucketCount={buckets.length}
			locale={locale}
			moreLabel={moreLabel}
		>
			<ul className="flex flex-wrap gap-1.5 pb-3">
				{buckets.map((bucket) => {
					const active = state.filters.decade === bucket.label;
					const href = buildSearchHref(
						withSingleFilter(state, "decade", active ? null : bucket.label),
					);
					return (
						<li key={bucket.label}>
							<SearchNavLink
								href={href}
								aria-current={active ? "true" : undefined}
								data-focus-key={`facet:${variant}:decade:${bucket.label}`}
								className={cn(
									"inline-flex h-11 items-center gap-1.5 border px-2.5 text-label transition-colors lg:h-8",
									active
										? "border-primary bg-primary text-primary-foreground"
										: "border-border-strong text-muted fine-hover:border-foreground/50 fine-hover:text-foreground",
								)}
							>
								<span dir="ltr" className="tabular-nums">
									{formatDecadeLabel(locale, bucket.label)}
								</span>
								<span
									className={cn(
										"tabular-nums",
										active ? "text-primary-foreground/80" : "text-muted",
									)}
								>
									{formatCount(locale, bucket.count)}
								</span>
								{active ? (
									<span className="visually-hidden">{selectedLabel}</span>
								) : null}
							</SearchNavLink>
						</li>
					);
				})}
			</ul>
		</RefineGroup>
	);
}

type RefinePanelProps = {
	state: SearchPageState;
	facets: PlatformFacets | null | undefined;
	locale: string;
	/** "sidebar" = desktop paper column (≥lg); "inline" = mobile fold (<lg). */
	variant: RefineVariant;
	/** Matched total of the current page — the live count on the done button. */
	totalElements: number;
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
 * Rendered twice (sidebar ≥lg, inline <lg); the fold state of each copy lives
 * in the transition context under its own `${variant}:${facet}` key.
 */
export async function RefinePanel({
	state,
	facets,
	locale,
	variant,
	totalElements,
}: RefinePanelProps) {
	const t = await getTranslations("Search");
	if (!facets || !hasRefinements(facets)) {
		return null;
	}

	const activeCount = countActiveFilters(state.filters);
	const clearedHref = buildSearchHref(withClearedFilters(state));
	const moreLabel = t("facetMore");
	const selectedLabel = t("facetSelected");

	const groups = (
		<>
			{GROUPS.map((def) => {
				const buckets = facets[def.facet] ?? [];
				if (buckets.length === 0) {
					return null;
				}
				return (
					<FacetGroup
						key={def.facet}
						def={def}
						buckets={buckets}
						state={state}
						locale={locale}
						variant={variant}
						title={t(def.labelKey)}
						moreLabel={moreLabel}
						selectedLabel={selectedLabel}
					/>
				);
			})}
			{(facets.decades?.length ?? 0) > 0 ? (
				<DecadeGroup
					buckets={facets.decades ?? []}
					state={state}
					locale={locale}
					variant={variant}
					title={t("facetDecade")}
					moreLabel={moreLabel}
					selectedLabel={selectedLabel}
				/>
			) : null}
		</>
	);

	if (variant === "inline") {
		return (
			<RefineInlineShell>
				<div className="mt-4 border border-border bg-surface">
					<div className="px-4 [&>section:last-child]:border-b-0">{groups}</div>
					{/* No max-height and no inner scroll on the panel, so this footer
					    sticks to the VIEWPORT edge while any part of it is on screen. */}
					<div className="sticky bottom-0 z-10 flex items-center gap-3 border-t border-border bg-surface px-4 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
						<RefineDone count={totalElements} locale={locale} />
						{activeCount > 0 ? (
							<SearchNavLink
								href={clearedHref}
								data-focus-key="refine:clear"
								className="inline-flex min-h-11 items-center px-2 text-small text-muted underline decoration-border underline-offset-4 transition-colors fine-hover:text-foreground fine-hover:decoration-current"
							>
								{t("filtersClearShort")}
							</SearchNavLink>
						) : null}
					</div>
				</div>
			</RefineInlineShell>
		);
	}

	return (
		<aside
			aria-labelledby="refine-title"
			className={cn(
				"hidden lg:col-start-1 lg:row-start-1 lg:block",
				"lg:sticky lg:top-[calc(var(--header-h)+1.5rem)] lg:max-h-[calc(100dvh-var(--header-h)-3rem)]",
				"lg:overflow-y-auto lg:overscroll-contain lg:pe-2 [scrollbar-width:thin]",
			)}
		>
			<div className="flex items-baseline gap-2 border-b border-foreground pb-2.5">
				<h3
					id="refine-title"
					className="font-heading text-body font-semibold text-foreground"
				>
					{t("filtersTitle")}
				</h3>
				{activeCount > 0 ? (
					<Badge variant="solid" size="sm" className="tabular-nums">
						{formatCount(locale, activeCount)}
					</Badge>
				) : null}
				{activeCount > 0 ? (
					<SearchNavLink
						href={clearedHref}
						data-focus-key="chip:clear"
						className="ms-auto text-label text-muted underline decoration-border underline-offset-4 transition-colors fine-hover:text-foreground fine-hover:decoration-current"
					>
						{t("filtersClearShort")}
					</SearchNavLink>
				) : null}
			</div>
			{groups}
		</aside>
	);
}
