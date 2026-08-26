import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import {
	ScrollReveal,
	ScrollRevealBlock,
	ScrollRevealItem,
} from "@/components/motion/scroll-reveal";
import { Link } from "@/components/ui/link";
import { VideoCinemaHero } from "@/components/video/video-cinema-hero";
import { VideoGenrePills } from "@/components/video/video-genre-pills";
import {
	VideoPosterCard,
	type VideoPosterCardProps,
} from "@/components/video/video-poster-card";
import {
	getVideoById,
	getVideoListing,
	getVideoTopicName,
} from "@/lib/api/videos";
import { homeInsetClass } from "@/lib/layout";
import { localeAlternates } from "@/lib/seo/metadata";
import { cn } from "@/lib/utils";
import {
	cardIdentity,
	filterVideos,
	pickFeaturedCard,
} from "@/lib/video/filter";
import { formatDuration } from "@/lib/video/format";
import {
	SHORT_FILM_LISTING_FILTERS,
	shortFilmDetailHref,
} from "@/lib/video/resolve";
import { parseVideoTopicId } from "@/lib/video-url";
import type { ResolvedVideoCard } from "@/types/video";

const SHORT_FILMS_PATH = "/videos/shortfilms";
const PROGRAMME_ID = "shortfilms-programme";
const GENRE_PILL_LIMIT = 8;

export async function generateMetadata({
	params,
}: {
	params: Promise<{ locale: string }>;
}): Promise<Metadata> {
	const { locale } = await params;
	const t = await getTranslations({ locale, namespace: "Video" });

	return {
		alternates: localeAlternates(locale, "/videos/shortfilms"),
		title: t("shortfilms.pageTitle"),
		description: t("shortfilms.metaDescription"),
	};
}

type ShortFilmsPageProps = {
	params: Promise<{ locale: string }>;
	/**
	 * The pill row writes `?genre=`, but the detail sidebar's tag and topic
	 * links land on `?q=` and `?topic=` — all three have to be read here or
	 * those links navigate to an unfiltered page.
	 */
	searchParams: Promise<{ genre?: string; q?: string; topic?: string }>;
};

function toPoster(card: ResolvedVideoCard): VideoPosterCardProps {
	return {
		id: card.id,
		title: card.title,
		coverUrl: card.coverUrl,
		previewVideoUrl: card.previewVideoUrl,
		durationLabel: formatDuration(card.durationSeconds),
		href: shortFilmDetailHref(card.id),
		dark: true,
		variant: "caption",
	};
}

/** Most-used tags become the genre pills. */
function collectGenres(cards: ResolvedVideoCard[]): string[] {
	const counts = new Map<string, number>();
	for (const card of cards) {
		for (const tag of card.tags) {
			counts.set(tag, (counts.get(tag) ?? 0) + 1);
		}
	}
	return [...counts.entries()]
		.sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
		.slice(0, GENRE_PILL_LIMIT)
		.map(([tag]) => tag);
}

/** Folio marker: `03` on its own, `02 / 03` while a filter is narrowing it. */
function folio(shown: number, total: number): string {
	const pad = (value: number) => String(value).padStart(2, "0");
	return shown === total ? pad(total) : `${pad(shown)} / ${pad(total)}`;
}

export default async function ShortFilmsPage({
	params,
	searchParams,
}: ShortFilmsPageProps) {
	const { locale } = await params;
	const { genre, q, topic } = await searchParams;
	setRequestLocale(locale);

	const t = await getTranslations("Video");
	// `genre` and `q` name the same tag axis; reconcile onto the one the pills
	// can render so an incoming tag link shows up as a selected pill.
	const activeGenre = genre?.trim() || q?.trim() || null;
	const activeTopicId = parseVideoTopicId(topic);
	const hasFilters = activeGenre != null || activeTopicId != null;

	// The whole programme, unfiltered: the pills, the marquee and the folio all
	// describe the catalogue, so narrowing happens below this line — in memory —
	// and never shrinks the pill row down to the tags of its own selection.
	const listing = await getVideoListing(locale, {
		...SHORT_FILM_LISTING_FILTERS,
		size: 100,
	});
	const allShort = listing.items;

	if (allShort.length === 0) {
		return (
			<main className="bg-foreground py-24 text-primary-foreground sm:py-32">
				<div className={cn(homeInsetClass, "text-center")}>
					<h1 className="font-heading text-h1 font-bold">
						{t("shortfilms.pageTitle")}
					</h1>
					<p className="mt-3 text-body text-primary-foreground/70">
						{t("shortfilms.empty")}
					</p>
				</div>
			</main>
		);
	}

	const genres = collectGenres(allShort);
	const visible = filterVideos(allShort, {
		topicId: activeTopicId,
		query: activeGenre,
	});

	const featuredCard = pickFeaturedCard(allShort) ?? allShort[0];
	const [featuredDetail, activeTopicName] = await Promise.all([
		getVideoById(locale, featuredCard.id),
		activeTopicId != null ? getVideoTopicName(locale, activeTopicId) : null,
	]);

	// `once: true` reveals stay hidden if the DOM they animate is swapped under
	// them, so the grid remounts whenever the filter changes.
	const gridKey = `${activeGenre ?? "all"}:${activeTopicId ?? "any"}`;

	return (
		<main className="bg-foreground pb-16 text-primary-foreground sm:pb-24">
			<VideoCinemaHero
				id={featuredCard.id}
				title={featuredDetail?.title ?? featuredCard.title}
				description={featuredDetail?.description ?? featuredCard.excerpt}
				coverUrl={featuredDetail?.coverUrl ?? featuredCard.coverUrl}
				previewVideoUrl={
					featuredDetail?.previewVideoUrl ?? featuredCard.previewVideoUrl
				}
				hoverCoverUrl={
					featuredCard.hoverCoverUrl ?? featuredDetail?.coverUrl ?? null
				}
				watchNowLabel={t("shortfilms.watchNow")}
				detailsLabel={t("shortfilms.details")}
				href={shortFilmDetailHref(featuredCard.id)}
			/>

			{/* One programme, one grid. The page used to run three rails over the
			    same handful of films, so every title was on screen three times. */}
			<section
				id={PROGRAMME_ID}
				aria-labelledby="shortfilms-programme-heading"
				className="scroll-mt-26 pt-12 sm:scroll-mt-30 sm:pt-16"
			>
				<div className={homeInsetClass}>
					<ScrollRevealBlock className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-2 border-b border-primary-foreground/20 pb-4 sm:pb-5">
						<h2
							id="shortfilms-programme-heading"
							className="font-heading text-h2 font-bold leading-tight text-balance sm:text-h1"
						>
							{t("shortfilms.more")}
						</h2>
						<span
							aria-hidden="true"
							dir="ltr"
							className="label shrink-0 font-medium tabular-nums text-primary-foreground/40"
						>
							{folio(visible.length, allShort.length)}
						</span>
					</ScrollRevealBlock>

					<ScrollRevealBlock
						delay={0.06}
						className="mt-5 flex flex-col gap-3 sm:mt-6"
					>
						<VideoGenrePills
							genres={genres}
							activeGenre={activeGenre}
							allLabel={t("shortfilms.allGenres")}
							label={t("shortfilms.genreLabel")}
							scrollTargetId={PROGRAMME_ID}
							dark
						/>

						{hasFilters ? (
							<div className="flex flex-wrap items-baseline gap-x-4 gap-y-1">
								{activeTopicName ? (
									<span className="text-small text-primary-foreground/55">
										{t("filter.topicLabel")}
										{": "}
										<span className="font-semibold text-primary-foreground">
											{activeTopicName}
										</span>
									</span>
								) : null}
								<Link
									href={SHORT_FILMS_PATH}
									className="text-small text-primary-foreground/55 underline decoration-primary-foreground/25 underline-offset-4 transition-colors fine-hover:text-primary-foreground"
								>
									{t("filter.reset")}
								</Link>
							</div>
						) : null}
					</ScrollRevealBlock>

					{visible.length === 0 ? (
						// The dead timecode — the projector with no reel.
						<div className="mt-6 border border-primary-foreground/20 bg-primary-foreground/5 px-6 py-14 text-center sm:mt-8">
							<p
								aria-hidden="true"
								dir="ltr"
								className="label font-medium tabular-nums text-primary-foreground/40"
							>
								{"// --:--"}
							</p>
							<p className="mt-2 text-body text-primary-foreground/70">
								{t("shortfilms.noResults")}
							</p>
							<Link
								href={SHORT_FILMS_PATH}
								className="mt-4 inline-block font-heading text-small font-medium text-primary-foreground underline decoration-primary-foreground/30 underline-offset-4 transition-colors fine-hover:decoration-primary-foreground"
							>
								{t("filter.reset")}
							</Link>
						</div>
					) : (
						// Spotlight scope: hovering one film dims its siblings.
						<ScrollReveal
							key={gridKey}
							className="spotlight-grid-dark mt-6 grid grid-cols-1 gap-4 sm:mt-8 sm:grid-cols-2 sm:gap-5 lg:grid-cols-3"
						>
							{visible.map((card) => (
								<ScrollRevealItem
									key={cardIdentity(card)}
									className="h-full min-w-0"
								>
									<VideoPosterCard {...toPoster(card)} />
								</ScrollRevealItem>
							))}
						</ScrollReveal>
					)}
				</div>
			</section>
		</main>
	);
}
