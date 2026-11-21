"use client";

import { useSearchParams } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { useCallback, useTransition } from "react";
import { unifiedLabels } from "@/components/filters/filter-labels";
import type { FilterOption } from "@/components/filters/filters-shared";
import { UnifiedSearchBar } from "@/components/filters/UnifiedSearchBar";
import { useFilterSearch } from "@/components/filters/use-filter-search";
import { useRouter } from "@/i18n/navigation";
import { buildVideoHref } from "@/lib/video-url";
import type { VideoType } from "@/types/video";

type TopicOption = {
	id: number;
	name: string;
	count?: number;
};

type VideoFiltersProps = {
	topics: TopicOption[];
	categories?: TopicOption[];
	activeType?: VideoType | null;
	activeTopicId?: number | null;
	activeCategoryId?: number | null;
	activeMemories?: boolean | null;
	activeQuery?: string | null;
	resultCount: number;
	title: string;
	basePath?: string;
	scrollTargetId?: string;
	className?: string;
};

/**
 * Style D — the writings-page bar: search + جۆر panel (فیلم/کلیپ, single —
 * the listing endpoint takes one type), کۆکراوە list and a searchable بابەت
 * list with live counts. State lives in the URL.
 */
export function VideoFilters({
	topics,
	categories = [],
	activeType,
	activeTopicId,
	activeCategoryId,
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
				category?: number | null;
				memories?: boolean | null;
				q?: string;
			},
			replace = false,
		) => {
			const href = buildVideoHref({
				basePath,
				type: "type" in opts ? opts.type : activeType,
				topic: "topic" in opts ? opts.topic : activeTopicId,
				category: "category" in opts ? opts.category : activeCategoryId,
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
			activeCategoryId,
			activeMemories,
			query,
			scrollTargetId,
		],
	);

	const types: FilterOption[] = [
		{ id: "FILM", label: t("types.FILM") },
		{ id: "VIDEO_CLIP", label: t("types.VIDEO_CLIP") },
	];

	const topicOptions: FilterOption[] = topics.map((topic) => ({
		id: String(topic.id),
		label: topic.name,
		count: topic.count,
	}));

	const categoryOptions: FilterOption[] = categories.map((category) => ({
		id: String(category.id),
		label: category.name,
		count: category.count,
	}));

	return (
		<UnifiedSearchBar
			title={title}
			titleAs="h2"
			className={className}
			labels={{
				...unifiedLabels(locale),
				searchPlaceholder: t("filter.searchLabel"),
				allTypes: t("filter.all"),
				author: t("filter.topicLabel"),
				allAuthors: t("filter.all"),
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
			// The listing endpoint takes ONE type — a new pick replaces the old.
			selectedTypes={activeType ? [activeType] : []}
			onTypesChange={(ids) =>
				navigate({
					type: ids.length
						? ((ids[ids.length - 1] as VideoType) ?? null)
						: null,
				})
			}
			extra={[
				{
					label: t("filter.collectionLabel"),
					allLabel: t("filter.all"),
					noMatch: "",
					asPills: true,
					options: [{ id: "memories", label: t("filter.memoriesLabel") }],
					selected: activeMemories ? "memories" : null,
					onChange: (id) => navigate({ memories: id === "memories" }),
				},
				{
					label: t("filter.categoryLabel"),
					allLabel: t("filter.all"),
					noMatch: t("filter.topicNoMatch"),
					options: categoryOptions,
					selected: activeCategoryId != null ? String(activeCategoryId) : null,
					onChange: (id) =>
						navigate({ category: id ? Number.parseInt(id, 10) : null }),
				},
			]}
			authors={topicOptions}
			selectedAuthor={activeTopicId != null ? String(activeTopicId) : null}
			onAuthorChange={(id) =>
				navigate({ topic: id ? Number.parseInt(id, 10) : null })
			}
			resultCount={resultCount}
		/>
	);
}

export default VideoFilters;
