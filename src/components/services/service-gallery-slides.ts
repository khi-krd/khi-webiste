import type {
	ServiceItem,
	ServiceMedia,
	ServiceVideo,
} from "@/lib/mock/services";

export type GallerySlide =
	| { type: "image"; media: ServiceMedia }
	| { type: "video"; video: ServiceVideo };

export function buildServiceGallery(
	service: ServiceItem,
	lead: "feature" | "video" = "feature",
): { slides: GallerySlide[]; defaultIndex: number } {
	if (lead === "video") {
		return {
			slides: [
				{ type: "video", video: service.video },
				...service.thumbnails.map(
					(media) => ({ type: "image", media }) as GallerySlide,
				),
			],
			defaultIndex: 0,
		};
	}

	return {
		slides: [
			{ type: "image", media: service.featureImage },
			...service.thumbnails.map(
				(media) => ({ type: "image", media }) as GallerySlide,
			),
		],
		defaultIndex: 0,
	};
}
