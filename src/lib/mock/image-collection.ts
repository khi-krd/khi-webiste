export type ImageCollectionItem = {
	id: string;
	slug: string;
	title: string;
	subtitle: string;
	image: {
		url: string;
		alt?: string;
	};
};

type LocaleCopy = ImageCollectionItem[];

const EN_ITEMS: LocaleCopy = [
	{
		id: "collection-1",
		slug: "traditional-architecture",
		title: "Traditional Architecture",
		subtitle: "Erbil & Sulaymaniyah",
		image: {
			url: "/menu/4.jpg",
			alt: "Stone courtyard of a traditional Kurdish house",
		},
	},
	{
		id: "collection-2",
		slug: "textile-patterns",
		title: "Textile Patterns",
		subtitle: "Duhok region",
		image: {
			url: "/menu/6.jpg",
			alt: "Handwoven Kurdish textile with regional motifs",
		},
	},
	{
		id: "collection-3",
		slug: "family-archives",
		title: "Family Archives",
		subtitle: "Historic photographs",
		image: {
			url: "/menu/7.jpg",
			alt: "Black and white photograph from a Kurdish family archive",
		},
	},
	{
		id: "collection-4",
		slug: "craftsmanship",
		title: "Craftsmanship",
		subtitle: "Metalwork & wood carving",
		image: {
			url: "/menu/3.jpg",
			alt: "Traditional Kurdish dress and handcrafted details",
		},
	},
];

const KU_ITEMS: LocaleCopy = [
	{
		id: "collection-1",
		slug: "traditional-architecture",
		title: "Mîmariya Kevneşopî",
		subtitle: "Hewlêr & Silêmanî",
		image: {
			url: "/menu/4.jpg",
			alt: "Avahiya kevneşopî ya kurdî",
		},
	},
	{
		id: "collection-2",
		slug: "textile-patterns",
		title: "Desenên Tekstîlê",
		subtitle: "Herêma Dihokê",
		image: {
			url: "/menu/6.jpg",
			alt: "Tekstîla kurdî ya bi destan hatî dokirin",
		},
	},
	{
		id: "collection-3",
		slug: "family-archives",
		title: "Arşîva Malbatî",
		subtitle: "Wêneyên dîrokî",
		image: {
			url: "/menu/7.jpg",
			alt: "Wêneyek dîrokî ji arşîva malbatî",
		},
	},
	{
		id: "collection-4",
		slug: "craftsmanship",
		title: "Kariya Destan",
		subtitle: "Xemilandin & darxistin",
		image: {
			url: "/menu/3.jpg",
			alt: "Cil û hunera destan a kurdî",
		},
	},
];

const CKB_ITEMS: LocaleCopy = [
	{
		id: "collection-1",
		slug: "traditional-architecture",
		title: "تەلارسازی نەریتی",
		subtitle: "هەولێر و سلێمانی",
		image: {
			url: "/menu/4.jpg",
			alt: "حەوشەی بەردی ماڵێکی نەریتی کوردی",
		},
	},
	{
		id: "collection-2",
		slug: "textile-patterns",
		title: "نموونەی قوماش",
		subtitle: "هەرێمی دهۆک",
		image: {
			url: "/menu/6.jpg",
			alt: "قوماشی دەستی کوردی بە نموونەی هەرێمی",
		},
	},
	{
		id: "collection-3",
		slug: "family-archives",
		title: "ئارشیڤی خێزانی",
		subtitle: "وێنەی مێژوویی",
		image: {
			url: "/menu/7.jpg",
			alt: "وێنەیەکی ڕەش و سپی لە ئارشیڤی خێزانی",
		},
	},
	{
		id: "collection-4",
		slug: "craftsmanship",
		title: "پیشەسازی دەستی",
		subtitle: "کاری کانزا و دار",
		image: {
			url: "/menu/3.jpg",
			alt: "جلوبەرگ و وردەکاری دەستی کوردی",
		},
	},
];

const LOCALE_ITEMS: Record<string, LocaleCopy> = {
	en: EN_ITEMS,
	ku: KU_ITEMS,
	ckb: CKB_ITEMS,
};

export function getImageCollection(locale: string): ImageCollectionItem[] {
	return LOCALE_ITEMS[locale] ?? EN_ITEMS;
}
