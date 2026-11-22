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

	/**
	 * The "جۆر" axis is the managed پۆل vocabulary — film/clip are seeded
	 * rows and admins add folklore/documentary/etc. The structural `?type=`
	 * (FILM/VIDEO_CLIP) param still filters when a legacy link carries it,
	 * but no longer drives the visible axis.
	 */
	const types: FilterOption[] = categories.map((category) => ({
		id: String(category.id),
		label: category.name,
		count: category.count,
	}));

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
				type: t("filter.categoryLabel"),
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
			// One پۆل at a time — a new pick replaces the old, and clears
			// any legacy ?type= enum param the category axis supersedes.
			selectedTypes={activeCategoryId != null ? [String(activeCategoryId)] : []}
			onTypesChange={(ids) =>
				navigate({
					type: null,
					category: ids.length
						? Number.parseInt(ids[ids.length - 1] ?? "", 10) || null
						: null,
				})
			}
			extra={{
				label: t("filter.collectionLabel"),
				allLabel: t("filter.all"),
				noMatch: "",
				asPills: true,
				options: [{ id: "memories", label: t("filter.memoriesLabel") }],
				selected: activeMemories ? "memories" : null,
				onChange: (id) => navigate({ memories: id === "memories" }),
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

export default VideoFilters;
