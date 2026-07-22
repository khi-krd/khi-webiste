export type DonateTypeId =
	| "visualArchive"
	| "documents"
	| "oralHeritage"
	| "financial"
	| "scientific";

export type MaterialTypeId =
	| "cassetteAudio"
	| "photograph"
	| "manuscript"
	| "document"
	| "video"
	| "other";

export type PaymentMethodId = "fib" | "fastpay";

export type CurrencyId = "iqd" | "usd";

export type DonateTypeItem = {
	id: DonateTypeId;
	index: number;
	image: {
		url: string;
		alt?: string;
	};
};

export type DonateHeroMedia = {
	url: string;
	alt?: string;
};

export type DonatePaymentDetails = {
	fibAccount: string;
	fastpayNumber: string;
};

export type AmountPreset = {
	id: "large" | "medium" | "small";
	value: number;
};

const MENU = (n: number) => `/menu/${n}.jpg`;

const DONATE_IMAGES = {
	hero: "/about/475203467_1007002848126180_7383496220452921499_n.jpg",
	visualArchive: "/menu/7.jpg",
	documents: "/menu/1.jpg",
	oralHeritage: "/menu/5.jpg",
	financial: "/menu/4.jpg",
	scientific: "/menu/6.jpg",
	supporters: "/menu/3.jpg",
} as const;

export const DONATE_TYPE_IDS: DonateTypeId[] = [
	"visualArchive",
	"documents",
	"oralHeritage",
	"financial",
	"scientific",
];

export const MATERIAL_TYPE_IDS: MaterialTypeId[] = [
	"cassetteAudio",
	"photograph",
	"manuscript",
	"document",
	"video",
	"other",
];

export const CURRENCY_IDS: CurrencyId[] = ["iqd", "usd"];

export const PAYMENT_METHOD_IDS: PaymentMethodId[] = ["fib", "fastpay"];

export function getDonateHeroMedia(): DonateHeroMedia {
	return {
		url: DONATE_IMAGES.hero,
		alt: "",
	};
}

export function getDonateTypeItems(): DonateTypeItem[] {
	return [
		{
			id: "visualArchive",
			index: 1,
			image: { url: DONATE_IMAGES.visualArchive },
		},
		{
			id: "documents",
			index: 2,
			image: { url: DONATE_IMAGES.documents },
		},
		{
			id: "oralHeritage",
			index: 3,
			image: { url: DONATE_IMAGES.oralHeritage },
		},
		{
			id: "financial",
			index: 4,
			image: { url: DONATE_IMAGES.financial },
		},
		{
			id: "scientific",
			index: 5,
			image: { url: DONATE_IMAGES.scientific },
		},
	];
}

export function getDonatePaymentDetails(): DonatePaymentDetails {
	return {
		fibAccount: "2345 8901 4567 1201",
		fastpayNumber: "0770 123 4567",
	};
}

export function getAmountPresets(): AmountPreset[] {
	return [
		{ id: "large", value: 100_000 },
		{ id: "medium", value: 50_000 },
		{ id: "small", value: 25_000 },
	];
}

export function getSupportersImage(href?: string | null) {
	return {
		url: DONATE_IMAGES.supporters,
		href: href ?? null,
	};
}

/** Placeholder menu images for any future donate card swaps. */
export const DONATE_MENU_IMAGES = [1, 2, 3, 4, 5, 6, 7].map(MENU);
