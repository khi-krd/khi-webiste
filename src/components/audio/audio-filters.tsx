"use client";

import { useSearchParams } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { useCallback, useTransition } from "react";
import { tabRailLabels } from "@/components/filters/filter-labels";
import type { FilterOption } from "@/components/filters/filters-shared";
import { TabRailFilter } from "@/components/filters/TabRailFilter";
import { useFilterSearch } from "@/components/filters/use-filter-search";
import { useRouter } from "@/i18n/navigation";
import { buildAudioHref } from "@/lib/audio-url";
import { formatCount } from "@/lib/platform/format";
import type { TrackState } from "@/types/audio";

type TopicOption = {
	id: number;
	name: string;
	count?: number;
};

type AudioFiltersProps = {
	topics: TopicOption[];
	/** Kept for URL round-trips — the single "گۆرانی" type is hidden by design. */
	activeType?: string | null;
	activeState?: TrackState | null;
	activeTopicId?: number | null;
	activeTag?: string | null;
	activeQuery?: string | null;
	resultCount: number;
	title: string;
	scrollTargetId?: string;
	className?: string;
};

/**
 * Style A — the type filter is hidden (the catalogue holds only گۆرانی), so
 * the tab rail carries the شێواز axis instead: تۆماری تاک / ئەلبووم. The
 * بابەت dropdown keeps its live counts.
 */
export function AudioFilters({
	topics,
	activeType,
	activeState,
	activeTopicId,
	activeTag,
	activeQuery,
	resultCount,
	title,
	scrollTargetId = "audio-grid",
	className,
}: AudioFiltersProps) {
	const t = useTranslations("Audio");
	const locale = useLocale();
	const router = useRouter();
	const searchParams = useSearchParams();
	const [, startTransition] = useTransition();
	const { query, setQuery, schedule, cancel } = useFilterSearch(activeQuery);

	const navigate = useCallback(
		(
			opts: {
				state?: TrackState | null;
				topic?: number | null;
				q?: string;
			},
			replace = false,
		) => {
			const href = buildAudioHref({
				type: activeType,
				state: "state" in opts ? opts.state : activeState,
				topic: "topic" in opts ? opts.topic : activeTopicId,
				tag: activeTag,
				q: opts.q ?? query,
				page: 1,
			});
			startTransition(() => {
				if (replace) router.replace(href, { scroll: false });
				else router.push(href, { scroll: false });
				router.refresh();
				if (searchParams.toString()) {
					document
						.getElementById(scrollTargetId)
						?.scrollIntoView({ block: "start" });
				}
			});
		},
		[
			router,
			searchParams,
			activeType,
			activeState,
			activeTopicId,
			activeTag,
			query,
			scrollTargetId,
		],
	);

	const tabs: FilterOption[] = [
		{ id: "SINGLE", label: t("state.single") },
		{ id: "MULTI", label: t("state.multi") },
	];

	return (
		<TabRailFilter
			title={title}
			titleAs="h2"
			className={className}
			labels={tabRailLabels(locale)}
			query={query}
			onQueryChange={(v) => {
				setQuery(v);
				schedule((value) => navigate({ q: value }, true), v);
			}}
			onSearchSubmit={(v) => {
				cancel();
				navigate({ q: v });
			}}
			searchPlaceholder={t("filter.searchLabel")}
			tabsLabel={t("filter.stateLabel")}
			tabs={tabs}
			activeTab={activeState ?? null}
			onTabChange={(id) => navigate({ state: id as TrackState | null })}
			selects={[
				{
					id: "topic",
					label: t("filter.topicLabel"),
					value: activeTopicId != null ? String(activeTopicId) : "",
					options: [
						{ value: "", label: t("filter.topicAll") },
						...topics.map((topic) => ({
							value: String(topic.id),
							label:
								topic.count != null
									? `${topic.name} (${formatCount(locale, topic.count)})`
									: topic.name,
						})),
					],
					onChange: (v) =>
						navigate({ topic: v ? Number.parseInt(v, 10) : null }),
				},
			]}
			resultCount={resultCount}
		/>
	);
}

export default AudioFilters;
