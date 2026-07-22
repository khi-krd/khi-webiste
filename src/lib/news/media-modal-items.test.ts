import { describe, expect, it } from "vitest";
import { buildNewsMediaModalItems } from "@/lib/news/media-modal-items";
import type { MediaItem } from "@/types/media";

function mediaItem(
	url: string,
	kind: MediaItem["kind"] = "IMAGE",
	sortOrder = 0,
): MediaItem {
	return {
		url,
		kind,
		thumbnailUrl: null,
		caption: null,
		sortOrder,
	};
}

describe("buildNewsMediaModalItems", () => {
	it("returns cover only when the gallery is empty", () => {
		const cover = mediaItem("https://example.com/cover.jpg");

		const result = buildNewsMediaModalItems(cover, []);

		expect(result.items).toEqual([cover]);
		expect(result.coverIndex).toBe(0);
		expect(result.galleryIndexOffset).toBe(0);
	});

	it("does not duplicate the cover when it already exists in the gallery", () => {
		const cover = mediaItem("https://example.com/shared.jpg");
		const gallery = [
			mediaItem("https://example.com/shared.jpg"),
			mediaItem("https://example.com/other.jpg", "IMAGE", 1),
		];

		const result = buildNewsMediaModalItems(cover, gallery);

		expect(result.items).toEqual(gallery);
		expect(result.coverIndex).toBe(0);
		expect(result.galleryIndexOffset).toBe(0);
	});

	it("prepends the cover when it is not in the gallery", () => {
		const cover = mediaItem("https://example.com/cover.jpg");
		const gallery = [mediaItem("https://example.com/other.jpg")];

		const result = buildNewsMediaModalItems(cover, gallery);

		expect(result.items).toEqual([cover, ...gallery]);
		expect(result.coverIndex).toBe(0);
		expect(result.galleryIndexOffset).toBe(1);
	});
});
