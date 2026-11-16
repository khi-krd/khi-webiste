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
/**
 * Editor-managed CMS slugs (from /api/v1/book-genres) mapped into the four
 * design groups. The enum-style keys below them stay as a fallback for any
 * built-in slugs the catalogue still carries.
 */
const GENRE_GROUP: Record<string, (typeof TYPE_GROUP_ORDER)[number]> = {
	// ئەدەب — چیرۆک، دیوان، پەند و ئیدیۆم، منداڵان
	ROK: "lit",
	D_WAN: "lit",
	PEND_DIYOM: "lit",
	ZAROK: "lit",
	POETRY: "lit",
	NOVEL: "lit",
	SHORT_STORY: "lit",
	DRAMA: "lit",
	CHILDREN: "lit",
	// زانست و مێژوو — توێژینەوە، لێکۆڵینەوە، مێژوو، فەرهەنگ
	RESEARCH: "sci",
	L_KOL_N: "sci",
	M_J: "sci",
	FERHENG: "sci",
	HISTORY: "sci",
	BIOGRAPHY: "sci",
	PHILOSOPHY: "sci",
	LINGUISTICS: "sci",
	SCIENCE: "sci",
	MEDICINE: "sci",
	EDUCATIONAL: "sci",
	// کەلتوور و کۆمەڵگا — فۆلکلۆر، کەلتوور، بیروباوەڕ، ئایین، خواردن
	FOLKLOR: "cul",
	KELT_R: "cul",
	B_R_BAWER: "cul",
	AYN: "cul",
	XWARIN: "cul",
	CULTURAL: "cul",
	RELIGION: "cul",
	SOCIOLOGY: "cul",
	POLITICS: "cul",
	ECONOMICS: "cul",
	LAW: "cul",
	TRAVEL: "cul",
	OTHER: "cul",
	// هونەر و موزیک — موزیک، گۆرانی، هونەری
	M_Z_K: "art",
	STRAN: "art",
	HUNER: "art",
	ARTS: "art",
};

type WritingsFiltersProps = {
	categorySlug?: WritingCategorySlug | null;
	activeGenres?: BookGenre[];
	activeQuery?: string | null;
	activeWriter?: string | null;
	activeTag?: string | null;
	activeKeyword?: string | null;
	activeSort?: WritingsSort;
	genreLabels: Record<BookGenre, string>;
	genreCounts?: Record<string, number>;
	writers?: string[];
	resultCount: number;
	title: string;
	scrollTargetId?: string;
	className?: string;
};

/**
 * Style D — one bar: search + جۆر / نووسەر / ڕیزکردن panels, active filters
 * as removable tags below. Replaces the old genre-chip rail + writer select.
 * Genres are multi-select: ?genre=A,B unions server-side in filterWritings.
 */
export function WritingsFilters({
	categorySlug,
	activeGenres,
	activeQuery,
	activeWriter,
	activeTag,
	activeKeyword,
	activeSort = "newest",
	genreLabels,
	genreCounts,
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
				genre?: BookGenre[] | null;
				writer?: string | null;
				sort?: WritingsSort;
				q?: string;
			},
			replace = false,
		) => {
			const href = buildWritingsHref({
				category: categorySlug,
				genre: "genre" in opts ? opts.genre : activeGenres,
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
			activeGenres,
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
			count: genreCounts?.[slug],
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
			selectedTypes={activeGenres ?? []}
			onTypesChange={(ids) =>
				navigate({ genre: (ids as BookGenre[]).length ? (ids as BookGenre[]) : null })
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
