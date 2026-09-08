import {
	BookOpenIcon,
	FilmIcon,
	MagnifyingGlassIcon,
	MusicalNoteIcon,
	NewspaperIcon,
	PhotoIcon,
	Squares2X2Icon,
} from "@heroicons/react/24/outline";
import { getTranslations } from "next-intl/server";
import type {
	ComponentProps,
	ComponentType,
	CSSProperties,
	ReactNode,
} from "react";
import { RetryButton } from "@/components/search/retry-button";
import {
	AnnounceResults,
	FocusRestore,
	RESULTS_SUMMARY_ID,
	SearchNavLink,
	SearchPendingRegion,
} from "@/components/search/search-transition";
import { viewAllCtaClass } from "@/components/ui/cta-styles";
import { EmptyState } from "@/components/ui/empty-state";
import { ErrorState } from "@/components/ui/error-state";
import { Image } from "@/components/ui/image";
import type {
	ResolvedGlobalSearchResponse,
	ResolvedSearchItem,
	ResolvedSearchSection,
} from "@/lib/api/search";
import { buildAudioHref } from "@/lib/audio-url";
import { buildGalleryHref } from "@/lib/gallery-url";
import { buildNewsHref } from "@/lib/news-url";
import { formatCount } from "@/lib/platform/format";
import { projectsHref } from "@/lib/projects-url";
import { stripHtml } from "@/lib/search/client";
import { searchSiteWithFallback } from "@/lib/search/site-search";
import { cn } from "@/lib/utils";
import { buildVideoHref } from "@/lib/video-url";
import { buildWritingsHref } from "@/lib/writings-url";

const SECTION_SIZE = 8;

/** Focus-restore root for the ماڵپەر tree (it lives outside #search-results). */
const SITE_RESULTS_ANCHOR_ID = "site-results";

const bdi = (chunks: ReactNode) => <bdi dir="auto">{chunks}</bdi>;

type SectionDef = {
	key: keyof Pick<
		ResolvedGlobalSearchResponse,
		| "projects"
		| "news"
		| "videos"
		| "writings"
		| "soundTracks"
		| "imageCollections"
	>;
	/** Label key under the "Nav" namespace — same mapping the overlay uses. */
	navLabelKey: string;
	icon: ComponentType<ComponentProps<"svg">>;
	viewAllHref: (q: string) => string;
};

const SECTIONS: SectionDef[] = [
	{
		key: "projects",
		navLabelKey: "projects",
		icon: Squares2X2Icon,
		viewAllHref: (q) => projectsHref({ q }),
	},
	{
		key: "news",
		navLabelKey: "news",
		icon: NewspaperIcon,
		viewAllHref: (q) => buildNewsHref({ q }),
	},
	{
		key: "videos",
		navLabelKey: "video",
		icon: FilmIcon,
		viewAllHref: (q) => buildVideoHref({ q }),
	},
	{
		key: "writings",
		navLabelKey: "writings",
		icon: BookOpenIcon,
		viewAllHref: (q) => buildWritingsHref({ q }),
	},
	{
		key: "soundTracks",
		navLabelKey: "sound",
		icon: MusicalNoteIcon,
		viewAllHref: (q) => buildAudioHref({ q }),
	},
	{
		key: "imageCollections",
		navLabelKey: "gallery",
		icon: PhotoIcon,
		viewAllHref: (q) => buildGalleryHref({ q }),
	},
];

/**
 * One CMS hit in the plate's language: a stretched title link over the row
 * (`after:` overlay, one tab stop), the article named by its visible title, a
 * small 4:3 media box at the start, and the focus ring drawn around the whole
 * row through `has-[a:focus-visible]` so nothing clips it.
 */
function SiteRow({
	item,
	index,
	sectionKey,
	icon: Icon,
	titleLevel,
}: {
	item: ResolvedSearchItem;
	index: number;
	sectionKey: SectionDef["key"];
	icon: SectionDef["icon"];
	/** One step under the catalogue heading it sits in. */
	titleLevel: 4 | 5;
}) {
	const id = `site-${sectionKey}-${item.id}`;
	const TitleTag = `h${titleLevel}` as const;
	const description = stripHtml(item.description);

	return (
		<li
			className="search-rise border-b border-border last:border-b-0"
			style={{ "--i": index } as CSSProperties}
		>
			<article
				aria-labelledby={`${id}-title`}
				className={cn(
					"group relative -mx-3 flex items-center gap-4 px-3 py-3",
					"transition-colors duration-200 fine-hover:bg-surface",
					"has-[a:focus-visible]:outline-2 has-[a:focus-visible]:outline-ring has-[a:focus-visible]:outline-offset-2",
				)}
			>
				<div className="relative aspect-4/3 w-20 shrink-0 overflow-hidden border border-border bg-sunken">
					{item.coverUrl?.trim() ? (
						<Image
							src={item.coverUrl}
							alt=""
							aspectRatio="4/3"
							sizes="80px"
							className="absolute inset-0 size-full"
							imageClassName="object-cover transition-transform duration-500 ease-out group-fine:scale-[1.04] motion-reduce:transition-none motion-reduce:group-fine:scale-100"
						/>
					) : (
						<span
							aria-hidden
							className="absolute inset-0 flex items-center justify-center"
						>
							<Icon className="size-5 text-muted/60" />
						</span>
					)}
				</div>

				<div className="min-w-0 flex-1">
					<TitleTag
						id={`${id}-title`}
						className={cn(
							"line-clamp-1 text-start text-body font-medium text-foreground [overflow-wrap:anywhere]",
							"transition-colors duration-200 group-fine:text-brand",
						)}
					>
						<SearchNavLink
							href={item.href}
							className="text-inherit no-underline focus-visible:outline-none after:absolute after:inset-0 after:z-1 after:content-['']"
						>
							<bdi>{item.title}</bdi>
						</SearchNavLink>
					</TitleTag>
					{description ? (
						<p className="mt-0.5 line-clamp-1 text-start text-small text-muted [overflow-wrap:anywhere]">
							<bdi>{description}</bdi>
						</p>
					) : null}
				</div>
			</article>
		</li>
	);
}

export type SiteSectionEntry = {
	def: SectionDef;
	section: ResolvedSearchSection;
};

/** The catalogues that actually matched, in display order. */
export function siteSectionsOf(
	response: ResolvedGlobalSearchResponse,
): SiteSectionEntry[] {
	return SECTIONS.map((def) => ({
		def,
		section: response[def.key],
	})).filter(
		(entry): entry is SiteSectionEntry =>
			entry.section != null && entry.section.items.length > 0,
	);
}

/**
 * One catalogue's matches under its own heading. Also used by the mixed
 * overview, which shows fewer rows per catalogue and sits one heading level
 * deeper (under the ماڵپەر source heading).
 */
export function SiteSection({
	def,
	section,
	label,
	viewAllLabel,
	locale,
	q,
	limit = SECTION_SIZE,
	headingLevel = 3,
}: {
	def: SectionDef;
	section: ResolvedSearchSection;
	label: string;
	viewAllLabel: string;
	locale: string;
	q: string;
	/** Rows shown before the "view all" link. */
	limit?: number;
	headingLevel?: 3 | 4;
}) {
	const Icon = def.icon;
	const Heading = headingLevel === 4 ? "h4" : "h3";
	const shown = section.items.slice(0, limit);
	const hasMore = section.totalElements > shown.length;

	return (
		<section aria-labelledby={`site-${def.key}-heading`}>
			<div className="flex items-center gap-3">
				<Heading
					id={`site-${def.key}-heading`}
					className="flex items-center gap-2 font-heading text-body font-semibold text-foreground"
				>
					<Icon className="size-4.5 shrink-0 text-muted" aria-hidden />
					{label}
				</Heading>
				<span className="text-label tabular-nums text-muted">
					{formatCount(locale, section.totalElements)}
				</span>
				<span aria-hidden className="h-px flex-1 bg-border" />
			</div>

			<ul className="mt-1">
				{shown.map((item, index) => (
					<SiteRow
						key={item.id}
						item={item}
						index={index}
						sectionKey={def.key}
						icon={Icon}
						titleLevel={headingLevel === 4 ? 5 : 4}
					/>
				))}
			</ul>

			{hasMore ? (
				<div className="mt-5">
					<SearchNavLink href={def.viewAllHref(q)} className={viewAllCtaClass}>
						<span className="relative z-1">{viewAllLabel}</span>
					</SearchNavLink>
				</div>
			) : null}
		</section>
	);
}

/**
 * The ماڵپەر source — this website's own CMS content, grouped by section with
 * a "view the rest" link into each catalogue's filtered listing.
 */
export async function SiteResults({
	q,
	locale,
}: {
	q: string;
	locale: string;
}) {
	const [t, tNav] = await Promise.all([
		getTranslations("Search"),
		getTranslations("Nav"),
	]);

	const trimmed = q.trim();
	if (trimmed.length === 0) {
		return (
			<EmptyState
				icon={<MagnifyingGlassIcon />}
				title={t("heading")}
				description={t("browseDescription")}
				className="py-20"
			/>
		);
	}

	const response = await searchSiteWithFallback(locale, {
		q: trimmed,
		type: "ALL",
		page: 0,
		size: SECTION_SIZE,
	});

	if (!response) {
		return (
			<ErrorState
				framed
				title={t("siteUnavailable")}
				action={<RetryButton label={t("retry")} />}
				className="my-10"
			/>
		);
	}

	const sections = siteSectionsOf(response);

	if (sections.length === 0) {
		return (
			<div id={SITE_RESULTS_ANCHOR_ID}>
				<FocusRestore rootId={SITE_RESULTS_ANCHOR_ID} />
				<div id={RESULTS_SUMMARY_ID} tabIndex={-1} className="outline-none">
					<EmptyState
						icon={<MagnifyingGlassIcon />}
						title={t("emptyTitle")}
						description={t("emptyDescription")}
						className="py-20"
					/>
				</div>
				<AnnounceResults text={t("emptyTitle")} />
			</div>
		);
	}

	const total = sections.reduce(
		(sum, entry) => sum + entry.section.totalElements,
		0,
	);
	const summary = t("resultsFor", {
		count: formatCount(locale, total),
		query: trimmed,
	});

	return (
		<SearchPendingRegion>
			<div id={SITE_RESULTS_ANCHOR_ID}>
				<FocusRestore rootId={SITE_RESULTS_ANCHOR_ID} />
				<h2
					id={RESULTS_SUMMARY_ID}
					tabIndex={-1}
					className="mb-6 border-b border-border pb-3 font-heading text-lead font-semibold text-foreground focus-visible:outline-none sm:mb-8 sm:text-h3"
				>
					{t.rich("resultsForRich", {
						count: formatCount(locale, total),
						query: trimmed,
						bdi,
					})}
				</h2>
				<AnnounceResults text={t("announceResults", { summary })} />
				<div className="grid gap-10 md:grid-cols-2 md:gap-x-14">
					{sections.map(({ def, section }) => (
						<SiteSection
							key={def.key}
							def={def}
							section={section}
							label={tNav(def.navLabelKey)}
							viewAllLabel={t("siteViewAll", {
								section: tNav(def.navLabelKey),
							})}
							locale={locale}
							q={trimmed}
						/>
					))}
				</div>
			</div>
		</SearchPendingRegion>
	);
}
