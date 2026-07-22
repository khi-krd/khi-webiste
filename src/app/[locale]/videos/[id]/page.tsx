import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { setRequestLocale } from "next-intl/server";
import { VideoDetailView } from "@/components/video/video-detail-view";
import type { VideoPosterCardProps } from "@/components/video/video-poster-card";
import { getVideoById, getVideoListing } from "@/lib/api/videos";
import { formatDuration } from "@/lib/video/format";
import {
	isShortFilm,
	shortFilmDetailHref,
	videoDetailHref,
} from "@/lib/video/resolve";
import { RELATED_VIDEOS_VISIBLE } from "@/components/video/video-related-grid";

type VideoDetailPageProps = {
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
}: VideoDetailPageProps): Promise<Metadata> {
	const { locale, id } = await params;
	const { clip } = await searchParams;
	const videoId = parseVideoId(id);
	// Thrown HERE (not just in the page) so the 404 status is decided before
	// the shell starts streaming with a 200.
	if (videoId == null) notFound();

	const detail = await getVideoById(locale, videoId, parseClipNumber(clip));
	if (!detail) notFound();

	return {
		title: detail.title,
		description: detail.description || undefined,
	};
}

export default async function VideoDetailPage({
	params,
	searchParams,
}: VideoDetailPageProps) {
	const { locale, id } = await params;
	const { clip } = await searchParams;
	setRequestLocale(locale);

	const videoId = parseVideoId(id);
	if (videoId == null) notFound();

	const clipNumber = parseClipNumber(clip);
	const detail = await getVideoById(locale, videoId, clipNumber);
	if (!detail) notFound();

	if (isShortFilm(detail)) {
		const clipQuery =
			clipNumber != null ? `?clip=${clipNumber}` : "";
		redirect(`${shortFilmDetailHref(videoId)}${clipQuery}`);
	}

	const relatedListing = await getVideoListing(locale, {
		topicId: detail.topicId ?? undefined,
		videoType: detail.videoType,
		size: RELATED_VIDEOS_VISIBLE + 4,
	});

	const hasClipPlaylist = detail.clips.length > 1;

	// Sibling clips live in the on-page playlist when there are multiple;
	// Related stays other catalogue items only.
	const relatedVideos: VideoPosterCardProps[] = relatedListing.items
		.filter((card) => {
			if (card.id === videoId) {
				// Drop the active clip always; drop all siblings when the playlist owns them.
				return !hasClipPlaylist && card.clipNumber !== detail.activeClipNumber;
			}
			return true;
		})
		.map((card) => ({
			id:
				card.clipNumber != null ? card.id * 1000 + card.clipNumber : card.id,
			title: card.title,
			subtitle: card.subtitle,
			coverUrl: card.coverUrl,
			durationLabel: formatDuration(card.durationSeconds),
			href: videoDetailHref(card.id, card.clipNumber),
		}))
		.slice(0, RELATED_VIDEOS_VISIBLE);

	return (
		<main className="bg-background">
			<VideoDetailView
				detail={detail}
				locale={locale}
				relatedVideos={relatedVideos}
			/>
		</main>
	);
}
