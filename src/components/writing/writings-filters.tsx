"use client";

import { useSearchParams } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { useCallback, useTransition } from "react";
import { unifiedLabels } from "@/components/filters/filter-labels";
import type {
	FilterGroup,
	FilterOption,
} from "@/components/filters/filters-shared";
import { UnifiedSearchBar } from "@/components/filters/UnifiedSearchBar";
import { useFilterSearch } from "@/components/filters/use-filter-search";
import { useRouter } from "@/i18n/navigation";
import type { WritingCategorySlug } from "@/lib/writing/categories";
import type { WritingsSort } from "@/lib/writing/filter";
import { buildWritingsHref } from "@/lib/writings-url";
import type { BookGenre } from "@/types/writing";

/**
 * TODO: move groups to the CMS — genres are editor-managed rows and the API
 * exposes no parent-group field yet, so the grouping below is static.
 */
const TYPE_GROUP_ORDER = ["lit", "sci", "cul", "art"] as const;
const GENRE_GROUP: Record<string, (typeof TYPE_GROUP_ORDER)[number]> = {
	POETRY: "lit",
	NOVEL: "lit",
	SHORT_STORY: "lit",
	DRAMA: "lit",
	CHILDREN: "lit",
	HISTORY: "sci",
	BIOGRAPHY: "sci",
	PHILOSOPHY: "sci",
	LINGUISTICS: "sci",
	SCIENCE: "sci",
	MEDICINE: "sci",
	EDUCATIONAL: "sci",
	FOLKLORE: "cul",
	CULTURAL: "cul",
	RELIGION: "cul",
	SOCIOLOGY: "cul",
	POLITICS: "cul",
	ECONOMICS: "cul",
	LAW: "cul",
	TRAVEL: "cul",
	OTHER: "cul",
	ARTS: "art",
};

type WritingsFiltersProps = {
	categorySlug?: WritingCategorySlug | null;
	activeGenre?: BookGenre | null;
	activeQuery?: string | null;
	activeWriter?: string | null;
	activeTag?: string | null;
	activeKeyword?: string | null;
	activeSort?: WritingsSort;
	genreLabels: Record<BookGenre, string>;
	writers?: string[];
	resultCount: number;
	title: string;
	scrollTargetId?: string;
	className?: string;
};

/**
 * Style D — one bar: search + جۆر / نووسەر / ڕیزکردن panels, active filters
 * as removable tags below. Replaces the old genre-chip rail + writer select.
 * The backend accepts ONE genre, so a new pick replaces the previous one.
 */
export function WritingsFilters({
	categorySlug,
	activeGenre,
	activeQuery,
	activeWriter,
	activeTag,
	activeKeyword,
	activeSort = "newest",
	genreLabels,
	writers = [],
	resultCount,
	title,
	scrollTargetId = "writings-grid",
	className,
}: WritingsFiltersProps) {
	const t = useTranslations("Writings");
	const locale = useLocale();
	const router = useRouter();
	const searchParams = useSearchParams();
	const [, startTransition] = useTransition();
	const { query, setQuery, schedule, cancel } = useFilterSearch(activeQuery);

	const navigate = useCallback(
		(
			opts: {
				genre?: BookGenre | null;
				writer?: string | null;
				sort?: WritingsSort;
				q?: string;
			},
			replace = false,
		) => {
			const href = buildWritingsHref({
				category: categorySlug,
				genre: "genre" in opts ? opts.genre : activeGenre,
				writer: "writer" in opts ? opts.writer : activeWriter,
				sort: opts.sort ?? activeSort,
				tag: activeTag,
				keyword: activeKeyword,
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
			categorySlug,
			activeGenre,
			activeWriter,
			activeSort,
			activeTag,
			activeKeyword,
			query,
			scrollTargetId,
		],
	);

	const types: FilterOption[] = Object.entries(genreLabels)
		.map(([slug, label]) => ({
			id: slug,
			label,
			group: GENRE_GROUP[slug],
		}))
		.sort((a, b) =>
			a.label.localeCompare(b.label, locale === "ckb" ? "ckb" : "ku"),
		);

	const typeGroups: FilterGroup[] = TYPE_GROUP_ORDER.map((id) => ({
		id,
		label: t(`typeGroups.${id}`),
	}));

	const authors: FilterOption[] = writers.map((name) => ({
		id: name,
		label: name,
	}));

	return (
		<UnifiedSearchBar
			title={title}
			titleAs="h2"
			className={className}
			labels={unifiedLabels(locale)}
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
			typeGroups={typeGroups}
			// The listing endpoint takes a single genre — keep the last pick.
			selectedTypes={activeGenre ? [activeGenre] : []}
			onTypesChange={(ids) =>
				navigate({
					genre: ids.length
						? ((ids[ids.length - 1] as BookGenre) ?? null)
						: null,
				})
			}
			authors={authors.length ? authors : undefined}
			selectedAuthor={activeWriter ?? null}
			onAuthorChange={(id) => navigate({ writer: id })}
			sortOptions={[
				{ value: "newest", label: t("sort.newest") },
				{ value: "title", label: t("sort.title") },
			]}
			sort={activeSort}
			onSortChange={(v) => navigate({ sort: v as WritingsSort })}
			resultCount={resultCount}
		/>
	);
}

export default WritingsFilters;
