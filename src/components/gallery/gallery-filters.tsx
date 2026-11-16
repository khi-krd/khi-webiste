"use client";

import { useLocale, useTranslations } from "next-intl";
import { useCallback, useTransition } from "react";
import { tabRailLabels } from "@/components/filters/filter-labels";
import type { FilterOption } from "@/components/filters/filters-shared";
import { TabRailFilter } from "@/components/filters/TabRailFilter";
import { useFilterSearch } from "@/components/filters/use-filter-search";
import { Link, useRouter } from "@/i18n/navigation";
import { buildGalleryHref, parseGalleryTopicId } from "@/lib/gallery-url";
import type { GalleryCollectionType } from "@/lib/mock/gallery";
import { formatCount } from "@/lib/platform/format";

type TopicOption = {
	id: number;
	name: string;
	count?: number;
};

type GalleryFiltersProps = {
	topics: TopicOption[];
	activeType?: string | null;
	activeTopicId?: number | null;
	activeQuery?: string | null;
	resultCount: number;
	title: string;
	collectionsLabel: string;
	className?: string;
};

const TYPE_ORDER: GalleryCollectionType[] = [
	"GALLERY",
	"PHOTO_STORY",
	"SINGLE",
];

/** Style A — title + underline search, type tabs, quiet بابەت dropdown. */
export function GalleryFilters({
	topics,
	activeType,
	activeTopicId,
	activeQuery,
	resultCount,
	title,
	collectionsLabel,
	className,
}: GalleryFiltersProps) {
	const t = useTranslations("Gallery");
	const locale = useLocale();
	const router = useRouter();
	const [, startTransition] = useTransition();
	const { query, setQuery, schedule, cancel } = useFilterSearch(activeQuery);

	const navigate = useCallback(
		(
			opts: {
				type?: string | null;
				topic?: number | null;
				q?: string;
			},
			replace = false,
		) => {
			const href = buildGalleryHref({
				type: "type" in opts ? opts.type : activeType,
				topic: "topic" in opts ? opts.topic : activeTopicId,
				q: opts.q ?? query,
				page: 1,
			});
			startTransition(() => {
				if (replace) router.replace(href, { scroll: false });
				else router.push(href, { scroll: false });
				router.refresh();
			});
		},
		[router, activeType, activeTopicId, query],
	);

	const tabs: FilterOption[] = TYPE_ORDER.map((type) => ({
		id: type,
		label: t(`posts.types.${type}`),
	}));

	return (
		<TabRailFilter
			title={title}
			titleAs="h1"
			className={className}
			labels={tabRailLabels(locale)}
			titleExtra={
				<Link href="#gallery-content" className="tr__title-link">
					{collectionsLabel}
				</Link>
			}
			query={query}
			onQueryChange={(v) => {
				setQuery(v);
				schedule((value) => navigate({ q: value }, true), v);
			}}
			onSearchSubmit={(v) => {
				cancel();
				navigate({ q: v });
			}}
			searchPlaceholder={t("search.label")}
			tabsLabel={t("filter.typeLabel")}
			tabs={tabs}
			activeTab={activeType ?? null}
			onTabChange={(id) => navigate({ type: id })}
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
					onChange: (v) => navigate({ topic: parseGalleryTopicId(v) }),
				},
			]}
			resultCount={resultCount}
		/>
	);
}

export default GalleryFilters;
