import { describe, expect, it } from "vitest";
import { normalizeServiceRecord } from "@/lib/api/normalize";
import {
	buildApiOnlyServiceSections,
	buildServiceHighlights,
	resolveServiceContent,
	resolveServiceContents,
	resolveServicesHeroMedia,
} from "@/lib/services/resolve";
import type { Service } from "@/types/service";
import { ServiceSchema } from "@/types/service";

function baseService(overrides: Partial<Service> = {}): Service {
	return {
		id: 1,
		active: true,
		contents: [
			{
				id: 1,
				languageCode: "CKB",
				title: "ستۆدیۆ",
				description: "ناوەرۆک",
			},
			{
				id: 2,
				languageCode: "KMR",
				title: "Stûdyo",
				description: "Naverok",
			},
		],
		...overrides,
	};
}

describe("normalizeServiceRecord", () => {
	it("coerces null arrays and snake_case aliases", () => {
		const normalized = normalizeServiceRecord({
			id: 5,
			active: true,
			gallery_media: null,
			feature_image_urls: null,
			thumbnail_urls: null,
			partner_ids: null,
			contents: null,
			sort_order: 3,
			nav_anchor_id: "studio",
			hero_poster_url: "https://cdn.example.com/poster.jpg",
		});

		const parsed = ServiceSchema.parse(normalized);
		expect(parsed.sortOrder).toBe(3);
		expect(parsed.navAnchorId).toBe("studio");
		expect(parsed.heroPosterUrl).toBe("https://cdn.example.com/poster.jpg");
		expect(parsed.galleryMedia).toEqual([]);
		expect(parsed.contents).toEqual([]);
		expect(parsed.partnerIds).toEqual([]);
	});

	it("drops gallery slots without urls", () => {
		const normalized = normalizeServiceRecord({
			id: 1,
			active: true,
			contents: [{ id: 1, languageCode: "CKB", title: "Test" }],
			galleryMedia: [
				{ type: "IMAGE", url: "https://cdn.example.com/a.jpg" },
				{ type: "VIDEO", url: "  " },
			],
		});

		const parsed = ServiceSchema.parse(normalized);
		expect(parsed.galleryMedia).toHaveLength(1);
	});

	it("reads gallery_media snake_case and poster_url aliases", () => {
		const normalized = normalizeServiceRecord({
			id: 1,
			active: true,
			contents: [{ id: 1, languageCode: "CKB", title: "Test" }],
			gallery_media: [
				{
					type: "VIDEO",
					url: "https://cdn.example.com/clip.mp4",
					poster_url: "https://cdn.example.com/poster.jpg",
				},
			],
		});

		const parsed = ServiceSchema.parse(normalized);
		expect(parsed.galleryMedia).toEqual([
			{
				type: "VIDEO",
				url: "https://cdn.example.com/clip.mp4",
				posterUrl: "https://cdn.example.com/poster.jpg",
				alt: null,
			},
		]);
	});
});

describe("resolveServiceContents", () => {
	it("prefers locale language and skips records without titles", () => {
		const records = [
			baseService(),
			baseService({
				id: 2,
				contents: [{ id: 3, languageCode: "CKB", title: "   " }],
			}),
		];

		const ckb = resolveServiceContents("ckb", records);
		expect(ckb).toHaveLength(1);
		expect(ckb[0]?.title).toBe("ستۆدیۆ");

		const kmr = resolveServiceContents("ku", records);
		expect(kmr[0]?.title).toBe("Stûdyo");
	});

	it("builds dynamic api-only sections in response order", () => {
		const records = [
			baseService({ id: 10, navAnchorId: "alpha", sortOrder: 1 }),
			baseService({
				id: 11,
				navAnchorId: "beta",
				sortOrder: 2,
				contents: [{ id: 4, languageCode: "CKB", title: "دووەم" }],
			}),
		];

		const sections = buildApiOnlyServiceSections("ckb", records);
		expect(sections).toHaveLength(2);
		expect(sections[0]?.service.id).toBe("alpha");
		expect(sections[1]?.service.id).toBe("beta");
		expect(sections[0]?.title).toBe("ستۆدیۆ");
	});

	it("leaves media empty when the CMS has none — never borrows mock art", () => {
		const sections = buildApiOnlyServiceSections("ckb", [
			baseService({
				id: 6,
				serviceType: "services",
				layoutType: "MEDIA_HERO",
				galleryMedia: [],
				featureImageUrls: [],
				thumbnailUrls: [],
			}),
		]);

		expect(sections).toHaveLength(1);
		expect(sections[0]?.title).toBe("ستۆدیۆ");
		expect(sections[0]?.service.galleryMedia).toBeUndefined();
		expect(sections[0]?.service.featureImage.url).toBe("");
		expect(sections[0]?.service.video.src).toBe("");
		expect(
			sections[0]?.service.thumbnails.every((thumb) => thumb.url === ""),
		).toBe(true);
	});

	it("keeps the CMS gallery when one exists", () => {
		const sections = buildApiOnlyServiceSections("ckb", [
			baseService({
				id: 7,
				galleryMedia: [
					{ type: "IMAGE", url: "https://cdn.example.com/a.jpg", alt: null },
				],
			}),
		]);

		expect(sections[0]?.service.galleryMedia).toEqual([
			{
				kind: "image",
				media: { url: "https://cdn.example.com/a.jpg", alt: "ستۆدیۆ" },
			},
		]);
	});
});

describe("resolveServicesHeroMedia", () => {
	it("uses heroPosterUrl when present", () => {
		const media = resolveServicesHeroMedia(
			[
				baseService({
					heroPosterUrl: "https://cdn.example.com/hero.jpg",
				}),
			],
			"ckb",
			{ url: "", alt: "fallback" },
		);

		expect(media.url).toBe("https://cdn.example.com/hero.jpg");
		expect(media.alt).toBe("ستۆدیۆ");
	});

	it("falls back to galleryMedia video poster", () => {
		const media = resolveServicesHeroMedia(
			[
				baseService({
					heroPosterUrl: null,
					galleryMedia: [
						{
							type: "VIDEO",
							url: "https://cdn.example.com/tour.mp4",
							posterUrl: "https://cdn.example.com/tour.jpg",
						},
					],
				}),
			],
			"ckb",
			{ url: "", alt: "fallback" },
		);

		expect(media.url).toBe("https://cdn.example.com/tour.jpg");
		expect(media.alt).toBe("ستۆدیۆ");
	});
});

describe("resolveServiceContent", () => {
	it("returns null when no resolvable title exists", () => {
		expect(
			resolveServiceContent(
				"ckb",
				baseService({
					contents: [{ id: 1, languageCode: "KMR", description: "Only body" }],
				}),
			),
		).toBeNull();
	});
});

describe("buildServiceHighlights", () => {
	it("returns only featured services, ordered by featuredOrder then newest id", () => {
		const highlights = buildServiceHighlights("ckb", [
			baseService({ id: 10, navAnchorId: "alpha", featured: true }),
			baseService({ id: 11, navAnchorId: "beta" }),
			baseService({
				id: 12,
				navAnchorId: "gamma",
				featured: true,
				featuredOrder: 1,
			}),
			baseService({ id: 13, navAnchorId: "delta", featured: true }),
		]);

		// order 1 first; the two null orders fall to the end, newest id first.
		expect(highlights.map((item) => item.anchorId)).toEqual([
			"gamma",
			"delta",
			"alpha",
		]);
	});

	it("prefers featureImageUrl, then a gallery image, then a video poster", () => {
		const [withOverride, withGallery, withPoster, withNothing] =
			buildServiceHighlights("ckb", [
				baseService({
					id: 20,
					navAnchorId: "a",
					featured: true,
					featuredOrder: 1,
					featureImageUrl: "https://cdn.example.com/hero.jpg",
					galleryMedia: [
						{ type: "IMAGE", url: "https://cdn.example.com/gallery.jpg" },
					],
				}),
				baseService({
					id: 21,
					navAnchorId: "b",
					featured: true,
					featuredOrder: 2,
					galleryMedia: [
						{ type: "IMAGE", url: "https://cdn.example.com/gallery.jpg" },
					],
				}),
				baseService({
					id: 22,
					navAnchorId: "c",
					featured: true,
					featuredOrder: 3,
					galleryMedia: [
						{
							type: "VIDEO",
							url: "https://cdn.example.com/clip.mp4",
							posterUrl: "https://cdn.example.com/poster.jpg",
						},
					],
				}),
				baseService({
					id: 23,
					navAnchorId: "d",
					featured: true,
					featuredOrder: 4,
				}),
			]);

		expect(withOverride?.image?.url).toBe("https://cdn.example.com/hero.jpg");
		expect(withGallery?.image?.url).toBe("https://cdn.example.com/gallery.jpg");
		expect(withPoster?.image?.url).toBe("https://cdn.example.com/poster.jpg");
		// No CMS picture — the card renders as copy only rather than a broken frame.
		expect(withNothing?.image).toBeNull();
	});

	it("carries featureDescription as the card copy and falls back to the id anchor", () => {
		const [highlight] = buildServiceHighlights("ckb", [
			baseService({
				id: 30,
				featured: true,
				contents: [
					{
						id: 9,
						languageCode: "CKB",
						title: "ستۆدیۆ",
						description: "<p>دەقی درێژ</p>",
						featureDescription: "دێڕێکی کورت.",
					},
				],
			}),
		]);

		expect(highlight?.description).toBe("دێڕێکی کورت.");
		expect(highlight?.anchorId).toBe("30");
	});

	it("is empty when nothing is featured", () => {
		expect(buildServiceHighlights("ckb", [baseService()])).toEqual([]);
	});
});
