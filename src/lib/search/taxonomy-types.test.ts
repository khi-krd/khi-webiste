import { describe, expect, it } from "vitest";
import {
	filterTaxonomyItems,
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
		id: "projects-tag-oral",
		label: "Oral history",
		kind: "tag",
		sectionKey: "projects",
		href: "/projects?tag=Oral%20history",
		searchText: "Oral history",
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
		expect(filterTaxonomyItems(sampleItems, "poetry", "archive")).toHaveLength(0);
	});

	it("respects library scope", () => {
		expect(filterTaxonomyItems(sampleItems, "poetry", "library")).toHaveLength(1);
		expect(filterTaxonomyItems(sampleItems, "culture", "library")).toHaveLength(0);
	});
});
