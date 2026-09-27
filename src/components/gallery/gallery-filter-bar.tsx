"use client";

import { useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { useCallback, useEffect, useRef, useState, useTransition } from "react";
import { Badge } from "@/components/ui/badge";
import {
	FilterBar,
	FilterDivider,
	FilterGroupLabel,
	FilterPill,
	FilterSearchBox,
} from "@/components/ui/filter-bar";
import { Select } from "@/components/ui/select";
import { useRouter } from "@/i18n/navigation";
import {
	buildGalleryHref,
	isGalleryCollectionType,
	parseGalleryTopicId,
} from "@/lib/gallery-url";
import type { GalleryCollectionType } from "@/lib/mock/gallery";
import { useScrollToSection } from "@/lib/use-scroll-to-section";

const GALLERY_TYPE_OPTIONS: GalleryCollectionType[] = [
	"GALLERY",
	"PHOTO_STORY",
	"SINGLE",
];

type TopicOption = {
	id: number;
	name: string;
};

type GalleryFilterBarProps = {
	topics: TopicOption[];
	activeType?: string | null;
	activeTopicId?: number | null;
	activeQuery?: string | null;
	className?: string;
};

/**
 * All controls on ONE continuous line: type pills, topic select and the
 * search box flow in a single `flex-wrap` row — no expand panel, no stacked
 * sections. Active-filter chips trail at the row's tail.
 */
export function GalleryFilterBar({
	topics,
	activeType,
	activeTopicId,
	activeQuery,
	className,
}: GalleryFilterBarProps) {
	const t = useTranslations("Gallery");
	const router = useRouter();
	const searchParams = useSearchParams();
	const [isPending, startTransition] = useTransition();
	const [query, setQuery] = useState(activeQuery ?? "");
	const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
	const scrollToSection = useScrollToSection();

	const hasActiveType = isGalleryCollectionType(activeType);
	const activeTypeLabel = hasActiveType ? t(`posts.types.${activeType}`) : null;
	const hasActiveQuery = Boolean(activeQuery?.trim());
	const hasActiveTopic = activeTopicId != null;
	const activeTopicName =
		topics.find((topic) => topic.id === activeTopicId)?.name ?? null;
	const hasActiveFilters = hasActiveType || hasActiveQuery || hasActiveTopic;
	const currentType = hasActiveType ? (activeType ?? null) : null;
	const currentTopic = activeTopicId ?? null;

	useEffect(() => {
		setQuery(activeQuery ?? "");
	}, [activeQuery]);

	const pushFilters = useCallback(
		(type: string | null, q: string, topic: number | null) => {
			startTransition(() => {
				router.replace(
					buildGalleryHref({
						type,
						topic,
						q,
						page: 1,
					}),
					{ scroll: false },
				);

				const grid = document.getElementById("gallery-content");
				if (grid && searchParams.toString()) {
					scrollToSection("gallery-content");
				}
			});
		},
		[router, searchParams, scrollToSection],
	);

	// The two dimensions are a backend priority chain, so the controls clear each
	// other rather than letting a topic be silently dropped upstream.
	const handleType = (type: string | null) => {
		pushFilters(type, query, type ? null : currentTopic);
	};

	const handleTopic = (topic: number | null) => {
		pushFilters(topic != null ? null : currentType, query, topic);
	};

	const handleSearchSubmit = () => {
		if (debounceRef.current) clearTimeout(debounceRef.current);
		pushFilters(currentType, query, currentTopic);
	};

	const handleQueryChange = (value: string) => {
		setQuery(value);
		if (debounceRef.current) clearTimeout(debounceRef.current);
		debounceRef.current = setTimeout(() => {
			pushFilters(currentType, value, currentTopic);
		}, 350);
	};

	const handleClearSearch = () => {
		if (debounceRef.current) clearTimeout(debounceRef.current);
		setQuery("");
		pushFilters(currentType, "", currentTopic);
	};

	const handleClearAll = () => {
		if (debounceRef.current) clearTimeout(debounceRef.current);
		setQuery("");
		router.replace(buildGalleryHref({}), { scroll: false });
	};

	useEffect(
		() => () => {
			if (debounceRef.current) clearTimeout(debounceRef.current);
		},
		[],
	);

	return (
		<FilterBar
			label={t("filter.label")}
			pending={isPending}
			className={className}
		>
			{/* primary browse axis — the collection types */}
			<FilterPill active={!hasActiveType} onClick={() => handleType(null)}>
				{t("filter.all")}
			</FilterPill>
			{GALLERY_TYPE_OPTIONS.map((type) => (
				<FilterPill
					key={type}
					active={activeType === type}
					onClick={() => handleType(type)}
				>
					{t(`posts.types.${type}`)}
				</FilterPill>
			))}

			{topics.length > 0 ? (
				<>
					<FilterDivider />
					<FilterGroupLabel>{t("filter.topicLabel")}</FilterGroupLabel>
					<div className="w-44 min-w-36">
						<Select
							aria-label={t("filter.topicLabel")}
							value={activeTopicId != null ? String(activeTopicId) : ""}
							onChange={(event) =>
								handleTopic(parseGalleryTopicId(event.target.value))
							}
						>
							<option value="">{t("filter.topicAll")}</option>
							{topics.map((topic) => (
								<option key={topic.id} value={topic.id}>
									{topic.name}
								</option>
							))}
						</Select>
					</div>
				</>
			) : null}

			{/* same line — the row's remaining space goes to search */}
			<FilterSearchBox
				className="sm:max-w-sm"
				value={query}
				onValueChange={handleQueryChange}
				onSubmit={handleSearchSubmit}
				onClear={handleClearSearch}
				busy={isPending}
				searchLabel={t("search.label")}
				clearLabel={t("search.clear")}
				submitLabel={t("search.submit")}
			/>

			{hasActiveFilters ? (
				<>
					<FilterDivider />
					<span className="text-label text-muted">{t("filter.active")}</span>
					{activeTypeLabel ? (
						<Badge variant="outline" size="sm">
							{activeTypeLabel}
						</Badge>
					) : null}
					{activeTopicName ? (
						<Badge variant="outline" size="sm">
							{activeTopicName}
						</Badge>
					) : null}
					{hasActiveQuery && activeQuery ? (
						<Badge variant="outline" size="sm">
							&ldquo;{activeQuery}&rdquo;
						</Badge>
					) : null}
					<button
						type="button"
						onClick={handleClearAll}
						disabled={isPending}
						className="font-heading text-small font-medium text-muted underline decoration-border underline-offset-4 transition-colors fine-hover:text-foreground"
					>
						{t("filter.clear")}
					</button>
				</>
			) : null}
		</FilterBar>
	);
}
