import { describe, expect, it } from "vitest";
import { SiteSettingsSchema } from "@/types/site-settings";
import { FilmReklamVideoSchema } from "@/types/video";

// The exact payloads the backend documents, so a contract change breaks a test
// rather than silently blanking the logo or the film background.

describe("SiteSettingsSchema", () => {
	it("accepts the documented response", () => {
		const parsed = SiteSettingsSchema.safeParse({
			id: 1,
			logoUrl: "https://s3-khiwebsite.s3.amazonaws.com/branding/khi-logo.png",
			donateImageUrl: "https://s3-khiwebsite.s3.amazonaws.com/branding/a.jpg",
			maxFeaturedSlides: 7,
			updatedAt: "2026-08-18T10:04:11",
		});

		expect(parsed.success).toBe(true);
	});

	// The endpoint returns defaults rather than 404ing, and the API omits null
	// keys — so "nothing configured yet" must parse, not fail.
	it("accepts a response with every image absent", () => {
		const parsed = SiteSettingsSchema.safeParse({ maxFeaturedSlides: 7 });

		expect(parsed.success).toBe(true);
		expect(parsed.success && parsed.data.logoUrl).toBeUndefined();
	});

	it("accepts explicit nulls", () => {
		const parsed = SiteSettingsSchema.safeParse({
			id: 1,
			logoUrl: null,
			donateImageUrl: null,
			maxFeaturedSlides: 7,
			updatedAt: null,
		});

		expect(parsed.success).toBe(true);
	});

	it("accepts an empty object", () => {
		expect(SiteSettingsSchema.safeParse({}).success).toBe(true);
	});
});

describe("FilmReklamVideoSchema", () => {
	it("accepts the documented response", () => {
		const parsed = FilmReklamVideoSchema.safeParse({
			id: 1,
			videoUrl: "https://s3-khiwebsite.s3.amazonaws.com/video/film-bg.mp4",
			sizeBytes: 7199031,
			mimeType: "video/mp4",
			createdAt: "2026-08-18T10:00:00",
			updatedAt: "2026-08-18T10:00:00",
		});

		expect(parsed.success).toBe(true);
	});

	// A null in an unused metadata field must not fail the parse: `apiFetch`
	// turns a parse failure into null, which the section cannot tell apart from
	// the documented "nothing uploaded" 404.
	it("tolerates null metadata", () => {
		const parsed = FilmReklamVideoSchema.safeParse({
			videoUrl: "https://s3-khiwebsite.s3.amazonaws.com/video/film-bg.mp4",
			sizeBytes: null,
			mimeType: null,
		});

		expect(parsed.success).toBe(true);
	});

	it("rejects a payload with no video url", () => {
		expect(FilmReklamVideoSchema.safeParse({ id: 1 }).success).toBe(false);
	});
});
