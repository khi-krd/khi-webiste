import { describe, expect, it } from "vitest";
import {
	coordinatesEmbedUrl,
	coordinatesLinkUrl,
	resolveMapUrl,
} from "@/lib/contact/map-url";

const LIVE_IFRAME_SRC =
	"https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3926.07!2d45.429480999999996!3d35.561886!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!5e0!3m2!1sen!2siq!4v1700000000000";
const LIVE_IFRAME_SNIPPET = `<iframe src="${LIVE_IFRAME_SRC}" width="600" height="450" style="border:0;" allowfullscreen="" loading="lazy"></iframe>`;

const noFallback = { lat: null, lng: null };

describe("resolveMapUrl", () => {
	// Office 1's live record: an <iframe> snippet whose pb string carries the
	// real coordinates while the backend lat/lng fields are bogus (55, 45 —
	// the Caspian sea). The URL coordinates must win everywhere.
	it("extracts src and pb coordinates from the live iframe snippet", () => {
		const map = resolveMapUrl(LIVE_IFRAME_SNIPPET, { lat: 55.0, lng: 45.0 });

		expect(map.embedUrl).toBe(LIVE_IFRAME_SRC);
		expect(map.coordinates?.lat).toBeCloseTo(35.561886);
		expect(map.coordinates?.lng).toBeCloseTo(45.429481);
		expect(map.linkUrl).toBe(
			"https://www.google.com/maps?q=35.561886,45.429481",
		);
	});

	// Office 2's live record: already an embed URL.
	it("passes an output=embed URL through unchanged", () => {
		const url =
			"https://www.google.com/maps?q=36.8663,42.9884&z=14&output=embed";
		const map = resolveMapUrl(url, { lat: 36.8663, lng: 42.9884 });

		expect(map.embedUrl).toBe(url);
		expect(map.linkUrl).toBe("https://www.google.com/maps?q=36.8663,42.9884");
		expect(map.coordinates).toEqual({ lat: 36.8663, lng: 42.9884 });
	});

	it("decodes &amp; in a pasted iframe src", () => {
		const map = resolveMapUrl(
			'<iframe src="https://maps.google.com/maps?q=35.5,45.4&amp;output=embed"></iframe>',
			noFallback,
		);

		expect(map.embedUrl).toContain("q=35.5,45.4");
		expect(map.embedUrl).toContain("output=embed");
		expect(map.embedUrl).not.toContain("&amp;");
	});

	it("derives coordinates from a place URL and keeps it as the link", () => {
		const url =
			"https://www.google.com/maps/place/Kurdish+Heritage+Institute/@35.561886,45.4294810,17z/data=!3m1!4b1!4m6!3m5!1s0x40002c25ecdaf793:0xf8de076f7b28a646!8m2!3d35.561886!4d45.429481";
		const map = resolveMapUrl(url, noFallback);

		expect(map.coordinates?.lat).toBeCloseTo(35.561886);
		expect(map.coordinates?.lng).toBeCloseTo(45.429481);
		expect(map.embedUrl).toBe(coordinatesEmbedUrl(35.561886, 45.429481));
		expect(map.linkUrl).toBe(url);
	});

	it("embeds coordinates for a short link when fallback coords exist", () => {
		const map = resolveMapUrl("https://maps.app.goo.gl/AbC123", {
			lat: 35.561886,
			lng: 45.429481,
		});

		expect(map.embedUrl).toBe(coordinatesEmbedUrl(35.561886, 45.429481));
		expect(map.linkUrl).toBe("https://maps.app.goo.gl/AbC123");
	});

	it("cannot embed a short link without coordinates", () => {
		const map = resolveMapUrl("https://maps.app.goo.gl/AbC123", noFallback);

		expect(map.embedUrl).toBeNull();
		expect(map.linkUrl).toBe("https://maps.app.goo.gl/AbC123");
		expect(map.coordinates).toBeNull();
	});

	it("turns a text ?q= search into a query embed", () => {
		const map = resolveMapUrl(
			"https://www.google.com/maps?q=Kurdish+Heritage+Institute+Sulaymaniyah",
			noFallback,
		);

		expect(map.embedUrl).not.toBeNull();
		const embed = new URL(map.embedUrl as string);
		expect(embed.hostname).toBe("maps.google.com");
		expect(embed.searchParams.get("q")).toBe(
			"Kurdish Heritage Institute Sulaymaniyah",
		);
		expect(embed.searchParams.get("output")).toBe("embed");
	});

	it("keeps a non-Google URL as the link but never embeds it", () => {
		const url = "https://www.openstreetmap.org/export/embed.html?bbox=1,2,3,4";
		const map = resolveMapUrl(url, noFallback);

		expect(map.embedUrl).toBeNull();
		expect(map.linkUrl).toBe(url);
	});

	it("rejects non-http(s) input entirely", () => {
		const map = resolveMapUrl("javascript:alert(1)", noFallback);

		expect(map).toEqual({
			embedUrl: null,
			linkUrl: null,
			coordinates: null,
		});
	});

	it("accepts a plain 'lat, lng' paste", () => {
		const map = resolveMapUrl("35.5619, 45.4295", noFallback);

		expect(map.coordinates).toEqual({ lat: 35.5619, lng: 45.4295 });
		expect(map.embedUrl).toBe(coordinatesEmbedUrl(35.5619, 45.4295));
		expect(map.linkUrl).toBe(coordinatesLinkUrl(35.5619, 45.4295));
	});

	it("accepts a plain 'lat lng' paste", () => {
		const map = resolveMapUrl("35.5619 45.4295", noFallback);

		expect(map.coordinates).toEqual({ lat: 35.5619, lng: 45.4295 });
	});

	it("rewrites a My Maps viewer URL to the d/embed form", () => {
		const map = resolveMapUrl(
			"https://www.google.com/maps/d/viewer?mid=1AbC_def",
			noFallback,
		);

		expect(map.embedUrl).toBe(
			"https://www.google.com/maps/d/embed?mid=1AbC_def",
		);
	});

	it("normalises a google.com embed host to www.google.com for CSP", () => {
		const map = resolveMapUrl(
			`https://google.com/maps/embed?pb=!1m18!2d45.429481!3d35.561886`,
			noFallback,
		);

		expect(map.embedUrl).toBe(
			"https://www.google.com/maps/embed?pb=!1m18!2d45.429481!3d35.561886",
		);
	});

	it("falls back to CMS coordinates when the URL yields none", () => {
		const map = resolveMapUrl("https://www.google.com/maps/place/", {
			lat: 35.5,
			lng: 45.4,
		});

		expect(map.embedUrl).toBe(coordinatesEmbedUrl(35.5, 45.4));
		expect(map.coordinates).toEqual({ lat: 35.5, lng: 45.4 });
	});
});
