import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Suspense } from "react";
import { HeadingRow } from "@/components/search/heading-row";
import { LibrarySoon } from "@/components/search/library-soon";
import { PlatformResults } from "@/components/search/platform-results";
import {
	OverviewSkeleton,
	ResultsSkeleton,
} from "@/components/search/results-skeleton";
import { SearchHeader } from "@/components/search/search-header";
import { SearchOverview } from "@/components/search/search-overview";
import { SearchTransitionProvider } from "@/components/search/search-transition";
import { SiteResults } from "@/components/search/site-results";
import { homeInsetClass } from "@/lib/layout";
import {
	parseSearchPageState,
	type RawSearchParams,
	searchMode,
} from "@/lib/platform/search-url";
import { localeAlternates } from "@/lib/seo/metadata";
import { cn } from "@/lib/utils";

type SearchPageProps = {
	params: Promise<{ locale: string }>;
	searchParams: Promise<RawSearchParams>;
};

export async function generateMetadata({
	params,
	searchParams,
}: SearchPageProps): Promise<Metadata> {
	const [{ locale }, resolvedSearchParams] = await Promise.all([
		params,
		searchParams,
	]);
	const t = await getTranslations({ locale, namespace: "Search" });
	const state = parseSearchPageState(resolvedSearchParams);

	return {
		alternates: localeAlternates(locale, "/search"),
		title: state.q ? `${state.q} — ${t("pageTitle")}` : t("pageTitle"),
		description: t("metaDescription"),
		// Result pages are for people, not crawlers — the catalogues they link
		// to are the indexable surface.
		robots: { index: false, follow: true },
	};
}

/**
 * The unified results page: one query, three sources — ماڵپەر (this site's
 * CMS), پلاتفۆڕم (the archive platform) and کتێبخانە (coming). The URL carries
 * the whole search state, so every view is shareable and survives refresh.
 *
 * Two rows of chrome before the results: the heading line (h1 + source
 * description) and the command bar (scope segment · input · submit). Kind
 * chips, toolbar and refinements belong to the results tree itself.
 */
export default async function SearchPage({
	params,
	searchParams,
}: SearchPageProps) {
	const [{ locale }, resolvedSearchParams] = await Promise.all([
		params,
		searchParams,
	]);
	setRequestLocale(locale);

	const t = await getTranslations("Search");
	const state = parseSearchPageState(resolvedSearchParams);
	const mode = searchMode(state);

	// Suspense identity: a NEW key per query/source/filter combination streams a
	// fresh skeleton on hard loads, while client transitions keep the previous
	// list visible (the transition dims it instead).
	const resultsKey = JSON.stringify({ ...state, page: state.page });

	return (
		<main className="bg-background">
			<div className={cn(homeInsetClass, "pb-16 pt-6 sm:pb-24 sm:pt-8")}>
				<SearchTransitionProvider sourcesKey={state.sources.join(",")}>
					{/* The provider renders the live region here, ABOVE the
					    Suspense boundary, so announcements survive remounts. */}
					<search aria-label={t("heading")}>
						<HeadingRow state={state} />
						<SearchHeader state={state} />
					</search>

					<div className="mt-6 sm:mt-7">
						{mode === "platform" ? (
							<Suspense
								key={resultsKey}
								fallback={<ResultsSkeleton label={t("skeletonLabel")} />}
							>
								<PlatformResults state={state} locale={locale} />
							</Suspense>
						) : mode === "site" ? (
							<Suspense
								key={resultsKey}
								fallback={<ResultsSkeleton label={t("skeletonLabel")} />}
							>
								<SiteResults q={state.q} locale={locale} />
							</Suspense>
						) : mode === "library" ? (
							<LibrarySoon />
						) : (
							// Several sources checked (the default): one classified
							// overview — by source, and inside the platform by kind.
							<Suspense
								key={resultsKey}
								fallback={<OverviewSkeleton label={t("skeletonLabel")} />}
							>
								<SearchOverview state={state} locale={locale} />
							</Suspense>
						)}
					</div>
				</SearchTransitionProvider>
			</div>
		</main>
	);
}
