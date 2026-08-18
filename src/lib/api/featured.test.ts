import { describe, expect, it } from "vitest";
import {
	featuredItemFromSourceRecord,
	interleaveFeaturedSources,
	parseFeaturedItem,
} from "@/lib/api/featured";
import { contentDetailHref } from "@/lib/content/href";
import type { FeaturedItem } from "@/types/content";

const sampleApiItem = {
	id: "news-42",
	source: "news",
	entityId: 42,
	type: "article",
	slug: "42",
	title: "News KMR",
	description: "<p>Localized description</p>",
	image: {
		url: "https://cdn.example.com/news.jpg",
		alt: "News KMR",
	},
	locale: "kmr",
	featured: true,
	featuredOrder: 1,
	displayOrder: 1,
	active: true,
} as const;

describe("parseFeaturedItem", () => {
	it("parses the documented featured API DTO", () => {
		const item = parseFeaturedItem(sampleApiItem);
		expect(item).toMatchObject({
			id: "news-42",
			type: "article",
			slug: "42",
			title: "News KMR",
			description: "Localized description",
			image: {
				url: "https://cdn.example.com/news.jpg",
				alt: "News KMR",
			},
		});
	});

	it("falls back to title when description strips to empty", () => {
		const item = parseFeaturedItem({
			...sampleApiItem,
			description: "<p></p>",
		});
		expect(item?.description).toBe("News KMR");
	});

	it("skips items without an image URL", () => {
		expect(
			parseFeaturedItem({
				...sampleApiItem,
				image: { url: "   ", alt: "News KMR" },
			}),
		).toBeNull();
	});

	it("falls back to the title when description is null", () => {
		const item = parseFeaturedItem({ ...sampleApiItem, description: null });
		expect(item?.description).toBe("News KMR");
	});

	it.each([
		["about", "about", "derbare-me", "/about"],
		["service", "service", "studio", "/services#studio"],
		["donation", "donation", "donation", "/donate"],
	])("links the %s slide to its page", (source, type, slug, expectedHref) => {
		const item = parseFeaturedItem({
			...sampleApiItem,
			id: `${source}-5`,
			source,
			entityId: 5,
			type,
			slug,
		});

		expect(item?.type).toBe(type);
		expect(item && contentDetailHref(item)).toBe(expectedHref);
	});

	it("links a service without a nav anchor to its id section", () => {
		const item = parseFeaturedItem({
			...sampleApiItem,
			id: "service-7",
			source: "service",
			entityId: 7,
			type: "service",
			slug: "7",
		});

		expect(item && contentDetailHref(item)).toBe("/services#7");
	});
});

const NEWS_ENDPOINT = {
	source: "news",
	path: "/api/v1/news/featured",
	type: "article",
} as const;

const GALLERY_ENDPOINT = {
	source: "image-collection",
	path: "/api/v1/image-collections/featured",
	type: "gallery",
	slugFromRecord: true,
} as const;

describe("featuredItemFromSourceRecord", () => {
	it("maps a source DTO to a slide keyed by its id", () => {
		const item = featuredItemFromSourceRecord("ckb", NEWS_ENDPOINT, {
			id: 19,
			coverUrl: "https://cdn.example.com/cover.jpg",
			featureImageUrl: "https://cdn.example.com/hero.jpg",
			ckbContent: { title: "سەردان", description: "<p>وردەکاری</p>" },
			kmrContent: { title: "Serdan", description: "<p>Kitekit</p>" },
		});

		expect(item).toMatchObject({
			id: "news-19",
			type: "article",
			slug: "19",
			title: "سەردان",
			description: "وردەکاری",
			// featureImageUrl is the wide crop — it must win over the cover.
			image: { url: "https://cdn.example.com/hero.jpg", alt: "سەردان" },
		});
		expect(item && contentDetailHref(item)).toBe("/news/19");
	});

	it("prefers the KMR content and cover outside ckb", () => {
		const item = featuredItemFromSourceRecord("ku", NEWS_ENDPOINT, {
			id: 7,
			ckbCoverUrl: "https://cdn.example.com/ckb.jpg",
			kmrCoverUrl: "https://cdn.example.com/kmr.jpg",
			ckbContent: { title: "ناونیشان" },
			kmrContent: { title: "Sernav" },
		});

		expect(item).toMatchObject({
			title: "Sernav",
			description: "Sernav",
			image: { url: "https://cdn.example.com/kmr.jpg" },
		});
	});

	it("uses the localized slug for gallery slides", () => {
		const item = featuredItemFromSourceRecord("ckb", GALLERY_ENDPOINT, {
			id: 4,
			slugCkb: "wene-kurdi",
			slugKmr: "wene-kurdi-kmr",
			ckbCoverUrl: "https://cdn.example.com/gallery.jpg",
			ckbContent: { title: "وێنە" },
		});

		expect(item?.slug).toBe("wene-kurdi");
		expect(item && contentDetailHref(item)).toBe("/gallery/wene-kurdi");
	});

	it("drops records with no usable image or title", () => {
		const base = { id: 3, ckbContent: { title: "ناونیشان" } };

		expect(featuredItemFromSourceRecord("ckb", NEWS_ENDPOINT, base)).toBeNull();
		expect(
			featuredItemFromSourceRecord("ckb", NEWS_ENDPOINT, {
				id: 3,
				coverUrl: "https://cdn.example.com/cover.jpg",
			}),
		).toBeNull();
	});
});

describe("interleaveFeaturedSources", () => {
	const slide = (id: string): FeaturedItem => ({
		id,
		type: "article",
		slug: id,
		title: id,
		description: id,
		image: { url: `https://cdn.example.com/${id}.jpg`, alt: id },
	});

	it("takes one slide per source in turn", () => {
		const merged = interleaveFeaturedSources([
			[slide("a1"), slide("a2")],
			[],
			[slide("c1")],
		]);

		expect(merged.map((item) => item.id)).toEqual(["a1", "c1", "a2"]);
	});

	it("stops at the cap", () => {
		const merged = interleaveFeaturedSources(
			[[slide("a1"), slide("a2")], [slide("b1")]],
			2,
		);

		expect(merged.map((item) => item.id)).toEqual(["a1", "b1"]);
	});

	it("returns nothing when every source is empty", () => {
		expect(interleaveFeaturedSources([[], []])).toEqual([]);
	});
});
