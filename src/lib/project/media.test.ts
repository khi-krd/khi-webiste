import { describe, expect, it } from "vitest";
import { inferMediaKindFromUrl, parseMediaKind } from "@/lib/project/media";

describe("inferMediaKindFromUrl", () => {
	it("detects still images, audio, and video from file extensions", () => {
		expect(
			inferMediaKindFromUrl("https://s3.example.com/folders/images/photo.jpg"),
		).toBe("IMAGE");
		expect(inferMediaKindFromUrl("/audio/sample-1.m4a")).toBe("AUDIO");
		expect(inferMediaKindFromUrl("/video/wave.mp4")).toBe("VIDEO");
	});

	it("detects YouTube URLs as video", () => {
		expect(
			inferMediaKindFromUrl("https://www.youtube.com/watch?v=dQw4w9WgXcQ"),
		).toBe("VIDEO");
	});
});

describe("parseMediaKind", () => {
	it("normalizes lowercase API values", () => {
		expect(parseMediaKind("image")).toBe("IMAGE");
		expect(parseMediaKind("video")).toBe("VIDEO");
	});

	it("prefers the URL extension when CMS kind conflicts", () => {
		expect(
			parseMediaKind(
				"VIDEO",
				"https://s3.example.com/folders/images/cover.jpg",
			),
		).toBe("IMAGE");
		expect(parseMediaKind("IMAGE", "/video/wave.mp4")).toBe("VIDEO");
	});
});
