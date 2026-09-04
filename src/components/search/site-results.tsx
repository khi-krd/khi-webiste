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
import type { ComponentProps, ComponentType } from "react";
import { RetryButton } from "@/components/search/retry-button";
import {
	SearchNavLink,
	SearchPendingRegion,
} from "@/components/search/search-transition";
import { EmptyState } from "@/components/ui/empty-state";
import { ErrorState } from "@/components/ui/error-state";
import { Image } from "@/components/ui/image";
import type {
	ResolvedGlobalSearchResponse,
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

function SiteSection({
	def,
	section,
	label,
	viewAllLabel,
	locale,
	q,
}: {
	def: SectionDef;
	section: ResolvedSearchSection;
	label: string;
	viewAllLabel: string;
	locale: string;
	q: string;
}) {
	const Icon = def.icon;
	const shown = section.items.slice(0, SECTION_SIZE);
	const hasMore = section.totalElements > shown.length;

	return (
		<section>
			<div className="flex items-baseline gap-3 border-b border-border pb-2.5">
				<h3 className="flex items-center gap-2 font-heading text-body font-semibold text-foreground">
					<Icon className="size-4.5 shrink-0 text-muted" aria-hidden />
					{label}
				</h3>
				<span className="text-label tabular-nums text-muted">
					{formatCount(locale, section.totalElements)}
				</span>
			</div>

			<ul>
				{shown.map((item) => {
					const description = stripHtml(item.description);
					return (
						<li
							key={item.id}
							className="border-b border-border last:border-b-0"
						>
							<SearchNavLink
								href={item.href}
								className="group flex items-center gap-4 py-3.5"
							>
								<div className="relative size-12 shrink-0 overflow-hidden border border-border bg-sunken sm:size-14">
									{item.coverUrl?.trim() ? (
										<Image
											src={item.coverUrl}
											alt=""
											aspectRatio="square"
											sizes="56px"
											className="absolute inset-0 size-full"
										/>
									) : (
										<span className="absolute inset-0 flex items-center justify-center">
											<Icon className="size-5 text-muted/60" aria-hidden />
										</span>
									)}
								</div>
								<span className="min-w-0 flex-1">
									<span
										className={cn(
											"line-clamp-1 text-start text-body font-medium text-foreground",
											"[overflow-wrap:anywhere] transition-colors group-fine-hover:text-brand",
										)}
									>
										<bdi>{item.title}</bdi>
									</span>
									{description ? (
										<span className="mt-0.5 line-clamp-1 text-start text-small text-muted [overflow-wrap:anywhere]">
											<bdi>{description}</bdi>
										</span>
									) : null}
								</span>
							</SearchNavLink>
						</li>
					);
				})}
			</ul>

			{hasMore ? (
				<SearchNavLink
					href={def.viewAllHref(q)}
					className="mt-3 inline-flex text-small text-muted underline decoration-border underline-offset-4 transition-colors fine-hover:text-foreground fine-hover:decoration-current"
				>
					{viewAllLabel}
				</SearchNavLink>
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

	const sections = SECTIONS.map((def) => ({
		def,
		section: response[def.key],
	})).filter(
		(entry): entry is { def: SectionDef; section: ResolvedSearchSection } =>
			entry.section != null && entry.section.items.length > 0,
	);

	if (sections.length === 0) {
		return (
			<EmptyState
				icon={<MagnifyingGlassIcon />}
				title={t("emptyTitle")}
				description={t("emptyDescription")}
				className="py-20"
			/>
		);
	}

	return (
		<SearchPendingRegion>
			<div className="grid gap-10 md:grid-cols-2 md:gap-x-14">
				{sections.map(({ def, section }) => (
					<SiteSection
						key={def.key}
						def={def}
						section={section}
						label={tNav(def.navLabelKey)}
						viewAllLabel={t("siteViewAll", { section: tNav(def.navLabelKey) })}
						locale={locale}
						q={trimmed}
					/>
				))}
			</div>
		</SearchPendingRegion>
	);
}
