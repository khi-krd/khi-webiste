import { describe, expect, it } from "vitest";
import { normalizeVideoRecord } from "@/lib/api/normalize";
import { resolveVideoDetail } from "@/lib/video/resolve";
import { VideoSchema } from "@/types/video";

const MAIN_URL =
	"https://s3-khiwebsite.s3.us-east-1.amazonaws.com/khi-web-folders/video/820f018c-de36-4092-b183-9b9da3d35da0-t.mp4";
const SECOND_URL =
	"https://s3-khiwebsite.s3.us-east-1.amazonaws.com/khi-web-folders/video/6e5126f0-9ec5-41a0-bcd3-588680155b2b-s.mp4";
const THIRD_URL =
	"https://s3-khiwebsite.s3.us-east-1.amazonaws.com/khi-web-folders/video/b09983b8-403c-4351-a158-661a1f394aae-Pekawa_Zhiany_Ainakan.mp4";

const filmWithVideoSources = {
	id: 38,
	videoType: "FILM",
	albumOfMemories: false,
	topicId: 84,
	contentLanguages: ["CKB"],
	ckbContent: {
		title: "فیلمی پێکەوەژیان",
		description: "وەسف",
		location: "کوردستان",
	},
	videoSources: [
		{ url: MAIN_URL, main: true },
		{ url: SECOND_URL, main: false },
		{ url: THIRD_URL, main: false },
	],
	sourceUrl: MAIN_URL,
	castMembers: [],
	highlightClips: [],
	fileFormat: "mp4",
	durationSeconds: 2700,
	publishmentDate: "2026-07-22",
	tagsCkb: [],
	tagsKmr: [],
	keywordsCkb: [],
	keywordsKmr: [],
};

describe("normalizeVideoRecord videoSources", () => {
	it("maps videoSources to clip items when videoClipItems is absent", () => {
		const normalized = normalizeVideoRecord(filmWithVideoSources);
		const parsed = VideoSchema.parse(normalized);

		expect(parsed.videoClipItems).toHaveLength(3);
		expect(parsed.videoClipItems?.[0]).toMatchObject({
			clipNumber: 1,
			url: MAIN_URL,
		});
		expect(parsed.videoClipItems?.[1]).toMatchObject({
			clipNumber: 2,
			url: SECOND_URL,
		});
		expect(parsed.videoClipItems?.[2]).toMatchObject({
			clipNumber: 3,
			url: THIRD_URL,
		});
	});

	it("keeps the main source first even when it is not first in the API payload", () => {
		const normalized = normalizeVideoRecord({
			...filmWithVideoSources,
			videoSources: [
				{ url: SECOND_URL, main: false },
				{ url: THIRD_URL, main: false },
				{ url: MAIN_URL, main: true },
			],
			sourceUrl: null,
		});
		const parsed = VideoSchema.parse(normalized);

		expect(parsed.sourceUrl).toBe(MAIN_URL);
		expect(parsed.videoClipItems?.[0]?.url).toBe(MAIN_URL);
	});

	it("does not override explicit videoClipItems", () => {
		const normalized = normalizeVideoRecord({
			...filmWithVideoSources,
			videoClipItems: [{ clipNumber: 1, url: "https://example.com/explicit.mp4" }],
		});
		const parsed = VideoSchema.parse(normalized);

		expect(parsed.videoClipItems).toHaveLength(1);
		expect(parsed.videoClipItems?.[0]?.url).toBe(
			"https://example.com/explicit.mp4",
		);
	});
});

describe("resolveVideoDetail with videoSources", () => {
	it("exposes all sources as clips and plays the main source by default", () => {
		const parsed = VideoSchema.parse(normalizeVideoRecord(filmWithVideoSources));
		const detail = resolveVideoDetail("ckb", parsed);

		expect(detail?.clips).toHaveLength(3);
		expect(detail?.playableSrc).toBe(MAIN_URL);
		expect(detail?.previewVideoUrl).toBe(MAIN_URL);
		expect(detail?.activeClipNumber).toBe(1);
	});
});
