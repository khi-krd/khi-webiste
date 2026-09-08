import {
	ArchiveBoxIcon,
	BookOpenIcon,
	GlobeAltIcon,
} from "@heroicons/react/24/outline";
import { getTranslations } from "next-intl/server";
import type { ComponentProps, ComponentType, ReactNode } from "react";
import { kindChipClass } from "@/components/search/chip-styles";
import { KindIcon } from "@/components/search/kind-icon";
import { PlatformPlate } from "@/components/search/platform-plate";
import { RESULTS_ANCHOR_ID } from "@/components/search/results-anchor";
import { RetryButton } from "@/components/search/retry-button";
import {
	AnnounceResults,
	FocusRestore,
	RESULTS_SUMMARY_ID,
	SearchNavLink,
	SearchPendingRegion,
} from "@/components/search/search-transition";
import { SiteSection, siteSectionsOf } from "@/components/search/site-results";
import {
	SOURCE_DESCRIPTION_KEYS,
	SOURCE_LABEL_KEYS,
} from "@/components/search/source-links";
import { viewAllCtaClass } from "@/components/ui/cta-styles";
import type { SearchScope } from "@/config/site";
import { searchPlatformMedia } from "@/lib/api/platform";
import {
	PLATFORM_MEDIA_KINDS,
	type PlatformMediaKind,
} from "@/lib/platform/constants";
import { formatCount } from "@/lib/platform/format";
import { KIND_LABEL_KEYS } from "@/lib/platform/kind-labels";
import {
	buildSearchHref,
	type SearchPageState,
} from "@/lib/platform/search-url";
import { searchSiteWithFallback } from "@/lib/search/site-search";
import type { PlatformHit } from "@/types/platform";

/** Plates per kind in the platform block — one row on desktop. */
const PLATFORM_PER_KIND = 4;
/** Rows per catalogue in the website block. */
const SITE_PER_SECTION = 4;

const bdi = (chunks: ReactNode) => <bdi dir="auto">{chunks}</bdi>;

type SourceIcon = ComponentType<ComponentProps<"svg">>;

const SOURCE_ICONS: Record<SearchScope, SourceIcon> = {
	archive: ArchiveBoxIcon,
	main: GlobeAltIcon,
	library: BookOpenIcon,
};

function sourceSectionId(scope: SearchScope): string {
	return `source-${scope}`;
}

type KindGroup = {
	kind: PlatformMediaKind;
	hits: PlatformHit[];
	count: number;
};

type PlatformOverview = {
	groups: KindGroup[];
	total: number;
	unavailable: boolean;
};

/**
 * The platform, classified by kind: one small request per kind so every
 * group shows its own best matches rather than whatever survived a single
 * ranked page. `counts` is stable across kinds, so any answer carries the
 * totals for all four.
 */
async function loadPlatform(state: SearchPageState): Promise<PlatformOverview> {
	const responses = await Promise.all(
		PLATFORM_MEDIA_KINDS.map((kind) =>
			searchPlatformMedia({
				q: state.q,
				type: kind,
				page: 0,
				size: PLATFORM_PER_KIND,
				facets: false,
			}),
		),
	);
	const counts = responses.find((response) => response != null)?.counts;
	if (!counts) {
		return { groups: [], total: 0, unavailable: true };
	}
	const groups = PLATFORM_MEDIA_KINDS.map((kind, index) => ({
		kind,
		hits: responses[index]?.content ?? [],
		count: responses[index]?.counts[kind] ?? counts[kind],
	})).filter((group) => group.hits.length > 0);
	return { groups, total: counts.total, unavailable: false };
}

/** A source's block: its heading rule, description and "all N" link. */
function SourceSection({
	scope,
	label,
	description,
	count,
	allHref,
	allLabel,
	children,
}: {
	scope: SearchScope;
	label: string;
	description: string;
	count: string | null;
	allHref: string | null;
	allLabel: string | null;
	children: ReactNode;
}) {
	const Icon = SOURCE_ICONS[scope];
	const id = sourceSectionId(scope);

	return (
		<section
			id={id}
			aria-labelledby={`${id}-title`}
			className="scroll-mt-26 sm:scroll-mt-30"
		>
			<div className="flex flex-wrap items-end justify-between gap-x-6 gap-y-3 border-b border-foreground pb-3">
				<div className="min-w-0">
					<h3
						id={`${id}-title`}
						className="flex items-center gap-2.5 font-heading text-h3 font-semibold text-foreground"
					>
						<Icon className="size-5 shrink-0 text-muted" aria-hidden />
						{label}
						{count != null ? (
							<span className="text-label tabular-nums text-muted">
								{count}
							</span>
						) : null}
					</h3>
					<p className="mt-1 text-small text-muted">{description}</p>
				</div>
				{allHref && allLabel ? (
					<SearchNavLink
						href={allHref}
						data-focus-key={`source-all:${scope}`}
						className={viewAllCtaClass}
					>
						<span className="relative z-1">{allLabel}</span>
					</SearchNavLink>
				) : null}
			</div>
			{children}
		</section>
	);
}

function SectionNote({ children }: { children: ReactNode }) {
	return <p className="mt-4 text-small text-muted">{children}</p>;
}

function SectionUnavailable({
	text,
	retryLabel,
}: {
	text: string;
	retryLabel: string;
}) {
	return (
		<div className="mt-5 flex flex-wrap items-center gap-4">
			<p className="text-small text-muted">{text}</p>
			<RetryButton label={retryLabel} />
		</div>
	);
}

/**
 * The default view — several sources checked — as one classified overview:
 * a block per source in display order, and inside the platform block a row
 * per media kind, each group with a link that narrows the search to just
 * that source (and kind), where the full tools live: kind chips, refine
 * panel, sort and paging.
 */
export async function SearchOverview({
	state,
	locale,
}: {
	state: SearchPageState;
	locale: string;
}) {
	const [t, tNav] = await Promise.all([
		getTranslations("Search"),
		getTranslations("Nav"),
	]);
	const query = state.q.trim();
	const hasQuery = query.length > 0;
	const wantsPlatform = state.sources.includes("archive");
	const wantsSite = state.sources.includes("main");
	const wantsLibrary = state.sources.includes("library");

	// The website has no browse endpoint — it is only asked with a query.
	const [platform, site] = await Promise.all([
		wantsPlatform ? loadPlatform(state) : Promise.resolve(null),
		wantsSite && hasQuery
			? searchSiteWithFallback(locale, {
					q: query,
					type: "ALL",
					page: 0,
					size: SITE_PER_SECTION,
				})
			: Promise.resolve(undefined),
	]);

	const siteSections = site ? siteSectionsOf(site) : [];
	const siteTotal = siteSections.reduce(
		(sum, entry) => sum + entry.section.totalElements,
		0,
	);
	const platformTotal = platform && !platform.unavailable ? platform.total : 0;
	const total = platformTotal + siteTotal;
	const count = formatCount(locale, total);
	const sourceCount = formatCount(locale, state.sources.length);

	const plainSummary = hasQuery
		? t("overviewResultsFor", { count, query, sourceCount })
		: t("overviewBrowseTitle");
	const richSummary = hasQuery
		? t.rich("overviewResultsForRich", { count, query, sourceCount, bdi })
		: t("overviewBrowseTitle");

	const archiveLabel = t(SOURCE_LABEL_KEYS.archive);
	const siteLabel = t(SOURCE_LABEL_KEYS.main);
	const libraryLabel = t(SOURCE_LABEL_KEYS.library);

	// The jump strip — every checked source, with what it holds.
	const jumps: { scope: SearchScope; label: string; count: string | null }[] =
		[];
	if (wantsPlatform) {
		jumps.push({
			scope: "archive",
			label: archiveLabel,
			count: platform?.unavailable ? null : formatCount(locale, platformTotal),
		});
	}
	if (wantsSite) {
		jumps.push({
			scope: "main",
			label: siteLabel,
			count: site ? formatCount(locale, siteTotal) : null,
		});
	}
	if (wantsLibrary) {
		jumps.push({
			scope: "library",
			label: libraryLabel,
			count: t("librarySoonShort"),
		});
	}

	// Plates keep one running index: their DOM ids are positional, and the
	// mount stagger reads naturally across the kind rows.
	let plateIndex = 0;

	return (
		<div id={RESULTS_ANCHOR_ID} className="scroll-mt-26 sm:scroll-mt-30">
			<FocusRestore rootId={RESULTS_ANCHOR_ID} />

			<div className="border-b border-border pb-3">
				<h2
					id={RESULTS_SUMMARY_ID}
					tabIndex={-1}
					className="font-heading text-lead font-semibold text-foreground focus-visible:outline-none sm:text-h3"
				>
					{richSummary}
				</h2>
				{!hasQuery ? (
					<p className="mt-0.5 text-small text-muted">
						{t("overviewBrowseDescription")}
					</p>
				) : null}
			</div>

			<nav aria-label={t("sourcesLabel")} className="mt-4">
				<ul className="flex flex-wrap gap-2">
					{jumps.map((jump) => {
						const Icon = SOURCE_ICONS[jump.scope];
						return (
							<li key={jump.scope}>
								<a
									href={`#${sourceSectionId(jump.scope)}`}
									className={kindChipClass(false)}
								>
									<Icon className="size-4 shrink-0" aria-hidden />
									<span>{jump.label}</span>
									{jump.count != null ? (
										<span className="text-label tabular-nums text-muted">
											{jump.count}
										</span>
									) : null}
								</a>
							</li>
						);
					})}
				</ul>
			</nav>

			<SearchPendingRegion className="mt-8 sm:mt-10">
				<div className="flex flex-col gap-12 sm:gap-14">
					{/* ---- پلاتفۆڕم, by kind ---------------------------------------- */}
					{wantsPlatform && platform ? (
						<SourceSection
							scope="archive"
							label={archiveLabel}
							description={t(SOURCE_DESCRIPTION_KEYS.archive)}
							count={
								platform.unavailable ? null : formatCount(locale, platformTotal)
							}
							allHref={
								platformTotal > 0
									? buildSearchHref({ sources: ["archive"], q: state.q })
									: null
							}
							allLabel={t("sourceSectionAll", {
								count: formatCount(locale, platformTotal),
								source: archiveLabel,
							})}
						>
							{platform.unavailable ? (
								<SectionUnavailable
									text={t("unavailableTitle")}
									retryLabel={t("retry")}
								/>
							) : platform.groups.length === 0 ? (
								<SectionNote>
									{t("sourceSectionEmpty", { source: archiveLabel })}
								</SectionNote>
							) : (
								<div className="mt-6 flex flex-col gap-8 sm:gap-10">
									{platform.groups.map((group) => {
										const kindLabel = t(KIND_LABEL_KEYS[group.kind]);
										const titleId = `kind-${group.kind}-title`;
										const offset = plateIndex;
										plateIndex += group.hits.length;
										return (
											<section key={group.kind} aria-labelledby={titleId}>
												<div className="flex items-center gap-3">
													<h4
														id={titleId}
														className="flex items-center gap-2 font-heading text-body font-semibold text-foreground"
													>
														<KindIcon
															kind={group.kind}
															className="size-4.5 shrink-0 text-muted"
														/>
														{kindLabel}
													</h4>
													<span className="text-label tabular-nums text-muted">
														{formatCount(locale, group.count)}
													</span>
													<span aria-hidden className="h-px flex-1 bg-border" />
													{group.count > group.hits.length ? (
														<SearchNavLink
															href={buildSearchHref({
																sources: ["archive"],
																q: state.q,
																kind: group.kind,
															})}
															data-focus-key={`kind-all:${group.kind}`}
															className="shrink-0 text-small text-muted underline decoration-border underline-offset-4 transition-colors fine-hover:text-foreground fine-hover:decoration-current"
														>
															{t("kindGroupAll", {
																count: formatCount(locale, group.count),
																kind: kindLabel,
															})}
														</SearchNavLink>
													) : null}
												</div>
												<ol
													aria-labelledby={titleId}
													className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4 lg:gap-5"
												>
													{group.hits.map((hit, index) => (
														<PlatformPlate
															key={`${hit.type}:${hit.code}`}
															hit={hit}
															index={offset + index}
															locale={locale}
															hasQuery={hasQuery}
															titleLevel={5}
														/>
													))}
												</ol>
											</section>
										);
									})}
								</div>
							)}
						</SourceSection>
					) : null}

					{/* ---- ماڵپەر, by catalogue ------------------------------------- */}
					{wantsSite ? (
						<SourceSection
							scope="main"
							label={siteLabel}
							description={t(SOURCE_DESCRIPTION_KEYS.main)}
							count={site ? formatCount(locale, siteTotal) : null}
							allHref={
								hasQuery && siteTotal > 0
									? buildSearchHref({ sources: ["main"], q: state.q })
									: null
							}
							allLabel={t("sourceSectionAll", {
								count: formatCount(locale, siteTotal),
								source: siteLabel,
							})}
						>
							{!hasQuery ? (
								<SectionNote>{t("siteNeedsQuery")}</SectionNote>
							) : site === null ? (
								<SectionUnavailable
									text={t("siteUnavailable")}
									retryLabel={t("retry")}
								/>
							) : siteSections.length === 0 ? (
								<SectionNote>
									{t("sourceSectionEmpty", { source: siteLabel })}
								</SectionNote>
							) : (
								<div className="mt-6 grid gap-10 md:grid-cols-2 md:gap-x-14">
									{siteSections.map(({ def, section }) => (
										<SiteSection
											key={def.key}
											def={def}
											section={section}
											label={tNav(def.navLabelKey)}
											viewAllLabel={t("siteViewAll", {
												section: tNav(def.navLabelKey),
											})}
											locale={locale}
											q={query}
											limit={SITE_PER_SECTION}
											headingLevel={4}
										/>
									))}
								</div>
							)}
						</SourceSection>
					) : null}

					{/* ---- کتێبخانە ----------------------------------------------- */}
					{wantsLibrary ? (
						<SourceSection
							scope="library"
							label={libraryLabel}
							description={t(SOURCE_DESCRIPTION_KEYS.library)}
							count={null}
							allHref={null}
							allLabel={null}
						>
							<SectionNote>{t("librarySoonDescription")}</SectionNote>
						</SourceSection>
					) : null}
				</div>
			</SearchPendingRegion>

			<AnnounceResults text={t("announceResults", { summary: plainSummary })} />
		</div>
	);
}
