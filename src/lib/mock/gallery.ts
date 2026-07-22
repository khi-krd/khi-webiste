/**
 * Mock data for the gallery hero marquee. Same locale-aware getter convention
 * as the other mocks (see news.ts), but split into a shared base (asset, ratio,
 * category) + per-locale copy map so image URLs aren't triplicated.
 */

type GalleryAspect = "2/3" | "3/4" | "4/5";
type GalleryCategory = "photography" | "traditionalDress" | "crafts";

export type GalleryHeroImage = {
	id: string;
	image: { url: string; alt: string };
	/** Short hover label on the marquee card. */
	title: string;
	category?: GalleryCategory;
	/** Localized category eyebrow for the hover card. */
	categoryLabel?: string;
	/** Ratio box the card crops into — varying these creates the masonry rhythm. */
	aspect: GalleryAspect;
	/** Collection detail path — marquee cards link through when set. */
	href?: string;
};

export type GalleryHeroColumns = {
	/** Drifts up in the hero marquee. */
	up: GalleryHeroImage[];
	/** Drifts down. */
	down: GalleryHeroImage[];
};

type GalleryHeroImageBase = {
	id: string;
	url: string;
	aspect: GalleryAspect;
	category?: GalleryHeroImage["category"];
};

/* Adjacent cards alternate ratios so neither column reads as a uniform strip. */
const UP_BASE: GalleryHeroImageBase[] = [
	{
		id: "hawraman-spring",
		url: "/gallery/1.jpg",
		aspect: "2/3",
		category: "photography",
	},
	{
		id: "bridal-dress",
		url: "/gallery/2.jpg",
		aspect: "4/5",
		category: "traditionalDress",
	},
	{
		id: "copper-bazaar",
		url: "/gallery/3.jpg",
		aspect: "2/3",
		category: "crafts",
	},
	{
		id: "qandil-shepherds",
		url: "/gallery/4.jpg",
		aspect: "3/4",
		category: "photography",
	},
	{
		id: "klash-weaving",
		url: "/gallery/5.jpg",
		aspect: "2/3",
		category: "crafts",
	},
	{
		id: "newroz-fires",
		url: "/gallery/6.jpg",
		aspect: "4/5",
		category: "photography",
	},
];

const DOWN_BASE: GalleryHeroImageBase[] = [
	{
		id: "glass-plate-portrait",
		url: "/gallery/7.jpg",
		aspect: "2/3",
		category: "photography",
	},
	{
		id: "sine-kilim",
		url: "/gallery/8.jpg",
		aspect: "4/5",
		category: "crafts",
	},
	{
		id: "daf-workshop",
		url: "/gallery/1.jpg",
		aspect: "2/3",
		category: "crafts",
	},
	{
		id: "badinan-village",
		url: "/gallery/2.jpg",
		aspect: "3/4",
		category: "photography",
	},
	{
		id: "soran-headdress",
		url: "/gallery/3.jpg",
		aspect: "4/5",
		category: "traditionalDress",
	},
	{
		id: "teahouse-storytellers",
		url: "/gallery/4.jpg",
		aspect: "2/3",
		category: "photography",
	},
];

type GalleryCopy = { title: string; alt: string };

const EN_COPY: Record<string, GalleryCopy> = {
	"hawraman-spring": {
		title: "Hawraman in spring",
		alt: "Terraced village of Hawraman in spring",
	},
	"bridal-dress": {
		title: "Kurdish bridal dress",
		alt: "Traditional Kurdish bridal dress with embroidered fabric",
	},
	"copper-bazaar": {
		title: "Coppersmiths of Sulaymaniyah",
		alt: "Engraved copperwork in the Sulaymaniyah bazaar",
	},
	"qandil-shepherds": {
		title: "Shepherds below Qandil",
		alt: "Shepherds with their flock in the Qandil foothills",
	},
	"klash-weaving": {
		title: "Klash weaving, Hawraman",
		alt: "Hands weaving traditional klash footwear",
	},
	"newroz-fires": {
		title: "Newroz fires",
		alt: "Newroz celebration fires at dusk",
	},
	"glass-plate-portrait": {
		title: "Glass-plate portrait, 1923",
		alt: "Restored glass-plate portrait from the early archive",
	},
	"sine-kilim": {
		title: "Kilim motifs of Sine",
		alt: "Woven kilim with geometric motifs from Sine",
	},
	"daf-workshop": {
		title: "The daf maker's workshop",
		alt: "Craftsman stretching skin over a daf frame",
	},
	"badinan-village": {
		title: "Mountain village, Badinan",
		alt: "Stone houses of a mountain village in Badinan",
	},
	"soran-headdress": {
		title: "Women's headdress, Soran",
		alt: "Traditional women's headdress from the Soran region",
	},
	"teahouse-storytellers": {
		title: "Teahouse storytellers",
		alt: "Storytellers gathered in a traditional teahouse",
	},
};

const CKB_COPY: Record<string, GalleryCopy> = {
	"hawraman-spring": {
		title: "هەورامان لە بەهاردا",
		alt: "گوندە پلیکانەییەکانی هەورامان لە بەهاردا",
	},
	"bridal-dress": {
		title: "جلوبەرگی بووکی کوردی",
		alt: "جلوبەرگی بووکی کوردی بە قوماشی نەخشێنراو",
	},
	"copper-bazaar": {
		title: "مسگەرانی سلێمانی",
		alt: "کاری مسی نەخشێنراو لە بازاڕی سلێمانی",
	},
	"qandil-shepherds": {
		title: "شوانەکانی بناری قەندیل",
		alt: "شوانەکان لەگەڵ مەڕەکانیان لە بناری قەندیل",
	},
	"klash-weaving": {
		title: "چنینی کڵاش، هەورامان",
		alt: "دەستەکان لە کاتی چنینی کڵاشی هەورامی",
	},
	"newroz-fires": {
		title: "ئاگری نەورۆز",
		alt: "ئاگری ئاهەنگی نەورۆز لە ئێوارەدا",
	},
	"glass-plate-portrait": {
		title: "وێنەی شووشەیی، ١٩٢٣",
		alt: "وێنەیەکی شووشەیی نۆژەنکراوە لە ئەرشیڤی کۆن",
	},
	"sine-kilim": {
		title: "نەخشی بەڕەی سنە",
		alt: "بەڕەی چنراو بە نەخشی ئەندازەیی سنە",
	},
	"daf-workshop": {
		title: "کارگەی دەفسازی",
		alt: "پیشەوەرێک پێست بەسەر چوارچێوەی دەفدا ڕادەکێشێت",
	},
	"badinan-village": {
		title: "گوندێکی شاخاوی، بادینان",
		alt: "خانووە بەردینەکانی گوندێکی شاخاوی لە بادینان",
	},
	"soran-headdress": {
		title: "سەرپۆشی ژنان، سۆران",
		alt: "سەرپۆشی نەریتی ژنان لە ناوچەی سۆران",
	},
	"teahouse-storytellers": {
		title: "چیرۆکبێژانی چایخانە",
		alt: "چیرۆکبێژان لە چایخانەیەکی نەریتیدا کۆبوونەتەوە",
	},
};

const KU_COPY: Record<string, GalleryCopy> = {
	"hawraman-spring": {
		title: "Hewraman di biharê de",
		alt: "Gundê pêlekanî yê Hewramanê di biharê de",
	},
	"bridal-dress": {
		title: "Cilê bûkê yê kurdî",
		alt: "Cilê bûkê yê kevneşopî bi qumaşê neqişandî",
	},
	"copper-bazaar": {
		title: "Misgerên Silêmaniyê",
		alt: "Karê misî yê neqişandî li bazara Silêmaniyê",
	},
	"qandil-shepherds": {
		title: "Şivanên bin Qendîlê",
		alt: "Şivan bi keriyên xwe re li binê çiyayê Qendîlê",
	},
	"klash-weaving": {
		title: "Çêkirina kilaşê, Hewraman",
		alt: "Dest di dema çêkirina kilaşê kevneşopî de",
	},
	"newroz-fires": {
		title: "Agirê Newrozê",
		alt: "Agirê pîrozbahiya Newrozê di êvarê de",
	},
	"glass-plate-portrait": {
		title: "Portreya camî, 1923",
		alt: "Portreyeke camî ya nûvekirî ji arşîva kevn",
	},
	"sine-kilim": {
		title: "Motîfên kilîma Sineyê",
		alt: "Kilîma honandî bi motîfên geometrîk ên Sineyê",
	},
	"daf-workshop": {
		title: "Atolyeya defçêker",
		alt: "Pîşekarek çerm li ser çarçoveya defê dikişîne",
	},
	"badinan-village": {
		title: "Gundê çiyayî, Badînan",
		alt: "Xaniyên kevirîn ên gundekî çiyayî li Badînanê",
	},
	"soran-headdress": {
		title: "Serpoşa jinan, Soran",
		alt: "Serpoşa kevneşopî ya jinan ji herêma Soranê",
	},
	"teahouse-storytellers": {
		title: "Çîrokbêjên çayxaneyê",
		alt: "Çîrokbêj li çayxaneyeke kevneşopî civiyane",
	},
};

const CATEGORY_LABELS: Record<string, Record<GalleryCategory, string>> = {
	en: {
		photography: "Photography",
		traditionalDress: "Traditional dress",
		crafts: "Handicrafts",
	},
	ckb: {
		photography: "وێنە",
		traditionalDress: "جلوبەرگی کۆن",
		crafts: "پیشەی دەستی",
	},
	ku: {
		photography: "Wêne",
		traditionalDress: "Cilên kevneşopî",
		crafts: "Kariya destan",
	},
};

function copyFor(locale: string): Record<string, GalleryCopy> {
	if (locale === "ckb") return CKB_COPY;
	if (locale === "ku") return KU_COPY;
	return EN_COPY;
}

function categoryLabelsFor(locale: string): Record<GalleryCategory, string> {
	return CATEGORY_LABELS[locale] ?? CATEGORY_LABELS.en;
}

function build(
	base: GalleryHeroImageBase[],
	copy: Record<string, GalleryCopy>,
	categoryLabels: Record<GalleryCategory, string>,
): GalleryHeroImage[] {
	return base.map(({ id, url, aspect, category }) => {
		const text = copy[id] ?? EN_COPY[id];
		return {
			id,
			aspect,
			category,
			categoryLabel: category ? categoryLabels[category] : undefined,
			title: text.title,
			image: { url, alt: text.alt },
		};
	});
}

export function getGalleryHeroColumns(locale: string): GalleryHeroColumns {
	const copy = copyFor(locale);
	const categoryLabels = categoryLabelsFor(locale);
	const postIds = [
		"the-mountain-keeps-us",
		"threads-of-identity",
		"made-by-hand",
		"city-of-poets",
		"the-radio-years",
		"festivals-of-the-plain",
		"doors-of-the-old-quarter",
		"bread-and-salt",
	];
	const withHref = (items: GalleryHeroImage[]): GalleryHeroImage[] =>
		items.map((item, index) => ({
			...item,
			href: `/gallery/${postIds[index % postIds.length]}`,
		}));

	return {
		up: withHref(build(UP_BASE, copy, categoryLabels)),
		down: withHref(build(DOWN_BASE, copy, categoryLabels)),
	};
}

/* ----------------------------------------------------------------------------
   Gallery posts — mock collections shaped after the public Image Collection
   API (GET /api/v1/image-collections): collection type, topic, publishment
   date, per-language content (title, Tiptap-HTML description, location,
   collectedBy), tags, and an ordered image album with auto-extracted upload
   metadata. UI-only stand-in — an adapter maps the real DTO onto this shape
   when the endpoints are wired.
   -------------------------------------------------------------------------- */

export type GalleryCollectionType = "SINGLE" | "GALLERY" | "PHOTO_STORY";

export type GalleryAlbumItem = {
	id: number;
	/** Uploaded S3/CDN URL — present for hosted files. */
	imageUrl?: string;
	/** Third-party page link — UI may link out instead of lightboxing. */
	externalUrl?: string;
	/** iframe-embeddable URL — UI may embed instead of lightboxing. */
	embedUrl?: string;
	/** Localized caption (captionCkb / captionKmr resolved per locale). */
	caption?: string;
	/** Localized long description (descriptionCkb / descriptionKmr). */
	description?: string;
	/** 0-based display order — the album arrives sorted ASC. */
	sortOrder: number;
	/* Auto-extracted upload metadata — absent for URL-only items (per API). */
	widthPx?: number;
	heightPx?: number;
	/** widthPx / heightPx, as the API computes it. */
	aspectRatio?: number;
	humanReadableSize?: string;
	mimeType?: string;
	fileSizeBytes?: number;
};

export type GalleryPost = {
	/** Mock slug id (the real API keys collections by numeric id). */
	id: string;
	collectionType: GalleryCollectionType;
	title: string;
	/** Markdown or legacy HTML — render via RichText. */
	description: string;
	location?: string;
	collectedBy?: string;
	/** Localized topic name (topicNameCkb / topicNameKmr). */
	topicName?: string;
	/** ISO-8601 date (YYYY-MM-DD). */
	publishmentDate: string;
	tags: string[];
	/** CMS cover/thumbnail URL — may differ from album[0]. */
	coverUrl?: string;
	/** Ordered album — its length IS the photo count (no separate field). */
	album: GalleryAlbumItem[];
};

/* Album pool — stands in for uploaded files. Dimensions mimic the API's
   auto-extracted metadata; entries WITHOUT dimensions mimic URL-only items
   (all metadata null, per the API note). captionId reuses the hero copy maps
   above so captions localize without re-translating. */
type AlbumPoolEntry = {
	url: string;
	w?: number;
	h?: number;
	captionId?: string;
};

const ALBUM_POOL: AlbumPoolEntry[] = [
	{ url: "/gallery/1.jpg", w: 1600, h: 2400, captionId: "hawraman-spring" },
	{ url: "/gallery/2.jpg", w: 2000, h: 2500, captionId: "bridal-dress" },
	{ url: "/gallery/3.jpg", w: 1800, h: 2700, captionId: "copper-bazaar" },
	{ url: "/gallery/4.jpg", w: 2400, h: 1600, captionId: "qandil-shepherds" },
	{ url: "/gallery/5.jpg", w: 1600, h: 2000, captionId: "klash-weaving" },
	{ url: "/gallery/6.jpg", w: 2048, h: 2048, captionId: "newroz-fires" },
	{
		url: "/gallery/7.jpg",
		w: 1700,
		h: 2550,
		captionId: "glass-plate-portrait",
	},
	{ url: "/gallery/8.jpg", w: 2400, h: 1800, captionId: "sine-kilim" },
	{ url: "/menu/1.jpg", w: 1920, h: 2400, captionId: "daf-workshop" },
	{ url: "/menu/2.jpg", w: 2200, h: 1650, captionId: "badinan-village" },
	{ url: "/menu/3.jpg", w: 1600, h: 2133, captionId: "soran-headdress" },
	{ url: "/menu/4.jpg", w: 2000, h: 1500, captionId: "teahouse-storytellers" },
	{ url: "/menu/5.jpg", w: 1600, h: 2400 },
	{ url: "/menu/6.jpg", w: 2400, h: 1600 },
	{ url: "/menu/7.jpg", w: 1800, h: 2250 },
	{ url: "/news/1.jpg", w: 2000, h: 3000 },
	{ url: "/news/2.jpg", w: 2400, h: 1600 },
	{ url: "/news/3.jpg" },
	{ url: "/news/4.jpg", w: 1600, h: 2000 },
	{ url: "/news/5.jpg", w: 2048, h: 2048 },
	{ url: "/news/6.jpg", w: 1620, h: 2430 },
	{ url: "/news/7.jpg", w: 2400, h: 1800 },
	{ url: "/news/8.jpg" },
	{ url: "/news/9.jpg", w: 1700, h: 2125 },
	{ url: "/news/10.jpg", w: 2000, h: 1333 },
];

/* Mock IMAGE topics (GET /topics returns id + nameCkb + nameKmr). */
type GalleryTopicKey = "nature" | "history" | "culture" | "crafts";

const TOPIC_NAMES: Record<string, Record<GalleryTopicKey, string>> = {
	en: {
		nature: "Nature",
		history: "History",
		culture: "Culture",
		crafts: "Handicrafts",
	},
	ckb: {
		nature: "سروشت",
		history: "مێژوو",
		culture: "کەلتوور",
		crafts: "پیشەی دەستی",
	},
	ku: {
		nature: "Xweza",
		history: "Dîrok",
		culture: "Çand",
		crafts: "Kariya destan",
	},
};

type GalleryPostBase = {
	id: string;
	collectionType: GalleryCollectionType;
	publishmentDate: string;
	topicKey?: GalleryTopicKey;
	/** Album = albumLength pool entries starting at albumStart (wraps). */
	albumStart: number;
	albumLength: number;
};

const POSTS_BASE: GalleryPostBase[] = [
	{
		id: "the-mountain-keeps-us",
		collectionType: "GALLERY",
		publishmentDate: "2025-04-18",
		topicKey: "nature",
		albumStart: 0,
		albumLength: 12,
	},
	{
		id: "threads-of-identity",
		collectionType: "GALLERY",
		publishmentDate: "2024-11-02",
		topicKey: "culture",
		albumStart: 5,
		albumLength: 10,
	},
	{
		id: "made-by-hand",
		collectionType: "GALLERY",
		publishmentDate: "2025-02-21",
		topicKey: "crafts",
		albumStart: 9,
		albumLength: 13,
	},
	{
		id: "city-of-poets",
		collectionType: "PHOTO_STORY",
		publishmentDate: "2023-09-14",
		topicKey: "culture",
		albumStart: 13,
		albumLength: 11,
	},
	{
		id: "the-radio-years",
		collectionType: "GALLERY",
		publishmentDate: "2024-06-07",
		topicKey: "history",
		albumStart: 17,
		albumLength: 10,
	},
	{
		id: "festivals-of-the-plain",
		collectionType: "GALLERY",
		publishmentDate: "2025-03-21",
		topicKey: "culture",
		albumStart: 2,
		albumLength: 12,
	},
	{
		id: "doors-of-the-old-quarter",
		collectionType: "PHOTO_STORY",
		publishmentDate: "2023-05-30",
		topicKey: "history",
		albumStart: 7,
		albumLength: 10,
	},
	{
		id: "bread-and-salt",
		collectionType: "GALLERY",
		publishmentDate: "2024-12-12",
		topicKey: "culture",
		albumStart: 11,
		albumLength: 11,
	},
];

/* Per-language content block — mirrors LanguageContentDto (title, Tiptap-HTML
   description, location, collectedBy) plus the language's tag set. */
type GalleryPostCopy = {
	title: string;
	description: string;
	location?: string;
	collectedBy?: string;
	tags: string[];
};

const POSTS_EN: Record<string, GalleryPostCopy> = {
	"the-mountain-keeps-us": {
		title: "The Mountain Keeps Us",
		description:
			"<p>Landscapes and lives along the high passes — herding routes, spring pastures, and the villages that hold to the slopes.</p><p>Photographed across three springs, from the first thaw to the last move of the flocks.</p>",
		location: "Hawraman range, Kurdistan",
		collectedBy: "Dr. Shilan Hassan",
		tags: ["Kurdistan", "nature", "spring"],
	},
	"threads-of-identity": {
		title: "Threads of Identity",
		description:
			"<p>Regional dress from Hawraman to Botan, photographed piece by piece — pattern, weave, and the hands that still make them.</p>",
		location: "Hawraman to Botan",
		collectedBy: "Dilan Mohammed",
		tags: ["dress", "weaving", "identity"],
	},
	"made-by-hand": {
		title: "Made by Hand",
		description:
			"<p>Coppersmiths, weavers, and instrument makers at work — craft traditions documented in the workshops where they survive.</p>",
		location: "Sulaymaniyah bazaar",
		collectedBy: "Kamal Aziz",
		tags: ["crafts", "copper", "workshop"],
	},
	"city-of-poets": {
		title: "City of Poets",
		description:
			"<p>Street scenes and teahouse evenings in Sulaymaniyah — the everyday rhythm of a city that keeps its memory in verse.</p><p>A sequential photo story, told in the order the day unfolds.</p>",
		location: "Sulaymaniyah",
		collectedBy: "Narin Ali",
		tags: ["Sulaymaniyah", "street", "poetry"],
	},
	"the-radio-years": {
		title: "The Radio Years",
		description:
			"<p>Studios, transmitters, and the voices behind them — portraits from the era when the airwaves carried Kurdish song across borders.</p>",
		location: "Baghdad & Yerevan studios",
		collectedBy: "Hawar Salih",
		tags: ["radio", "archive", "song"],
	},
	"festivals-of-the-plain": {
		title: "Festivals of the Plain",
		description:
			"<p>Newroz gatherings, harvest dances, and wedding processions — celebration photographed from inside the circle.</p>",
		location: "Sharazor plain",
		collectedBy: "Rojin Karim",
		tags: ["Newroz", "dance", "wedding"],
	},
	"doors-of-the-old-quarter": {
		title: "Doors of the Old Quarter",
		description:
			"<p>Carved wood, worn thresholds, and courtyard gates — a study of the entrances that hold a neighborhood's history.</p>",
		location: "Old quarter, Sulaymaniyah",
		collectedBy: "Avin Taha",
		tags: ["architecture", "history", "doors"],
	},
	"bread-and-salt": {
		title: "Bread and Salt",
		description:
			"<p>Tandoor mornings, mountain kitchens, and the long table — hospitality as it is practiced, not performed.</p>",
		location: "Across Kurdistan",
		collectedBy: "KHI field team",
		tags: ["food", "hospitality", "tandoor"],
	},
};

const POSTS_CKB: Record<string, GalleryPostCopy> = {
	"the-mountain-keeps-us": {
		title: "چیا ئێمەی دەپارێزێت",
		description:
			"<p>دیمەن و ژیان لە ڕێگا بەرزەکاندا — ڕێچکەی شوانکارە، لەوەڕگای بەهار و ئەو گوندانەی بە بناری چیاوە لکاون.</p><p>لە ماوەی سێ بەهاردا وێنەگیراون، لە یەکەم توانەوەی بەفرەوە تا دوایین کۆچی مەڕەکان.</p>",
		location: "زنجیرە چیای هەورامان، کوردستان",
		collectedBy: "د. شیلان حەسەن",
		tags: ["کوردستان", "سروشت", "بەهار"],
	},
	"threads-of-identity": {
		title: "ڕیشاڵەکانی ناسنامە",
		description:
			"<p>جلوبەرگی ناوچەیی لە هەورامانەوە تا بۆتان، پارچە بە پارچە وێنەگیراون — نەخش، چنین و ئەو دەستانەی هێشتا دروستیان دەکەن.</p>",
		location: "لە هەورامانەوە بۆ بۆتان",
		collectedBy: "دیلان محەمەد",
		tags: ["جلوبەرگ", "چنین", "ناسنامە"],
	},
	"made-by-hand": {
		title: "بە دەست دروستکراو",
		description:
			"<p>مسگەر و چنەر و ئامێرسازەکان لە کاتی کارکردندا — نەریتی پیشەیی لەو کارگانەدا تۆمارکراون کە تێیاندا ماونەتەوە.</p>",
		location: "بازاڕی سلێمانی",
		collectedBy: "کەمال عەزیز",
		tags: ["پیشە", "مس", "کارگە"],
	},
	"city-of-poets": {
		title: "شاری شاعیران",
		description:
			"<p>دیمەنی شەقام و ئێوارانی چایخانەکان لە سلێمانی — ڕیتمی ڕۆژانەی شارێک کە یادەوەری خۆی بە شیعر دەپارێزێت.</p><p>چیرۆکێکی وێنەیی زنجیرەیی، بەو ڕیزبەندییە گێڕدراوەتەوە کە ڕۆژەکە تێیدا تێدەپەڕێت.</p>",
		location: "سلێمانی",
		collectedBy: "نارین عەلی",
		tags: ["سلێمانی", "شەقام", "شیعر"],
	},
	"the-radio-years": {
		title: "ساڵانی ڕادیۆ",
		description:
			"<p>ستودیۆ و وەرگرەکان و ئەو دەنگانەی لە پشتیانەوە بوون — وێنەی ئەو سەردەمەی شەپۆلەکان گۆرانی کوردییان بەسەر سنوورەکاندا دەگەیاند.</p>",
		location: "ستودیۆکانی بەغدا و یەریڤان",
		collectedBy: "هاوار ساڵح",
		tags: ["ڕادیۆ", "ئەرشیڤ", "گۆرانی"],
	},
	"festivals-of-the-plain": {
		title: "جەژنەکانی دەشت",
		description:
			"<p>کۆبوونەوەکانی نەورۆز، هەڵپەڕکێی دروێنە و کاروانی بووکگوازی — ئاهەنگ لە ناو بازنەکەوە وێنەگیراوە.</p>",
		location: "دەشتی شارەزوور",
		collectedBy: "ڕۆژین کەریم",
		tags: ["نەورۆز", "هەڵپەڕکێ", "زەماوەند"],
	},
	"doors-of-the-old-quarter": {
		title: "دەرگاکانی گەڕەکی کۆن",
		description:
			"<p>داری نەخشێنراو، بەردەرگای کۆن و دەروازەی حەوشەکان — لێکۆڵینەوەیەک لەو دەرگایانەی مێژووی گەڕەکێک هەڵدەگرن.</p>",
		location: "گەڕەکی کۆنی سلێمانی",
		collectedBy: "ئاڤین تەها",
		tags: ["تەلارسازی", "مێژوو", "دەرگا"],
	},
	"bread-and-salt": {
		title: "نان و خوێ",
		description:
			"<p>بەیانییانی تەنوور، چێشتخانەی شاخ و سفرە درێژەکان — میوانداری وەک خۆی، نەک وەک نمایش.</p>",
		location: "سەرانسەری کوردستان",
		collectedBy: "تیمی مەیدانی ئینستیتوت",
		tags: ["خواردن", "میوانداری", "تەنوور"],
	},
};

const POSTS_KU: Record<string, GalleryPostCopy> = {
	"the-mountain-keeps-us": {
		title: "Çiya me diparêze",
		description:
			"<p>Dîmen û jiyan li ser rêyên bilind — rêçikên şivaniyê, mêrgên biharê û gundên ku xwe bi çiyan ve girtine.</p><p>Di sê biharan de hatine wênekirin, ji heliyana yekem a berfê heta koça dawî ya keriyan.</p>",
		location: "Zincîreçiyayên Hewramanê, Kurdistanê",
		collectedBy: "Dr. Şîlan Hesen",
		tags: ["Kurdistan", "xweza", "bihar"],
	},
	"threads-of-identity": {
		title: "Tayên nasnameyê",
		description:
			"<p>Cilên herêmî ji Hewramanê heta Botanê, perçe bi perçe hatine wênekirin — nexş, honandin û destên ku hîn jî wan çêdikin.</p>",
		location: "Ji Hewramanê heta Botanê",
		collectedBy: "Dîlan Mihemed",
		tags: ["cil", "honandin", "nasname"],
	},
	"made-by-hand": {
		title: "Bi dest çêkirî",
		description:
			"<p>Misger, honandkar û amûrsaz di dema xebatê de — kevneşopiyên pîşeyî li atolyeyên ku lê dijîn hatine tomarkirin.</p>",
		location: "Bazara Silêmaniyê",
		collectedBy: "Kemal Ezîz",
		tags: ["pîşe", "mis", "atolye"],
	},
	"city-of-poets": {
		title: "Bajarê helbestvanan",
		description:
			"<p>Dîmenên kolanan û êvarên çayxaneyan li Silêmaniyê — rîtma rojane ya bajarekî ku bîra xwe bi helbestê diparêze.</p><p>Çîrokeke wêneyî ya rêzdar, bi rêza ku roj tê de derbas dibe hatiye vegotin.</p>",
		location: "Silêmanî",
		collectedBy: "Narîn Elî",
		tags: ["Silêmanî", "kolan", "helbest"],
	},
	"the-radio-years": {
		title: "Salên radyoyê",
		description:
			"<p>Studyo, veguhêzer û dengên li pişt wan — portreyên serdema ku pêlên radyoyê strana kurdî derbasî ser sînoran dikirin.</p>",
		location: "Studyoyên Bexda û Yêrêvanê",
		collectedBy: "Hawar Salih",
		tags: ["radyo", "arşîv", "stran"],
	},
	"festivals-of-the-plain": {
		title: "Cejnên deştê",
		description:
			"<p>Civînên Newrozê, govendên dirûnê û karwanên bûkaniyê — şahî ji nava gerê hatiye wênekirin.</p>",
		location: "Deşta Şarezûr",
		collectedBy: "Rojîn Kerîm",
		tags: ["Newroz", "govend", "dawet"],
	},
	"doors-of-the-old-quarter": {
		title: "Deriyên taxa kevn",
		description:
			"<p>Darê neqişandî, şêmûgên kevn û deriyên hewşan — lêkolînek li ser wan deriyên ku dîroka taxekê dihewînin.</p>",
		location: "Taxa kevn, Silêmanî",
		collectedBy: "Avîn Teha",
		tags: ["avahîsazî", "dîrok", "derî"],
	},
	"bread-and-salt": {
		title: "Nan û xwê",
		description:
			"<p>Sibehên tenûrê, metbexên çiyê û sifreya dirêj — mêvandarî wek ku tê jiyîn, ne wek pêşandan.</p>",
		location: "Li seranserê Kurdistanê",
		collectedBy: "Tîma meydanî ya KHI",
		tags: ["xwarin", "mêvandarî", "tenûr"],
	},
};

function postsCopyFor(locale: string): Record<string, GalleryPostCopy> {
	if (locale === "ckb") return POSTS_CKB;
	if (locale === "ku") return POSTS_KU;
	return POSTS_EN;
}

/** Deterministic mock of the API's computed humanReadableSize. */
function mockFileSize(w: number, h: number): string {
	const mb = (w * h * 0.38) / 1_048_576;
	return mb >= 1 ? `${mb.toFixed(1)} MB` : `${Math.round(mb * 1024)} KB`;
}

function buildAlbum(base: GalleryPostBase, locale: string): GalleryAlbumItem[] {
	const captions = copyFor(locale);
	return Array.from({ length: base.albumLength }, (_, i) => {
		const entry = ALBUM_POOL[(base.albumStart + i) % ALBUM_POOL.length];
		const { url, w, h, captionId } = entry;
		const copy = captionId ? (captions[captionId] ?? EN_COPY[captionId]) : null;
		const caption = copy?.title;
		const description = copy?.alt;

		const item: GalleryAlbumItem = {
			id: base.albumStart * 100 + i,
			imageUrl: url,
			caption,
			description:
				description && description !== caption ? description : undefined,
			sortOrder: i,
		};
		if (w != null && h != null) {
			item.widthPx = w;
			item.heightPx = h;
			item.aspectRatio = w / h;
			item.humanReadableSize = mockFileSize(w, h);
			item.mimeType = "image/jpeg";
			item.fileSizeBytes = Math.round((w * h * 0.38) / 1);
		}
		return item;
	});
}

export const GALLERY_POSTS_PER_PAGE = 4;

export function filterGalleryPosts(
	items: GalleryPost[],
	query?: string | null,
	type?: string | null,
): GalleryPost[] {
	const trimmedQuery = query?.trim().toLowerCase();
	const trimmedType = type?.trim().toUpperCase();

	return items.filter((item) => {
		if (trimmedType && item.collectionType !== trimmedType) {
			return false;
		}

		if (!trimmedQuery) {
			return true;
		}

		return (
			item.title.toLowerCase().includes(trimmedQuery) ||
			item.tags.some((tag) => tag.toLowerCase().includes(trimmedQuery)) ||
			item.topicName?.toLowerCase().includes(trimmedQuery)
		);
	});
}

export function paginateGalleryPosts<T>(
	items: T[],
	page: number,
	perPage: number = GALLERY_POSTS_PER_PAGE,
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

export function getGalleryPosts(locale: string): GalleryPost[] {
	const copy = postsCopyFor(locale);
	const topicNames = TOPIC_NAMES[locale] ?? TOPIC_NAMES.en;
	return POSTS_BASE.map((base) => {
		const text = copy[base.id] ?? POSTS_EN[base.id];
		return {
			id: base.id,
			collectionType: base.collectionType,
			publishmentDate: base.publishmentDate,
			topicName: base.topicKey ? topicNames[base.topicKey] : undefined,
			title: text.title,
			description: text.description,
			location: text.location,
			collectedBy: text.collectedBy,
			tags: text.tags,
			album: buildAlbum(base, locale),
		};
	});
}

export type GalleryPostDetail = {
	post: GalleryPost;
	previous: GalleryPost | null;
	next: GalleryPost | null;
};

export function getGalleryPostBySlug(
	locale: string,
	slug: string,
): GalleryPostDetail | null {
	const posts = getGalleryPosts(locale);
	const index = posts.findIndex((post) => post.id === slug);
	if (index === -1) return null;

	return {
		post: posts[index],
		previous: posts[index - 1] ?? null,
		next: posts[index + 1] ?? null,
	};
}
