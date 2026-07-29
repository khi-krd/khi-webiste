import { describe, expect, it } from "vitest";
import type { NewsItem } from "@/lib/mock/news";
import { dedupeNewsItems, resolveNewsItems } from "@/lib/news/resolve";
import type { News } from "@/types/news";

function newsItem(id: string): NewsItem {
	return {
		id,
		slug: id,
		title: `Title ${id}`,
		excerpt: "Excerpt",
		category: "culture",
		publishedAt: "2026-01-01",
		image: { url: "/menu/1.jpg", alt: `Title ${id}` },
	};
}

function apiNews(id: number): News {
	return {
		id,
		coverUrl: "/menu/1.jpg",
		datePublished: "2026-01-01",
		contentLanguages: ["CKB"],
		ckbContent: { title: `Title ${id}`, description: "Body" },
	};
}

describe("dedupeNewsItems", () => {
	it("keeps one row per id when the API repeats the same news item", () => {
		const repeated = [newsItem("14"), newsItem("14"), newsItem("14")];

		expect(dedupeNewsItems(repeated)).toHaveLength(1);
		expect(dedupeNewsItems(repeated)[0]?.id).toBe("14");
	});

	it("keeps distinct items in original order", () => {
		const items = [
			newsItem("14"),
			newsItem("12"),
			newsItem("14"),
			newsItem("10"),
		];

		const deduped = dedupeNewsItems(items);
		expect(deduped.map((item) => item.id)).toEqual(["14", "12", "10"]);
	});
});

describe("resolveNewsItems", () => {
	it("deduplicates repeated API records by id", () => {
		const repeated = Array.from({ length: 5 }, () => apiNews(14));

		const items = resolveNewsItems("ckb", repeated);
		expect(items).toHaveLength(1);
		expect(items[0]?.id).toBe("14");
	});
});
