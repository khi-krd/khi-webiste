import type {
	ServiceGalleryMediaItem,
	ServiceItem,
	ServiceMedia,
	ServiceVideo,
} from "@/lib/mock/services";
import type { ServiceGalleryMedia } from "@/types/service";

export type GallerySlide =
	| { type: "image"; media: ServiceMedia }
	| { type: "video"; video: ServiceVideo };

const VIDEO_URL_PATTERN = /\.(mp4|webm|mov|m4v|ogg)(\?|#|$)/i;

function isValidMediaUrl(url: string | undefined): boolean {
	return Boolean(url?.trim());
}

function isVideoUrl(url: string): boolean {
	return VIDEO_URL_PATTERN.test(url.trim());
}

function isValidVideo(video: ServiceVideo): boolean {
	return isValidMediaUrl(video.src) || isValidMediaUrl(video.poster);
}

export function slideKey(slide: GallerySlide): string {
	if (slide.type === "image") return slide.media.url.trim();
	return slide.video.src.trim() || slide.video.poster?.trim() || "";
}

function dedupeOrderedSlides(slides: GallerySlide[]): GallerySlide[] {
	const seen = new Set<string>();
	const ordered: GallerySlide[] = [];

	for (const slide of slides) {
		const key = slideKey(slide);
		if (!key || seen.has(key)) continue;
		seen.add(key);
		ordered.push(slide);
	}

	return ordered;
}

function galleryItemToSlide(
	item: ServiceGalleryMediaItem,
): GallerySlide | null {
	if (item.kind === "image") {
		if (!isValidMediaUrl(item.media.url)) return null;
		return { type: "image", media: item.media };
	}

	if (!isValidVideo(item.video)) return null;
	return { type: "video", video: item.video };
}

function urlToSlide(
	url: string,
	alt: string,
	video: ServiceVideo,
): GallerySlide | null {
	const trimmed = url.trim();
	if (!isValidMediaUrl(trimmed)) return null;

	if (isVideoUrl(trimmed)) {
		return {
			type: "video",
			video: {
				src: trimmed,
				poster: video.poster,
				posterAlt: video.posterAlt ?? alt,
				variant: video.variant,
			},
		};
	}

	return { type: "image", media: { url: trimmed, alt } };
}

function legacySlidesFromService(service: ServiceItem): GallerySlide[] {
	const slides: GallerySlide[] = [];
	const alt = service.featureImage.alt ?? service.id;
	const seen = new Set<string>();

	const pushSlide = (slide: GallerySlide | null) => {
		if (!slide) return;
		const key = slideKey(slide);
		if (!key || seen.has(key)) return;
		seen.add(key);
		slides.push(slide);
	};

	pushSlide(urlToSlide(service.featureImage.url, alt, service.video));

	for (const media of service.thumbnails) {
		pushSlide(urlToSlide(media.url, media.alt ?? alt, service.video));
	}

	const heroSrc = service.video.src?.trim();
	if (
		isValidVideo(service.video) &&
		heroSrc &&
		!seen.has(heroSrc) &&
		!seen.has(service.video.poster?.trim() ?? "")
	) {
		pushSlide({ type: "video", video: service.video });
	}

	return slides;
}

export function mapApiGalleryMedia(
	items: ServiceGalleryMedia[],
	title: string,
	videoVariant: ServiceVideo["variant"] = "minimal",
): ServiceGalleryMediaItem[] {
	return items.flatMap((item): ServiceGalleryMediaItem[] => {
		const url = item.url?.trim();
		if (!url) return [];

		if (item.type === "VIDEO") {
			return [
				{
					kind: "video",
					video: {
						src: url,
						poster: item.posterUrl?.trim() || undefined,
						posterAlt: item.alt?.trim() || title,
						variant: videoVariant,
					},
				},
			];
		}

		return [
			{
				kind: "image",
				media: {
					url,
					alt: item.alt?.trim() || title,
				},
			},
		];
	});
}

export function buildServiceGallery(service: ServiceItem): {
	slides: GallerySlide[];
	defaultIndex: number;
} {
	const fromGalleryMedia =
		service.galleryMedia && service.galleryMedia.length > 0
			? service.galleryMedia
					.map(galleryItemToSlide)
					.filter((slide): slide is GallerySlide => slide != null)
			: [];

	const sourceSlides =
		fromGalleryMedia.length > 0
			? fromGalleryMedia
			: legacySlidesFromService(service);

	return {
		slides: dedupeOrderedSlides(sourceSlides),
		defaultIndex: 0,
	};
}
