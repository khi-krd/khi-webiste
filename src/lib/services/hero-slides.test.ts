import { describe, expect, it } from "vitest";
import { buildServiceHeroSlides } from "@/lib/services/hero-slides";
import type { ServiceHighlight } from "@/lib/services/resolve";

const copy = {
	typeLabel: "Featured",
	actionLabel: "See the service",
	slideLabel: (current: number, total: number) => `${current} of ${total}`,
};

function highlight(
	overrides: Partial<ServiceHighlight> = {},
): ServiceHighlight {
	return {
		anchorId: "digital-archive",
		title: "Digital archive",
		description: "400,000 heritage items.",
		image: { url: "https://cdn.example.com/archive.jpg" },
		...overrides,
	};
}

describe("buildServiceHeroSlides", () => {
	it("turns a featured service into a full hero slide", () => {
		const [slide] = buildServiceHeroSlides([highlight()], copy);

		expect(slide).toEqual({
			id: "digital-archive",
			// A full path, not "#digital-archive" — the locale-aware Link would
			// otherwise resolve a bare hash against the homepage.
			href: "/services#digital-archive",
			title: "Digital archive",
			description: "400,000 heritage items.",
			typeLabel: "Featured",
			actionLabel: "See the service",
			slideLabel: "1 of 1",
			// Decorative — the slide link and heading already name the service.
			image: { url: "https://cdn.example.com/archive.jpg", alt: "" },
		});
	});

	it("numbers slides against the kept set, not the input", () => {
		const slides = buildServiceHeroSlides(
			[
				highlight({ anchorId: "a" }),
				highlight({ anchorId: "no-picture", image: null }),
				highlight({ anchorId: "b" }),
			],
			copy,
		);

		expect(slides.map((slide) => slide.id)).toEqual(["a", "b"]);
		expect(slides.map((slide) => slide.slideLabel)).toEqual([
			"1 of 2",
			"2 of 2",
		]);
	});

	it("drops a featured service with no picture anywhere", () => {
		expect(buildServiceHeroSlides([highlight({ image: null })], copy)).toEqual(
			[],
		);
	});

	it("treats a blank image url as no picture", () => {
		expect(
			buildServiceHeroSlides([highlight({ image: { url: "   " } })], copy),
		).toEqual([]);
	});

	it("marks the hero photo decorative even when the highlight carries an alt", () => {
		const [slide] = buildServiceHeroSlides(
			[
				highlight({
					image: { url: "https://cdn.example.com/a.jpg", alt: "Shelves" },
				}),
			],
			copy,
		);

		expect(slide.image.alt).toBe("");
	});

	it("skips a CMS url that is not a usable media url", () => {
		expect(
			buildServiceHeroSlides(
				[highlight({ image: { url: "uploads/hall.jpg" } })],
				copy,
			),
		).toEqual([]);
	});

	it("drops a duplicate anchor rather than emitting two identical React keys", () => {
		const slides = buildServiceHeroSlides(
			[
				highlight({ anchorId: "studio", title: "Studio one" }),
				highlight({ anchorId: "studio", title: "Studio two" }),
				highlight({ anchorId: "library", title: "Library" }),
			],
			copy,
		);

		expect(slides.map((slide) => slide.id)).toEqual(["studio", "library"]);
		expect(slides.map((slide) => slide.title)).toEqual([
			"Studio one",
			"Library",
		]);
	});

	it("renders a slide with no feature description rather than dropping it", () => {
		const [slide] = buildServiceHeroSlides(
			[highlight({ description: null })],
			copy,
		);

		expect(slide.description).toBe("");
	});

	it("returns nothing when nothing is featured", () => {
		expect(buildServiceHeroSlides([], copy)).toEqual([]);
	});
});
