import { describe, expect, it } from "vitest";
import { parseFeaturedItem } from "@/lib/api/featured";
import { contentDetailHref } from "@/lib/content/href";

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
