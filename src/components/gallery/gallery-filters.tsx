"use client";

import { useLocale, useTranslations } from "next-intl";
import { useCallback, useTransition } from "react";
import { unifiedLabels } from "@/components/filters/filter-labels";
import type { FilterOption } from "@/components/filters/filters-shared";
import { UnifiedSearchBar } from "@/components/filters/UnifiedSearchBar";
import { useFilterSearch } from "@/components/filters/use-filter-search";
import { Link, useRouter } from "@/i18n/navigation";
import { buildGalleryHref, parseGalleryTopicId } from "@/lib/gallery-url";
import type { GalleryCollectionType } from "@/lib/mock/gallery";

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

/**
 * Style D — the writings-page bar: search + جۆر panel (گەلەری / چیرۆکی
 * وێنەیی / تاک وێنە, single) and a searchable بابەت list with live counts.
 * The کۆکراوەکان link stays beside the title.
 */
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

	const types: FilterOption[] = TYPE_ORDER.map((type) => ({
		id: type,
		label: t(`posts.types.${type}`),
	}));

	const topicOptions: FilterOption[] = topics.map((topic) => ({
		id: String(topic.id),
		label: topic.name,
		count: topic.count,
	}));

	return (
		<UnifiedSearchBar
			title={title}
			titleAs="h1"
			className={className}
			titleExtra={
				<Link href="#gallery-content" className="usb__title-link">
					{collectionsLabel}
				</Link>
			}
			labels={{
				...unifiedLabels(locale),
				searchPlaceholder: t("search.label"),
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
			// One collection type at a time — a new pick replaces the old.
			selectedTypes={activeType ? [activeType] : []}
			onTypesChange={(ids) =>
				navigate({ type: ids.length ? (ids[ids.length - 1] ?? null) : null })
			}
			authors={topicOptions}
			selectedAuthor={
				activeTopicId != null ? String(activeTopicId) : null
			}
			onAuthorChange={(id) => navigate({ topic: parseGalleryTopicId(id) })}
			resultCount={resultCount}
		/>
	);
}

export default GalleryFilters;
