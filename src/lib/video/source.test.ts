import { describe, expect, it } from "vitest";
import { toCleanEmbedSrc } from "@/lib/video/source";

describe("toCleanEmbedSrc", () => {
	it("normalizes a youtu.be link to a nocookie embed with minimal branding", () => {
		const src = toCleanEmbedSrc("https://youtu.be/LFo3Zt6RAzU?si=abc");
		expect(src).toBe(
			"https://www.youtube-nocookie.com/embed/LFo3Zt6RAzU?modestbranding=1&rel=0&iv_load_policy=3&playsinline=1",
		);
	});

	it("normalizes an existing youtube.com/embed URL the same way", () => {
		const src = toCleanEmbedSrc(
			"https://www.youtube.com/embed/LFo3Zt6RAzU?si=xyz",
		);
		expect(src).toContain("youtube-nocookie.com/embed/LFo3Zt6RAzU");
	});

	it("appends autoplay=1 for click-activated surfaces", () => {
		const src = toCleanEmbedSrc("https://youtu.be/LFo3Zt6RAzU", {
			autoplay: true,
		});
		expect(src).toContain("autoplay=1");
	});

	it("converts a vimeo page URL to a player embed", () => {
		const src = toCleanEmbedSrc("https://vimeo.com/76979871", {
			autoplay: true,
		});
		expect(src).toBe("https://player.vimeo.com/video/76979871?autoplay=1");
	});

	it("passes other provider embeds through, adding autoplay only when asked", () => {
		const soundcloud =
			"https://w.soundcloud.com/player/?url=https%3A//api.soundcloud.com/tracks/123";
		expect(toCleanEmbedSrc(soundcloud)).toBe(soundcloud);
		expect(toCleanEmbedSrc(soundcloud, { autoplay: true })).toContain(
			"autoplay=1",
		);
	});
});
