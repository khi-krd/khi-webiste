export type BorderRadiusSize = "s" | "m" | "l" | "xl";

const VALID_SIZES = new Set<BorderRadiusSize>(["s", "m", "l", "xl"]);

export function isBorderRadiusEnabled(): boolean {
	return process.env.NEXT_PUBLIC_ENABLE_BORDER_RADIUS === "true";
}

export function getBorderRadiusSize(): BorderRadiusSize {
	const raw = process.env.NEXT_PUBLIC_BORDER_RADIUS?.trim().toLowerCase();
	if (raw && VALID_SIZES.has(raw as BorderRadiusSize)) {
		return raw as BorderRadiusSize;
	}
	return "m";
}

export type BorderRadiusHtmlAttrs = {
	"data-corners": "square" | "rounded";
	"data-radius-size"?: BorderRadiusSize;
};

export function getBorderRadiusHtmlAttrs(): BorderRadiusHtmlAttrs {
	if (!isBorderRadiusEnabled()) {
		return { "data-corners": "square" };
	}

	return {
		"data-corners": "rounded",
		"data-radius-size": getBorderRadiusSize(),
	};
}
