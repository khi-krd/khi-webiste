import { resolveAudioContent } from "@/lib/audio/resolve";
import { getAllDemoSoundTracks } from "@/lib/mock/audio";
import { getGalleryPosts } from "@/lib/mock/gallery";
import { getNews } from "@/lib/mock/news";
import { getAllDemoVideos } from "@/lib/mock/videos";
import { getAllDemoWritingCards } from "@/lib/mock/writing-page";
import { resolveVideoContent } from "@/lib/video/resolve";
import type { FeaturedItem } from "@/types/content";

/** Demo featured carousel items — used when the upstream `/featured` call is unavailable. */
export function getDemoFeaturedItems(locale: string): FeaturedItem[] {
	const [writing] = getAllDemoWritingCards(locale);
	const audioTrack = getAllDemoSoundTracks()[0];
	const video =
		getAllDemoVideos().find((item) => item.id === 2) ?? getAllDemoVideos()[0];
	const galleryPost = getGalleryPosts(locale)[0];
	const article = getNews(locale)[0];

	const items: FeaturedItem[] = [];

	if (writing) {
		items.push({
			id: String(writing.id),
			type: "book",
			slug: String(writing.id),
			title: writing.title,
			description: writing.excerpt,
			image: {
				url: writing.coverUrl ?? "/menu/6.jpg",
				alt: writing.title,
			},
		});
	}

	if (audioTrack) {
		const content = resolveAudioContent(locale, audioTrack);
		items.push({
			id: String(audioTrack.id),
			type: "audio",
			slug: String(audioTrack.id),
			title: content?.title ?? String(audioTrack.id),
			description:
				content?.description?.trim() ||
				"Listen to preserved recordings from the digital sound archive.",
			image: {
				url: audioTrack.ckbCoverUrl ?? audioTrack.kmrCoverUrl ?? "/menu/5.jpg",
				alt: content?.title ?? undefined,
			},
		});
	}

	if (video) {
		const content = resolveVideoContent(locale, video);
		items.push({
			id: String(video.id),
			type: "video",
			slug: String(video.id),
			title: content?.title ?? String(video.id),
			description:
				content?.description?.trim() ||
				"Watch curated moving-image records from the institute archive.",
			image: {
				url:
					video.ckbCoverUrl ??
					video.kmrCoverUrl ??
					video.hoverCoverUrl ??
					"/menu/4.jpg",
				alt: content?.title ?? undefined,
			},
		});
	}

	if (galleryPost) {
		items.push({
			id: galleryPost.id,
			type: "gallery",
			slug: galleryPost.id,
			title: galleryPost.title,
			description: galleryPost.description
				.replace(/<[^>]+>/g, " ")
				.replace(/\s+/g, " ")
				.trim(),
			image: {
				url: galleryPost.album[0]?.imageUrl ?? "/menu/7.jpg",
				alt: galleryPost.title,
			},
		});
	}

	if (article) {
		items.push({
			id: article.id,
			type: "article",
			slug: article.slug,
			title: article.title,
			description: article.excerpt,
			image: {
				url: article.image.url,
				alt: article.image.alt ?? article.title,
			},
		});
	}

	return items;
}
