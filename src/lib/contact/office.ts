export type OfficeId = "sulaymaniyah" | "duhok";

export type ContactOffice = {
	id: OfficeId;
	index: 1 | 2;
	badge: "hq" | "regional";
	phone: string;
	/** Second line the office publishes; omitted when it only has one. */
	secondaryPhone?: string;
	email: string;
	mapEmbedUrl: string;
	mapLinkUrl: string;
	coordinates: {
		lat: number;
		lng: number;
	};
	/** False when neither the pasted map value nor the CMS fields yielded coordinates — the UI then hides the "0.0000° N" line. */
	hasCoordinates: boolean;
	image: {
		url: string;
		alt?: string;
	};
};

/**
 * Bundled office photos used only while the CMS `heroImageUrl` is blank —
 * two identical placeholders side by side read as a rendering bug, so each
 * office keeps its own.
 */
export const OFFICE_IMAGES = {
	sulaymaniyah: "/about/475203467_1007002848126180_7383496220452921499_n.jpg",
	duhok: "/about/services-bg.jpg",
} as const;

export function formatCoordinates(lat: number, lng: number): string {
	const latDir = lat >= 0 ? "N" : "S";
	const lngDir = lng >= 0 ? "E" : "W";
	return `${Math.abs(lat).toFixed(4)}° ${latDir}, ${Math.abs(lng).toFixed(4)}° ${lngDir}`;
}
