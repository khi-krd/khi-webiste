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
import {
	buildGalleryHref,
	isGalleryCollectionType,
	parseGalleryTopicId,
} from "@/lib/gallery-url";
import type { GalleryCollectionType } from "@/lib/mock/gallery";
import { useScrollToSection } from "@/lib/use-scroll-to-section";
import { cn } from "@/lib/utils";

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
	const [expanded, setExpanded] = useState(true);
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

	const handleSearchSubmit = (event: React.FormEvent) => {
		event.preventDefault();
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
		<div
			className={cn("transition-opacity", isPending && "opacity-80", className)}
		>
			<div
				className="flex flex-wrap items-center gap-2"
				role="group"
				aria-label={t("filter.label")}
			>
				<button
					type="button"
					onClick={() => setExpanded((open) => !open)}
					aria-expanded={expanded}
					aria-label={t("filter.heading")}
					title={t("filter.heading")}
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
				<TypePill active={!hasActiveType} onClick={() => handleType(null)}>
					{t("filter.all")}
				</TypePill>
				{GALLERY_TYPE_OPTIONS.map((type) => (
					<TypePill
						key={type}
						active={activeType === type}
						onClick={() => handleType(type)}
					>
						{t(`posts.types.${type}`)}
					</TypePill>
				))}
			</div>

			{expanded ? (
				<div className="mt-6 border border-border bg-surface">
					<div className="border-b border-border bg-background px-4 py-4 sm:px-5 sm:py-5">
						<form
							onSubmit={handleSearchSubmit}
							className="flex flex-col gap-3 sm:flex-row sm:items-stretch"
							role="search"
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
									aria-label={t("search.label")}
									autoComplete="off"
									className="h-full min-w-0 flex-1 bg-transparent px-3 py-0 text-body text-foreground placeholder:text-muted focus:outline-none sm:px-4"
								/>

								{query ? (
									<button
										type="button"
										onClick={handleClearSearch}
										className="flex shrink-0 items-center px-3 text-muted transition-colors fine-hover:text-foreground"
										aria-label={t("search.clear")}
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
								{t("search.submit")}
							</Button>
						</form>
					</div>

					{topics.length > 0 || hasActiveFilters ? (
						<div className="px-4 py-4 sm:px-5 sm:py-5">
							{hasActiveFilters ? (
								<div className="mb-4 flex justify-end">
									<button
										type="button"
										onClick={handleClearAll}
										className="font-heading text-label font-medium text-muted underline decoration-border underline-offset-4 transition-colors fine-hover:text-foreground"
									>
										{t("filter.clear")}
									</button>
								</div>
							) : null}

							{topics.length > 0 ? (
								<div>
									<label
										htmlFor="gallery-topic-select"
										className="label font-semibold text-muted"
									>
										{t("filter.topicLabel")}
									</label>
									<div className="mt-3 max-w-xs">
										<Select
											id="gallery-topic-select"
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
								</div>
							) : null}

							{hasActiveFilters ? (
								<div className="mt-4 flex flex-wrap items-center gap-2 border-t border-border pt-4">
									<span className="text-label text-muted">
										{t("filter.active")}
									</span>
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
								</div>
							) : null}
						</div>
					) : null}
				</div>
			) : null}
		</div>
	);
}

type TypePillProps = {
	active: boolean;
	onClick: () => void;
	children: React.ReactNode;
};

function TypePill({ active, onClick, children }: TypePillProps) {
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
