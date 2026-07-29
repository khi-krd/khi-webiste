import { describe, expect, it } from "vitest";
import {
	filterTaxonomyItems,
	getNavMenuTaxonomyItems,
	getSectionKeyForNavKey,
	limitNavMenuLinks,
	NAV_MENU_MAX_ITEMS,
	type SearchTaxonomyItem,
} from "@/lib/search/taxonomy-types";

const sampleItems: SearchTaxonomyItem[] = [
	{
		id: "news-category-culture",
		label: "Culture",
		kind: "category",
		sectionKey: "news",
		href: "/news?category=culture",
		searchText: "Culture culture",
	},
	{
		id: "news-tag-kurdistan",
		label: "Kurdistan",
		kind: "tag",
		sectionKey: "news",
		href: "/news?q=Kurdistan",
		searchText: "Kurdistan",
	},
	{
		id: "projects-tag-oral",
		label: "Oral history",
		kind: "tag",
		sectionKey: "projects",
		href: "/projects?tag=Oral%20history",
		searchText: "Oral history",
	},
	{
		id: "videos-topic-2",
		label: "Documentaries",
		kind: "topic",
		sectionKey: "videos",
		href: "/videos?topic=2",
		searchText: "Documentaries",
	},
	{
		id: "videos-type-FILM",
		label: "Film",
		kind: "type",
		sectionKey: "videos",
		href: "/videos?type=FILM",
		searchText: "Film FILM",
	},
	{
		id: "writings-category-literature",
		label: "Literature",
		kind: "category",
		sectionKey: "writings",
		href: "/writings/literature",
		searchText: "Literature literature",
	},
	{
		id: "writings-genre-POETRY",
		label: "Poetry",
		kind: "genre",
		sectionKey: "writings",
		href: "/writings?genre=POETRY",
		searchText: "Poetry POETRY",
	},
];

describe("filterTaxonomyItems", () => {
	it("matches labels case-insensitively", () => {
		expect(filterTaxonomyItems(sampleItems, "culture", "main")).toHaveLength(1);
		expect(filterTaxonomyItems(sampleItems, "ORAL", "main")).toHaveLength(1);
	});

	it("respects archive scope", () => {
		expect(filterTaxonomyItems(sampleItems, "oral", "archive")).toHaveLength(1);
		expect(filterTaxonomyItems(sampleItems, "poetry", "archive")).toHaveLength(
			0,
		);
	});

	it("respects library scope", () => {
		expect(filterTaxonomyItems(sampleItems, "poetry", "library")).toHaveLength(
			1,
		);
		expect(filterTaxonomyItems(sampleItems, "culture", "library")).toHaveLength(
			0,
		);
	});
});

describe("getSectionKeyForNavKey", () => {
	it("maps collection nav keys to search sections", () => {
		expect(getSectionKeyForNavKey("news")).toBe("news");
		expect(getSectionKeyForNavKey("video")).toBe("videos");
		expect(getSectionKeyForNavKey("sound")).toBe("soundTracks");
		expect(getSectionKeyForNavKey("gallery")).toBe("imageCollections");
	});

	it("returns null for non-taxonomy sections", () => {
		expect(getSectionKeyForNavKey("services")).toBeNull();
		expect(getSectionKeyForNavKey("about")).toBeNull();
	});
});

describe("getNavMenuTaxonomyItems", () => {
	it("returns categories for news, excluding tags", () => {
		const items = getNavMenuTaxonomyItems("news", sampleItems);
		expect(items.map((item) => item.id)).toEqual(["news-category-culture"]);
	});

	it("returns topics and types for video", () => {
		const items = getNavMenuTaxonomyItems("video", sampleItems);
		expect(items.map((item) => item.id)).toEqual([
			"videos-topic-2",
			"videos-type-FILM",
		]);
	});

	it("returns categories for writings, excluding genres", () => {
		const items = getNavMenuTaxonomyItems("writings", sampleItems);
		expect(items.map((item) => item.id)).toEqual([
			"writings-category-literature",
		]);
	});

	it("returns empty for services", () => {
		expect(getNavMenuTaxonomyItems("services", sampleItems)).toEqual([]);
	});

	it("dedupes by label and href, keeping the first match", () => {
		const catalog: SearchTaxonomyItem[] = [
			{
				id: "videos-topic-film",
				label: "Film",
				kind: "topic",
				sectionKey: "videos",
				href: "/videos?topic=1",
				searchText: "Film",
			},
			{
				id: "videos-type-FILM",
				label: "Film",
				kind: "type",
				sectionKey: "videos",
				href: "/videos?type=FILM",
				searchText: "Film FILM",
			},
			{
				id: "videos-topic-docs",
				label: "Documentaries",
				kind: "topic",
				sectionKey: "videos",
				href: "/videos?topic=2",
				searchText: "Documentaries",
			},
			{
				id: "videos-topic-docs-dup",
				label: "Other label",
				kind: "topic",
				sectionKey: "videos",
				href: "/videos?topic=2",
				searchText: "Other label",
			},
		];

		expect(
			getNavMenuTaxonomyItems("video", catalog).map((item) => item.id),
		).toEqual(["videos-topic-film", "videos-topic-docs"]);
	});

	it("caps results at NAV_MENU_MAX_ITEMS", () => {
		const catalog: SearchTaxonomyItem[] = Array.from(
			{ length: NAV_MENU_MAX_ITEMS + 5 },
			(_, index) => ({
				id: `projects-tag-${index}`,
				label: `Tag ${index}`,
				kind: "tag" as const,
				sectionKey: "projects" as const,
				href: `/projects?tag=${index}`,
				searchText: `Tag ${index}`,
			}),
		);

		const items = getNavMenuTaxonomyItems("projects", catalog);
		expect(items).toHaveLength(NAV_MENU_MAX_ITEMS);
		expect(items[0]?.id).toBe("projects-tag-0");
		expect(items.at(-1)?.id).toBe(`projects-tag-${NAV_MENU_MAX_ITEMS - 1}`);
	});
});

describe("limitNavMenuLinks", () => {
	it("dedupes case-insensitive labels and hrefs then caps", () => {
		const links = [
			{ id: "a", label: "Culture", href: "/news?category=culture" },
			{ id: "b", label: "culture", href: "/news?category=other" },
			{ id: "c", label: "Politics", href: "/news?category=culture" },
			{ id: "d", label: "Arts", href: "/news?category=arts" },
		];

		expect(limitNavMenuLinks(links, 2)).toEqual([
			{ id: "a", label: "Culture", href: "/news?category=culture" },
			{ id: "d", label: "Arts", href: "/news?category=arts" },
		]);
	});
});
