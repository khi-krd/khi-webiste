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
import { soundTypeLabel } from "@/lib/audio/sound-types";
import { buildAudioHref } from "@/lib/audio-url";
import { useScrollToSection } from "@/lib/use-scroll-to-section";
import type { TrackState } from "@/types/audio";

type TopicOption = {
	id: number;
	name: string;
};

type AudioFilterBarProps = {
	soundTypes: string[];
	topics: TopicOption[];
	activeType?: string | null;
	activeState?: TrackState | null;
	activeTopicId?: number | null;
	activeTag?: string | null;
	activeQuery?: string | null;
	scrollTargetId?: string;
	className?: string;
};

/**
 * All controls on ONE continuous line: type pills, state pills, topic select
 * and the search box flow in a single `flex-wrap` row — no expand panel, no
 * stacked sections. Active-filter chips trail at the row's tail.
 */
export function AudioFilterBar({
	soundTypes,
	topics,
	activeType,
	activeState,
	activeTopicId,
	activeTag,
	activeQuery,
	scrollTargetId = "audio-grid",
	className,
}: AudioFilterBarProps) {
	const t = useTranslations("Audio");
	const router = useRouter();
	const searchParams = useSearchParams();
	const [isPending, startTransition] = useTransition();
	const [query, setQuery] = useState(activeQuery ?? "");
	const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
	const scrollToSection = useScrollToSection();

	const hasActiveFilters = Boolean(
		activeType ||
			activeState ||
			activeTopicId != null ||
			activeTag?.trim() ||
			activeQuery?.trim(),
	);

	useEffect(() => {
		setQuery(activeQuery ?? "");
	}, [activeQuery]);

	const pushFilters = useCallback(
		(opts: {
			type?: string | null;
			state?: TrackState | null;
			topic?: number | null;
			tag?: string | null;
			q?: string;
		}) => {
			startTransition(() => {
				router.replace(
					buildAudioHref({
						type: "type" in opts ? opts.type : activeType,
						state: "state" in opts ? opts.state : activeState,
						topic: "topic" in opts ? opts.topic : activeTopicId,
						tag: "tag" in opts ? opts.tag : activeTag,
						q: opts.q ?? query,
						page: 1,
					}),
					{ scroll: false },
				);

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
			activeState,
			activeTopicId,
			activeTag,
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
		router.replace(buildAudioHref({}), { scroll: false });
	};

	useEffect(
		() => () => {
			if (debounceRef.current) clearTimeout(debounceRef.current);
		},
		[],
	);

	const activeTopic = topics.find((topic) => topic.id === activeTopicId);

	return (
		<FilterBar
			label={t("filter.label")}
			pending={isPending}
			className={className}
		>
			{/* primary browse axis — the sound types */}
			<FilterPill
				active={!activeType}
				onClick={() => pushFilters({ type: null })}
			>
				{t("filter.all")}
			</FilterPill>
			{soundTypes.map((type) => (
				<FilterPill
					key={type}
					active={activeType === type}
					onClick={() => pushFilters({ type })}
				>
					{soundTypeLabel((key) => t(key), type)}
				</FilterPill>
			))}

			<FilterDivider />
			<FilterGroupLabel>{t("filter.stateLabel")}</FilterGroupLabel>
			<FilterPill
				active={!activeState}
				onClick={() => pushFilters({ state: null })}
			>
				{t("state.all")}
			</FilterPill>
			<FilterPill
				active={activeState === "SINGLE"}
				onClick={() => pushFilters({ state: "SINGLE" })}
			>
				{t("state.single")}
			</FilterPill>
			<FilterPill
				active={activeState === "MULTI"}
				onClick={() => pushFilters({ state: "MULTI" })}
			>
				{t("state.multi")}
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
					<span className="text-label text-muted">{t("filter.active")}</span>
					{activeType ? (
						<Badge variant="outline" size="sm">
							{soundTypeLabel((key) => t(key), activeType)}
						</Badge>
					) : null}
					{activeState ? (
						<Badge variant="outline" size="sm">
							{t(activeState === "SINGLE" ? "state.single" : "state.multi")}
						</Badge>
					) : null}
					{activeTopic ? (
						<Badge variant="outline" size="sm">
							{activeTopic.name}
						</Badge>
					) : null}
					{activeTag?.trim() ? (
						<button
							type="button"
							onClick={() => pushFilters({ tag: null })}
							aria-label={t("filter.tagRemove")}
							className="transition-opacity fine-hover:opacity-70"
						>
							<Badge variant="outline" size="sm">
								#{activeTag}
							</Badge>
						</button>
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
	);
}
