import { afterEach, describe, expect, it } from "vitest";
import {
	getBorderRadiusHtmlAttrs,
	getBorderRadiusSize,
	isBorderRadiusEnabled,
} from "@/lib/theme/border-radius";

const originalEnable = process.env.NEXT_PUBLIC_ENABLE_BORDER_RADIUS;
const originalSize = process.env.NEXT_PUBLIC_BORDER_RADIUS;

afterEach(() => {
	if (originalEnable === undefined) {
		delete process.env.NEXT_PUBLIC_ENABLE_BORDER_RADIUS;
	} else {
		process.env.NEXT_PUBLIC_ENABLE_BORDER_RADIUS = originalEnable;
	}

	if (originalSize === undefined) {
		delete process.env.NEXT_PUBLIC_BORDER_RADIUS;
	} else {
		process.env.NEXT_PUBLIC_BORDER_RADIUS = originalSize;
	}
});

describe("isBorderRadiusEnabled", () => {
	it("returns false when unset", () => {
		delete process.env.NEXT_PUBLIC_ENABLE_BORDER_RADIUS;
		expect(isBorderRadiusEnabled()).toBe(false);
	});

	it("returns true only for the literal string true", () => {
		process.env.NEXT_PUBLIC_ENABLE_BORDER_RADIUS = "true";
		expect(isBorderRadiusEnabled()).toBe(true);
	});

	it("returns false for other values", () => {
		process.env.NEXT_PUBLIC_ENABLE_BORDER_RADIUS = "false";
		expect(isBorderRadiusEnabled()).toBe(false);
	});
});

describe("getBorderRadiusSize", () => {
	it("defaults to m when unset", () => {
		delete process.env.NEXT_PUBLIC_BORDER_RADIUS;
		expect(getBorderRadiusSize()).toBe("m");
	});

	it("accepts valid sizes case-insensitively", () => {
		process.env.NEXT_PUBLIC_BORDER_RADIUS = "XL";
		expect(getBorderRadiusSize()).toBe("xl");
	});

	it("falls back to m for invalid values", () => {
		process.env.NEXT_PUBLIC_BORDER_RADIUS = "xxl";
		expect(getBorderRadiusSize()).toBe("m");
	});
});

describe("getBorderRadiusHtmlAttrs", () => {
	it("returns square when disabled", () => {
		process.env.NEXT_PUBLIC_ENABLE_BORDER_RADIUS = "false";
		expect(getBorderRadiusHtmlAttrs()).toEqual({ "data-corners": "square" });
	});

	it("returns rounded with size when enabled", () => {
		process.env.NEXT_PUBLIC_ENABLE_BORDER_RADIUS = "true";
		process.env.NEXT_PUBLIC_BORDER_RADIUS = "l";
		expect(getBorderRadiusHtmlAttrs()).toEqual({
			"data-corners": "rounded",
			"data-radius-size": "l",
		});
	});
});
