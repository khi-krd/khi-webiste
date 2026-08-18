import { mapApiGalleryMedia } from "@/components/services/service-gallery-slides";
import type {
	ServiceGalleryMediaItem,
	ServiceItem,
	ServiceLayout,
	ServiceMedia,
	ServiceVideo,
} from "@/lib/mock/services";
import type {
	Service,
	ServiceContent,
	ServiceLayoutType,
} from "@/types/service";

export function isLikelyMediaUrl(url: string | undefined | null): boolean {
	const trimmed = url?.trim();
	if (!trimmed) return false;
	return (
		trimmed.startsWith("http://") ||
		trimmed.startsWith("https://") ||
		trimmed.startsWith("/")
	);
}

function pickMediaUrl(apiUrl: string | undefined, fallback?: string): string {
	// Trim up front so the checks and the return value operate on the same
	// values — this also avoids non-null assertions, since `isLikelyMediaUrl`
	// returning false does NOT imply the input was absent.
	const trimmedApiUrl = apiUrl?.trim() ?? "";
	const trimmedFallback = fallback?.trim() ?? "";

	if (isLikelyMediaUrl(trimmedApiUrl)) return trimmedApiUrl;
	if (isLikelyMediaUrl(trimmedFallback)) return trimmedFallback;
	return trimmedApiUrl || trimmedFallback;
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
	/** Short plain-text line written for the highlight card. */
	featureDescription: string | null;
	location: string | null;
	serviceType: string | null;
	featured: boolean;
	featuredOrder: number | null;
	featureImageUrl: string | null;
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
		featureDescription: content?.featureDescription?.trim() || null,
		location: service.location?.trim() || null,
		serviceType: service.serviceType?.trim() || null,
		featured: service.featured === true,
		featuredOrder: service.featuredOrder ?? null,
		featureImageUrl: service.featureImageUrl?.trim() || null,
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

export type MergedServiceSection = {
	/** `navAnchorId` when the CMS set one, else the record id — the `#anchor`. */
	anchorId: string;
	service: ServiceItem;
	title: string | null;
	body: string | null;
	partnerIds: number[];
};

function synthesizeGalleryFromLegacy(
	api: ResolvedServiceContent,
): ServiceGalleryMediaItem[] {
	const out: ServiceGalleryMediaItem[] = [];
	const seen = new Set<string>();

	const pushUrl = (
		url: string,
		type: "IMAGE" | "VIDEO",
		posterUrl?: string,
	) => {
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
		pushUrl(
			url,
			/\.(mp4|webm|mov|m4v|ogg)(\?|#|$)/i.test(url) ? "VIDEO" : "IMAGE",
		);
	}
	for (const url of api.layout.thumbnailUrls) {
		pushUrl(
			url,
			/\.(mp4|webm|mov|m4v|ogg)(\?|#|$)/i.test(url) ? "VIDEO" : "IMAGE",
		);
	}

	return out;
}

function serviceItemFromApi(api: ResolvedServiceContent): ServiceItem {
	const sectionId = api.layout.navAnchorId ?? String(api.id);
	const layout = mapApiLayoutType(api.layout.layoutType) ?? "editorial";
	const thumbUrls = api.layout.thumbnailUrls;
	let galleryMedia =
		api.layout.galleryMedia && api.layout.galleryMedia.length > 0
			? mapApiGalleryMedia(api.layout.galleryMedia, api.title)
			: undefined;

	if (!galleryMedia?.length) {
		const legacy = synthesizeGalleryFromLegacy(api);
		galleryMedia = legacy.length > 0 ? legacy : undefined;
	}

	// Media the CMS has not supplied stays blank — the section then renders as
	// text only. Nothing is borrowed from the mock catalogue.
	const featureImage: ServiceMedia = {
		url: pickMediaUrl(api.layout.featureImageUrls[0]),
		alt: api.title,
	};

	const video: ServiceVideo = {
		src: pickMediaUrl(api.layout.heroVideoUrl ?? undefined),
		poster: pickMediaUrl(api.layout.heroPosterUrl ?? undefined),
		posterAlt: api.title,
	};

	const thumbnails = [0, 1, 2, 3].map((index) => ({
		url: pickMediaUrl(thumbUrls[index]),
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

/** Build service sections straight from the CMS records. */
export function buildApiOnlyServiceSections(
	locale: string,
	apiRecords: Service[],
): MergedServiceSection[] {
	return apiRecords
		.map((record): MergedServiceSection | null => {
			const api = resolveServiceContent(locale, record);
			if (!api) {
				return null;
			}

			return {
				anchorId: api.layout.navAnchorId ?? String(api.id),
				service: serviceItemFromApi(api),
				title: api.title,
				body: api.body,
				partnerIds: api.layout.partnerIds,
			};
		})
		.filter((item): item is MergedServiceSection => item != null);
}

/** One card in the services-page highlight band. */
export type ServiceHighlight = {
	/** The `#anchor` of this service's own section further down the page. */
	anchorId: string;
	title: string;
	description: string | null;
	image: ServiceMedia | null;
};

function firstGalleryImageUrl(
	galleryMedia: Service["galleryMedia"],
): string | null {
	if (!galleryMedia?.length) {
		return null;
	}

	for (const item of galleryMedia) {
		const url = item.type === "IMAGE" ? item.url?.trim() : null;
		if (url) {
			return url;
		}
	}

	for (const item of galleryMedia) {
		const poster = item.type === "VIDEO" ? item.posterUrl?.trim() : null;
		if (poster) {
			return poster;
		}
	}

	return null;
}

/**
 * Featured services, ordered the way the CMS orders them: `featuredOrder`
 * ascending with nulls last, ties broken by newest id first.
 *
 * These are a highlight on the services page itself — they are deliberately not
 * homepage hero slides, so nothing here is capped by `maxFeaturedSlides`.
 */
export function buildServiceHighlights(
	locale: string,
	apiRecords: Service[],
): ServiceHighlight[] {
	return apiRecords
		.filter((record) => record.featured === true)
		.sort((a, b) => {
			const ao = a.featuredOrder ?? Number.POSITIVE_INFINITY;
			const bo = b.featuredOrder ?? Number.POSITIVE_INFINITY;
			return ao !== bo ? ao - bo : b.id - a.id;
		})
		.map((record): ServiceHighlight | null => {
			const resolved = resolveServiceContent(locale, record);
			if (!resolved) {
				return null;
			}

			const imageUrl =
				resolved.featureImageUrl ?? firstGalleryImageUrl(record.galleryMedia);

			return {
				anchorId: resolved.layout.navAnchorId ?? String(resolved.id),
				title: resolved.title,
				description: resolved.featureDescription,
				image: imageUrl ? { url: imageUrl, alt: resolved.title } : null,
			};
		})
		.filter((item): item is ServiceHighlight => item != null);
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
