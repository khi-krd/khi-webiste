// Formerly the demo services catalogue — now only the shared types production
// code still imports. All records come from the CMS via `@/lib/api/services`.

export type ServiceMedia = {
	url: string;
	alt?: string;
};

export type ServiceLayout =
	| "cinema"
	| "split"
	| "split-reverse"
	| "editorial"
	| "stacked"
	| "gallery"
	| "studio-panel"
	| "bento";

export type ServiceVideo = {
	src: string;
	poster?: string;
	posterAlt?: string;
	variant?: "minimal" | "full";
	/** Provider/player URL (YouTube embed, Vimeo player, …) — plays in an iframe. */
	embed?: boolean;
};

export type ServiceGalleryMediaItem =
	| { kind: "image"; media: ServiceMedia }
	| { kind: "video"; video: ServiceVideo };

export type ServiceItem = {
	id: string;
	slug: string;
	layout: ServiceLayout;
	featureImage: ServiceMedia;
	video: ServiceVideo;
	thumbnails: [ServiceMedia, ServiceMedia, ServiceMedia, ServiceMedia];
	/** Ordered gallery slots — each entry may be an image or a video. */
	galleryMedia?: ServiceGalleryMediaItem[];
};
