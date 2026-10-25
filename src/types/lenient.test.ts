import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { normalizeWritingRecord } from "@/lib/api/normalize";
import { ImageCollectionSchema } from "@/types/gallery";
import { lenientArray } from "@/types/lenient";
import { NewsPageSchema } from "@/types/news";
import { ProjectSchema } from "@/types/project";
import { SocialLinkListSchema } from "@/types/social";
import { WritingSchema } from "@/types/writing";

/**
 * The backend serializes with `default-property-inclusion: non_null`, so an
 * empty field is ABSENT from the JSON, not null. Each case below reproduces a
 * record shape that used to vanish from the website silently.
 */

let warn: ReturnType<typeof vi.spyOn>;
beforeEach(() => {
	warn = vi.spyOn(console, "warn").mockImplementation(() => {});
});
afterEach(() => warn.mockRestore());

describe("records with omitted fields still parse", () => {
	it("keeps a writing whose Kurmanji writer/title/description are absent", () => {
		const writing = {
			id: 14,
			contentLanguages: ["CKB", "KMR"],
			ckbContent: { title: "چەپكێ", description: "<p>…</p>", writer: "ڕێبوار" },
			kmrContent: { location: "Rêbwar Cemal" },
			bookGenres: ["ROK"],
			publishedByInstitute: true,
			tags: { ckb: [], kmr: [] },
			keywords: { ckb: [], kmr: [] },
		};
		expect(
			WritingSchema.safeParse(normalizeWritingRecord(writing)).success,
		).toBe(true);
	});

	it("keeps a project whose cover media type is unknown to the site", () => {
		const project = {
			id: 1,
			contentLanguages: ["CKB"],
			coverMediaType: "DOCUMENT",
			ckbContent: { title: "پرۆژە" },
		};
		const parsed = ProjectSchema.safeParse(project);
		expect(parsed.success).toBe(true);
		expect(parsed.data?.coverMediaType).toBeNull();
	});
});

describe("one bad entry never takes its siblings down", () => {
	it("drops only the malformed news item, not the whole page", () => {
		const page = NewsPageSchema.parse({
			content: [
				{ id: 1, contentLanguages: ["CKB"], tags: { ckb: [], kmr: [] } },
				{ id: "broken" },
				{ id: 3, contentLanguages: ["KMR"], tags: { ckb: [], kmr: [] } },
			],
			totalElements: 3,
			totalPages: 1,
		});
		expect(page.content.map((item) => item.id)).toEqual([1, 3]);
		expect(warn).toHaveBeenCalledOnce();
	});

	it("keeps the album when one image entry is malformed", () => {
		const parsed = ImageCollectionSchema.safeParse({
			id: 7,
			collectionType: "GALLERY",
			contentLanguages: ["CKB"],
			imageAlbum: [{ id: 1, imageUrl: "a.jpg" }, { imageUrl: "no-id.jpg" }],
		});
		expect(parsed.success).toBe(true);
		expect(parsed.data?.imageAlbum).toHaveLength(1);
	});

	it("keeps a social link whose platform the site does not know", () => {
		const links = SocialLinkListSchema.parse([
			{ id: 1, platform: "SNAPCHAT", url: "https://snapchat.com/x" },
			{ id: 2, platform: "FACEBOOK", url: "https://facebook.com/x" },
		]);
		expect(links.map((link) => link.platform)).toEqual(["OTHER", "FACEBOOK"]);
	});

	it("treats a missing array as empty", () => {
		expect(lenientArray(ProjectSchema).parse(undefined)).toEqual([]);
	});
});
