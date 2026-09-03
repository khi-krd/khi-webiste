export type OfficeId = "sulaymaniyah" | "duhok";

export type ContactOffice = {
	id: OfficeId;
	index: 1 | 2;
	badge: "hq" | "regional";
	phone: string;
	email: string;
	mapEmbedUrl: string;
	mapLinkUrl: string;
	coordinates: {
		lat: number;
		lng: number;
	};
	image: {
		url: string;
		alt?: string;
	};
};

export type SocialPlatformId =
	| "whatsapp"
	| "youtube"
	| "instagram"
	| "facebook";

export type SocialPlatform = {
	id: SocialPlatformId;
	href: string;
};

export const OFFICE_IMAGES = {
	sulaymaniyah: "/about/475203467_1007002848126180_7383496220452921499_n.jpg",
	duhok: "/about/services-bg.jpg",
} as const;

function mapsEmbedUrl(lat: number, lng: number): string {
	return `https://maps.google.com/maps?q=${lat},${lng}&hl=en&z=15&output=embed`;
}

function mapsLinkUrl(lat: number, lng: number): string {
	return `https://www.google.com/maps?q=${lat},${lng}`;
}

export function getContactOffices(): ContactOffice[] {
	return [
		{
			id: "sulaymaniyah",
			index: 1,
			badge: "hq",
			phone: "+964 53 320 4232",
			email: "khi_2003@hotmail.com",
			coordinates: { lat: 36.1901, lng: 44.0099 },
			mapEmbedUrl: mapsEmbedUrl(36.1901, 44.0099),
			mapLinkUrl: mapsLinkUrl(36.1901, 44.0099),
			image: { url: OFFICE_IMAGES.sulaymaniyah },
		},
		{
			id: "duhok",
			index: 2,
			badge: "regional",
			phone: "+964 62 761 2253",
			email: "khid_2003@hotmail.com",
			coordinates: { lat: 36.861, lng: 42.988 },
			mapEmbedUrl: mapsEmbedUrl(36.861, 42.988),
			mapLinkUrl: mapsLinkUrl(36.861, 42.988),
			image: { url: OFFICE_IMAGES.duhok },
		},
	];
}

export function getSocialPlatforms(): SocialPlatform[] {
	return [
		{ id: "facebook", href: "https://facebook.com/KurdishHeritage" },
		{ id: "instagram", href: "https://instagram.com/KurdishHeritage" },
		{ id: "youtube", href: "https://youtube.com/@KHI_Kurdistan" },
		{ id: "whatsapp", href: "https://wa.me/964533204232" },
	];
}

export function formatCoordinates(lat: number, lng: number): string {
	const latDir = lat >= 0 ? "N" : "S";
	const lngDir = lng >= 0 ? "E" : "W";
	return `${Math.abs(lat).toFixed(4)}° ${latDir}, ${Math.abs(lng).toFixed(4)}° ${lngDir}`;
}
