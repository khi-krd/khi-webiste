import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { VideoCinemaHero } from "@/components/video/video-cinema-hero";
import { VideoGenrePills } from "@/components/video/video-genre-pills";
import type { VideoPosterCardProps } from "@/components/video/video-poster-card";
import { VideoPosterRail } from "@/components/video/video-poster-rail";
import { getVideoById, getVideoListing } from "@/lib/api/videos";
import { homeInsetClass } from "@/lib/layout";
import { SHORT_FILMS_TOPIC_ID } from "@/lib/mock/videos";
import { formatDuration } from "@/lib/video/format";
import { shortFilmDetailHref } from "@/lib/video/resolve";
import type { ResolvedVideoCard } from "@/types/video";

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
		title: t("shortfilms.pageTitle"),
		description: t("shortfilms.metaDescription"),
	};
}

type ShortFilmsPageProps = {
	params: Promise<{ locale: string }>;
	searchParams: Promise<{ genre?: string }>;
};

function toPoster(card: ResolvedVideoCard): VideoPosterCardProps {
	return {
		id: card.id,
		title: card.title,
		subtitle: card.subtitle,
		coverUrl: card.coverUrl,
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
	const { genre } = await searchParams;
	setRequestLocale(locale);

	const t = await getTranslations("Video");
	const activeGenre = genre?.trim() || null;

	const allShort = (
		await getVideoListing(locale, {
			topicId: SHORT_FILMS_TOPIC_ID,
			size: 100,
		})
	).items;

	if (allShort.length === 0) {
		return (
			<main className="bg-background">
				<div className={homeInsetClass}>
					<div className="border border-border bg-surface px-6 py-16 text-center">
						<p className="text-body text-muted">{t("shortfilms.empty")}</p>
					</div>
				</div>
			</main>
		);
	}

	const genres = collectGenres(allShort);
	const trending = activeGenre
		? allShort.filter((card) => card.tags.includes(activeGenre))
		: allShort;
	const featuredCard =
		activeGenre && trending.length > 0 ? trending[0] : allShort[0];
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
		<main className="-mt-26 bg-foreground pb-16 text-primary-foreground sm:-mt-30 sm:pb-20">
			<VideoCinemaHero
				id={featuredCard.id}
				eyebrow={t("shortfilms.featuredEyebrow")}
				title={featuredDetail?.title ?? featuredCard.title}
				description={featuredDetail?.description ?? featuredCard.excerpt}
				coverUrl={featuredDetail?.coverUrl ?? featuredCard.coverUrl}
				hoverCoverUrl={
					featuredCard.hoverCoverUrl ?? featuredDetail?.coverUrl ?? null
				}
				watchNowLabel={t("shortfilms.watchNow")}
				detailsLabel={t("shortfilms.details")}
				href={shortFilmDetailHref(featuredCard.id)}
			/>

			<div className="space-y-12 pt-12 sm:space-y-16 sm:pt-16">
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
					cards={trending.map(toPoster)}
					emptyLabel={t("shortfilms.empty")}
					dark
					cardWidthClass="w-44 sm:w-48 lg:w-52"
				/>

				<VideoPosterRail
					title={t("shortfilms.continueWatching")}
					cards={continueWatching}
					dark
					cardWidthClass="w-44 sm:w-48 lg:w-52"
				/>

				<VideoPosterRail
					title={t("shortfilms.more")}
					cards={more.map(toPoster)}
					dark
					cardWidthClass="w-44 sm:w-48 lg:w-52"
				/>
			</div>
		</main>
	);
}
