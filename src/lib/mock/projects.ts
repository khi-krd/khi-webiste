export type ProjectItem = {
	id: string;
	slug: string;
	title: string;
	subtitle: string;
	image: {
		url: string;
		alt?: string;
	};
};

type LocaleCopy = ProjectItem[];

const EN_ITEMS: LocaleCopy = [
	{
		id: "project-1",
		slug: "oral-history-archive",
		title: "Oral History Archive",
		subtitle: "Preserving spoken memory across generations",
		image: {
			url: "/menu/2.jpg",
			alt: "Recording session for the oral history archive",
		},
	},
	{
		id: "project-2",
		slug: "manuscript-digitization",
		title: "Manuscript Digitization",
		subtitle: "Making fragile texts accessible to scholars",
		image: {
			url: "/menu/1.jpg",
			alt: "Manuscript being digitized in the heritage archive",
		},
	},
	{
		id: "project-3",
		slug: "folk-music-collection",
		title: "Folk Music Collection",
		subtitle: "Digitizing regional songs and performances",
		image: {
			url: "/menu/5.jpg",
			alt: "Musician performing traditional Kurdish folk music",
		},
	},
	{
		id: "project-4",
		slug: "traditional-dress-archive",
		title: "Traditional Dress Archive",
		subtitle: "Documenting textile patterns and regional identity",
		image: {
			url: "/menu/3.jpg",
			alt: "Traditional Kurdish dress on display",
		},
	},
	{
		id: "project-5",
		slug: "photographic-heritage",
		title: "Photographic Heritage",
		subtitle: "Cataloguing historic images from Kurdish communities",
		image: {
			url: "/menu/7.jpg",
			alt: "Historical photograph from a Kurdish family archive",
		},
	},
];

const KU_ITEMS: LocaleCopy = [
	{
		id: "project-1",
		slug: "oral-history-archive",
		title: "Arşîva Dîroka Devkî",
		subtitle: "Parastina bîra axaftî li ser neslan",
		image: {
			url: "/menu/2.jpg",
			alt: "Danişîna tomarkirina dîroka devkî",
		},
	},
	{
		id: "project-2",
		slug: "manuscript-digitization",
		title: "Dîjîtalîzekirina Destnivîsan",
		subtitle: "Destnivîsên tuj ji zanistvanan re guncaw kirin",
		image: {
			url: "/menu/1.jpg",
			alt: "Destnivîsek di arşîva mîratê de tê dîjîtalîzekirin",
		},
	},
	{
		id: "project-3",
		slug: "folk-music-collection",
		title: "Koleksiyona Stranên Gelêrî",
		subtitle: "Tomarkirina stran û performansên herêmî",
		image: {
			url: "/menu/5.jpg",
			alt: "Stranbêjek stranên gelêrî yên kurdî dileyize",
		},
	},
	{
		id: "project-4",
		slug: "traditional-dress-archive",
		title: "Arşîva Cilên Kevneşopî",
		subtitle: "Belgekirina desenên tekstîl û nasnameya herêmî",
		image: {
			url: "/menu/3.jpg",
			alt: "Cilên kevneşopî yên kurdî li pêşangehê",
		},
	},
	{
		id: "project-5",
		slug: "photographic-heritage",
		title: "Mîrata Wêneyan",
		subtitle: "Katalogkirina wêneyên dîrokî yên civakên kurdî",
		image: {
			url: "/menu/7.jpg",
			alt: "Wêneyek dîrokî ji arşîva malbatî ya kurdî",
		},
	},
];

const CKB_ITEMS: LocaleCopy = [
	{
		id: "project-1",
		slug: "oral-history-archive",
		title: "ئارشیڤی مێژووی شفاهی",
		subtitle: "پاراستنی یادەوەریی قسەکراو لە نەوەکاندا",
		image: {
			url: "/menu/2.jpg",
			alt: "دانیشتنی تۆمارکردنی مێژووی شفاهی",
		},
	},
	{
		id: "project-2",
		slug: "manuscript-digitization",
		title: "دیجیتاڵکردنی دەستنووسەکان",
		subtitle: "بەردەستخستنی دەقە لاوازەکان بۆ زانایان",
		image: {
			url: "/menu/1.jpg",
			alt: "دەستنووسێک لە ئارشیڤی میراتدا دیجیتاڵ دەکرێت",
		},
	},
	{
		id: "project-3",
		slug: "folk-music-collection",
		title: "کۆلێکشنەی گۆرانیی گەلەیی",
		subtitle: "دیجیتاڵکردنی گۆرانی و پیشاندانی هەرێمی",
		image: {
			url: "/menu/5.jpg",
			alt: "مۆزیسیان گۆرانیی گەلەیی کوردی دەژەنێت",
		},
	},
	{
		id: "project-4",
		slug: "traditional-dress-archive",
		title: "ئارشیڤی جلی نەریتی",
		subtitle: "بەڵگەکردنی نموونەی قوماش و ناسنامەی هەرێمی",
		image: {
			url: "/menu/3.jpg",
			alt: "جلوبەرگی نەریتی کوردی لە پێشانگا",
		},
	},
	{
		id: "project-5",
		slug: "photographic-heritage",
		title: "میراتی وێنەیی",
		subtitle: "پۆلێنکردنی وێنەی مێژوویی لە کۆمەڵگە کوردییەکان",
		image: {
			url: "/menu/7.jpg",
			alt: "وێنەیەکی مێژوویی لە ئارشیڤی خێزانی کوردی",
		},
	},
];

const LOCALE_ITEMS: Record<string, LocaleCopy> = {
	en: EN_ITEMS,
	ku: KU_ITEMS,
	ckb: CKB_ITEMS,
};

export function getProjects(locale: string): ProjectItem[] {
	return LOCALE_ITEMS[locale] ?? EN_ITEMS;
}
