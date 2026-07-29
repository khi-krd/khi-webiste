import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { setRequestLocale } from "next-intl/server";
import { AudioPostView } from "@/components/audio/audio-post-view";
import {
	getAudioNeighbors,
	getAudioTrackById,
	getRelatedAudio,
} from "@/lib/api/audio";
import { localeAlternates } from "@/lib/seo/metadata";

type AudioDetailPageProps = {
	params: Promise<{ locale: string; id: string }>;
};

function parseTrackId(raw: string): number | null {
	const parsed = Number.parseInt(raw, 10);
	return Number.isInteger(parsed) && parsed > 0 ? parsed : null;
}

export async function generateMetadata({
	params,
}: AudioDetailPageProps): Promise<Metadata> {
	const { locale, id } = await params;
	const trackId = parseTrackId(id);
	// Thrown HERE (not just in the page) so the 404 status is decided before
	// the shell starts streaming with a 200.
	if (trackId == null) notFound();

	const detail = await getAudioTrackById(locale, trackId);
	if (!detail) notFound();

	return {
		alternates: localeAlternates(locale, `/audio/${id}`),
		title: detail.title,
		description: detail.description || undefined,
	};
}

export default async function AudioDetailPage({
	params,
}: AudioDetailPageProps) {
	const { locale, id } = await params;
	setRequestLocale(locale);

	const trackId = parseTrackId(id);
	if (trackId == null) notFound();

	const detail = await getAudioTrackById(locale, trackId);
	if (!detail) notFound();

	const { previous, next } = await getAudioNeighbors(locale, detail.id);
	const related = await getRelatedAudio(locale, detail, {
		excludeIds: [previous?.id, next?.id].filter(
			(value): value is number => value != null,
		),
	});

	return (
		<main className="bg-background">
			<AudioPostView
				detail={detail}
				locale={locale}
				previous={previous}
				next={next}
				related={related}
			/>
		</main>
	);
}
