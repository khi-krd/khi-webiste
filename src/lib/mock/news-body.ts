import type { MediaItem, MediaKind } from "@/types/media";

export type NewsBodyExtras = {
	description: string;
	coverMediaType?: MediaKind | null;
	coverThumbnailUrl?: string | null;
	mediaGallery: MediaItem[];
	tags: string[];
};

type LocaleBodies = Partial<Record<string, NewsBodyExtras>>;

function media(
	url: string,
	kind: MediaKind = "IMAGE",
	caption: string | null = null,
	thumbnailUrl: string | null = null,
	sortOrder = 0,
): MediaItem {
	return { url, kind, caption, thumbnailUrl, sortOrder };
}

function gallery(...items: MediaItem[]): MediaItem[] {
	return items.map((item, index) => ({ ...item, sortOrder: index }));
}

const CKB_BODIES: LocaleBodies = {
	"oral-history-preservation": {
		description: `<p>لە گوندەکانی شاخ و ناوچەکانی شاردا، چیرۆکەکان هێشتا زۆرجار لەسەر قاپی چا و لە نێو مەجلیسدا دەگوترێن — بەڵام ئەو دەنگانە کەمتر و کەمتر دەمێننەوە. مێژووی شفاهی یەکێکە لە کەمترین — و گرینگترین — جۆرەکانی تۆمارکردنی کەلتووری کوردی.</p>
<h2>بۆچی ئێستا گرینگە</h2>
<p>لە دوای چەندین ساڵ جەنگ، کۆچ و گۆڕانی ژیانی شارنشینی، زۆرێک لە چیرۆکگۆکان بەبێ تۆمارکردن لەناوچوون. ئەو زانیارییانەی کە لە دەفتەر و کتێبدا نەنووسراون — ناسنامەی خێزان، نەریتی ئاینی، ناسینی ڕووەک و دەرمان، و چیرۆکی کۆچ — لە دەنگی خۆیاندا دەمێننەوە.</p>
<p>ئینستیتووت لە ساڵی ٢٠٢٠ەوە بەرنامەیەکی تۆمارکردنی مەیدانی دەستپێکرد کە تاکە میکرۆفۆنەکەی لە ژوورێکی مەجلیسەوە گەورەبووە بۆ تۆڕێک لە توێژەرانی مەیدانی لە هەولێر، سلێمانی، دهۆک و ناوچەکانی دیکە.</p>
<blockquote>هەر دەنگێک کە ئارشیڤ دەکرێت، پەڕەیەکە لە کتێبێک کە لە یەک نەوەیەکدا لەناو دەچێت.</blockquote>
<h2>چی تۆمار دەکەین</h2>
<p>چاوپێکەوتنەکان شاخەنی نەژادی خێزان، مێژووی گوند، زانیاری پیشەسازی، و گۆرانییەکانی منداڵی دەگرنەوە. هەر دانیشتنێک بە شێوەزاری قسەکەر تۆمار دەکرێت، لەگەڵ ڕەزامەندی نووسراو و کورتەیەکی دوو زمانە لە کاتی گونجاودا.</p>
<figure><img src="/news/2.jpg" alt="دانیشتنی تۆمارکردنی مێژووی شفاهی" /><figcaption>دانیشتنی تۆمارکردن لە هەولێر، ٢٠٢٥ — چاوپێکەوتن لەگەڵ کەسایەتییەکی کۆمەڵایەتی بۆ نەخشەکێشانی شێوەزار.</figcaption></figure>
<h2>کێ دەتوانێت ئارشیڤەکە بەکاربهێنێت</h2>
<p>توێژەران، ڕۆژنامەنووسان و ئەندامانی خێزان دەتوانن لە ڕێگەی ژووری خوێندنەوەی ئینستیتووتەوە داوای دەستگەیشتن بکەن. ناوەڕۆکی هەستیار — ناو، شوێن یان شایەتی سیاسی — دەتوانرێت بە داوای چیرۆکگۆ بۆ ماوەیەکی دیاریکراو یان بە هەمیشەیی سنووردار بکرێت.</p>`,
		coverMediaType: "IMAGE",
		tags: ["مێژووی شفاهی", "ئارشیڤ", "شێوەزار", "گوند"],
		mediaGallery: gallery(
			media("/news/3.jpg", "IMAGE", "توێژەری مەیدانی لەگەڵ چیرۆکگۆیەکی گەنجی"),
			media(
				"/audio/sample-1.m4a",
				"AUDIO",
				"وەرگێڕەیەکی کورت لە چاوپێکەوتنێک — گۆرانییەکی لۆری",
			),
			media("/news/4.jpg", "IMAGE", "میکرۆفۆن و تۆمارکەری دەنگی مەیدانی"),
			media(
				"/video/wave.mp4",
				"VIDEO",
				"کورتە فیلمێک لە پرۆسەی تۆمارکردن",
				"/news/2.jpg",
			),
		),
	},
	"manuscript-digitization": {
		description: `<p>لە ناو کۆگاکانی کتێبخانە تایبەتەکان و مزگەوتە کۆنەکاندا، هەزاران لاپەڕەی دەستنووس بە هۆی کەنەپەڕی، ڕەشەبا و کۆچی خێزانەوە لە مەترسی لەناوچووندا دەمێننەوە. پڕۆژەی دیجیتاڵکردنی ئینستیتووت ئەو دەقانە دەگۆڕێت بۆ سەرچاوەیەکی گشتی بۆ توێژان — بەبێ ئەوەی دەستنووسە ڕەسەنەکان شوێنیان بگۆڕێت.</p>
<h2>پرۆسەی دیجیتاڵکردن</h2>
<p>هەر لاپەڕەیەک لەژێر ڕووناکی کۆنترۆڵکراودا وێنەگیراوە، پاشان لە کاتی خوێندنەویدا ڕۆشنویسی دەکرێت. مێتاداتاکان دوو زمانەن و بە ئینستیتووتە هەڵگرەکانەوە بەستراونەتەوە.</p>
<p>تیمەکەمان لەگەڵ کتێبخانەوان و خاوەن کۆلێکشنەکان هاوکاری دەکات بۆ ئەوەی هەر دەستنووسێک مێژووی خۆی و مەرجەکانی بڵاوکردنەوەی بە دروستی تۆمار بکرێت.</p>
<blockquote>هەر لاپەڕەیەکی پارێزراو، دەرگایەکە بۆ توێژەرێک کە لەوانەیە هەرگیز ئارشیڤی ڕەسەن نەبینێت.</blockquote>
<h2>دەستگەیشتن بۆ توێژەران</h2>
<p>دوای تەواوکردنی مەرحەلەی یەکەم، زیاتر لە ٣٥٠ دەستنووس لە پۆرتاڵی خوێندنەوەی ئینستیتووتدا بەردەستن. گەڕان بەپێی سەردێڕ، ساڵ و شوێنی دۆزینەوە ئاسانکراوە.</p>
<figure><img src="/news/1.jpg" alt="دیجیتاڵکردنی دەستنووس" /><figcaption>کارگێڕی وێنەگرتن لە ژوورێکی پاراستنی دەستنووس لە سلێمانی.</figcaption></figure>`,
		coverMediaType: "IMAGE",
		tags: ["دەستنووس", "دیجیتاڵکردن", "کتێبخانە", "توێژین"],
		mediaGallery: gallery(
			media("/news/1.jpg", "IMAGE", "لاپەڕەی دەستنووس پێش پاراستن"),
			media("/news/5.jpg", "IMAGE", "وێستگەی دیجیتاڵکردن لە ئینستیتووت"),
			media("/news/6.jpg", "IMAGE", "تیمی کتalogکردن لەگەڵ دەستنووسێکی نوێ"),
		),
	},
	"kurdish-folk-music-revival": {
		description: `<p>گۆرانییە گەلەییەکانی کوردستان — لە گۆرانی داوەتەوە تا غەم و لۆری — سەردەمییەکی نوێیان بەدەستهێناوە لە ڕێگەی ئارشیڤە دیجیتاڵەکانەوە. گەنجان کە پێشتر تەنها گوێیان لە مۆسیقای مۆدێرن بوو، ئێستا دەتوانن گۆرانییەکانی باپیر و دایکەیان لە تەلەفۆنەکەیاندا بیستن.</p>
<h2>گوێگرتن لە چوارچێوەی ڕەسەن</h2>
<p>هەر تۆمارێک لەگەڵ ئامێر، شوێن و چیرۆکی پشت پەڕەی مەلۆدییەکە بڵاودەکرێتەوە. تێبینییەکان لەسەر هەرێم و هونەرمەند لەگەڵ دەنگدا دەرچوون.</p>
<p>لە هەولێرەوە تا مێرگەسۆر، تیمەکانی مەیدانیمان زیاتر لە ٢٠٠ تۆماری دەنگی کۆکردۆتەوە — زۆربەیان بۆ یەکەم جار لە دەرەوەی خێزانی هونەرمەند تۆمارکراون.</p>
<h2>پەیوەندی نەوەکان</h2>
<p>لە کارگەیەتییەکانی قوتابخانەدا، مامۆستایان ئەم تۆمارانە وەک سەرچاوەی فێربوون بەکاردەهێنن. قوتابییەکان گۆرانییەکان فێردەبن و لەگەڵ مێژووی خێزانی خۆیان دەبەستنەوە.</p>
<figure><img src="/news/5.jpg" alt="هونەرمەندی گۆرانی گەلەیی" /><figcaption>ژەنی هونەرمەند لە دهۆک — تۆمارکردنی گۆرانییەکی عەیدی ناوچەیی.</figcaption></figure>`,
		coverMediaType: "VIDEO",
		coverThumbnailUrl: "/news/5.jpg",
		tags: ["گۆرانی گەلەیی", "مۆسیقا", "ئارشیڤی دەنگی", "نەوەکان"],
		mediaGallery: gallery(
			media(
				"/video/wave.mp4",
				"VIDEO",
				"کورتە فیلم: ئامادەکاری بۆ کۆنسێرتێکی گەلەیی",
				"/news/5.jpg",
			),
			media("/audio/sample-2.m4a", "AUDIO", "تۆمارێکی مەیدانی — دەنگی تەنبور"),
			media("/news/7.jpg", "IMAGE", "ئامێرە کۆنەکانی مۆسیقا لە مۆزەخانە"),
			media("/news/8.jpg", "IMAGE", "گەنجان لە کارگەیەتییەکی گۆرانی"),
		),
	},
	"sorani-dialect-mapping": {
		description: `<p>سورانی یەک شێوەزار نییە — بەڵکو تۆڕێکە لە گۆڕانکارییەکانی دەربڕین کە سەدە بە سەدە لە کۆچ، بازرگانی و پەیوەندی نێوان گوندەکان دروستبوون. پڕۆژەی نەخشەکێشانی شێوەزارەکان ئەو جیاوازییانە بە شێوەیەکی سیستەماتیک تۆمار دەکات.</p>
<h2>چۆن کۆمەڵە داتاکان دروست دەکەین</h2>
<p>توێژەران لەگەڵ قسەکەرانی سەرچاوە لە شازدە ناوچەدا چاوپێکەوتن ئەنجام دەدەن. وشە، دەربڕین و تەلەففوز بۆ هەر وشەیەکی سەرەکی تۆمار دەکرێت.</p>
<p>ئەنجامەکان لەسەر نەخشەیەکی کارلێککار پیشان دەدرێن کە دەتوانرێت بەپێی شار، گوند یان تەمەن فلتەر بکرێت.</p>
<h2>بۆچی گرنگە</h2>
<p>زمانناسان دەڵێن شێوەزارەکان پەنجەرەیەکن بۆ مێژووی کۆچ و پەیوەندی نێوان کۆمەڵگاکان. پاراستنیان یارمەتی فێربوونی زمانی دایک و نووسینی ئەدەبی دەدات.</p>
<figure><img src="/news/6.jpg" alt="نەخشەی شێوەزار" /><figcaption>وەشانێکی چاپکراوی نەخشەی جیاوازییەکانی وشە لە باشووری کوردستان.</figcaption></figure>`,
		tags: ["زمان", "سورانی", "شێوەزار", "لینگویستیک"],
		mediaGallery: gallery(
			media("/news/6.jpg", "IMAGE", "نەخشەی شێوەزارەکان"),
			media("/news/9.jpg", "IMAGE", "چاوپێکەوتن لەگەڵ قسەکەرێکی سەرچاوە"),
			media("/audio/sample-3.m4a", "AUDIO", "نموونەی دەنگی شێوەزارێکی ناوچەیی"),
		),
	},
	"traditional-dress-exhibition": {
		description: `<p>جلوبەرگی نەریتی کوردی تەنها جل نییە — بەڵکو تۆماری دیمەنییە: هەر نموونەیەکی قوماش، ڕەنگ و دوورین ڕوونکردنەوەیەکە لە مێژووی هەرێم، پیشە و ناسنامەی خێزان.</p>
<h2>دە جلێک، دە چیرۆک</h2>
<p>پێشانگاکە لە هەورامانەوە تا بوتان دەگرێتەوە. سەردێڕەکان لە جلی ڕۆژهەڵاتنی کوردستانەوە تا جلی کۆنەپەڕی شاخ و جلی بەهاران پیشان دەدات.</p>
<p>هەر جلێک لەگەڵ وێنەی مێژوویی، وەسفی دروستکردن و چیرۆکی خێزانی هەڵگری سەرەتا نمایش دەکرێت.</p>
<h2>پاراستن بۆ نەوەی داهاتوو</h2>
<p>تیمی ئینستیتووت لەگەڵ پیشەسازانی نیشتمانی هاوکاری دەکات بۆ تۆمارکردنی تەکنیکەکانی دروستکردن و ڕاهێنانی نەوەیەکی نوێ.</p>
<figure><img src="/news/3.jpg" alt="جلوبەرگی نەریتی" /><figcaption>جلی ژنی هەورامی لە پێشانگای میراتی دیمەنی.</figcaption></figure>`,
		tags: ["جلوبەرگ", "نەریت", "پێشانگا", "ناسنامە"],
		mediaGallery: gallery(
			media("/news/3.jpg", "IMAGE", "جلی هەورامی"),
			media("/news/10.jpg", "IMAGE", "وردەکاریی دوورین و نموونەی قوماش"),
			media("/news/2.jpg", "IMAGE", "سەردانکەران لە پێشانگا"),
		),
	},
	"heritage-education-initiative": {
		description: `<p>چۆن قوتابییەکی پۆلی یەکەم دەتوانێت بە دەستی خۆی بەستەنی مێژووی گوندەکەی بخوێنێت؟ بەرنامەی پەروەردەی میرات هەوڵ دەدات ئەم پرسیارە وەڵام بداتەوە بە بەکارهێنانی سەرچاوەی سەرەتایی و چالاکییە مەیدانییەکان.</p>
<h2>مۆدیولەکانی پۆل</h2>
<p>مامۆستا و ئارشیڤکار پێکەوە مۆدیول دروست دەکەن کە وێنە، دەنگ و دەق لە ئارشیڤی ئینستیتووتەوە دەهێنن. هەر مۆدیولێک بۆ تەمەن و شێوەزاری ناوچەیی گونجاو کراوە.</p>
<p>لە ١٢ قوتابخانەی تاقیکردنەوەدا، زیاتر لە ٨٠٠ قوتابی بەشداریان کردووە لە چالاکییەکانی وێنەگرتن، چاوپێکەوتن و دروستکردنی تایم‌لاینی خێزان.</p>
<h2>کاریگەری لەسەر کۆمەڵگا</h2>
<p>دایک و باوکەکان دەڵێن منداڵەکانان دەستیان کردووە بە پرسیارکردن لە پیران دەربارەی مێژووی خێزان — گفتوگۆیەک کە پێشتر کەم ڕوودەدا.</p>`,
		coverMediaType: "VIDEO",
		coverThumbnailUrl: "/news/4.jpg",
		tags: ["پەروەردە", "قوتابخانە", "میرات", "گوند"],
		mediaGallery: gallery(
			media(
				"/video/wave.mp4",
				"VIDEO",
				"کورتە فیلم: چالاکییەکی پۆلی میرات",
				"/news/4.jpg",
			),
			media("/news/4.jpg", "IMAGE", "قوتابیان لەگەڵ وێنەیەکی مێژوویی"),
			media("/news/1.jpg", "IMAGE", "مامۆستایەک دەربارەی دەستنووسێک دەڵێت"),
		),
	},
	"photographic-archive-discovery": {
		description: `<p>کۆمەڵێک نێگەتیڤی شووشەیی کە بۆ چەندین ساڵ لە ناو قوتوی خێزانێکدا مایەوە، ئێستا دەبێتە بەشێک لە گەورەترین دۆزینەوەی وێنەیی ئەم ساڵە لە ئارشیڤی ئینستیتووت. وێنەکان ژیانی ڕۆژانەی سلێمانی لە سەدەی ١٩ی دەنووسنەوە.</p>
<h2>چی لە وێناندا هەیە</h2>
<p>بازاڕەکان، مەدرەسەکان، جەژنەکان و وێنەی خێزانی — هەموویان بە کوالیتی بەرز لە شووشەی ئەسڵی دیجیتاڵکراون. هەندێک وێنە تەنها نموونەیەکی دیمەنییە؛ هەندێکیان ناوی کەس و شوێنی دیاریکراو لە پشتەوە هەیە.</p>
<p>خێزانی بەخشەر ڕازی بوون بە بڵاوکردنەوەی وێنەکان بە مەرجێک ناوی هەندێک کەس بشاردرێتەوە.</p>
<figure><img src="/news/7.jpg" alt="وێنەی مێژوویی" /><figcaption>وێنەیەکی بازاڕی سلێمانی، نزیکەی ١٩٢٠ — لە کۆلێکشنی خێزانی تایبەت.</figcaption></figure>`,
		tags: ["وێنە", "ئارشیڤ", "سلێمانی", "دۆزینەوە"],
		mediaGallery: gallery(
			media("/news/7.jpg", "IMAGE", "بازاڕی سلێمانی، نزیکەی ١٩٢٠"),
			media("/news/8.jpg", "IMAGE", "وێنەی خێزان لە سەدەی ١٩"),
			media("/news/9.jpg", "IMAGE", "پرۆسەی دیجیتاڵکردنی شووشە"),
		),
	},
	"kurdish-poetry-translation": {
		description: `<p>وەرگێڕانی شیعر لە هەر زمانێکدا ئاستەنگی هەیە — بەڵام شیعری کوردی تایبەتمەندییەکی زیاتری هەیە: ڕیتمی نەریتی، وشەی ناوچەیی و مەتابۆری کە بە ڕاستەوخۆیی لە زمانی دایکەوە گواستراوەتەوە.</p>
<h2>مەترسی لەدەستدانی دەنگ</h2>
<p>زانایان دەڵێن وەرگێڕان هەوڵ دەدات «هەست» بگەیەنێت نەک تەنها «وشە». بۆ شیعری کوردی، ئەمە واتای پاراستنی ڕیتم، کەلتوری و دەربڕینی ناوچەییە.</p>
<p>لە پڕۆژەیەکی نوێدا، ٤٠ شیعری کلاسیکی کوردی بۆ ئینگلیزی، عەرەبی و فارسی وەرگێڕدراون — هەر دانەیەک لەگەڵ تێبینیی زمانناسی و بەراوردکردنی هێڵەکان.</p>
<figure><img src="/news/1.jpg" alt="دەستنووسی شیعر" /><figcaption>دەستنووسێکی شیعری کوردی لە ئارشیڤی ئینستیتووت.</figcaption></figure>`,
		tags: ["شیعر", "وەرگێڕان", "ئەدەب", "زمان"],
		mediaGallery: gallery(
			media("/news/1.jpg", "IMAGE", "دەستنووسی شیعر"),
			media(
				"/audio/sample-2.m4a",
				"AUDIO",
				"خوێندنەوەی شیعرێک بە شێوەزاری سەرچاوە",
			),
		),
	},
	"hawraman-heritage-landscape": {
		description: `<p>هەورامان تەنها شوێنێکی جوانیی سروشتی نییە — سیستەمێکی کەلتووری تەواوە کە پەیوەندی نێوان شاخ، کێڵگە، گوند و کۆچی وەرزی دروست کردووە.</p>
<h2>تەراسەکان وەک ئارکیتێکتورا</h2>
<p>گوندەکانی پلەپلە نەک تەنها بۆ جوانایی دروستکراون — بۆ بەکارهێنانی زەوی، پاراستنی خاک و ڕێکخستنی ئاودەری.</p>
<figure><img src="/news/6.jpg" alt="گوندی هەورامان" /><figcaption>گوندێکی پلەپلەی هەورامان لە بەهار — وێنەی مەیدانی ٢٠٢٥.</figcaption></figure>`,
		tags: ["هەورامان", "دیمەن", "میرات", "شاخ"],
		mediaGallery: gallery(
			media("/news/6.jpg", "IMAGE", "گوندی پلەپلە"),
			media("/news/9.jpg", "IMAGE", "کۆچی وەرزی"),
			media(
				"/video/wave.mp4",
				"VIDEO",
				"فیلم: ژیانی گوند لە هەورامان",
				"/news/6.jpg",
			),
		),
	},
	"women-in-oral-tradition": {
		description: `<p>لە نەریتی شفاهیی کوردیدا، دەنگی ژنان زۆرجار لە پشت پەردەی «تایبەتمەندیی نێر»دا مایەوە — بەڵام ئەو چیرۆک و گۆرانیانەی کە ژنان هەڵگرتوون زانیارییەکی بەنرخن.</p>
<h2>لۆری، غەم و چیرۆکی خێزان</h2>
<p>لۆرییەکان نەک تەنها گۆرانیی منداڵخواردنن — زۆرجار مێژووی خێزان و نەریتی ناوچەیی لەخۆدەگرن.</p>`,
		tags: ["ژنان", "نەریت", "گۆرانی", "شفاهی"],
		mediaGallery: gallery(
			media("/news/2.jpg", "IMAGE", "ژنێکی بەتەمەن چیرۆک دەگێڕێتەوە"),
			media("/audio/sample-3.m4a", "AUDIO", "لۆرییەکی ناوچەیی"),
		),
	},
	"newroz-celebration-origins": {
		description: `<p>نەورۆز لە سەرتاسەری کوردستاندا جەژنێکی بەهارە — لە ئایینی کۆنەوە تا نیشانەی بەرگری و نوێکردنەوەی کۆمەڵایەتی.</p>
<h2>ئایینەکانی ئاگر</h2>
<p>چەقاندنی ئاگر لە سەر گرد و بەرزاییەکان هێشتا بەشێکی سەرەکیی جەشنە.</p>
<figure><img src="/news/5.jpg" alt="نەورۆز" /><figcaption>چەقاندنی ئاگری نەورۆز لە شارێکی کوردستان.</figcaption></figure>`,
		tags: ["نەورۆز", "جەژن", "ئایین", "بەهار"],
		mediaGallery: gallery(
			media("/news/5.jpg", "IMAGE", "ئاگری نەورۆز"),
			media("/news/4.jpg", "IMAGE", "خەڵک لە گرد"),
			media(
				"/video/wave.mp4",
				"VIDEO",
				"کورتە فیلم: ئامادەکاری بۆ نەورۆز",
				"/news/5.jpg",
			),
		),
	},
	"archive-access-policy": {
		description: `<p>کاتێک ئارشیڤێکی دیجیتاڵ دەگەڕێتەوە بۆ کۆمەڵگای سەرچاو، پرسیارێکی گرنگ دەردەکەوێت: کێ دەتوانێت چی ببینێت؟ سیاسەتی دەستگەیشتنی ئینستیتووت هەوڵ دەدات هاوسەنگی نێوان توێژانی زانستی و خاوەنداریی کۆمەڵایەتی بپارێزێت.</p>
<h2>ئاستەکانی دەستگەیشتن</h2>
<p>ناوەڕۆکی گشتی بەخۆڕایی بەردەستە. تۆمارە هەستیارەکان تەنها بە مۆڵەتی چیرۆکگۆ یان خێزان دەردەکەون. توێژەران دەتوانن داوای کۆپی بۆ لێکۆڵینەوە بکەن بە مەرجەکانی بەکارهێنانی ڕوون.</p>`,
		tags: ["ئارشیڤ", "سیاسەت", "دەستگەیشتن", "کۆمەڵگا"],
		mediaGallery: gallery(
			media("/news/4.jpg", "IMAGE", "ژووری خوێندنەوەی ئارشیڤ"),
		),
	},
	"kurdish-cinema-retrospective": {
		description: `<p>سینەمای کوردی لە سەدەی ١٩٧٠ەوە تا ئەمڕۆ بابەتەکانی جیابوونەوە، ناسنامە و ژیانی ڕۆژانە لەژێر سنوورداریدا تۆمار کردووە. پێشبینینێکی نوێ لە ئینستیتووت چەندین فیلمی کلاسیک و نوێ لەگەڵ یادی دەرکەوتنەوە دەخاتە پێش چاو.</p>
<h2>فیلم و چیرۆک</h2>
<p>لە فیلمە کورتەکانی سەرەتاییەوە تا بەرهەمی ئێستا، هونەرمەندانی کوردی زمانێکی بینراوی تایبەت دروستکردووە.</p>
<p>هەموو فیلمەکان لەگەڵ ژێرنووسی دوو زمانە و تێبینی مێژوویی بڵاودەکرێنەوە.</p>`,
		coverMediaType: "VIDEO",
		coverThumbnailUrl: "/news/3.jpg",
		tags: ["سینەما", "فیلم", "هونەر", "ناسنامە"],
		mediaGallery: gallery(
			media(
				"/video/wave.mp4",
				"VIDEO",
				"کورتە فیلم: دیمەنێک لە سینەمای کوردی",
				"/news/3.jpg",
			),
			media("/news/3.jpg", "IMAGE", "وێنەیەکی فیلمی کوردی"),
			media("/news/7.jpg", "IMAGE", "پێشبینینی فیلم"),
		),
	},
	"ancient-settlement-excavation": {
		description: `<p>تیمە ئەرکەۆلۆژییەکان لە پێشەوەی زاگرۆس بەڵگەی شوێنی نیشتەجێبوونی پێش ئیسلام دەدۆزنەوە کە ڕێگای بازرگانی نێوان کۆمەڵگە شاخییەکان دەسەلمێنن.</p>
<h2>دۆزینەوەکانی ئەم وەرزە</h2>
<p>کەل و پەل، پاشماوەی خانوو و ئامرازی ڕۆژانە بە وردی نەخشەکێشراون. هەر شوێنێک لەگەڵ تەمەنی تەخمینی و پەیوەندی بە ڕێگای بازرگانییەوە تۆمار دەکرێت.</p>
<figure><img src="/news/7.jpg" alt="شوێنی کۆنپێکردن" /><figcaption>شوێنی کۆنپێکردن لە پێشەوەی زاگرۆس — وێنەی مەیدانی ٢٠٢٥.</figcaption></figure>`,
		tags: ["ئەرکەۆلۆژی", "مێژوو", "زاگرۆس", "کۆنپێکردن"],
		mediaGallery: gallery(
			media("/news/7.jpg", "IMAGE", "شوێنی کۆنپێکردن"),
			media("/news/8.jpg", "IMAGE", "کەل و پەلی دۆزراوە"),
		),
	},
	"kurmanci-sorani-bridge": {
		description: `<p>نەریتە ئەدەبییەکانی کورمانجی و سورانی بۆ سەدەها ساڵ بە شێوەی جیا گەشەیان کردووە — بەڵام بڵاوکردنەوەی نێوان-شێوەزار هێزیان زیاتر دەکات وەک میراتێکی هاوبەش.</p>
<h2>وەرگێڕان و هاوکاری</h2>
<p>بڵاوکەران و وەرگێڕان لەگەڵ یەکدا کتێب، گۆڤار و پلاتفۆرمی دیجیتاڵ دروست دەکەن کە هەردوو شێوەزار لە یەک شوێندا دەخوێنرێنەوە.</p>`,
		tags: ["کورمانجی", "سورانی", "ئەدەب", "وەرگێڕان"],
		mediaGallery: gallery(
			media("/news/1.jpg", "IMAGE", "کتێب بە هەردوو شێوەزار"),
		),
	},
	"craft-revival-weaving": {
		description: `<p>لە نێوان شاخەکانی کوردستاندا، پیشەسازی دەستی هێشتا بەشێکە لە ڕۆتینی ژیان — لە دروستکردنی گۆپاڵ و گۆچانەوە تا نەقڵکردنی قوماش و دروستکردنی کەرەستەی ماڵ. بەرنامەی زیندووکردنەوەی پیشەسازی ئینستیتووت هەوڵ دەدات ئەم زانیارییانە پاش مردنی پیشەسازەکان لەناو نەچن.</p>
<h2>چۆنیەتی دروستکردنی گۆپاڵ — گۆچان</h2>
<p>گۆپاڵ یان گۆچان نەک تەنها ئامرازێکی ڕۆژانەیە؛ نیشانەیەکی ڕێز و نەریتە. پیشەسازەکە دارێکی گونجاو هەڵدەبژێرێت — زۆرجار دارەڕەش یان دارەگەڵا — پاشان بە کەرەستەی دەستی شێوەی دەدات.</p>
<p>سەرەتا لقەکە بە وردی دەبڕدرێت و قاش دەکرێت. پاشان بە کەرەستەی تێکەڵاو لە نەوت و سەرەڕێژ شێوە دەگیرێت. هەندێک گۆپاڵ بە نەخشی کۆن دەنوقێنرێن؛ هەندێکی تر سادە و بە کارایی دروست دەکرێن.</p>
<figure><img src="/news/1.jpg" alt="دروستکردنی گۆپاڵ" /><figcaption>پیشەسازێکی بەتەمەن لە هەورامان گۆپاڵێک دروست دەکات — تۆمارکراو لە ٢٠٢٥.</figcaption></figure>
<h2>تۆمارکردن و ڕاهێنانی نەوەی نوێ</h2>
<p>تیمەکانی ئینستیتووت هەنگاو بە هەنگاو فیلم و وێنە تۆمار دەکەن. لەگەڵ ئەوەشدا، کارگەیەتییەکانی ڕاهێنانی کورت بۆ گەنجان ڕێکدەخرێت کە دەیانەوێت تەکنیکەکان فێر بن.</p>
<blockquote>کاتێک پیشەسازێک دەمرێت بەبێ قوتابی، بەشێک لە میراتی دەستی لەناو دەچێت — مەگەر ئێمە تۆمار بکەین.</blockquote>
<h2>پیشەکانی تر</h2>
<p>جگە لە گۆپاڵ، بەرنامەکە بەرگی نەریتی، نەقڵکردن و دروستکردنی کەرەستەی چێشتنی کۆن دەگرێتەوە. هەر پیشەیەک لەگەڵ لیستی کەرەستە، وشەی تەکنیکی و وێنەیەکی پڕۆسەکە تۆمار دەکرێت.</p>`,
		coverMediaType: "IMAGE",
		tags: ["پیشەسازی", "گۆپاڵ", "هەورامان", "میرات"],
		mediaGallery: gallery(
			media("/news/1.jpg", "IMAGE", "پیشەساز گۆپاڵ دروست دەکات"),
			media("/news/2.jpg", "IMAGE", "کەرەستەی دەستی لەسەر میز"),
			media(
				"/video/wave.mp4",
				"VIDEO",
				"فیلم: هەنگاوەکانی دروستکردنی گۆپاڵ",
				"/news/1.jpg",
			),
			media("/news/10.jpg", "IMAGE", "گۆپاڵە تەواوکراوەکان"),
			media(
				"/audio/sample-4.m4a",
				"AUDIO",
				"چیرۆکی پیشەسازێک دەربارەی فێربوونی پیشەکە",
			),
		),
	},
	"youth-heritage-ambassadors": {
		description: `<p>بەرنامەی باڵیۆزانی میراتی گەنج خۆبەخشانی ١٨ تا ٢٥ ساڵ فێری لێهاتوویی بەڵگەکردن دەکات و دەنێرێتەوە بۆ گوند و شارەکانی خۆیان وەک پاڵپشتی ئارشیڤی ناوچەیی.</p>
<h2>چی فێردەبن</h2>
<p>وێنەگرتن، تۆمارکردنی دەنگ، چاوپێکەوتن و نووسینی کورتە چیرۆک — هەموویان لە کارگەیەتییەکانی دوو هەفتەییدا فێردەکرێن.</p>
<p>تا ئێستا زیاتر لە ١٢٠ باڵیۆز لە شازدە شار چالاکن.</p>`,
		tags: ["گەنجان", "میرات", "خۆبەخشی", "بەڵگەکردن"],
		mediaGallery: gallery(
			media("/news/4.jpg", "IMAGE", "گەنجان لە کارگەیەتییەکی میرات"),
			media(
				"/video/wave.mp4",
				"VIDEO",
				"کورتە فیلم: باڵیۆزان لە مەیدان",
				"/news/4.jpg",
			),
		),
	},
	"radio-archive-digitization": {
		description: `<p>لە کۆگاکانی ڕادیۆکانی هەرێمی کوردستاندا، هەزاران کاتی تەیپی reel-to-reel ماونەتەوە کە هەواڵ، مۆسیقا و لێدوان سیاسی لە نێوانی ساڵانی ١٩٥٠ تا ١٩٩٠ تۆمار دەکەن.</p>
<h2>گەڕانەوە بۆ دەنگی سەردەمێک</h2>
<p>تیمەکەمان ئامێرە کۆنەکانی پەخشکردنەوە چاککردۆتەوە و پرۆسەی دیجیتاڵکردن بە وردی بەڕێوەدەبات.</p>
<figure><img src="/news/2.jpg" alt="ئامێری ڕادیۆ" /><figcaption>ئامێری پەخشی کۆن لە کۆگای ڕادیۆی هەرێمی.</figcaption></figure>`,
		tags: ["ڕادیۆ", "ئارشیڤ", "دیجیتاڵ", "مۆسیقا"],
		mediaGallery: gallery(
			media("/news/2.jpg", "IMAGE", "ئامێری ڕادیۆی کۆن"),
			media("/audio/sample-1.m4a", "AUDIO", "وەرگێڕەیەکی پەخشی ڕادیۆی ١٩٧٥"),
			media(
				"/audio/sample-4.m4a",
				"AUDIO",
				"گۆرانییەکی گەلەیی لە ئارشیڤی ڕادیۆ",
			),
		),
	},
};

const KU_BODIES: LocaleBodies = {
	"oral-history-preservation": {
		description: `<p>Li gundên çiyayî û navçeyên bajêr, çîrok hê jî pir caran li ser tepsiya çayê û di meclisê de têne gotin — lê ew deng hîn jî kêm û kêm dimînin. Dîroka devkî yek ji tundtirîn — û herî jîndar — formên tomarkirina çandî ya Kurdî ye.</p>
<h2>Çima niha girîng e</h2>
<p>Piştî salên şer, koçberiyê û guhertina jiyana bajarî, gelek çîrokgotar bê tomarkirin winda bûne. Ew agahiyên ku di defter û pirtûkan de nehatine nivîsandin — nasnameya malbatê, olên kevneşopî, nasîna giyayên dermanî û çîroka koçberiyê — di dengê xwe de dimînin.</p>
<blockquote>Her deng ku tê arşîvkirin, rûpelek e ji pirtûkek ku di yek nesilê de winda dibe.</blockquote>
<h2>Kî dikare arşîvê bikar bîne</h2>
<p>Lêkolêr, rojnamevan û endamên malbatê dikarin bi rêya odeya xwendinê ya Enstîtûyê daxwaza gihîştinê bikin.</p>
<figure><img src="/news/2.jpg" alt="Danişîna tomarkirinê" /><figcaption>Tomarkirina li Hewlêr, 2025 — hevpeyivîna bi kesayetiyek civakî re.</figcaption></figure>`,
		tags: ["Dîroka devkî", "Arşîv", "Devok", "Gund"],
		mediaGallery: gallery(
			media("/news/3.jpg", "IMAGE", "Lêkolêrê qeydan bi çîrokgotarek re"),
			media("/audio/sample-1.m4a", "AUDIO", "Kurteya hevpeyivînê — lorî"),
			media(
				"/video/wave.mp4",
				"VIDEO",
				"Fîlma kurt a prosesa tomarkirinê",
				"/news/2.jpg",
			),
		),
	},
	"craft-revival-weaving": {
		description: `<p>Di navbera çiyayên Kurdistanê de, karîya destan hê jî beşek ji rojane ye — ji çêkirina gopal û goçan heta dokum û amûrên malê. Bernameya zindîkirina karîya Enstîtûyê hewl dide ku ev zanîn piştî mirina çêkeran winda nebe.</p>
<h2>Çawa gopal — goçan tê çêkirin</h2>
<p>Gopal tenê amûrek rojane nîne; nîşaneyek rêz û kevneşopiyê ye. Çêker darê guncaw hilbijêre, paşê bi amûrên destan şekilê dide.</p>
<figure><img src="/news/1.jpg" alt="Çêkirina gopalê" /><figcaption>Çêkerekê kal li Hewraman gopal çêdike — tomarkirî 2025.</figcaption></figure>
<h2>Tomarkirin û perwerdehiya nifşek nû</h2>
<p>Tîmên me gav bi gav fîlm û wêne tomar dikin. Her karî bi lîsteya amûran, peyvên teknik û wêneyên prosesê tê tomarkirin.</p>`,
		tags: ["Karî", "Gopal", "Hewraman", "Mîrat"],
		mediaGallery: gallery(
			media("/news/1.jpg", "IMAGE", "Çêker gopal çêdike"),
			media("/news/2.jpg", "IMAGE", "Amûrên destan li ser maseyê"),
			media(
				"/video/wave.mp4",
				"VIDEO",
				"Fîlm: gavên çêkirina gopalê",
				"/news/1.jpg",
			),
		),
	},
};

const EN_BODIES: LocaleBodies = {
	"oral-history-preservation": {
		description: `<p>Across mountain villages and urban neighbourhoods, stories are still told over tea and in gathering rooms — but those voices are disappearing. Oral history remains one of the most fragile, and most vital, forms of Kurdish cultural record.</p>
<h2>Why it matters now</h2>
<p>After decades of conflict, migration, and urbanisation, many narrators have passed without being recorded. Family genealogy, ritual knowledge, plant medicine, and migration stories survive only in speech.</p>
<blockquote>Every voice archived is a page in a book that would otherwise vanish within a single generation.</blockquote>
<h2>Who can access the archive</h2>
<p>Researchers, journalists, and family members may request access through the institute reading room. Sensitive testimony can be restricted at the narrator's request.</p>
<figure><img src="/news/2.jpg" alt="Oral history session" /><figcaption>Field recording in Erbil, 2025.</figcaption></figure>`,
		tags: ["Oral history", "Archive", "Dialect", "Village"],
		mediaGallery: gallery(
			media("/news/3.jpg", "IMAGE", "Field researcher with a community elder"),
			media("/audio/sample-1.m4a", "AUDIO", "Interview excerpt — a lullaby"),
			media(
				"/video/wave.mp4",
				"VIDEO",
				"Short film: the recording process",
				"/news/2.jpg",
			),
		),
	},
	"craft-revival-weaving": {
		description: `<p>In the mountains of Kurdistan, handcraft remains part of daily life — from carving walking sticks to weaving textiles. The institute's craft revival programme documents techniques before master artisans pass away.</p>
<h2>How a walking stick is made</h2>
<p>A gopal is not merely a tool; it carries respect and tradition. The craftsman selects suitable wood, then shapes it with hand tools over several days.</p>
<figure><img src="/news/1.jpg" alt="Crafting a walking stick" /><figcaption>A master artisan in Hawraman, recorded 2025.</figcaption></figure>`,
		tags: ["Craft", "Walking stick", "Hawraman", "Heritage"],
		mediaGallery: gallery(
			media("/news/1.jpg", "IMAGE", "Artisan shaping a stick"),
			media(
				"/video/wave.mp4",
				"VIDEO",
				"Film: stages of carving",
				"/news/1.jpg",
			),
		),
	},
};

function fallbackBody(
	title: string,
	excerpt: string,
	imageUrl: string,
	locale: string,
): NewsBodyExtras {
	const readMore =
		locale === "ckb"
			? "زیاتر بخوێنەرەوە"
			: locale === "ku"
				? "Zêdetir bixwîne"
				: "Read more";

	return {
		description: `<p>${excerpt}</p>
<h2>${readMore}</h2>
<p>${excerpt}</p>
<p>${locale === "ckb" ? "ئەم ڕاپۆرتە بەشێکە لە کارەکانی بەردەوامی ئینستیتووی میراتی کوردی بۆ پاراستن، تۆمارکردن و بڵاوکردنەوەی زانیاری کەلتووری لە سەرانسەری هەرێمەکانی کوردستان." : locale === "ku" ? "Ev rapor beşek ji karên domdar ên Enstîtûya Mîrateya Kurdî ye ji bo parastin, tomarkirin û belavkirina agahdariya çandî li seranserê herêmên Kurdî." : "This report is part of the Kurdish Heritage Institute's ongoing work to preserve, document, and share cultural knowledge across the Kurdish regions."}</p>
<figure><img src="${imageUrl}" alt="${title}" /><figcaption>${title}</figcaption></figure>`,
		tags: [],
		mediaGallery: gallery(
			media(imageUrl, "IMAGE", title),
			media(`/news/${(Math.abs(title.length) % 10) + 1}.jpg`, "IMAGE", null),
		),
	};
}

const LOCALE_BODIES: Record<string, LocaleBodies> = {
	ckb: CKB_BODIES,
	ku: { ...CKB_BODIES, ...KU_BODIES },
	en: { ...CKB_BODIES, ...EN_BODIES },
};

export function getNewsBody(
	locale: string,
	slug: string,
	fallback: { title: string; excerpt: string; imageUrl: string },
): NewsBodyExtras {
	const bodies = LOCALE_BODIES[locale] ?? LOCALE_BODIES.en;
	const body = bodies[slug];
	if (body) {
		return {
			coverMediaType: body.coverMediaType ?? "IMAGE",
			coverThumbnailUrl: body.coverThumbnailUrl ?? null,
			mediaGallery: body.mediaGallery ?? [],
			tags: body.tags ?? [],
			description: body.description,
		};
	}
	return fallbackBody(
		fallback.title,
		fallback.excerpt,
		fallback.imageUrl,
		locale,
	);
}
