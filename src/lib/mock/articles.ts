import type { LatestUpdateCategory } from "@/lib/mock/latest-updates";

export type ArticleCategory = LatestUpdateCategory;

export const ARTICLE_CATEGORIES: ArticleCategory[] = [
	"culture",
	"history",
	"language",
	"heritage",
	"society",
];

export type ArticleItem = {
	id: string;
	slug: string;
	title: string;
	excerpt: string;
	category: ArticleCategory;
	publishedAt: string;
	featured?: boolean;
	author?: string;
	readTime?: number;
	image: {
		url: string;
		alt?: string;
	};
};

type LocaleCopy = ArticleItem[];

const EN_ITEMS: LocaleCopy = [
	{
		id: "article-1",
		slug: "oral-history-preservation",
		title: "Why Oral History Matters More Than Ever for Kurdish Communities",
		excerpt:
			"Across regions and generations, spoken memory remains one of the most fragile — and most vital — forms of cultural record.",
		category: "heritage",
		publishedAt: "2026-05-28",
		featured: true,
		author: "Dr. Shilan Hassan",
		readTime: 8,
		image: { url: "/menu/2.jpg", alt: "Oral history recording session" },
	},
	{
		id: "article-2",
		slug: "manuscript-digitization",
		title: "Inside the Institute's Manuscript Digitization Project",
		excerpt:
			"A look at how fragile texts are photographed, catalogued, and made accessible without leaving the archives that have preserved them for centuries.",
		category: "history",
		publishedAt: "2026-05-22",
		featured: true,
		author: "Kamal Aziz",
		readTime: 6,
		image: { url: "/menu/1.jpg", alt: "Manuscript being digitized" },
	},
	{
		id: "article-3",
		slug: "kurdish-folk-music-revival",
		title: "How Folk Music Is Finding New Audiences in the Digital Archive",
		excerpt:
			"From wedding songs to regional laments, digitized recordings are connecting younger listeners with traditions their grandparents once carried by heart.",
		category: "culture",
		publishedAt: "2026-05-18",
		featured: true,
		author: "Rojin Karim",
		readTime: 5,
		image: { url: "/menu/5.jpg", alt: "Musician performing folk music" },
	},
	{
		id: "article-4",
		slug: "sorani-dialect-mapping",
		title: "Mapping Sorani Dialect Variations Across Southern Kurdistan",
		excerpt:
			"Linguists document subtle shifts in vocabulary and pronunciation that reveal centuries of migration and exchange.",
		category: "language",
		publishedAt: "2026-05-14",
		author: "Prof. Avin Taha",
		readTime: 7,
		image: { url: "/menu/6.jpg", alt: "Linguistic map of dialect regions" },
	},
	{
		id: "article-5",
		slug: "traditional-dress-exhibition",
		title: "Ten Garments That Tell the Story of Kurdish Identity",
		excerpt:
			"An exhibition of traditional dress from Hawraman to Botan shows how textile patterns encode regional history.",
		category: "culture",
		publishedAt: "2026-05-10",
		author: "Dilan Mohammed",
		readTime: 4,
		image: { url: "/menu/3.jpg", alt: "Traditional Kurdish dress on display" },
	},
	{
		id: "article-6",
		slug: "heritage-education-initiative",
		title: "Bringing Heritage Education Into Kurdish Classrooms",
		excerpt:
			"Teachers and archivists are co-developing curriculum modules that connect students with local history through primary sources.",
		category: "society",
		publishedAt: "2026-05-06",
		author: "Hawar Salih",
		readTime: 6,
		image: { url: "/menu/4.jpg", alt: "Students exploring heritage materials" },
	},
	{
		id: "article-7",
		slug: "photographic-archive-discovery",
		title: "Rare Photographs Resurface From a Private Family Collection",
		excerpt:
			"A donation of glass-plate negatives offers an unprecedented glimpse into daily life in Sulaymaniyah a century ago.",
		category: "history",
		publishedAt: "2026-05-02",
		author: "Narin Ali",
		readTime: 5,
		image: { url: "/menu/7.jpg", alt: "Historical photograph from family archive" },
	},
	{
		id: "article-8",
		slug: "kurdish-poetry-translation",
		title: "Translating Kurdish Poetry for a Global Readership",
		excerpt:
			"Scholars discuss the challenges of rendering meter, metaphor, and regional idiom without losing the voice of the original.",
		category: "language",
		publishedAt: "2026-04-28",
		author: "Dr. Berivan Noori",
		readTime: 9,
		image: { url: "/menu/1.jpg", alt: "Open poetry manuscript" },
	},
	{
		id: "article-9",
		slug: "hawraman-heritage-landscape",
		title: "Hawraman's Terraced Villages and the Living Heritage of the Mountains",
		excerpt:
			"How landscape, architecture, and seasonal migration patterns form an integrated cultural system worth protecting.",
		category: "heritage",
		publishedAt: "2026-04-24",
		author: "Rebaz Omar",
		readTime: 7,
		image: { url: "/menu/6.jpg", alt: "Hawraman mountain village terraces" },
	},
	{
		id: "article-10",
		slug: "women-in-oral-tradition",
		title: "Women's Voices in Kurdish Oral Tradition",
		excerpt:
			"From lullabies to lament songs, female narrators have carried knowledge that written archives often overlooked.",
		category: "society",
		publishedAt: "2026-04-20",
		author: "Shilan Hassan",
		readTime: 6,
		image: { url: "/menu/2.jpg", alt: "Elder woman sharing oral history" },
	},
	{
		id: "article-11",
		slug: "newroz-celebration-origins",
		title: "Newroz: Ritual, Resistance, and Renewal Across Generations",
		excerpt:
			"The spring festival carries symbolic weight that shifts with political context while retaining ancient fire rituals.",
		category: "culture",
		publishedAt: "2026-04-16",
		author: "Kamal Aziz",
		readTime: 5,
		image: { url: "/menu/5.jpg", alt: "Newroz fire celebration" },
	},
	{
		id: "article-12",
		slug: "archive-access-policy",
		title: "Opening the Archive: Access Policies for Researchers and Communities",
		excerpt:
			"Balancing scholarly access with community ownership when digitized collections return knowledge to source regions.",
		category: "society",
		publishedAt: "2026-04-12",
		author: "Institute Editorial",
		readTime: 4,
		image: { url: "/menu/4.jpg", alt: "Researchers in archive reading room" },
	},
	{
		id: "article-13",
		slug: "kurdish-cinema-retrospective",
		title: "A Retrospective of Kurdish Cinema From the 1970s to Today",
		excerpt:
			"Filmmakers and critics trace how regional cinema documented displacement, identity, and everyday life under constraint.",
		category: "culture",
		publishedAt: "2026-04-08",
		author: "Rojin Karim",
		readTime: 8,
		image: { url: "/menu/3.jpg", alt: "Film still from Kurdish cinema" },
	},
	{
		id: "article-14",
		slug: "ancient-settlement-excavation",
		title: "What Recent Excavations Reveal About Pre-Islamic Settlement Patterns",
		excerpt:
			"Archaeological teams in the Zagros foothills uncover evidence of trade routes that connected highland communities.",
		category: "history",
		publishedAt: "2026-04-04",
		author: "Prof. Avin Taha",
		readTime: 7,
		image: { url: "/menu/7.jpg", alt: "Archaeological excavation site" },
	},
	{
		id: "article-15",
		slug: "kurmanci-sorani-bridge",
		title: "Building Bridges Between Kurmancî and Sorani Literary Traditions",
		excerpt:
			"Editors and translators explore how cross-dialect publishing strengthens a shared literary heritage.",
		category: "language",
		publishedAt: "2026-03-30",
		author: "Dr. Berivan Noori",
		readTime: 6,
		image: { url: "/menu/1.jpg", alt: "Books in multiple Kurdish dialects" },
	},
	{
		id: "article-16",
		slug: "craft-revival-weaving",
		title: "Reviving Traditional Weaving Techniques in Contemporary Kurdistan",
		excerpt:
			"Artisans partner with the Institute to document patterns and train a new generation of textile makers.",
		category: "heritage",
		publishedAt: "2026-03-26",
		author: "Dilan Mohammed",
		readTime: 5,
		image: { url: "/menu/3.jpg", alt: "Traditional weaving loom" },
	},
	{
		id: "article-17",
		slug: "youth-heritage-ambassadors",
		title: "Youth Heritage Ambassadors Programme Launches Across Kurdistan",
		excerpt:
			"Young volunteers learn documentation skills and return to their communities as advocates for local archives.",
		category: "society",
		publishedAt: "2026-03-22",
		author: "Hawar Salih",
		readTime: 4,
		image: { url: "/menu/4.jpg", alt: "Youth volunteers at heritage workshop" },
	},
	{
		id: "article-18",
		slug: "radio-archive-digitization",
		title: "Digitizing Decades of Kurdish Radio Broadcasts",
		excerpt:
			"Reel-to-reel tapes from regional stations capture news, music, and political commentary from the mid-20th century.",
		category: "heritage",
		publishedAt: "2026-03-18",
		author: "Narin Ali",
		readTime: 6,
		image: { url: "/menu/2.jpg", alt: "Vintage radio broadcast equipment" },
	},
];

const KU_ITEMS: LocaleCopy = EN_ITEMS.map((item, i) => ({
	...item,
	id: `article-${i + 1}`,
	title: [
		"Çima Dîroka Devkî Niha Ji Her Demê Ji Bo Civakên Kurd Girîngtire",
		"Di Projeya Dîjîtalîzekirina Destnivîsan de Navend",
		"Stranên Gelêrî Çawa Di Arşîva Dîjîtal de Guhdarên Nû Dibînin",
		"Nexşekirina Guherînên Devokên Soranî Li Başûrê Kurdistanê",
		"Deh Cilên Ku Çîroka Nasnameya Kurdî Dibêjin",
		"Perwerdehiya Mîratê Anîn Nav Polên Kurdî",
		"Wêneyên Rare Ji Koleksiyona Malbatî ya Taybet Derdikevin Holê",
		"Wergerandina Şêrên Kurdî Ji Bo Xwendevanên Cîhanê",
		"Gundên Terasî yên Hewraman û Mîrata Zindî ya Çiyan",
		"Dengên Jinan Di Tradîsyona Devkî ya Kurdî de",
		"Newroz: Ayîn, Berxwedan û Nûjenkirin Li Seranserê Neslan",
		"Vekirina Arşîvê: Siyasetên Gihîştinê Ji Bo Lêkolêr û Civakan",
		"Retrospektîfek Ji Sînemaya Kurdî Ji 1970'an Heta Îro",
		"Tiştên Ku Kaziyên Dawî Li Ser Şopên Cihê Rûniştinê Berî Îslamê Vedibêjin",
		"Avakirina Piran Li Ser Tradîsyonên Wêjeyî yên Kurmancî û Soranî",
		"Ji Nû Ve Zindîkirina Teknikên Weavinga Kevneşopî Li Kurdistanê",
		"Bernameya Ambasadoren Mîratê yên Ciwan Li Seranserê Kurdistanê Dest Pê Dike",
		"Dîjîtalîzekirina Dehanekan Ji Weşanên Radyoya Kurdî",
	][i],
	excerpt: [
		"Li hemû herêm û neslan, bîra axaftî yek ji tundtirîn — û herî jîndar — formên tomarkirina çandî ye.",
		"Nêrînek li ser awayê ku nivîsên tuj têne wênekirin, katalogkirin û bi awayekî guncaw kirin.",
		"Ji stranên dawetê heta kilamên herêmî, tomarkirinên dîjîtal guhdarên ciwan bi kevneşopiyan girêdidin.",
		"Zimanzan guherînên hênik yên peyv û devokê tomar dikin ku sedsalan koçberî vedibêjin.",
		"Pêşangehek ji cilên kevneşopî ji Hewraman heta Botan nîşan dide ka desenên tekstîl dîrokê kod dikin.",
		"Mamoste û arşîvkar bi hev re modulên perwerdehiyê pêşve dibin.",
		"Bexşek ji neyatîfên camê re nêrînek bêhempa dike jiyana rojane ya Silêmaniyeyê sedsal berê.",
		"Lêkolêr li ser çetiniyên wergerandina metr, metafor û devokê diaxivin.",
		"Çawa peyzaj, mimarî û şopên koçberiyê forma pergalên çandî yên entegre dikin.",
		"Ji lorîyan heta kilamên kêfî, jinên çîrokgotar zanîn veşartî hildigirtin.",
		"Festîvala biharê giraniya sembolîk diguhere lê ayînên agirê kevn diparêze.",
		"Dengekî li ser gihîştina zanistî û xwedîtiya civakî li arşîvên dîjîtal.",
		"Sînemager û rexnevan şopên sînemaya herêmî ya koçberî û nasnameyê vedibêjin.",
		"Tîmên arkeolojî li pêşiya Zagros delîlên rêyên bazirganiyê vedibînin.",
		"Weşanger û werger li ser weşandina nav-devokî wekî xurtkirina mîrata wêjeyî diaxivin.",
		"Çêker bi Enstîtûyê re hevkariyê dikin ji bo tomarkirin û perwerdehiya nifşek nû.",
		"Ciwanên dilxwaz jêhatîbûnên belgekirinê fêr dibin û wekî parêzerên arşîva herêmî vedigerin.",
		"Qeydên reel-to-reel ji stasyonên herêmî nûçe, muzîk û şîroveyên siyasî tomar dikin.",
	][i],
}));

const CKB_ITEMS: LocaleCopy = EN_ITEMS.map((item, i) => ({
	...item,
	id: `article-${i + 1}`,
	title: [
		"بۆچی مێژووی شفاهی ئێستا لە هەموو کاتێک گرینگترە بۆ کۆمەڵگە کوردییەکان",
		"ناوەندی پڕۆژەی دیجیتاڵکردنی دەستنووسەکان",
		"چۆن گۆرانییە گەلەییەکان لە ئارشیڤی دیجیتاڵدا گوێگرانی نوێ دەدۆزنەوە",
		"نەخشەکێشانی جیاوازیی شێوەزارەکانی سورانی لە باشووری کوردستان",
		"دە جلێک کە چیرۆکی ناسنامەی کوردی دەگێڕنەوە",
		"هێنانی پەروەردەی میرات بۆ پۆلەکانی کوردی",
		"وێنەی دەگمەن لە کۆلێکشنێکی تایبەتی خێزانی دەردەکەوێت",
		"وەرگێڕانی شیعرەکانی کوردی بۆ خوێنەرانی جیهان",
		"گوندەکانی پلەپلەی هەورامان و میراتی زیندووی شاخەکان",
		"دەنگی ژنان لە نەریتی شفاهیی کوردی",
		"نەورۆز: ئایین، بەرگری و نوێکردنەوە بە درێژایی نەوەکان",
		"کردنەوەی ئارشیڤ: سیاسەتەکانی دەستگەیشتن بۆ توێژەران و کۆمەڵگاکان",
		"پێشبینینێک بۆ سینەمای کوردی لە ١٩٧٠ەکانەوە تا ئەمڕۆ",
		"ئەوەی کە کۆنپێکردنە نوێیەکان دەربارەی شوێنی نیشتەجێبوونی پێش ئیسلام دەردەخەن",
		"دروستکردنی پرد لە نێوان نەریتە ئەدەبییەکانی کورمانجی و سورانی",
		"زیندووکردنەوەی تەکنیکەکانی بەرگی نەریتی لە کوردستانی ئێستا",
		"بەرنامەی باڵیۆزانی میراتی گەنج لە سەرانسەری کوردستان دەستپێدەکات",
		"دیجیتاڵکردنی دەیان ساڵ پەخشی ڕادیۆی کوردی",
	][i],
	excerpt: [
		"لە سەرانسەری هەرێم و نەوەکاندا، یادەوەریی قسەکراو یەکێکە لە کەمترین — و گرینگترین — جۆرەکانی تۆمارکردنی کەلتووری.",
		"سەیرکردنێک بۆ چۆنیەتی وێنەگرتن، پۆلێنکردن و بەردەستخستنی دەقە لاوازەکان.",
		"لە گۆرانیی داوەتەوە تا غەمی هەرێمی، تۆمارە دیجیتاڵەکان گەنجان بە نەریتەکان دەبەستنەوە.",
		"زمانناسان گۆڕانکارییە وردەکانی وشە و دەربڕین تۆمار دەکەن.",
		"پێشانگایەکی جلی نەریتی لە هەورامان تا بوتان نیشان دەدات کە نموونەی قوماش مێژوو کۆد دەکات.",
		"مامۆستا و ئارشیڤکار پێکەوە مۆدیولی پەروەردەیی پەرەپێدەدەن.",
		"بەخشینێکی نێگەتیڤی شووشەیی سەیرکردنێکی بێوێنە دەدات بە ژیانی ڕۆژانەی سلێمانی.",
		"زانایان دەربارەی ئاستەنگەکانی وەرگێڕانی ڕیتم و مەتابۆر دەدوێن.",
		"چۆن دیمەن، تەلارسازی و کۆچی وەرزی سیستەمی کەلتووری یەکگرتوو دروست دەکات.",
		"لە لۆرییەوە تا غەمی، ژنانی چیرۆکگۆ هەژمار کراوە زانیاری هەڵگرتووە.",
		"جەژنی بەهار گرنگی هێماوی دەگۆڕێت بەڵام ئایینەکانی ئاگری کۆن دەپارێزێت.",
		"هاوسەنگکردنی دەستگەیشتنی زانستی و خاوەنداریی کۆمەڵایەتی لە ئارشیڤە دیجیتاڵەکان.",
		"فیلمساز و ڕەخنەگر شوێنی سینەمای هەرێمی کۆچ و ناسنامە دەنوێننەوە.",
		"تیمە ئەرکەۆلۆژییەکان لە پێشەوەی زاگرۆس بەڵگەی ڕێگای بازرگانی دەدۆزنەوە.",
		"بڵاوکەر و وەرگێڕ دەربارەی بڵاوکردنەوەی نێوان-شێوەزار وەک بەهێزکردنی میراتی ئەدەبی دەدوێن.",
		"پیشەسازان لەگەڵ ئینستیتووتدا هاوکاری دەکەن بۆ تۆمارکردن و ڕاهێنانی نەوەیەکی نوێ.",
		"خۆبەخشانی گەنج لێهاتوویی بەڵگەکردن فێردەبن و وەک پاڵپشتی ئارشیڤی ناوچەیی دەگەڕێنەوە.",
		"تەیپی reel-to-reel لە وێستگە هەرێمییەکان هەواڵ و مۆسیق و لێدوان سیاسی تۆمار دەکات.",
	][i],
}));

function withArticleImages(items: LocaleCopy): LocaleCopy {
	return items.map((item, index) => ({
		...item,
		image: {
			...item.image,
			url: `/articles/${(index % 10) + 1}.jpg`,
		},
	}));
}

const LOCALE_ITEMS: Record<string, LocaleCopy> = {
	en: withArticleImages(EN_ITEMS),
	ku: withArticleImages(KU_ITEMS),
	ckb: withArticleImages(CKB_ITEMS),
};

export const ARTICLES_PER_PAGE = 10;
export const SIDEBAR_ITEMS_LIMIT = 3;

export function getArticles(locale: string): ArticleItem[] {
	const items = LOCALE_ITEMS[locale] ?? EN_ITEMS;
	return [...items].sort(
		(a, b) =>
			new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime(),
	);
}

export function getFeaturedArticles(locale: string): ArticleItem[] {
	return getArticles(locale)
		.filter((item) => item.featured)
		.slice(0, SIDEBAR_ITEMS_LIMIT);
}

export function getLatestArticles(locale: string): ArticleItem[] {
	return getArticles(locale).slice(0, SIDEBAR_ITEMS_LIMIT);
}

export function getBentoArticles(locale: string): {
	hero: ArticleItem;
	rail: ArticleItem[];
	editorial: ArticleItem;
	wide: ArticleItem;
} {
	const items = getArticles(locale);
	const [hero, railA, railB, railC, railD, editorial, , wide] = items;
	return {
		hero,
		rail: [railA, railB, railC, railD],
		editorial,
		wide: wide ?? items[items.length - 1],
	};
}

export type ArticleFilter = {
	category?: string | null;
	query?: string | null;
};

export function isValidCategory(
	category: string,
): category is ArticleCategory {
	return (ARTICLE_CATEGORIES as string[]).includes(category);
}

export function filterArticles(
	items: ArticleItem[],
	{ category, query }: ArticleFilter,
): ArticleItem[] {
	let result = items;

	if (category && isValidCategory(category)) {
		result = result.filter((item) => item.category === category);
	}

	if (query?.trim()) {
		const q = query.trim().toLowerCase();
		result = result.filter(
			(item) =>
				item.title.toLowerCase().includes(q) ||
				item.excerpt.toLowerCase().includes(q),
		);
	}

	return result;
}

export function paginateArticles<T>(
	items: T[],
	page: number,
	perPage: number = ARTICLES_PER_PAGE,
): { items: T[]; totalPages: number; currentPage: number } {
	const totalPages = Math.max(1, Math.ceil(items.length / perPage));
	const currentPage = Math.min(Math.max(1, page), totalPages);
	const start = (currentPage - 1) * perPage;

	return {
		items: items.slice(start, start + perPage),
		totalPages,
		currentPage,
	};
}

export function formatArticleDate(
	isoDate: string,
	locale: string,
): string {
	return new Intl.DateTimeFormat(locale === "ckb" ? "ar-IQ" : locale, {
		year: "numeric",
		month: "short",
		day: "numeric",
	}).format(new Date(isoDate));
}
