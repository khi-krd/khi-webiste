import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { setRequestLocale } from "next-intl/server";
import { ShortFilmDetailView } from "@/components/video/short-film-detail-view";
import type { VideoPosterCardProps } from "@/components/video/video-poster-card";
import { getVideoById, getVideoListing } from "@/lib/api/videos";
import { SHORT_FILMS_TOPIC_ID } from "@/lib/mock/videos";
import { formatDuration } from "@/lib/video/format";
import { shortFilmDetailHref } from "@/lib/video/resolve";
import { RELATED_VIDEOS_VISIBLE } from "@/components/video/video-related-grid";

type ShortFilmDetailPageProps = {
	params: Promise<{ locale: string; id: string }>;
	searchParams: Promise<{ clip?: string }>;
};

function parseVideoId(raw: string): number | null {
	const parsed = Number.parseInt(raw, 10);
	return Number.isInteger(parsed) && parsed > 0 ? parsed : null;
}

function parseClipNumber(raw: string | undefined): number | null {
	if (!raw) return null;
	const parsed = Number.parseInt(raw, 10);
	return Number.isInteger(parsed) && parsed > 0 ? parsed : null;
}

export async function generateMetadata({
	params,
	searchParams,
}: ShortFilmDetailPageProps): Promise<Metadata> {
	const { locale, id } = await params;
	const { clip } = await searchParams;
	const videoId = parseVideoId(id);
	if (videoId == null) notFound();

	const detail = await getVideoById(locale, videoId, parseClipNumber(clip));
	if (!detail || detail.topicId !== SHORT_FILMS_TOPIC_ID) notFound();

	return {
		title: detail.title,
		description: detail.description || undefined,
	};
}

export default async function ShortFilmDetailPage({
	params,
	searchParams,
}: ShortFilmDetailPageProps) {
	const { locale, id } = await params;
	const { clip } = await searchParams;
	setRequestLocale(locale);

	const videoId = parseVideoId(id);
	if (videoId == null) notFound();

	const detail = await getVideoById(locale, videoId, parseClipNumber(clip));
	if (!detail || detail.topicId !== SHORT_FILMS_TOPIC_ID) notFound();

	const relatedListing = await getVideoListing(locale, {
		topicId: SHORT_FILMS_TOPIC_ID,
		size: RELATED_VIDEOS_VISIBLE + 2,
	});
	const relatedShortFilms: VideoPosterCardProps[] = relatedListing.items
		.filter((card) => card.id !== videoId)
		.slice(0, RELATED_VIDEOS_VISIBLE)
		.map((card) => ({
			id: card.id,
			title: card.title,
			subtitle: card.subtitle,
			coverUrl: card.coverUrl,
			durationLabel: formatDuration(card.durationSeconds),
			href: shortFilmDetailHref(card.id),
			dark: true,
		}));

	return (
		<main className="bg-foreground">
			<ShortFilmDetailView
				detail={detail}
				locale={locale}
				relatedShortFilms={relatedShortFilms}
			/>
		</main>
	);
}
