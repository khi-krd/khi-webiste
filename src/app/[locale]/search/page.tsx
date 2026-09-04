import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Suspense } from "react";
import { LibrarySoon } from "@/components/search/library-soon";
import { PlatformResults } from "@/components/search/platform-results";
import { ResultsSkeleton } from "@/components/search/results-skeleton";
import { SearchHeader } from "@/components/search/search-header";
import { SearchTransitionProvider } from "@/components/search/search-transition";
import { SiteResults } from "@/components/search/site-results";
import { SourceTabs } from "@/components/search/source-tabs";
import { homeInsetClass } from "@/lib/layout";
import {
	parseSearchPageState,
	type RawSearchParams,
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

	// Suspense identity: a NEW key per query/source/filter combination streams a
	// fresh skeleton on hard loads, while client transitions keep the previous
	// list visible (the transition dims it instead).
	const resultsKey = JSON.stringify({ ...state, page: state.page });

	return (
		<main className="bg-background">
			<div className={cn(homeInsetClass, "pb-16 pt-8 sm:pb-24 sm:pt-12")}>
				<SearchTransitionProvider>
					<header className="max-w-3xl">
						<h1 className="mb-5 font-heading text-h2 font-bold text-foreground sm:mb-7 sm:text-h1">
							{t("heading")}
						</h1>
						<SearchHeader state={state} />
					</header>

					<div className="mt-8 sm:mt-10">
						<SourceTabs state={state} />
					</div>

					<div className="mt-6 sm:mt-8">
						{state.source === "archive" ? (
							<Suspense key={resultsKey} fallback={<ResultsSkeleton />}>
								<PlatformResults state={state} locale={locale} />
							</Suspense>
						) : state.source === "main" ? (
							<Suspense key={resultsKey} fallback={<ResultsSkeleton />}>
								<SiteResults q={state.q} locale={locale} />
							</Suspense>
						) : (
							<LibrarySoon />
						)}
					</div>
				</SearchTransitionProvider>
			</div>
		</main>
	);
}
