import { describe, expect, it } from "vitest";
import { parseFeaturedItem } from "@/lib/api/featured";

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
});
