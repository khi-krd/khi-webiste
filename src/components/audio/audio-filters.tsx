"use client";

import { useSearchParams } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { useCallback, useTransition } from "react";
import { unifiedLabels } from "@/components/filters/filter-labels";
import type { FilterOption } from "@/components/filters/filters-shared";
import { UnifiedSearchBar } from "@/components/filters/UnifiedSearchBar";
import { useFilterSearch } from "@/components/filters/use-filter-search";
import { useRouter } from "@/i18n/navigation";
import { buildAudioHref } from "@/lib/audio-url";
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
 * Style D — the writings-page bar. The type filter stays hidden (the
 * catalogue holds only گۆرانی); the شێواز axis (تۆماری تاک / ئەلبووم) rides
 * the types panel and بابەت gets the searchable counted list.
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

	const types: FilterOption[] = [
		{ id: "SINGLE", label: t("state.single") },
		{ id: "MULTI", label: t("state.multi") },
	];

	const topicOptions: FilterOption[] = topics.map((topic) => ({
		id: String(topic.id),
		label: topic.name,
		count: topic.count,
	}));

	return (
		<UnifiedSearchBar
			title={title}
			titleAs="h2"
			className={className}
			labels={{
				...unifiedLabels(locale),
				searchPlaceholder: t("filter.searchLabel"),
				type: t("filter.stateLabel"),
				allTypes: t("filter.stateAll"),
				searchTypes: t("filter.stateSearch"),
				noTypeMatch: t("filter.stateNoMatch"),
				otherTypes: t("filter.stateOther"),
				noTypesSelected: t("filter.stateNoneSelected"),
				typesSelected: (n) => t("filter.stateSelected", { count: n }),
				typesCount: (n) => t("filter.stateCount", { count: n }),
				author: t("filter.topicLabel"),
				allAuthors: t("filter.topicAll"),
				searchAuthors: t("filter.topicSearch"),
				noAuthorMatch: t("filter.topicNoMatch"),
			}}
			query={query}
			onQueryChange={(v) => {
				setQuery(v);
				schedule((value) => navigate({ q: value }, true), v);
			}}
			onSearchSubmit={(v) => {
				cancel();
				navigate({ q: v });
			}}
			types={types}
			// One شێواز at a time — a new pick replaces the old.
			selectedTypes={activeState ? [activeState] : []}
			onTypesChange={(ids) =>
				navigate({
					state: ids.length
						? ((ids[ids.length - 1] as TrackState) ?? null)
						: null,
				})
			}
			authors={topicOptions}
			selectedAuthor={
				activeTopicId != null ? String(activeTopicId) : null
			}
			onAuthorChange={(id) =>
				navigate({ topic: id ? Number.parseInt(id, 10) : null })
			}
			resultCount={resultCount}
		/>
	);
}

export default AudioFilters;
