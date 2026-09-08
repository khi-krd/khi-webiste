import { describe, expect, it } from "vitest";
import {
	buildSearchHref,
	parseSearchPageState,
	searchMode,
	withToggledSource,
} from "./search-url";

describe("parseSearchPageState sources", () => {
	it("defaults to every source when nothing narrows the search", () => {
		const state = parseSearchPageState({ q: "mamle" });
		expect(state.sources).toEqual(["archive", "main", "library"]);
		expect(searchMode(state)).toBe("mixed");
	});

	it("reads a comma-joined selection in display order", () => {
		const state = parseSearchPageState({ source: "library,archive" });
		expect(state.sources).toEqual(["archive", "library"]);
	});

	it("reads a repeated param and drops unknown values", () => {
		const state = parseSearchPageState({ source: ["main", "nope"] });
		expect(state.sources).toEqual(["main"]);
		expect(searchMode(state)).toBe("site");
	});

	it("keeps links minted before sources were selectable on the platform", () => {
		// The platform was the implicit default then, so `source` was omitted;
		// a kind, sort, page or refinement only ever belonged to that view.
		for (const params of [
			{ q: "x", type: "audio" },
			{ q: "x", sort: "newest" },
			{ q: "x", page: "2" },
			{ personCode: "GHULAMALIROMI" },
			{ tag: ["mamle"] },
		]) {
			const state = parseSearchPageState(params);
			expect(state.sources, JSON.stringify(params)).toEqual(["archive"]);
			expect(searchMode(state)).toBe("platform");
		}
	});

	it("does not treat an explicit selection as a legacy link", () => {
		const state = parseSearchPageState({ source: "main", type: "audio" });
		expect(state.sources).toEqual(["main"]);
	});
});

describe("buildSearchHref sources", () => {
	it("omits the param when every source is checked", () => {
		expect(
			buildSearchHref({ q: "a", sources: ["archive", "main", "library"] }),
		).toBe("/search?q=a");
	});

	it("joins a partial selection in display order", () => {
		expect(buildSearchHref({ sources: ["library", "archive"] })).toBe(
			"/search?source=archive%2Clibrary",
		);
	});
});

describe("withToggledSource", () => {
	const base = parseSearchPageState({
		q: "x",
		type: "audio",
		sort: "newest",
		page: "3",
		tag: ["t"],
	});

	it("adds a source and forgets the platform-only state", () => {
		const next = withToggledSource(base, "main");
		expect(next.sources).toEqual(["archive", "main"]);
		expect(next.kind).toBeNull();
		expect(next.sort).toBeNull();
		expect(next.page).toBe(1);
		expect(next.filters.tag).toEqual([]);
		expect(next.q).toBe("x");
	});

	it("refuses to uncheck the last source", () => {
		expect(withToggledSource(base, "archive")).toBe(base);
	});
});
