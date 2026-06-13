export type ImageCollectionItem = {
	id: string;
	slug: string;
	title: string;
	subtitle: string;
	catalogRef: string;
	image: {
		url: string;
		alt?: string;
	};
};

type LocaleCopy = ImageCollectionItem[];

const EN_ITEMS: LocaleCopy = [
	{
		id: "collection-1",
		slug: "the-mountain-keeps-us",
		title: "Traditional Architecture",
		subtitle: "Erbil & Sulaymaniyah",
		catalogRef: "Plate 01",
		image: {
			url: "/menu/4.jpg",
			alt: "Stone courtyard of a traditional Kurdish house",
		},
	},
	{
		id: "collection-2",
		slug: "threads-of-identity",
		title: "Textile Patterns",
		subtitle: "Duhok region",
		catalogRef: "Plate 02",
		image: {
			url: "/menu/6.jpg",
			alt: "Handwoven Kurdish textile with regional motifs",
		},
	},
	{
		id: "collection-3",
		slug: "city-of-poets",
		title: "Family Archives",
		subtitle: "Historic photographs",
		catalogRef: "Plate 03",
		image: {
			url: "/menu/7.jpg",
			alt: "Black and white photograph from a Kurdish family archive",
		},
	},
	{
		id: "collection-4",
		slug: "made-by-hand",
		title: "Craftsmanship",
		subtitle: "Metalwork & wood carving",
		catalogRef: "Plate 04",
		image: {
			url: "/menu/3.jpg",
			alt: "Traditional Kurdish dress and handcrafted details",
		},
	},
];

const KU_ITEMS: LocaleCopy = [
	{
		id: "collection-1",
		slug: "the-mountain-keeps-us",
		title: "Mîmariya Kevneşopî",
		subtitle: "Hewlêr & Silêmanî",
		catalogRef: "Plate 01",
		image: {
			url: "/menu/4.jpg",
			alt: "Avahiya kevneşopî ya kurdî",
		},
	},
	{
		id: "collection-2",
		slug: "threads-of-identity",
		title: "Desenên Tekstîlê",
		subtitle: "Herêma Dihokê",
		catalogRef: "Plate 02",
		image: {
			url: "/menu/6.jpg",
			alt: "Tekstîla kurdî ya bi destan hatî dokirin",
		},
	},
	{
		id: "collection-3",
		slug: "city-of-poets",
		title: "Arşîva Malbatî",
		subtitle: "Wêneyên dîrokî",
		catalogRef: "Plate 03",
		image: {
			url: "/menu/7.jpg",
			alt: "Wêneyek dîrokî ji arşîva malbatî",
		},
	},
	{
		id: "collection-4",
		slug: "made-by-hand",
		title: "Kariya Destan",
		subtitle: "Xemilandin & darxistin",
		catalogRef: "Plate 04",
		image: {
			url: "/menu/3.jpg",
			alt: "Cil û hunera destan a kurdî",
		},
	},
];

const CKB_ITEMS: LocaleCopy = [
	{
		id: "collection-1",
		slug: "the-mountain-keeps-us",
		title: "تەلارسازی نەریتی",
		subtitle: "هەولێر و سلێمانی",
		catalogRef: "Plate 01",
		image: {
			url: "/menu/4.jpg",
			alt: "حەوشەی بەردی ماڵێکی نەریتی کوردی",
		},
	},
	{
		id: "collection-2",
		slug: "threads-of-identity",
		title: "نموونەی قوماش",
		subtitle: "هەرێمی دهۆک",
		catalogRef: "Plate 02",
		image: {
			url: "/menu/6.jpg",
			alt: "قوماشی دەستی کوردی بە نموونەی هەرێمی",
		},
	},
	{
		id: "collection-3",
		slug: "city-of-poets",
		title: "ئارشیڤی خێزانی",
		subtitle: "وێنەی مێژوویی",
		catalogRef: "Plate 03",
		image: {
			url: "/menu/7.jpg",
			alt: "وێنەیەکی ڕەش و سپی لە ئارشیڤی خێزانی",
		},
	},
	{
		id: "collection-4",
		slug: "made-by-hand",
		title: "پیشەسازی دەستی",
		subtitle: "کاری کانزا و دار",
		catalogRef: "Plate 04",
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
