import type { PartnerItem } from "@/lib/mock/about";

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
};

export type ServiceItem = {
	id: string;
	slug: string;
	layout: ServiceLayout;
	featureImage: ServiceMedia;
	video: ServiceVideo;
	thumbnails: [ServiceMedia, ServiceMedia, ServiceMedia, ServiceMedia];
};

const MENU = (n: number) => `/menu/${n}.jpg`;
const DEMO_VIDEO = "/video/wave.mp4";

const SERVICE_IDS = [
	"institute-hall",
	"studio",
	"research-publishing",
	"printing-house",
	"sales",
	"library",
	"audio-visual-archive",
	"joint-projects",
] as const;

export type ServiceId = (typeof SERVICE_IDS)[number];

const LAYOUT_BY_ID: Record<ServiceId, ServiceLayout> = {
	"institute-hall": "cinema",
	studio: "cinema",
	"research-publishing": "cinema",
	"printing-house": "cinema",
	sales: "cinema",
	library: "cinema",
	"audio-visual-archive": "cinema",
	"joint-projects": "cinema",
};

function buildThumbnails(startIndex: number): ServiceItem["thumbnails"] {
	return [0, 1, 2, 3].map((offset) => {
		const menuIndex = ((startIndex + offset - 1) % 7) + 1;
		return { url: MENU(menuIndex) };
	}) as ServiceItem["thumbnails"];
}

function buildVideo(
	imageIndex: number,
	variant: "minimal" | "full",
): ServiceVideo {
	return {
		src: DEMO_VIDEO,
		poster: MENU(imageIndex),
		variant,
	};
}

function buildService(id: ServiceId, imageIndex: number): ServiceItem {
	const layout = LAYOUT_BY_ID[id];
	const videoVariant: "minimal" | "full" =
		layout === "split-reverse" ? "full" : "minimal";

	return {
		id,
		slug: id,
		layout,
		featureImage: { url: MENU(imageIndex) },
		video: buildVideo((imageIndex % 7) + 1, videoVariant),
		thumbnails: buildThumbnails(imageIndex + 1),
	};
}

const SERVICES: ServiceItem[] = SERVICE_IDS.map((id, index) =>
	buildService(id, (index % 7) + 1),
);

export function getServices(_locale: string): ServiceItem[] {
	return SERVICES;
}

export function getServicesHeroMedia(): ServiceMedia {
	return {
		url: "/about/services-bg.jpg",
		alt: "Institute library and research facilities",
	};
}

const BOTTOM_CARDS: PartnerItem[] = [
	{
		id: "donate",
		slug: "donate",
		image: {
			url: "/about/475203467_1007002848126180_7383496220452921499_n.jpg",
			alt: "Outdoor heritage photography exhibition",
		},
		href: "/donate",
	},
	{
		id: "about",
		slug: "about",
		image: {
			url: "/about/475203467_1007002848126180_7383496220452921499_n.jpg",
			alt: "Kurdish Heritage Institute",
		},
		href: "/about",
	},
];

export function getServicesBottomCards(_locale: string): PartnerItem[] {
	return BOTTOM_CARDS;
}
