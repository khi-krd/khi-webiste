import { describe, expect, it } from "vitest";
import { buildServiceGallery } from "@/components/services/service-gallery-slides";
import type { ServiceItem } from "@/lib/mock/services";

function mockService(overrides: Partial<ServiceItem> = {}): ServiceItem {
	return {
		id: "test",
		slug: "test",
		layout: "cinema",
		featureImage: { url: "/feature.jpg" },
		video: {
			src: "/video.mp4",
			poster: "/poster.jpg",
		},
		thumbnails: [
			{ url: "/thumb-1.jpg" },
			{ url: "/thumb-2.jpg" },
			{ url: "/thumb-3.jpg" },
			{ url: "/thumb-4.jpg" },
		],
		...overrides,
	};
}

describe("buildServiceGallery", () => {
	it("preserves galleryMedia order with video at any position", () => {
		const { slides } = buildServiceGallery(
			mockService({
				galleryMedia: [
					{ kind: "image", media: { url: "/a.jpg" } },
					{ kind: "image", media: { url: "/b.jpg" } },
					{
						kind: "video",
						video: { src: "/c.mp4", poster: "/c-poster.jpg" },
					},
					{ kind: "image", media: { url: "/d.jpg" } },
				],
			}),
		);

		expect(slides.map((slide) => slide.type)).toEqual([
			"image",
			"image",
			"video",
			"image",
		]);
	});

	it("supports multiple videos in the ordered gallery", () => {
		const { slides } = buildServiceGallery(
			mockService({
				galleryMedia: [
					{
						kind: "video",
						video: { src: "/intro.mp4", poster: "/intro.jpg" },
					},
					{ kind: "image", media: { url: "/still.jpg" } },
					{
						kind: "video",
						video: { src: "/outro.mp4", poster: "/outro.jpg" },
					},
				],
			}),
		);

		expect(slides.map((slide) => slide.type)).toEqual([
			"video",
			"image",
			"video",
		]);
	});

	it("detects video urls in legacy thumbnail fields", () => {
		const { slides } = buildServiceGallery(
			mockService({
				galleryMedia: undefined,
				thumbnails: [
					{ url: "/thumb-1.jpg" },
					{ url: "/clip.mp4" },
					{ url: "/thumb-3.jpg" },
					{ url: "/thumb-4.jpg" },
				],
			}),
		);

		expect(slides[2]?.type).toBe("video");
	});

	it("skips empty urls while preserving order", () => {
		const { slides } = buildServiceGallery(
			mockService({
				galleryMedia: [
					{ kind: "image", media: { url: "/a.jpg" } },
					{ kind: "image", media: { url: "" } },
					{ kind: "image", media: { url: "/c.jpg" } },
				],
			}),
		);

		expect(slides).toHaveLength(2);
		expect(slides[0]?.type).toBe("image");
		expect(slides[1]?.type).toBe("image");
	});

	it("falls back to legacy thumbnails when galleryMedia slots are all invalid", () => {
		const { slides } = buildServiceGallery(
			mockService({
				galleryMedia: [{ kind: "image", media: { url: "" } }],
				thumbnails: [
					{ url: "/thumb-1.jpg" },
					{ url: "/thumb-2.jpg" },
					{ url: "/thumb-3.jpg" },
					{ url: "/thumb-4.jpg" },
				],
			}),
		);

		expect(slides.length).toBeGreaterThan(0);
		expect(slides.some((slide) => slide.type === "image")).toBe(true);
	});
});
