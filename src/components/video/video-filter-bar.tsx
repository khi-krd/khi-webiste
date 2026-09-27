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
import { useScrollToSection } from "@/lib/use-scroll-to-section";
import { cn } from "@/lib/utils";
import { buildVideoHref } from "@/lib/video-url";
import type { VideoType } from "@/types/video";

type TopicOption = {
	id: number;
	name: string;
};

type VideoFilterBarProps = {
	topics: TopicOption[];
	activeType?: VideoType | null;
	activeTopicId?: number | null;
	activeMemories?: boolean | null;
	activeQuery?: string | null;
	scrollTargetId?: string;
	className?: string;
};

const TYPE_OPTIONS: { value: VideoType | null; key: string }[] = [
	{ value: null, key: "filter.all" },
	{ value: "FILM", key: "types.FILM" },
	{ value: "VIDEO_CLIP", key: "types.VIDEO_CLIP" },
];

/**
 * All controls on ONE continuous line inside the bordered "index card": type
 * cells, memories pill, topic select and the search box flow in a single
 * `flex-wrap` row — no expand panel, no stacked sections.
 */
export function VideoFilterBar({
	topics,
	activeType,
	activeTopicId,
	activeMemories,
	activeQuery,
	scrollTargetId = "videos-grid",
	className,
}: VideoFilterBarProps) {
	const t = useTranslations("Video");
	const router = useRouter();
	const searchParams = useSearchParams();
	const [isPending, startTransition] = useTransition();
	const [query, setQuery] = useState(activeQuery ?? "");
	const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
	const scrollToSection = useScrollToSection();

	const hasActiveFilters = Boolean(
		activeType ||
			activeTopicId != null ||
			activeMemories ||
			activeQuery?.trim(),
	);

	useEffect(() => {
		setQuery(activeQuery ?? "");
	}, [activeQuery]);

	const pushFilters = useCallback(
		(opts: {
			type?: VideoType | null;
			topic?: number | null;
			memories?: boolean | null;
			q?: string;
		}) => {
			startTransition(() => {
				router.push(
					buildVideoHref({
						type: "type" in opts ? opts.type : activeType,
						topic: "topic" in opts ? opts.topic : activeTopicId,
						memories: "memories" in opts ? opts.memories : activeMemories,
						q: opts.q ?? query,
						page: 1,
					}),
					{ scroll: false },
				);
				router.refresh();

				const grid = document.getElementById(scrollTargetId);
				if (grid && searchParams.toString()) {
					scrollToSection(scrollTargetId);
				}
			});
		},
		[
			router,
			searchParams,
			activeType,
			activeTopicId,
			activeMemories,
			query,
			scrollTargetId,
			scrollToSection,
		],
	);

	const handleSearchSubmit = () => {
		if (debounceRef.current) clearTimeout(debounceRef.current);
		pushFilters({ q: query });
	};

	const handleQueryChange = (value: string) => {
		setQuery(value);
		if (debounceRef.current) clearTimeout(debounceRef.current);
		debounceRef.current = setTimeout(() => {
			pushFilters({ q: value });
		}, 350);
	};

	const handleClearSearch = () => {
		if (debounceRef.current) clearTimeout(debounceRef.current);
		setQuery("");
		pushFilters({ q: "" });
	};

	const handleClearAll = () => {
		if (debounceRef.current) clearTimeout(debounceRef.current);
		setQuery("");
		startTransition(() => {
			router.push(buildVideoHref({}), { scroll: false });
			router.refresh();
		});
	};

	useEffect(
		() => () => {
			if (debounceRef.current) clearTimeout(debounceRef.current);
		},
		[],
	);

	const activeTopic = topics.find((topic) => topic.id === activeTopicId);

	return (
		// The bar is one bordered "index card" sitting on the section's wash.
		<div
			className={cn(
				"border border-border bg-surface px-4 py-3 transition-opacity sm:px-5",
				isPending && "opacity-80",
				className,
			)}
		>
			<FilterBar label={t("filter.label")} pending={false}>
				{/* primary browse axis — a film strip of type cells */}
				{TYPE_OPTIONS.map((option) => (
					<FilterPill
						key={option.key}
						active={(activeType ?? null) === option.value}
						onClick={() => pushFilters({ type: option.value })}
					>
						{t(option.key)}
					</FilterPill>
				))}

				<FilterDivider />
				<FilterGroupLabel>{t("filter.collectionLabel")}</FilterGroupLabel>
				<FilterPill
					active={Boolean(activeMemories)}
					onClick={() => pushFilters({ memories: !activeMemories })}
				>
					{t("filter.memoriesLabel")}
				</FilterPill>

				{topics.length > 0 ? (
					<>
						<FilterDivider />
						<FilterGroupLabel>{t("filter.topicLabel")}</FilterGroupLabel>
						<div className="w-44 min-w-36">
							<Select
								aria-label={t("filter.topicLabel")}
								value={activeTopicId != null ? String(activeTopicId) : ""}
								onChange={(event) =>
									pushFilters({
										topic: event.target.value
											? Number.parseInt(event.target.value, 10)
											: null,
									})
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
					searchLabel={t("filter.searchLabel")}
					clearLabel={t("filter.searchClear")}
					submitLabel={t("filter.searchSubmit")}
				/>

				{hasActiveFilters ? (
					<>
						<FilterDivider />
						<span aria-hidden="true" className="label me-1 text-muted">
							{"//"}
						</span>
						<span className="text-label text-muted">{t("filter.active")}</span>
						{activeType ? (
							<Badge variant="outline" size="sm">
								{t(`types.${activeType}`)}
							</Badge>
						) : null}
						{activeTopic ? (
							<Badge variant="outline" size="sm">
								{activeTopic.name}
							</Badge>
						) : null}
						{activeMemories ? (
							<Badge variant="outline" size="sm">
								{t("filter.memoriesLabel")}
							</Badge>
						) : null}
						{activeQuery?.trim() ? (
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
							{t("filter.reset")}
						</button>
					</>
				) : null}
			</FilterBar>
		</div>
	);
}
