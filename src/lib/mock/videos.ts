export type VideoCategory =
	| "documentaries"
	| "performances"
	| "lectures"
	| "newsreels";

export type VideoItem = {
	id: string;
	slug: string;
	title: string;
	subtitle: string;
	category: VideoCategory;
	duration: string;
	image: {
		url: string;
		alt?: string;
	};
};

type LocaleCopy = VideoItem[];

const EN_ITEMS: LocaleCopy = [
	{
		id: "video-1",
		slug: "voices-of-the-mountains",
		title: "Voices of the Mountains",
		subtitle: "Oral histories from the Zagros highlands",
		category: "documentaries",
		duration: "42 min",
		image: {
			url: "/menu/4.jpg",
			alt: "Documentary poster showing mountain landscapes",
		},
	},
	{
		id: "video-2",
		slug: "dengbej-performance-hawraman",
		title: "Dengbêj Performance in Hawraman",
		subtitle: "A recorded evening of traditional storytelling song",
		category: "performances",
		duration: "18 min",
		image: {
			url: "/menu/6.jpg",
			alt: "Performance of a dengbêj singer in Hawraman",
		},
	},
	{
		id: "video-3",
		slug: "lecture-kurdish-manuscripts",
		title: "Kurdish Manuscripts in the Digital Age",
		subtitle: "Scholarly lecture on preservation and access",
		category: "lectures",
		duration: "55 min",
		image: {
			url: "/menu/1.jpg",
			alt: "Lecture on Kurdish manuscript digitization",
		},
	},
	{
		id: "video-4",
		slug: "newsreel-1960s-sulaymaniyah",
		title: "Sulaymaniyah, 1960s",
		subtitle: "Restored newsreel footage from the city archive",
		category: "newsreels",
		duration: "8 min",
		image: {
			url: "/menu/7.jpg",
			alt: "Historical newsreel footage of Sulaymaniyah",
		},
	},
	{
		id: "video-5",
		slug: "weaving-traditions-documentary",
		title: "Weaving Traditions",
		subtitle: "Documentary on textile crafts across Kurdistan",
		category: "documentaries",
		duration: "31 min",
		image: {
			url: "/menu/3.jpg",
			alt: "Documentary on Kurdish weaving traditions",
		},
	},
];

const KU_ITEMS: LocaleCopy = [
	{
		id: "video-1",
		slug: "voices-of-the-mountains",
		title: "Dengên Çiyan",
		subtitle: "Dîroka devkî ji bilindahiyên Zagrosê",
		category: "documentaries",
		duration: "42 deq",
		image: {
			url: "/menu/4.jpg",
			alt: "Posterê belgefîlmê li ser çiyayên Zagrosê",
		},
	},
	{
		id: "video-2",
		slug: "dengbej-performance-hawraman",
		title: "Performansa Dengbêj li Hewramanê",
		subtitle: "Tomarek êvarî ya strana çîrokbêjî ya kevneşopî",
		category: "performances",
		duration: "18 deq",
		image: {
			url: "/menu/6.jpg",
			alt: "Performansa dengbêjek li Hewramanê",
		},
	},
	{
		id: "video-3",
		slug: "lecture-kurdish-manuscripts",
		title: "Destnivîsên Kurdî di Çaxa Dîjîtal de",
		subtitle: "Dersa zanistî li ser parastin û gihîştinê",
		category: "lectures",
		duration: "55 deq",
		image: {
			url: "/menu/1.jpg",
			alt: "Ders li ser dîjîtalîzekirina destnivîsên kurdî",
		},
	},
	{
		id: "video-4",
		slug: "newsreel-1960s-sulaymaniyah",
		title: "Silêmanî, 1960an",
		subtitle: "Wêneyên nûçeyên arşîva bajarê hatine vegerandin",
		category: "newsreels",
		duration: "8 deq",
		image: {
			url: "/menu/7.jpg",
			alt: "Wêneyên dîrokî yên Silêmanî",
		},
	},
	{
		id: "video-5",
		slug: "weaving-traditions-documentary",
		title: "Tradîsyona Wevingê",
		subtitle: "Belgefîlm li ser hunera tekstîlê li seranserî Kurdistanê",
		category: "documentaries",
		duration: "31 deq",
		image: {
			url: "/menu/3.jpg",
			alt: "Belgefîlm li ser tradîsyona wevinga kurdî",
		},
	},
];

const CKB_ITEMS: LocaleCopy = [
	{
		id: "video-1",
		slug: "voices-of-the-mountains",
		title: "دەنگەکانی چیاکان",
		subtitle: "مێژووی شفاهی لە شاخەکانی زاگرۆس",
		category: "documentaries",
		duration: "٤٢ خولەک",
		image: {
			url: "/menu/4.jpg",
			alt: "پۆستەری بەڵگەنامە لەسەر دیمەنی چیاکان",
		},
	},
	{
		id: "video-2",
		slug: "dengbej-performance-hawraman",
		title: "پیشاندانی دەنگبێژ لە هەورامان",
		subtitle: "تۆمارێکی ئێواری گۆرانی چیرۆکگوتنی نەریتی",
		category: "performances",
		duration: "١٨ خولەک",
		image: {
			url: "/menu/6.jpg",
			alt: "پیشاندانی دەنگبێژێک لە هەورامان",
		},
	},
	{
		id: "video-3",
		slug: "lecture-kurdish-manuscripts",
		title: "دەستنووسە کوردییەکان لە سەردەمی دیجیتاڵ",
		subtitle: "وتاری زانستی لەسەر پاراستن و بەردەستبوون",
		category: "lectures",
		duration: "٥٥ خولەک",
		image: {
			url: "/menu/1.jpg",
			alt: "وتار لەسەر دیجیتاڵکردنی دەستنووسە کوردییەکان",
		},
	},
	{
		id: "video-4",
		slug: "newsreel-1960s-sulaymaniyah",
		title: "سلێمانی، ١٩٦٠ەکان",
		subtitle: "وێنەی هەواڵی گەڕێندراوەوە لە ئارشیڤی شار",
		category: "newsreels",
		duration: "٨ خولەک",
		image: {
			url: "/menu/7.jpg",
			alt: "وێنەی مێژوویی سلێمانی",
		},
	},
	{
		id: "video-5",
		slug: "weaving-traditions-documentary",
		title: "نەریتی بەرکردن",
		subtitle: "بەڵگەنامە لەسەر پیشەی قوماش لە سەرانسەری کوردستان",
		category: "documentaries",
		duration: "٣١ خولەک",
		image: {
			url: "/menu/3.jpg",
			alt: "بەڵگەنامە لەسەر نەریتی بەرکردنی کوردی",
		},
	},
];

const LOCALE_ITEMS: Record<string, LocaleCopy> = {
	en: EN_ITEMS,
	ku: KU_ITEMS,
	ckb: CKB_ITEMS,
};

export function getVideos(locale: string): VideoItem[] {
	return LOCALE_ITEMS[locale] ?? EN_ITEMS;
}
