"use client";

import {
	AdjustmentsHorizontalIcon,
	MagnifyingGlassIcon,
	XMarkIcon,
} from "@heroicons/react/24/outline";
import { useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { useCallback, useEffect, useRef, useState, useTransition } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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

/** Film-cell pill: square, hairline, fills with ink when active. */
function CellPill({
	active,
	onClick,
	children,
}: {
	active: boolean;
	onClick: () => void;
	children: React.ReactNode;
}) {
	return (
		<button
			type="button"
			onClick={onClick}
			aria-pressed={active}
			className={cn(
				"shrink-0 border px-4 py-2 font-heading text-small font-medium transition-[background-color,color,border-color] duration-200",
				active
					? "border-primary bg-primary text-primary-foreground"
					: "border-border bg-background text-foreground fine-hover:border-foreground/40 fine-hover:bg-sunken",
			)}
		>
			{children}
		</button>
	);
}

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
	const [expanded, setExpanded] = useState(true);
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

	const handleSearchSubmit = (event: React.FormEvent) => {
		event.preventDefault();
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
				"border border-border bg-surface transition-opacity",
				isPending && "opacity-80",
				className,
			)}
		>
			{/* primary browse axis — a film strip of type cells */}
			<fieldset className="px-4 py-3 sm:px-5">
				<legend className="sr-only">{t("filter.typeLabel")}</legend>
				<div className="flex flex-wrap items-center gap-2">
					<button
						type="button"
						onClick={() => setExpanded((open) => !open)}
						aria-expanded={expanded}
						aria-label={t("filter.label")}
						title={t("filter.label")}
						className={cn(
							"inline-flex size-11 shrink-0 items-center justify-center border transition-colors",
							"focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
							expanded
								? "border-primary bg-primary text-primary-foreground"
								: "border-border-strong bg-surface text-foreground fine-hover:border-foreground/40 fine-hover:bg-sunken",
						)}
					>
						<AdjustmentsHorizontalIcon className="size-5" aria-hidden />
					</button>
					{TYPE_OPTIONS.map((option) => (
						<CellPill
							key={option.key}
							active={(activeType ?? null) === option.value}
							onClick={() => pushFilters({ type: option.value })}
						>
							{t(option.key)}
						</CellPill>
					))}
				</div>
			</fieldset>

			{/* Collapsible panel — the 0fr↔1fr grid-row tween animates height
			    without measuring; `inert` parks the hidden controls out of the
			    tab order and the accessibility tree while collapsed. */}
			<div
				className={cn(
					"grid transition-[grid-template-rows,opacity] duration-300 ease-out",
					expanded
						? "grid-rows-[1fr] opacity-100"
						: "grid-rows-[0fr] opacity-0",
				)}
				inert={!expanded}
			>
				<div className="min-h-0 overflow-hidden">
					<div className="border-t border-border">
						<search className="border-b border-border bg-background px-4 py-4 sm:px-5 sm:py-5">
							<form
								onSubmit={handleSearchSubmit}
								className="flex flex-col gap-3 sm:flex-row sm:items-stretch"
							>
								<div
									className={cn(
										"flex h-12 min-w-0 flex-1 items-stretch border border-border-strong bg-surface",
										"transition-colors focus-within:border-foreground",
									)}
								>
									<input
										type="search"
										name="q"
										value={query}
										onChange={(event) => handleQueryChange(event.target.value)}
										aria-label={t("filter.searchLabel")}
										autoComplete="off"
										className="h-full min-w-0 flex-1 bg-transparent px-3 py-0 text-body text-foreground placeholder:text-muted focus:outline-none sm:px-4"
									/>

									{query ? (
										<button
											type="button"
											onClick={handleClearSearch}
											className="flex shrink-0 items-center px-3 text-muted transition-colors fine-hover:text-foreground"
											aria-label={t("filter.searchClear")}
										>
											<XMarkIcon className="size-4" aria-hidden />
										</button>
									) : null}
								</div>
								<Button
									type="submit"
									variant="primary"
									size="lg"
									leadingIcon={<MagnifyingGlassIcon aria-hidden />}
									className="h-12 shrink-0 sm:min-w-32"
									disabled={isPending}
								>
									{t("filter.searchSubmit")}
								</Button>
							</form>
						</search>

						<div className="px-4 py-4 sm:px-5 sm:py-5">
							{topics.length > 0 ? (
								<div>
									<label
										htmlFor="video-topic-select"
										className="label font-semibold text-muted"
									>
										{t("filter.topicLabel")}
									</label>
									<div className="mt-3 max-w-xs">
										<Select
											id="video-topic-select"
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
								</div>
							) : null}

							<div className="mt-6 border-t border-border pt-4">
								<p className="label font-semibold text-muted">
									{t("filter.collectionLabel")}
								</p>
								<div className="mt-3 flex flex-wrap gap-2">
									<CellPill
										active={Boolean(activeMemories)}
										onClick={() => pushFilters({ memories: !activeMemories })}
									>
										{t("filter.memoriesLabel")}
									</CellPill>
								</div>
							</div>

							{hasActiveFilters ? (
								<div className="mt-6 flex flex-wrap items-center gap-2 border-t border-border pt-4">
									<span aria-hidden="true" className="label me-1 text-muted">
										{"//"}
									</span>
									<span className="text-label text-muted">
										{t("filter.active")}
									</span>
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
									{/* Reset lives beside the chips it clears. */}
									<button
										type="button"
										onClick={handleClearAll}
										disabled={isPending}
										className="ms-auto font-heading text-small font-medium text-muted underline decoration-border underline-offset-4 transition-colors fine-hover:text-foreground"
									>
										{t("filter.reset")}
									</button>
								</div>
							) : null}
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
