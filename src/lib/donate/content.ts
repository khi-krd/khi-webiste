/**
 * Donation page content that lives in the frontend.
 *
 * These are NOT mock records standing in for the CMS — the CMS has no field for
 * any of them. The donation-types API returns two coarse codes (FINANCIAL /
 * ARCHIVE) with no imagery or ordering, and donation settings carry no amount
 * presets and no supporters image. Every visible string here comes from
 * `messages/*.json`; what this file owns is the card set, its order, the preset
 * amounts and the artwork.
 *
 * If the backend ever grows these fields, this file is what they replace.
 */
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

/**
 * One fully-resolved card for the "دەتوانم چی ببەخشم؟" grid — text already in
 * the active locale. The CMS (`donation_type_cards`) is the only source; there
 * is no hardcoded stand-in set any more.
 */
export type DonateTypeCardData = {
	id: string | number;
	/** 1-based position — the "01" chip; the first card is the featured one. */
	index: number;
	title: string;
	description: string;
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

const DONATE_IMAGES = {
	hero: "/about/475203467_1007002848126180_7383496220452921499_n.jpg",
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
