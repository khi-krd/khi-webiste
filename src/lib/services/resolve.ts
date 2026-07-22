import type {
	ServiceGalleryMediaItem,
	ServiceItem,
	ServiceLayout,
	ServiceMedia,
	ServiceVideo,
} from "@/lib/mock/services";
import { getServices as getMockServices } from "@/lib/mock/services";
import { mapApiGalleryMedia } from "@/components/services/service-gallery-slides";
import type { Service, ServiceContent, ServiceLayoutType } from "@/types/service";

function isLikelyMediaUrl(url: string | undefined | null): boolean {
	const trimmed = url?.trim();
	if (!trimmed) return false;
	return (
		trimmed.startsWith("http://") ||
		trimmed.startsWith("https://") ||
		trimmed.startsWith("/")
	);
}

function pickMediaUrl(
	apiUrl: string | undefined,
	fallback?: string,
): string {
	if (isLikelyMediaUrl(apiUrl)) return apiUrl!.trim();
	if (isLikelyMediaUrl(fallback)) return fallback!.trim();
	return apiUrl?.trim() ?? fallback?.trim() ?? "";
}

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
	galleryMedia: Service["galleryMedia"];
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
		galleryMedia: service.galleryMedia ?? [],
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
	const galleryMedia =
		api.layout.galleryMedia && api.layout.galleryMedia.length > 0
			? mapApiGalleryMedia(
					api.layout.galleryMedia,
					mock.featureImage.alt ?? mock.id,
					mock.video.variant,
				)
			: mock.galleryMedia;

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
		galleryMedia,
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

function synthesizeGalleryFromLegacy(
	api: ResolvedServiceContent,
): ServiceGalleryMediaItem[] {
	const out: ServiceGalleryMediaItem[] = [];
	const seen = new Set<string>();

	const pushUrl = (url: string, type: "IMAGE" | "VIDEO", posterUrl?: string) => {
		const trimmed = url.trim();
		if (!trimmed || !isLikelyMediaUrl(trimmed) || seen.has(trimmed)) return;
		seen.add(trimmed);
		if (type === "VIDEO") {
			out.push({
				kind: "video",
				video: {
					src: trimmed,
					poster: posterUrl?.trim() || undefined,
					posterAlt: api.title,
					variant: "minimal",
				},
			});
		} else {
			out.push({
				kind: "image",
				media: { url: trimmed, alt: api.title },
			});
		}
	};

	const heroVideo = api.layout.heroVideoUrl?.trim();
	const heroPoster = api.layout.heroPosterUrl?.trim();
	if (heroVideo) {
		pushUrl(heroVideo, "VIDEO", heroPoster);
	} else if (heroPoster) {
		pushUrl(heroPoster, "IMAGE");
	}

	for (const url of api.layout.featureImageUrls) {
		pushUrl(url, /\.(mp4|webm|mov|m4v|ogg)(\?|#|$)/i.test(url) ? "VIDEO" : "IMAGE");
	}
	for (const url of api.layout.thumbnailUrls) {
		pushUrl(url, /\.(mp4|webm|mov|m4v|ogg)(\?|#|$)/i.test(url) ? "VIDEO" : "IMAGE");
	}

	return out;
}

function findMockServiceFallback(
	mockServices: ServiceItem[],
	record: Service,
	index: number,
): ServiceItem | null {
	const anchor = record.navAnchorId?.trim();
	const type = record.serviceType?.trim();

	return (
		(anchor ? mockServices.find((mock) => mock.id === anchor) : null) ??
		(type ? mockServices.find((mock) => mock.id === type) : null) ??
		mockServices[index] ??
		null
	);
}

function serviceItemFromApi(
	api: ResolvedServiceContent,
	mockFallback?: ServiceItem | null,
): ServiceItem {
	const sectionId = api.layout.navAnchorId ?? String(api.id);
	const layout =
		mapApiLayoutType(api.layout.layoutType) ?? mockFallback?.layout ?? "editorial";
	const thumbUrls = api.layout.thumbnailUrls;
	let galleryMedia =
		api.layout.galleryMedia && api.layout.galleryMedia.length > 0
			? mapApiGalleryMedia(api.layout.galleryMedia, api.title)
			: undefined;

	if (!galleryMedia?.length) {
		const legacy = synthesizeGalleryFromLegacy(api);
		galleryMedia = legacy.length > 0 ? legacy : undefined;
	}

	if (!galleryMedia?.length && mockFallback?.galleryMedia?.length) {
		galleryMedia = mockFallback.galleryMedia;
	}

	const featureImage: ServiceMedia = {
		url: pickMediaUrl(
			api.layout.featureImageUrls[0],
			mockFallback?.featureImage.url,
		),
		alt: api.title,
	};

	const video: ServiceVideo = {
		src: pickMediaUrl(api.layout.heroVideoUrl ?? undefined, mockFallback?.video.src),
		poster: pickMediaUrl(
			api.layout.heroPosterUrl ?? undefined,
			mockFallback?.video.poster,
		),
		posterAlt: api.title,
		variant: mockFallback?.video.variant,
	};

	const thumbnails = [0, 1, 2, 3].map((index) => ({
		url: pickMediaUrl(thumbUrls[index], mockFallback?.thumbnails[index]?.url),
		alt: api.title,
	})) as ServiceItem["thumbnails"];

	return {
		id: sectionId,
		slug: sectionId,
		layout,
		featureImage,
		video,
		thumbnails,
		galleryMedia,
	};
}

/** Build service sections from API records without mock layout shells. */
export function buildApiOnlyServiceSections(
	locale: string,
	apiRecords: Service[],
	options?: { useMockMediaFallback?: boolean },
): MergedServiceSection[] {
	const mockServices = options?.useMockMediaFallback
		? getMockServices(locale)
		: [];

	return apiRecords
		.map((record, index): MergedServiceSection | null => {
			const api = resolveServiceContent(locale, record);
			if (!api) {
				return null;
			}

			const mockFallback = options?.useMockMediaFallback
				? findMockServiceFallback(mockServices, record, index)
				: null;

			return {
				mockId: api.layout.navAnchorId ?? String(api.id),
				service: serviceItemFromApi(api, mockFallback),
				title: api.title,
				body: api.body,
				partnerIds: api.layout.partnerIds,
			};
		})
		.filter((item): item is MergedServiceSection => item != null);
}

function firstGalleryVideoPoster(
	galleryMedia: Service["galleryMedia"],
): string | null {
	if (!galleryMedia?.length) {
		return null;
	}

	for (const item of galleryMedia) {
		if (item.type !== "VIDEO") {
			continue;
		}

		const poster = item.posterUrl?.trim();
		if (poster) {
			return poster;
		}
	}

	return null;
}

export function resolveServicesHeroMedia(
	apiRecords: Service[],
	locale: string,
	fallback: ServiceMedia,
): ServiceMedia {
	const apiServices = resolveServiceContents(locale, apiRecords);

	for (const service of apiServices) {
		const poster = service.layout.heroPosterUrl?.trim();
		if (poster) {
			return {
				url: poster,
				alt: service.title,
			};
		}
	}

	for (const record of apiRecords) {
		const poster = firstGalleryVideoPoster(record.galleryMedia);
		if (poster) {
			const resolved = resolveServiceContent(locale, record);
			return {
				url: poster,
				alt: resolved?.title ?? fallback.alt,
			};
		}
	}

	return fallback;
}
