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
import { soundTypeLabel } from "@/lib/audio/sound-types";
import { buildAudioHref } from "@/lib/audio-url";
import { useScrollToSection } from "@/lib/use-scroll-to-section";
import { cn } from "@/lib/utils";
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

function FilterPill({
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
				"shrink-0 border px-3.5 py-2 font-heading text-small font-medium transition-colors sm:px-4",
				active
					? "border-primary bg-primary text-primary-foreground"
					: "border-border-strong bg-background text-foreground fine-hover:border-foreground/40 fine-hover:bg-sunken",
			)}
		>
			{children}
		</button>
	);
}

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
	const [expanded, setExpanded] = useState(true);
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
		<div
			className={cn("transition-opacity", isPending && "opacity-80", className)}
		>
			{/* primary browse axis — always visible */}
			<fieldset>
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
					<div className="mt-6 space-y-0 border border-border bg-surface">
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
							<fieldset>
								<legend className="label font-semibold text-muted">
									{t("filter.stateLabel")}
								</legend>
								<div className="mt-4 flex flex-wrap gap-2">
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
								</div>
							</fieldset>

							{topics.length > 0 ? (
								<div className="mt-6 border-t border-border pt-4">
									<label
										htmlFor="audio-topic-select"
										className="label font-semibold text-muted"
									>
										{t("filter.topicLabel")}
									</label>
									<div className="mt-3 max-w-xs">
										<Select
											id="audio-topic-select"
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

							{hasActiveFilters ? (
								<div className="mt-6 flex flex-wrap items-center gap-2 border-t border-border pt-4">
									<span className="text-label text-muted">
										{t("filter.active")}
									</span>
									{activeType ? (
										<Badge variant="outline" size="sm">
											{soundTypeLabel((key) => t(key), activeType)}
										</Badge>
									) : null}
									{activeState ? (
										<Badge variant="outline" size="sm">
											{t(
												activeState === "SINGLE"
													? "state.single"
													: "state.multi",
											)}
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
