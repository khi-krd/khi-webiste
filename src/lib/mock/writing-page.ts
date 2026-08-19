import { WRITING_DEMO_PDF_URL } from "@/lib/writing/pdf-url";
import { WRITINGS_STILL } from "@/lib/writing/still";
import type { BookGenre, ResolvedWritingCard } from "@/types/writing";

const DEMO_COVERS = [WRITINGS_STILL];

type DemoCopy = {
	title: string;
	writer: string;
	excerpt: string;
	genre: string;
};

const EN_DEMOS: DemoCopy[] = [
	{
		title: "Kurdish Identity in Modern Poetry",
		writer: "Dr. Leyla Aziz",
		excerpt:
			"How twentieth-century poets reframed national memory through metaphor, metre, and the politics of language choice.",
		genre: "Poetry",
	},
	{
		title: "Archive Ethics and Community Memory",
		writer: "Hêmin Salih",
		excerpt:
			"Preservation work must balance scholarly access with the consent and dignity of the communities whose stories are held.",
		genre: "Heritage",
	},
	{
		title: "Teaching Sorani Grammar in the Digital Classroom",
		writer: "Prof. Nîgar Reşîd",
		excerpt:
			"New pedagogical tools are helping teachers navigate dialect variation while building a shared literary standard.",
		genre: "Language",
	},
	{
		title: "Migration and Urban Identity in Kurdish Cities",
		writer: "Azad Karim",
		excerpt:
			"Demographic shifts across Sulaymaniyah, Erbil, and Diyarbakır reshape how communities narrate belonging and loss.",
		genre: "Society",
	},
	{
		title: "Folklore Collections of the Zagros",
		writer: "Rênas Muhammed",
		excerpt:
			"Field notes from oral histories gathered across mountain villages, tracing song, proverb, and seasonal ritual.",
		genre: "Folklore",
	},
	{
		title: "Philosophy and Kurdish Modernity",
		writer: "Dr. Şivan Omar",
		excerpt:
			"A survey of philosophical writing that shaped Kurdish intellectual life across the twentieth century.",
		genre: "Philosophy",
	},
	{
		title: "The Novel as Historical Witness",
		writer: "Ahmed Kerîm",
		excerpt:
			"Literary fiction as a lens on displacement, borderlands, and the everyday resilience of Kurdish families.",
		genre: "Novel",
	},
	{
		title: "Linguistic Atlas of Kurdistan",
		writer: "KHI Research Group",
		excerpt:
			"Mapping dialect variation, place names, and lexical change across Sorani and Kurmanji speech communities.",
		genre: "Linguistics",
	},
];

const KU_DEMOS: DemoCopy[] = [
	{
		title: "Nasnameya Kurdî di Helbesta Modern de",
		writer: "Dr. Leyla Aziz",
		excerpt:
			"Helbestvanên sedsala bîstîn bi metafor, metre û siyaseta hilbijartina zimanê bîra neteweyî ji nû ve çêdikin.",
		genre: "Şîir",
	},
	{
		title: "Etîka Arşîvê û Bîra Civakê",
		writer: "Hêmin Salih",
		excerpt:
			"Xebata parastinê divê balansa gihîştina zanistî bi razîbûn û rûmeta civakên ku çîrokên wan têne hilanîn de bigire.",
		genre: "Mîrat",
	},
	{
		title: "Fêrkirina Rêziman a Soranî di Pola Dîjîtal de",
		writer: "Prof. Nîgar Reşîd",
		excerpt:
			"Amûrên pedagojî yên nû alîkariya mamosteyan dikin ku guherîna devokî bi rê ve bibin û standardek edebî ya hevpar ava bikin.",
		genre: "Ziman",
	},
	{
		title: "Koçberî û Nasnameya Urban li Bajarên Kurdî",
		writer: "Azad Karim",
		excerpt:
			"Guherîna demografî li Silêmanî, Hewlêr û Amedê awayê ku civak çîroka girêdan û windakirinê dibêjin diguherîne.",
		genre: "Civak",
	},
	{
		title: "Koleksiyona Zargotina Zagrosê",
		writer: "Rênas Muhammed",
		excerpt:
			"Têbîniyên qadê ji dîroka devkî ya li gundên çiyayî, şopandina stran, pênivîs û ayînên demsalî.",
		genre: "Zargotina gelêrî",
	},
	{
		title: "Felsefe û Modernîtiya Kurdî",
		writer: "Dr. Şivan Omar",
		excerpt:
			"Pirsyarek li ser nivîsên felsefî yên ku jiyana ramanî ya Kurdî di sedsala bîstêm de şekil dabûn.",
		genre: "Felsefe",
	},
	{
		title: "Roman wek Şahidê Dîrokê",
		writer: "Ahmed Kerîm",
		excerpt:
			"Fiksiyona edebî wek camêrek li ser koçberî, sînor û berxwedana rojane ya malbatên Kurdî.",
		genre: "Roman",
	},
	{
		title: "Atlas a Zimanî ya Kurdistanê",
		writer: "Koma Lêkolînê ya EKK",
		excerpt:
			"Nexşekirina guherîna devokî, navên cihan û guherîna peyvokên li nav civakên Soranî û Kurmancî.",
		genre: "Zimanzanî",
	},
];

const CKB_DEMOS: DemoCopy[] = [
	{
		title: "ناسنامەی کوردی لە شیعری هاوچەرخدا",
		writer: "د. لەیلا عەزیز",
		excerpt:
			"چۆن شاعیرانی سەدەی بیستەم لە ڕێگەی متافۆر و مێتر و سیاسەتی هەڵبژاردنی زمانەوە یادەوەری نیشتمانی دووبارە چوارچێوە دەکەنەوە.",
		genre: "شیعر",
	},
	{
		title: "ئەخلاقی ئارشیڤ و یادەوەری کۆمەڵگا",
		writer: "حەمین ساڵح",
		excerpt:
			"کاری پاراستن دەبێت هاوسەنگی لە نێوان بەردەستبوونی زانستی و ڕەزامەندی و ڕێزگرتنی ئەو کۆمەڵگانە بگرێت کە چیرۆکەکانیان هەڵگیراون.",
		genre: "میرات",
	},
	{
		title: "فێرکردنی ڕێزمانی سۆرانی لە پۆلی دیجیتاڵدا",
		writer: "پ. نێگار ڕەشید",
		excerpt:
			"ئامرازە پەdagojییە نوێیەکان یارمەتی مامۆستایان دەدەن لە ڕێنمایی جیاوازیی شێوەزاردا و دروستکردنی ستانداردێکی ئەدەبی هاوبەش.",
		genre: "زمان",
	},
	{
		title: "کۆچ و ناسنامەی شارنشینی لە شارە کوردییەکاندا",
		writer: "ئازاد کریم",
		excerpt:
			"گۆڕانی دیمۆگرافی لە سلێمانی و هەولێر و ئامەدا چۆنیەتی گێڕانەوەی چیرۆکی سەر بەستن و لەدەستدان دەگۆڕێت.",
		genre: "کۆمەڵگا",
	},
	{
		title: "کۆکراوەی زارگوتنی زاگرۆس",
		writer: "ڕەنا محەمەد",
		excerpt:
			"تێبینیی مەیدانی لە مێژووی شفاهی کە لە گوندەکانی چیایدا کۆکراونەتەوە، شوێنکەوتنی گۆرانی و ئایین و ڕەوتە وەرزییەکان.",
		genre: "زارگوتن",
	},
	{
		title: "فەلسەفە و مۆدێرنێتی کوردی",
		writer: "د. شivan عومەر",
		excerpt:
			"پێداچوونەوە بە نووسینی فەلسەفی کە ژیانی ڕامانی کوردی لە سەدەی بیستەمدa دا ڕێکخست.",
		genre: "فەلسەفە",
	},
	{
		title: "ڕۆمان وەک شایەتی مێژوو",
		writer: "ئەحمەد کەریم",
		excerpt:
			"چیرۆکی ئەدەبی وەک ئاوێنەیەک بۆ koçberî، سنوور و بەرگریی ڕۆژانەی خێزانە کوردییەکان.",
		genre: "ڕۆمان",
	},
	{
		title: "ئەتڵەسی زمانەوانی کوردستان",
		writer: "گرووپی توێژینەوەی ئەکە",
		excerpt:
			"نەخشەکێشانی جیاوازی شێوەزار، ناوی شوێن و گۆڕانی وشەکان لە نێوان کۆمەڵگە سۆرانی و کورمانجییەکان.",
		genre: "زمانناسی",
	},
];

const LOCALE_DEMOS: Record<string, DemoCopy[]> = {
	en: EN_DEMOS,
	ku: KU_DEMOS,
	ckb: CKB_DEMOS,
};

const DEMO_GENRES: BookGenre[][] = [
	["POETRY"],
	["OTHER"],
	["LINGUISTICS"],
	["SOCIOLOGY"],
	["FOLKLORE"],
	["PHILOSOPHY"],
	["NOVEL"],
	["LINGUISTICS"],
];

const DEMO_SERIES = [
	"KHI Literary Series",
	"Heritage Editions",
	"Language Studies",
	"Urban Studies",
	"Folklore Collection",
	"Philosophy & Thought",
	"Contemporary Fiction",
	"Linguistic Atlas",
];

export const WRITING_DEMO_TOTAL = 24;

function buildDemoCard(
	locale: string,
	globalIndex: number,
): ResolvedWritingCard {
	const demos = LOCALE_DEMOS[locale] ?? EN_DEMOS;
	const demo = demos[globalIndex % demos.length] as DemoCopy;
	const order = globalIndex + 1;
	const coverIndex = globalIndex % DEMO_COVERS.length;

	return {
		id: 10_000 + order,
		title: demo.title,
		writer: demo.writer,
		excerpt: demo.excerpt,
		coverUrl: DEMO_COVERS[coverIndex],
		hoverCoverUrl: DEMO_COVERS[(coverIndex + 1) % DEMO_COVERS.length] ?? null,
		genres: DEMO_GENRES[globalIndex % DEMO_GENRES.length] ?? ["OTHER"],
		freeTextGenre: demo.genre,
		tags: [],
		keywords: [],
		topicName: null,
		seriesName: DEMO_SERIES[globalIndex % DEMO_SERIES.length] ?? null,
		publishedByInstitute: order % 2 === 0,
		seriesOrderLabel: String(order).padStart(2, "0"),
		fileUrl: WRITING_DEMO_PDF_URL,
		fileFormat: "PDF",
		pageCount: 120 + order * 15,
		fileSizeBytes: 2_097_152 + order * 524_288,
	};
}

export function getAllDemoWritingCards(locale: string): ResolvedWritingCard[] {
	return Array.from({ length: WRITING_DEMO_TOTAL }, (_, index) =>
		buildDemoCard(locale, index),
	);
}

export function getDemoWritingCards(
	locale: string,
	page = 1,
	size = 4,
): {
	items: ResolvedWritingCard[];
	totalPages: number;
	totalElements: number;
	currentPage: number;
	empty: boolean;
} {
	const totalElements = WRITING_DEMO_TOTAL;
	const totalPages = Math.ceil(totalElements / size);
	const currentPage = Math.min(Math.max(1, page), totalPages);
	const start = (currentPage - 1) * size;

	const itemCount = Math.min(size, totalElements - start);
	const items = Array.from({ length: itemCount }, (_, index) =>
		buildDemoCard(locale, start + index),
	);

	return {
		items,
		totalPages,
		totalElements,
		currentPage,
		empty: items.length === 0,
	};
}
