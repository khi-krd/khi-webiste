import { describe, expect, it } from "vitest";
import { resolveFounderFromAbout } from "@/lib/about/resolve";
import { selectLeadAboutPage, sortFeaturedAboutPages } from "@/lib/api/about";
import type { About } from "@/types/about";

function aboutPage(overrides: Partial<About> = {}): About {
	return { id: 5, ...overrides } as About;
}

describe("resolveFounderFromAbout", () => {
	it("keeps the founder copy when the CMS has no portrait", () => {
		const founder = resolveFounderFromAbout(
			"ckb",
			aboutPage({
				founderNameCkb: "مەزهەر خالەقی",
				founderBioCkb: "دامەزرێنەری پەیمانگە.",
			}),
		);

		expect(founder).toEqual({
			image: { url: "", alt: "مەزهەر خالەقی" },
			name: "مەزهەر خالەقی",
			bio: "دامەزرێنەری پەیمانگە.",
		});
	});

	it("uses the portrait when there is one", () => {
		const founder = resolveFounderFromAbout(
			"ckb",
			aboutPage({
				founderNameCkb: "مەزهەر خالەقی",
				founderImageUrl: "https://cdn.example.com/founder.jpg",
			}),
		);

		expect(founder?.image.url).toBe("https://cdn.example.com/founder.jpg");
	});

	it("prefers KMR copy outside ckb", () => {
		const founder = resolveFounderFromAbout(
			"ku",
			aboutPage({
				founderNameCkb: "مەزهەر خالەقی",
				founderNameKmr: "Mezher Xaliqî",
				founderBioKmr: "Avakerê enstîtuyê.",
			}),
		);

		expect(founder?.name).toBe("Mezher Xaliqî");
		expect(founder?.bio).toBe("Avakerê enstîtuyê.");
	});

	it("returns null when the page carries no founder at all", () => {
		expect(resolveFounderFromAbout("ckb", aboutPage())).toBeNull();
		expect(resolveFounderFromAbout("ckb", null)).toBeNull();
	});
});

describe("selectLeadAboutPage", () => {
	const plain = aboutPage({ id: 1, slugCkb: "derbarey-ime" });
	const alsoPlain = aboutPage({ id: 2, slugCkb: "peyam" });

	it("prefers a featured record over the first-with-a-slug rule", () => {
		const featured = aboutPage({ id: 3, featured: true });

		expect(selectLeadAboutPage("ckb", [plain, alsoPlain, featured])?.id).toBe(
			3,
		);
	});

	it("uses the lowest featuredOrder when several are featured", () => {
		const pages = [
			aboutPage({ id: 4, featured: true, featuredOrder: 2 }),
			aboutPage({ id: 5, featured: true, featuredOrder: 1 }),
			aboutPage({ id: 6, featured: true }),
		];

		expect(selectLeadAboutPage("ckb", pages)?.id).toBe(5);
		// nulls sort last, newest id first among them
		expect(sortFeaturedAboutPages(pages).map((page) => page.id)).toEqual([
			5, 4, 6,
		]);
	});

	it("falls back to the slug match when nothing is featured", () => {
		expect(selectLeadAboutPage("ckb", [plain, alsoPlain])?.id).toBe(1);
	});

	it("returns null for an empty list", () => {
		expect(selectLeadAboutPage("ckb", [])).toBeNull();
	});
});
