import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/components/ui/link";
import { VideoCinemaHero } from "@/components/video/video-cinema-hero";
import { VideoGenrePills } from "@/components/video/video-genre-pills";
import type { VideoPosterCardProps } from "@/components/video/video-poster-card";
import { VideoPosterRail } from "@/components/video/video-poster-rail";
import {
	getVideoById,
	getVideoListing,
	getVideoTopicName,
} from "@/lib/api/videos";
import { homeInsetClass } from "@/lib/layout";
import { localeAlternates } from "@/lib/seo/metadata";
import { cn } from "@/lib/utils";
import { pickFeaturedCard } from "@/lib/video/filter";
import { formatDuration } from "@/lib/video/format";
import {
	SHORT_FILM_LISTING_FILTERS,
	shortFilmDetailHref,
} from "@/lib/video/resolve";
import { parseVideoTopicId } from "@/lib/video-url";
import type { ResolvedVideoCard } from "@/types/video";

const SHORT_FILMS_PATH = "/videos/shortfilms";
const GENRE_PILL_LIMIT = 8;
const CONTINUE_WATCHING_COUNT = 6;

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
		subtitle: card.subtitle,
		coverUrl: card.coverUrl,
		previewVideoUrl: card.previewVideoUrl,
		durationLabel: formatDuration(card.durationSeconds),
		href: shortFilmDetailHref(card.id),
		dark: true,
	};
}

/** Deterministic mock watch-progress so server and client agree. */
function mockProgress(id: number): number {
	return (((id * 27) % 80) + 12) / 100;
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

	const [listing, activeTopicName] = await Promise.all([
		getVideoListing(locale, {
			...SHORT_FILM_LISTING_FILTERS,
			topicId: activeTopicId,
			query: activeGenre,
			size: 100,
		}),
		activeTopicId != null ? getVideoTopicName(locale, activeTopicId) : null,
	]);
	const allShort = listing.items;
	const hasFilters = activeGenre != null || activeTopicId != null;

	if (allShort.length === 0) {
		return (
			<main className="bg-background">
				<div className={homeInsetClass}>
					<div className="border border-border bg-surface px-6 py-16 text-center">
						<p className="text-body text-muted">{t("shortfilms.empty")}</p>
						{hasFilters ? (
							<Link
								href={SHORT_FILMS_PATH}
								className="mt-4 inline-block font-heading text-small font-medium text-foreground underline decoration-border underline-offset-4 transition-colors fine-hover:text-muted"
							>
								{t("filter.reset")}
							</Link>
						) : null}
					</div>
				</div>
			</main>
		);
	}

	const genres = collectGenres(allShort);
	const featuredCard = pickFeaturedCard(allShort) ?? allShort[0];
	const featuredDetail = await getVideoById(locale, featuredCard.id);
	const continueWatching: VideoPosterCardProps[] = allShort
		.slice(0, CONTINUE_WATCHING_COUNT)
		.map((card) => ({
			...toPoster(card),
			progress: mockProgress(card.id),
			showPlay: true,
		}));
	const more = [...allShort].reverse();

	return (
		<main className="bg-foreground pb-16 text-primary-foreground sm:pb-20">
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

			<div className="space-y-12 pt-12 sm:space-y-16 sm:pt-16">
				{activeTopicId != null ? (
					<div
						className={cn(
							homeInsetClass,
							"flex flex-wrap items-baseline gap-x-4 gap-y-1",
						)}
					>
						<span className="label text-primary-foreground/50">
							{t("filter.topicLabel")}
						</span>
						{activeTopicName ? (
							<span className="font-heading text-small font-semibold text-primary-foreground">
								{activeTopicName}
							</span>
						) : null}
						<Link
							href={SHORT_FILMS_PATH}
							className="text-small text-primary-foreground/55 underline decoration-primary-foreground/25 underline-offset-4 transition-colors fine-hover:text-primary-foreground/85"
						>
							{t("filter.reset")}
						</Link>
					</div>
				) : null}

				<VideoGenrePills
					genres={genres}
					activeGenre={activeGenre}
					allLabel={t("shortfilms.allPopular")}
					scrollTargetId="shortfilms-trending"
					dark
				/>

				<VideoPosterRail
					id="shortfilms-trending"
					title={t("shortfilms.trending")}
					cards={allShort.map(toPoster)}
					emptyLabel={t("shortfilms.empty")}
					dark
					cardWidthClass="w-44 sm:w-48 lg:w-52 2xl:w-64"
				/>

				<VideoPosterRail
					title={t("shortfilms.continueWatching")}
					cards={continueWatching}
					dark
					cardWidthClass="w-44 sm:w-48 lg:w-52 2xl:w-64"
				/>

				<VideoPosterRail
					title={t("shortfilms.more")}
					cards={more.map(toPoster)}
					dark
					cardWidthClass="w-44 sm:w-48 lg:w-52 2xl:w-64"
				/>
			</div>
		</main>
	);
}
