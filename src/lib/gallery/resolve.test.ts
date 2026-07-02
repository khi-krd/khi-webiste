import { describe, expect, it } from "vitest";
import {
	dedupeImageAlbumItems,
	resolveGalleryPost,
	resolveImageCollectionItem,
} from "@/lib/gallery/resolve";
import type { ImageAlbumItem, ImageCollection } from "@/types/gallery";

function albumItem(
	id: number,
	imageUrl: string,
	sortOrder = 0,
): ImageAlbumItem {
	return { id, imageUrl, sortOrder };
}

describe("dedupeImageAlbumItems", () => {
	it("keeps one row per id when the API repeats the same album item", () => {
		const repeated = Array.from({ length: 32 }, () =>
			albumItem(10, "https://example.com/a.jpg", 0),
		);

		expect(dedupeImageAlbumItems(repeated)).toHaveLength(1);
	});

	it("keeps distinct images in sort order", () => {
		const items = [
			...Array.from({ length: 32 }, () =>
				albumItem(1, "https://example.com/a.jpg", 0),
			),
			...Array.from({ length: 32 }, () =>
				albumItem(2, "https://example.com/b.jpg", 1),
			),
		];

		const deduped = dedupeImageAlbumItems(items);
		expect(deduped).toHaveLength(2);
		expect(deduped.map((item) => item.imageUrl)).toEqual([
			"https://example.com/a.jpg",
			"https://example.com/b.jpg",
		]);
	});
});

describe("resolveImageCollectionItem", () => {
	it("prefers the first album image over CMS cover URLs", () => {
		const collection = {
			id: 1,
			slugKmr: "test-gallery",
			collectionType: "GALLERY",
			ckbCoverUrl: "https://cdn.example.com/cover-thumb.jpg",
			kmrCoverUrl: "https://cdn.example.com/cover-thumb.jpg",
			contentLanguages: ["KMR"],
			kmrContent: {
				title: "Test gallery",
				description: null,
				location: "Hewraman",
				collectedBy: null,
			},
			imageAlbum: [
				albumItem(1, "https://cdn.example.com/full-image.jpg", 0),
			],
		} as ImageCollection;

		const item = resolveImageCollectionItem("ku", collection, 0);
		expect(item?.image.url).toBe("https://cdn.example.com/full-image.jpg");
	});

	it("falls back to cover URL when the album is empty", () => {
		const collection = {
			id: 2,
			slugKmr: "cover-only",
			collectionType: "GALLERY",
			kmrCoverUrl: "https://cdn.example.com/cover.jpg",
			contentLanguages: ["KMR"],
			kmrContent: {
				title: "Cover only",
				description: null,
				location: null,
				collectedBy: null,
			},
			imageAlbum: [],
		} as ImageCollection;

		const item = resolveImageCollectionItem("ku", collection, 0);
		expect(item?.image.url).toBe("https://cdn.example.com/cover.jpg");
	});
});

describe("resolveGalleryPost", () => {
	it("resolves a deduplicated album for display", () => {
		const collection = {
			id: 12,
			slugKmr: "cilen-heremi-hewraman",
			collectionType: "GALLERY",
			publishmentDate: "2026-01-01",
			contentLanguages: ["KMR"],
			kmrContent: {
				title: "Test gallery",
				description: "<p>Test</p>",
				location: null,
				collectedBy: null,
			},
			imageAlbum: [
				...Array.from({ length: 32 }, () =>
					albumItem(1, "https://example.com/a.jpg", 0),
				),
				...Array.from({ length: 32 }, () =>
					albumItem(2, "https://example.com/b.jpg", 1),
				),
			],
		} as ImageCollection;

		const post = resolveGalleryPost("ku", collection);
		expect(post?.album).toHaveLength(2);
	});
});
