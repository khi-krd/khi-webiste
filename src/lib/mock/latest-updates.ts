export type LatestUpdateCategory =
	| "culture"
	| "history"
	| "language"
	| "heritage"
	| "society";

export type LatestUpdateItem = {
	id: string;
	slug: string;
	title: string;
	excerpt: string;
	category: LatestUpdateCategory;
	image: {
		url: string;
		alt?: string;
	};
};

type LocaleCopy = LatestUpdateItem[];

const EN_ITEMS: LocaleCopy = [
	{
		id: "news-1",
		slug: "oral-history-preservation",
		title: "Why Oral History Matters More Than Ever for Kurdish Communities",
		excerpt:
			"Across regions and generations, spoken memory remains one of the most fragile — and most vital — forms of cultural record.",
		category: "heritage",
		image: {
			url: "/menu/2.jpg",
			alt: "Oral history recording session in a Kurdish community archive",
		},
	},
	{
		id: "news-2",
		slug: "manuscript-digitization",
		title: "Inside the Institute's Manuscript Digitization Project",
		excerpt:
			"A look at how fragile texts are photographed, catalogued, and made accessible without leaving the archives that have preserved them for centuries.",
		category: "history",
		image: {
			url: "/menu/1.jpg",
			alt: "Manuscript being digitized in the heritage archive",
		},
	},
	{
		id: "news-3",
		slug: "kurdish-folk-music-revival",
		title: "How Folk Music Is Finding New Audiences in the Digital Archive",
		excerpt:
			"From wedding songs to regional laments, digitized recordings are connecting younger listeners with traditions their grandparents once carried by heart.",
		category: "culture",
		image: {
			url: "/menu/5.jpg",
			alt: "Musician performing traditional Kurdish folk music",
		},
	},
	{
		id: "news-4",
		slug: "sorani-dialect-mapping",
		title: "Mapping Sorani Dialect Variations Across Southern Kurdistan",
		excerpt:
			"Linguists document subtle shifts in vocabulary and pronunciation that reveal centuries of migration and exchange.",
		category: "language",
		image: {
			url: "/menu/6.jpg",
			alt: "Linguistic map of Kurdish dialect regions",
		},
	},
	{
		id: "news-5",
		slug: "traditional-dress-exhibition",
		title: "Ten Garments That Tell the Story of Kurdish Identity",
		excerpt:
			"An exhibition of traditional dress from Hawraman to Botan shows how textile patterns encode regional history.",
		category: "culture",
		image: {
			url: "/menu/3.jpg",
			alt: "Traditional Kurdish dress on display",
		},
	},
	{
		id: "news-6",
		slug: "heritage-education-initiative",
		title: "Bringing Heritage Education Into Kurdish Classrooms",
		excerpt:
			"Teachers and archivists are co-developing curriculum modules that connect students with local history through primary sources.",
		category: "society",
		image: {
			url: "/menu/4.jpg",
			alt: "Students exploring heritage materials in a Kurdish classroom",
		},
	},
	{
		id: "news-7",
		slug: "photographic-archive-discovery",
		title: "Rare Photographs Resurface From a Private Family Collection",
		excerpt:
			"A donation of glass-plate negatives offers an unprecedented glimpse into daily life in Sulaymaniyah a century ago.",
		category: "history",
		image: {
			url: "/menu/7.jpg",
			alt: "Historical photograph from a Kurdish family archive",
		},
	},
];

const KU_ITEMS: LocaleCopy = [
	{
		id: "news-1",
		slug: "oral-history-preservation",
		title: "Çima Dîroka Devkî Niha Ji Her Demê Ji Bo Civakên Kurd Girîngtire",
		excerpt:
			"Li hemû herêm û neslan, bîra axaftî yek ji tundtirîn — û herî jîndar — formên tomarkirina çandî ye.",
		category: "heritage",
		image: {
			url: "/menu/2.jpg",
			alt: "Danişîna tomarkirina dîroka devkî li arşîva civakê",
		},
	},
	{
		id: "news-2",
		slug: "manuscript-digitization",
		title: "Di Projeya Dîjîtalîzekirina Destnivîsan de Navend",
		excerpt:
			"Nêrînek li ser awayê ku nivîsên tuj têne wênekirin, katalogkirin û bi awayekî guncaw kirin bê ku destan ji destan derkevin.",
		category: "history",
		image: {
			url: "/menu/1.jpg",
			alt: "Destnivîsek di arşîva mîratê de tê dîjîtalîzekirin",
		},
	},
	{
		id: "news-3",
		slug: "kurdish-folk-music-revival",
		title: "Stranên Gelêrî Çawa Di Arşîva Dîjîtal de Guhdarên Nû Dibînin",
		excerpt:
			"Ji stranên dawetê heta kilamên herêmî, tomarkirinên dîjîtal guhdarên ciwan bi kevneşopiyên ku bav û bavkalên wan bi dil xwedî dikirin girêdidin.",
		category: "culture",
		image: {
			url: "/menu/5.jpg",
			alt: "Stranbêjek stranên gelêrî yên kurdî dileyize",
		},
	},
	{
		id: "news-4",
		slug: "sorani-dialect-mapping",
		title: "Nexşekirina Guherînên Devokên Soranî Li Başûrê Kurdistanê",
		excerpt:
			"Zimanzan guherînên hênik yên peyv û devokê tomar dikin ku sedsalan koçberî û hevpariyê vedibêjin.",
		category: "language",
		image: {
			url: "/menu/6.jpg",
			alt: "Nexşeya zimanî ya herêmên devokên kurdî",
		},
	},
	{
		id: "news-5",
		slug: "traditional-dress-exhibition",
		title: "Deh Cilên Ku Çîroka Nasnameya Kurdî Dibêjin",
		excerpt:
			"Pêşangehek ji cilên kevneşopî ji Hewraman heta Botan nîşan dide ka desenên tekstîl çawa dîroka herêmî kod dikin.",
		category: "culture",
		image: {
			url: "/menu/3.jpg",
			alt: "Cilên kevneşopî yên kurdî li pêşangehê",
		},
	},
	{
		id: "news-6",
		slug: "heritage-education-initiative",
		title: "Perwerdehiya Mîratê Anîn Nav Polên Kurdî",
		excerpt:
			"Mamoste û arşîvkar bi hev re modulên perwerdehiyê pêşve dibin ku xwendekaran bi çavkaniyên herêmî girêdidin.",
		category: "society",
		image: {
			url: "/menu/4.jpg",
			alt: "Xwendekar di polê de bi materyalên mîratê dixebitin",
		},
	},
	{
		id: "news-7",
		slug: "photographic-archive-discovery",
		title: "Wêneyên Rare Ji Koleksiyona Malbatî ya Taybet Derdikevin Holê",
		excerpt:
			"Bexşek ji neyatîfên camê re nêrînek bêhempa dike jiyana rojane ya Silêmaniyeyê sedsal berê.",
		category: "history",
		image: {
			url: "/menu/7.jpg",
			alt: "Wêneyek dîrokî ji arşîva malbatî ya kurdî",
		},
	},
];

const CKB_ITEMS: LocaleCopy = [
	{
		id: "news-1",
		slug: "oral-history-preservation",
		title:
			"بۆچی مێژووی شفاهی ئێستا لە هەموو کاتێک گرینگترە بۆ کۆمەڵگە کوردییەکان",
		excerpt:
			"لە سەرانسەری هەرێم و نەوەکاندا، یادەوەریی قسەکراو یەکێکە لە کەمترین — و گرینگترین — جۆرەکانی تۆمارکردنی کەلتووری.",
		category: "heritage",
		image: {
			url: "/menu/2.jpg",
			alt: "دانیشتنی تۆمارکردنی مێژووی شفاهی لە ئارشیڤی کۆمەڵگا",
		},
	},
	{
		id: "news-2",
		slug: "manuscript-digitization",
		title: "ناوەندی پڕۆژەی دیجیتاڵکردنی دەستنووسەکان",
		excerpt:
			"سەیرکردنێک بۆ چۆنیەتی وێنەگرتن، پۆلێنکردن و بەردەستخستنی دەقە لاوازەکان بەبێ ئەوەی لە دەستی پارێزەرانیان دەربچێت.",
		category: "history",
		image: {
			url: "/menu/1.jpg",
			alt: "دەستنووسێک لە ئارشیڤی میراتدا دیجیتاڵ دەکرێت",
		},
	},
	{
		id: "news-3",
		slug: "kurdish-folk-music-revival",
		title:
			"چۆن گۆرانییە گەلەییەکان لە ئارشیڤی دیجیتاڵدا گوێگرانی نوێ دەدۆزنەوە",
		excerpt:
			"لە گۆرانیی داوەتەوە تا غەمی هەرێمی، تۆمارە دیجیتاڵەکان گوێگری گەنج بە نەریتەکانی باوباپ و دایکان دەبەستنەوە.",
		category: "culture",
		image: {
			url: "/menu/5.jpg",
			alt: "مۆزیسیان گۆرانیی گەلەیی کوردی دەژەنێت",
		},
	},
	{
		id: "news-4",
		slug: "sorani-dialect-mapping",
		title: "نەخشەکێشانی جیاوازیی شێوەزارەکانی سورانی لە باشووری کوردستان",
		excerpt:
			"زمانناسان گۆڕانکارییە وردەکانی وشە و دەربڕین تۆمار دەکەن کە سەدە ساڵ کۆچ و گۆڕانکاری دەردەخەن.",
		category: "language",
		image: {
			url: "/menu/6.jpg",
			alt: "نەخشەی زمانەوانی هەرێمەکانی شێوەزارەکانی کوردی",
		},
	},
	{
		id: "news-5",
		slug: "traditional-dress-exhibition",
		title: "دە جلێک کە چیرۆکی ناسنامەی کوردی دەگێڕنەوە",
		excerpt:
			"پێشانگایەکی جلی نەریتی لە هەورامان تا بوتان نیشان دەدات کە چۆن نموونەی قوماش مێژووی هەرێمی کۆد دەکات.",
		category: "culture",
		image: {
			url: "/menu/3.jpg",
			alt: "جلوبەرگی نەریتی کوردی لە پێشانگا",
		},
	},
	{
		id: "news-6",
		slug: "heritage-education-initiative",
		title: "هێنانی پەروەردەی میرات بۆ پۆلەکانی کوردی",
		excerpt:
			"مامۆستا و ئارشیڤکار پێکەوە مۆدیولی پەروەردەیی پەرەپێدەدەن کە قوتابیان بە سەرچاوەی ناوچەیی دەبەستنەوە.",
		category: "society",
		image: {
			url: "/menu/4.jpg",
			alt: "قوتابیان لە پۆلدا بە ماددەی میرات کاردەکەن",
		},
	},
	{
		id: "news-7",
		slug: "photographic-archive-discovery",
		title: "وێنەی دەگمەن لە کۆلێکشنێکی تایبەتی خێزانی دەردەکەوێت",
		excerpt:
			"بەخشینێکی نێگەتیڤی شووشەیی سەیرکردنێکی بێوێنە دەدات بە ژیانی ڕۆژانەی سلێمانی سەد ساڵ لەمەوبەر.",
		category: "history",
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

export function getLatestUpdates(locale: string): LatestUpdateItem[] {
	return LOCALE_ITEMS[locale] ?? EN_ITEMS;
}
