export type WritingCategory =
	| "culture"
	| "history"
	| "language"
	| "heritage"
	| "society";

export type WritingItem = {
	id: string;
	slug: string;
	title: string;
	excerpt: string;
	author: string;
	readTime: string;
	category: WritingCategory;
	image?: {
		url: string;
		alt?: string;
	};
};

type LocaleCopy = WritingItem[];

const EN_ITEMS: LocaleCopy = [
	{
		id: "writing-1",
		slug: "kurdish-identity-in-modern-poetry",
		title: "Kurdish Identity in Modern Poetry",
		excerpt:
			"How twentieth-century poets reframed national memory through metaphor, metre, and the politics of language choice.",
		author: "Dr. Leyla Aziz",
		readTime: "12",
		category: "culture",
		image: { url: "/menu/5.jpg", alt: "Open poetry anthology" },
	},
	{
		id: "writing-2",
		slug: "archive-ethics-and-community-memory",
		title: "Archive Ethics and Community Memory",
		excerpt:
			"Preservation work must balance scholarly access with the consent and dignity of the communities whose stories are held.",
		author: "Hêmin Salih",
		readTime: "9",
		category: "heritage",
		image: { url: "/menu/2.jpg", alt: "Community archive consultation" },
	},
	{
		id: "writing-3",
		slug: "sorani-grammar-in-education",
		title: "Teaching Sorani Grammar in the Digital Classroom",
		excerpt:
			"New pedagogical tools are helping teachers navigate dialect variation while building a shared literary standard.",
		author: "Prof. Nîgar Reşîd",
		readTime: "15",
		category: "language",
		image: { url: "/menu/6.jpg", alt: "Language classroom materials" },
	},
	{
		id: "writing-4",
		slug: "migration-and-urban-identity",
		title: "Migration and Urban Identity in Kurdish Cities",
		excerpt:
			"Demographic shifts across Sulaymaniyah, Erbil, and Diyarbakır reshape how communities narrate belonging and loss.",
		author: "Azad Karim",
		readTime: "11",
		category: "society",
		image: { url: "/menu/7.jpg", alt: "Urban street scene in a Kurdish city" },
	},
];

const KU_ITEMS: LocaleCopy = [
	{
		id: "writing-1",
		slug: "kurdish-identity-in-modern-poetry",
		title: "Nasnameya Kurdî di Helbesta Modern de",
		excerpt:
			"Helbestvanên sedsala bîstîn bi metafor, metre û siyaseta hilbijartina zimanê bîra neteweyî ji nû ve çêdikin.",
		author: "Dr. Leyla Aziz",
		readTime: "12",
		category: "culture",
		image: { url: "/menu/5.jpg", alt: "Antolojiya helbestê vekirî" },
	},
	{
		id: "writing-2",
		slug: "archive-ethics-and-community-memory",
		title: "Etîka Arşîvê û Bîra Civakê",
		excerpt:
			"Xebata parastinê divê balansa gihîştina zanistî bi razîbûn û rûmeta civakên ku çîrokên wan têne hilanîn de bigire.",
		author: "Hêmin Salih",
		readTime: "9",
		category: "heritage",
		image: { url: "/menu/2.jpg", alt: "Danûstandina arşîva civakî" },
	},
	{
		id: "writing-3",
		slug: "sorani-grammar-in-education",
		title: "Fêrkirina Rêziman a Soranî di Pola Dîjîtal de",
		excerpt:
			"Amûrên pedagojî yên nû alîkariya mamosteyan dikin ku guherîna devokî bi rê ve bibin û standardek edebî ya hevpar ava bikin.",
		author: "Prof. Nîgar Reşîd",
		readTime: "15",
		category: "language",
		image: { url: "/menu/6.jpg", alt: "Materyalên pola zimanê" },
	},
	{
		id: "writing-4",
		slug: "migration-and-urban-identity",
		title: "Koçberî û Nasnameya Urban li Bajarên Kurdî",
		excerpt:
			"Guherîna demografî li Silêmanî, Hewlêr û Amedê awayê ku civak çîroka girêdan û windakirinê dibêjin diguherîne.",
		author: "Azad Karim",
		readTime: "11",
		category: "society",
		image: { url: "/menu/7.jpg", alt: "Dîmena kolanê li bajarê kurdî" },
	},
];

const CKB_ITEMS: LocaleCopy = [
	{
		id: "writing-1",
		slug: "kurdish-identity-in-modern-poetry",
		title: "ناسنامەی کوردی لە شیعری هاوچەرخدا",
		excerpt:
			"چۆن شاعیرانی سەدەی بیستەم لە ڕێگەی مетаفۆر و مێتر و سیاسەتی هەڵبژاردنی زمانەوە یادەوەری نیشتمانی دووبارە چوارچێوە دەکەنەوە.",
		author: "د. لەیلا عەزیز",
		readTime: "12",
		category: "culture",
		image: { url: "/menu/5.jpg", alt: "هەڵبژاردەی شیعر کراوە" },
	},
	{
		id: "writing-2",
		slug: "archive-ethics-and-community-memory",
		title: "ئەخلاقی ئارشیڤ و یادەوەری کۆمەڵگا",
		excerpt:
			"کاری پاراستن دەبێت هاوسەنگی لە نێوان بەردەستبوونی زانستی و ڕەزامەندی و ڕێزگرتنی ئەو کۆمەڵگانە بگرێت کە چیرۆکەکانیان هەڵگیراون.",
		author: "حەمین ساڵح",
		readTime: "9",
		category: "heritage",
		image: { url: "/menu/2.jpg", alt: "گفتوگۆی ئارشیڤی کۆمەڵایەتی" },
	},
	{
		id: "writing-3",
		slug: "sorani-grammar-in-education",
		title: "فێرکردنی ڕێزمانی سۆرانی لە پۆلی دیجیتاڵدا",
		excerpt:
			"ئامرازە پەdagojییە نوێیەکان یارمەتی مامۆستایان دەدەن لە ڕێنمایی جیاوازیی شێوەزاردا و دروستکردنی ستانداردێکی ئەدەبی هاوبەش.",
		author: "پ. نێگار ڕەشید",
		readTime: "15",
		category: "language",
		image: { url: "/menu/6.jpg", alt: "ماددەکانی پۆلی زمان" },
	},
	{
		id: "writing-4",
		slug: "migration-and-urban-identity",
		title: "کۆچ و ناسنامەی شارنشینی لە شارە کوردییەکاندا",
		excerpt:
			"گۆڕانی دیمۆگرافی لە سلێمانی و هەولێر و ئامەدا چۆنیەتی گێڕانەوەی چیرۆکی سەر بەستن و لەدەستدان دەگۆڕێت.",
		author: "ئازاد کریم",
		readTime: "11",
		category: "society",
		image: { url: "/menu/7.jpg", alt: "دیمەنی شەقام لە شارێکی کوردی" },
	},
];

const LOCALE_ITEMS: Record<string, LocaleCopy> = {
	en: EN_ITEMS,
	ku: KU_ITEMS,
	ckb: CKB_ITEMS,
};

export function getWritings(locale: string): WritingItem[] {
	return LOCALE_ITEMS[locale] ?? EN_ITEMS;
}
