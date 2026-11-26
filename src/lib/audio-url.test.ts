import { describe, expect, it } from "vitest";
import { buildAudioHref, parseAudioState } from "@/lib/audio-url";

describe("audio state URL param", () => {
	it("keeps the short single/multi links for the built-in types", () => {
		expect(parseAudioState("single")).toBe("SINGLE");
		expect(parseAudioState("multi")).toBe("MULTI");
		expect(buildAudioHref({ state: "SINGLE" })).toBe("/audio?state=single");
		expect(buildAudioHref({ state: "MULTI" })).toBe("/audio?state=multi");
	});

	it("round-trips an admin-added type slug", () => {
		const href = buildAudioHref({ state: "SOUND_STATE_ABC" });
		expect(href).toBe("/audio?state=SOUND_STATE_ABC");
		expect(parseAudioState("SOUND_STATE_ABC")).toBe("SOUND_STATE_ABC");
	});

	it("rejects junk", () => {
		expect(parseAudioState("<script>")).toBeNull();
		expect(parseAudioState("")).toBeNull();
	});
});
