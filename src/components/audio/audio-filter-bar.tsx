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
import { Select } from "@/components/ui/select";
import { useRouter } from "@/i18n/navigation";
import { soundTypeLabel } from "@/lib/audio/sound-types";
import { buildAudioHref } from "@/lib/audio-url";
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
	activeQuery?: string | null;
	itemCount: number;
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
					? "border-foreground bg-primary text-primary-foreground"
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
	activeQuery,
	itemCount,
	scrollTargetId = "audio-grid",
	className,
}: AudioFilterBarProps) {
	const t = useTranslations("Audio");
	const router = useRouter();
	const searchParams = useSearchParams();
	const [isPending, startTransition] = useTransition();
	const [expanded, setExpanded] = useState(false);
	const [query, setQuery] = useState(activeQuery ?? "");
	const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

	const hasActiveFilters = Boolean(
		activeType || activeState || activeTopicId != null || activeQuery?.trim(),
	);

	useEffect(() => {
		setQuery(activeQuery ?? "");
	}, [activeQuery]);

	const pushFilters = useCallback(
		(opts: {
			type?: string | null;
			state?: TrackState | null;
			topic?: number | null;
			q?: string;
		}) => {
			startTransition(() => {
				router.replace(
					buildAudioHref({
						type: "type" in opts ? opts.type : activeType,
						state: "state" in opts ? opts.state : activeState,
						topic: "topic" in opts ? opts.topic : activeTopicId,
						q: opts.q ?? query,
						page: 1,
					}),
					{ scroll: false },
				);

				const grid = document.getElementById(scrollTargetId);
				if (grid && searchParams.toString()) {
					grid.scrollIntoView({ behavior: "smooth", block: "start" });
				}
			});
		},
		[
			router,
			searchParams,
			activeType,
			activeState,
			activeTopicId,
			query,
			scrollTargetId,
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
			<div className="flex flex-wrap items-end justify-between gap-4 border-b border-border pb-4">
				<button
					type="button"
					onClick={() => setExpanded((open) => !open)}
					aria-expanded={expanded}
					className="inline-flex items-center gap-2 font-heading text-body font-medium text-foreground underline decoration-foreground underline-offset-4 transition-colors fine-hover:text-foreground/80"
				>
					<AdjustmentsHorizontalIcon className="size-4 shrink-0" aria-hidden />
					{t("filter.label")}
				</button>

				<div className="flex items-center gap-4 sm:gap-6">
					<button
						type="button"
						onClick={handleClearAll}
						disabled={!hasActiveFilters || isPending}
						className={cn(
							"font-heading text-small font-medium underline decoration-border underline-offset-4 transition-colors",
							hasActiveFilters
								? "text-muted fine-hover:text-foreground"
								: "pointer-events-none text-muted/40",
						)}
					>
						{t("filter.reset")}
					</button>
					<p className="text-small text-muted">
						{/* `formatted` is a plain string so server and client agree on
						    digits — Node's ICU lacks ckb number data, the browser's
						    doesn't, and `#` would hydrate-mismatch. */}
						{t("grid.itemCount", {
							count: itemCount,
							formatted: String(itemCount),
						})}
					</p>
				</div>
			</div>

			{/* primary browse axis — always visible */}
			<fieldset className="mt-5">
				<legend className="sr-only">{t("filter.typeLabel")}</legend>
				<div className="flex flex-wrap gap-2">
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

			{expanded ? (
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
								<span className="flex shrink-0 items-center border-e border-border-strong px-3 text-muted sm:px-4">
									<MagnifyingGlassIcon className="size-5" aria-hidden />
								</span>

								<input
									type="search"
									name="q"
									value={query}
									onChange={(event) => handleQueryChange(event.target.value)}
									placeholder={t("filter.searchPlaceholder")}
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
											activeState === "SINGLE" ? "state.single" : "state.multi",
										)}
									</Badge>
								) : null}
								{activeTopic ? (
									<Badge variant="outline" size="sm">
										{activeTopic.name}
									</Badge>
								) : null}
								{activeQuery?.trim() ? (
									<Badge variant="outline" size="sm">
										&ldquo;{activeQuery}&rdquo;
									</Badge>
								) : null}
							</div>
						) : null}
					</div>
				</div>
			) : null}
		</div>
	);
}
