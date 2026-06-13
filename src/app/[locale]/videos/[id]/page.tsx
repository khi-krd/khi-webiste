import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { setRequestLocale } from "next-intl/server";
import { VideoDetailView } from "@/components/video/video-detail-view";
import { getVideoById } from "@/lib/api/videos";
import { isShortFilm, shortFilmDetailHref } from "@/lib/video/resolve";

type VideoDetailPageProps = {
	params: Promise<{ locale: string; id: string }>;
};

function parseVideoId(raw: string): number | null {
	const parsed = Number.parseInt(raw, 10);
	return Number.isInteger(parsed) && parsed > 0 ? parsed : null;
}

export async function generateMetadata({
	params,
}: VideoDetailPageProps): Promise<Metadata> {
	const { locale, id } = await params;
	const videoId = parseVideoId(id);
	// Thrown HERE (not just in the page) so the 404 status is decided before
	// the shell starts streaming with a 200.
	if (videoId == null) notFound();

	const detail = await getVideoById(locale, videoId);
	if (!detail) notFound();

	return {
		title: detail.title,
		description: detail.description || undefined,
	};
}

export default async function VideoDetailPage({
	params,
}: VideoDetailPageProps) {
	const { locale, id } = await params;
	setRequestLocale(locale);

	const videoId = parseVideoId(id);
	if (videoId == null) notFound();

	const detail = await getVideoById(locale, videoId);
	if (!detail) notFound();

	if (isShortFilm(detail.topicId)) {
		redirect(shortFilmDetailHref(videoId));
	}

	return (
		<main className="-mt-26 bg-background sm:-mt-30">
			<VideoDetailView detail={detail} locale={locale} />
		</main>
	);
}
