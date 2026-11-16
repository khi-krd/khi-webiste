"use client";

import { useSearchParams } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { useCallback, useTransition } from "react";
import { tabRailLabels } from "@/components/filters/filter-labels";
import type { FilterOption } from "@/components/filters/filters-shared";
import { TabRailFilter } from "@/components/filters/TabRailFilter";
import { useFilterSearch } from "@/components/filters/use-filter-search";
import { useRouter } from "@/i18n/navigation";
import { formatCount } from "@/lib/platform/format";
import { buildVideoHref } from "@/lib/video-url";
import type { VideoType } from "@/types/video";

type TopicOption = {
	id: number;
	name: string;
	count?: number;
};

type VideoFiltersProps = {
	topics: TopicOption[];
	activeType?: VideoType | null;
	activeTopicId?: number | null;
	activeMemories?: boolean | null;
	activeQuery?: string | null;
	resultCount: number;
	title: string;
	basePath?: string;
	scrollTargetId?: string;
	className?: string;
};

/**
 * Style A — فیلم/کلیپەکان tabs, then quiet dropdowns for کۆکراوە (the old
 * "ئەلبومی یادەوەرییەکان" toggle, now a select) and بابەت.
 */
export function VideoFilters({
	topics,
	activeType,
	activeTopicId,
	activeMemories,
	activeQuery,
	resultCount,
	title,
	basePath = "/videos",
	scrollTargetId = "videos-grid",
	className,
}: VideoFiltersProps) {
	const t = useTranslations("Video");
	const locale = useLocale();
	const router = useRouter();
	const searchParams = useSearchParams();
	const [, startTransition] = useTransition();
	const { query, setQuery, schedule, cancel } = useFilterSearch(activeQuery);

	const navigate = useCallback(
		(
			opts: {
				type?: VideoType | null;
				topic?: number | null;
				memories?: boolean | null;
				q?: string;
			},
			replace = false,
		) => {
			const href = buildVideoHref({
				basePath,
				type: "type" in opts ? opts.type : activeType,
				topic: "topic" in opts ? opts.topic : activeTopicId,
				memories: "memories" in opts ? opts.memories : activeMemories,
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
			basePath,
			activeType,
			activeTopicId,
			activeMemories,
			query,
			scrollTargetId,
		],
	);

	const tabs: FilterOption[] = [
		{ id: "FILM", label: t("types.FILM") },
		{ id: "VIDEO_CLIP", label: t("types.VIDEO_CLIP") },
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
			tabsLabel={t("filter.typeLabel")}
			tabs={tabs}
			activeTab={activeType ?? null}
			onTabChange={(id) => navigate({ type: id as VideoType | null })}
			selects={[
				{
					id: "memories",
					label: t("filter.collectionLabel"),
					value: activeMemories ? "memories" : "",
					options: [
						{ value: "", label: t("filter.all") },
						{ value: "memories", label: t("filter.memoriesLabel") },
					],
					onChange: (v) => navigate({ memories: v === "memories" }),
				},
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

export default VideoFilters;
