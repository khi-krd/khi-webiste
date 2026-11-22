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
	soundTypes: string[];
	soundTypeLabels: Record<string, string>;
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
 * Style D — the writings-page bar. The جۆر axis is the managed
 * sound-tracks/types vocabulary; شێواز (تۆماری تاک / ئەلبووم) rides the
 * extra pill axis and بابەت gets the searchable counted list.
 */
export function AudioFilters({
	topics,
	soundTypes,
	soundTypeLabels,
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
				type?: string | null;
				state?: TrackState | null;
				topic?: number | null;
				q?: string;
			},
			replace = false,
		) => {
			const href = buildAudioHref({
				type: "type" in opts ? opts.type : activeType,
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

	const types: FilterOption[] = soundTypes.map((value) => ({
		id: value,
		label: soundTypeLabels[value] ?? value,
	}));

	const states: FilterOption[] = [
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
				type: t("filter.typeLabel"),
				allTypes: t("filter.allShort"),
				author: t("filter.topicLabel"),
				allAuthors: t("filter.allShort"),
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
			typeStyle="pills"
			// The API's search endpoint takes ONE soundType per request —
			// a new pick replaces the old instead of stacking.
			selectedTypes={activeType ? [activeType] : []}
			onTypesChange={(ids) =>
				navigate({ type: ids.length ? (ids[ids.length - 1] ?? null) : null })
			}
			extra={{
				label: t("filter.stateLabel"),
				allLabel: t("filter.allShort"),
				noMatch: t("filter.stateNoMatch"),
				asPills: true,
				options: states,
				selected: activeState ?? null,
				onChange: (id) =>
					navigate({
						state: id === "SINGLE" || id === "MULTI" ? id : null,
					}),
			}}
			authors={topicOptions}
			selectedAuthor={activeTopicId != null ? String(activeTopicId) : null}
			onAuthorChange={(id) =>
				navigate({ topic: id ? Number.parseInt(id, 10) : null })
			}
			resultCount={resultCount}
		/>
	);
}

export default AudioFilters;
