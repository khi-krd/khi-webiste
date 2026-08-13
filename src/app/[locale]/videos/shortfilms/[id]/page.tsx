import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { setRequestLocale } from "next-intl/server";
import { ShortFilmDetailView } from "@/components/video/short-film-detail-view";
import type { VideoPosterCardProps } from "@/components/video/video-poster-card";
import { RELATED_VIDEOS_VISIBLE } from "@/components/video/video-related-grid";
import { getVideoById, getVideoListing } from "@/lib/api/videos";
import { localeAlternates } from "@/lib/seo/metadata";
import { formatDuration } from "@/lib/video/format";
import {
	isShortFilm,
	SHORT_FILM_LISTING_FILTERS,
	shortFilmDetailHref,
} from "@/lib/video/resolve";

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
	if (!detail || !isShortFilm(detail)) notFound();

	return {
		alternates: localeAlternates(locale, `/videos/shortfilms/${id}`),
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
	if (!detail || !isShortFilm(detail)) notFound();

	const relatedListing = await getVideoListing(locale, {
		...SHORT_FILM_LISTING_FILTERS,
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
			previewVideoUrl: card.previewVideoUrl,
			durationLabel: formatDuration(card.durationSeconds),
			href: shortFilmDetailHref(card.id),
			dark: true,
		}));

	return (
		// Tail padding lives on the detail view's last wrapper — none on <main>.
		<main className="bg-foreground text-primary-foreground">
			<ShortFilmDetailView
				detail={detail}
				relatedShortFilms={relatedShortFilms}
			/>
		</main>
	);
}
