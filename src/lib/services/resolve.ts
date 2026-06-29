import type {
	ServiceItem,
	ServiceLayout,
	ServiceMedia,
	ServiceVideo,
} from "@/lib/mock/services";
import type { Service, ServiceContent, ServiceLayoutType } from "@/types/service";

function resolveServiceContentForLanguage(
	locale: string,
	service: Service,
): ServiceContent | null {
	const languageCode = locale === "ckb" ? "CKB" : "KMR";
	const preferred = service.contents.find(
		(entry) => entry.languageCode === languageCode,
	);
	const fallback = service.contents.find(
		(entry) => entry.languageCode !== languageCode,
	);
	return preferred ?? fallback ?? service.contents[0] ?? null;
}

export type ResolvedServiceLayout = {
	layoutType: Service["layoutType"];
	heroVideoUrl: string | null;
	heroPosterUrl: string | null;
	navAnchorId: string | null;
	featureImageUrls: string[];
	thumbnailUrls: string[];
	partnerIds: number[];
};

function resolveServiceLayout(service: Service): ResolvedServiceLayout {
	return {
		layoutType: service.layoutType ?? null,
		heroVideoUrl: service.heroVideoUrl ?? null,
		heroPosterUrl: service.heroPosterUrl ?? null,
		navAnchorId: service.navAnchorId ?? null,
		featureImageUrls: service.featureImageUrls ?? [],
		thumbnailUrls: service.thumbnailUrls ?? [],
		partnerIds: service.partnerIds ?? [],
	};
}

export type ResolvedServiceContent = {
	id: number;
	title: string;
	body: string;
	location: string | null;
	serviceType: string | null;
	layout: ResolvedServiceLayout;
};

export function resolveServiceContent(
	locale: string,
	service: Service,
): ResolvedServiceContent | null {
	const content = resolveServiceContentForLanguage(locale, service);
	const title = content?.title?.trim();
	if (!title) {
		return null;
	}

	return {
		id: service.id,
		title,
		body: content?.description?.trim() ?? "",
		location: service.location?.trim() || null,
		serviceType: service.serviceType?.trim() || null,
		layout: resolveServiceLayout(service),
	};
}

export function resolveServiceContents(
	locale: string,
	services: Service[],
): ResolvedServiceContent[] {
	return services
		.map((service) => resolveServiceContent(locale, service))
		.filter((item): item is ResolvedServiceContent => item != null);
}

export function resolveServiceBody(
	locale: string,
	service: Service,
): string | null {
	const body = resolveServiceContent(locale, service)?.body;
	return body && body.length > 0 ? body : null;
}

function mapApiLayoutType(
	layoutType: ServiceLayoutType | null | undefined,
): ServiceLayout | null {
	switch (layoutType) {
		case "FEATURE_GRID":
			return "gallery";
		case "MEDIA_HERO":
			return "cinema";
		case "DEFAULT":
			return "editorial";
		default:
			return null;
	}
}

function findApiServiceForMock(
	mockId: string,
	apiServices: ResolvedServiceContent[],
	index: number,
): ResolvedServiceContent | null {
	return (
		apiServices.find((service) => service.layout.navAnchorId === mockId) ??
		apiServices.find((service) => service.serviceType === mockId) ??
		apiServices[index] ??
		null
	);
}

export function mergeServiceItem(
	mock: ServiceItem,
	api: ResolvedServiceContent | null,
): ServiceItem {
	if (!api) {
		return mock;
	}

	const layout = mapApiLayoutType(api.layout.layoutType) ?? mock.layout;
	const featureUrl = api.layout.featureImageUrls[0] ?? mock.featureImage.url;
	const thumbnailUrls = api.layout.thumbnailUrls;
	const thumbnails = mock.thumbnails.map((thumbnail, index) => ({
		url: thumbnailUrls[index] ?? thumbnail.url,
		alt: thumbnail.alt,
	})) as ServiceItem["thumbnails"];

	const video: ServiceVideo = {
		src: api.layout.heroVideoUrl ?? mock.video.src,
		poster: api.layout.heroPosterUrl ?? mock.video.poster,
		posterAlt: mock.video.posterAlt,
		variant: mock.video.variant,
	};

	const sectionId = api.layout.navAnchorId ?? mock.id;

	return {
		...mock,
		id: sectionId,
		slug: sectionId,
		layout,
		featureImage: {
			url: featureUrl,
			alt: mock.featureImage.alt,
		},
		video,
		thumbnails,
	};
}

export type MergedServiceSection = {
	mockId: string;
	service: ServiceItem;
	title: string | null;
	body: string | null;
	partnerIds: number[];
};

export function mergeServiceSections(
	locale: string,
	mockServices: ServiceItem[],
	apiRecords: Service[],
): MergedServiceSection[] {
	const apiServices = resolveServiceContents(locale, apiRecords);

	return mockServices.map((mock, index) => {
		const apiItem = findApiServiceForMock(mock.id, apiServices, index);
		return {
			mockId: mock.id,
			service: mergeServiceItem(mock, apiItem),
			title: apiItem?.title ?? null,
			body: apiItem?.body ?? null,
			partnerIds: apiItem?.layout.partnerIds ?? [],
		};
	});
}

export function resolveServicesHeroMedia(
	apiRecords: Service[],
	locale: string,
	fallback: ServiceMedia,
): ServiceMedia {
	const apiServices = resolveServiceContents(locale, apiRecords);
	const heroService = apiServices.find(
		(service) => service.layout.heroVideoUrl || service.layout.heroPosterUrl,
	);

	if (!heroService) {
		return fallback;
	}

	return {
		url: heroService.layout.heroPosterUrl ?? fallback.url,
		alt: fallback.alt,
	};
}
