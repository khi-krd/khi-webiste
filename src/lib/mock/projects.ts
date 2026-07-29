import type { MediaItem, MediaKind } from "@/types/media";
import type { ProjectStatus } from "@/types/project";

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

export type ProjectListItem = ProjectItem & {
	description: string;
	excerpt: string;
	location: string | null;
	projectType: string | null;
	status: ProjectStatus | null;
	projectDate: string | null;
	year: string | null;
	tags: string[];
	keywords: string[];
	coverMediaType: MediaKind | null;
	coverUrl: string;
	coverThumbnailUrl: string | null;
	mediaGallery: MediaItem[];
};

/** Loose mock shape — normalized before use. */
type MockProjectRecord = Omit<ProjectListItem, "coverUrl" | "mediaGallery"> & {
	coverUrl?: string;
	mediaGallery?: Array<Partial<MediaItem> & { url: string }>;
};

export type ProjectDetail = ProjectListItem & {
	previous: ProjectListItem | null;
	next: ProjectListItem | null;
};

export const PROJECTS_PER_PAGE = 9;

type LocaleRecords = MockProjectRecord[];

const EN_RECORDS: LocaleRecords = [
	{
		id: "1",
		slug: "1",
		title: "Oral History Archive",
		subtitle: "Erbil",
		description:
			'<p>A long-term programme recording elder voices across Kurdistan — preserving dialect, memory, and family narrative before they are lost to time. What began as a single microphone in a family living room has grown into a coordinated field archive spanning cities, villages, and diaspora communities.</p><h2>What we capture</h2><p>Interviews span family genealogy, village history, craft knowledge, and songs remembered from childhood. Each session is recorded in the speaker\'s own dialect, with consent forms archived alongside the audio file and a written summary in both Sorani and Kurmanji where possible.</p><p>Field workers travel with portable recorders and backup batteries. Sessions often run two hours; the best material frequently appears after the formal questions, when tea is poured and memory loosens.</p><h2>How recordings are preserved</h2><p>Audio is stored in lossless formats, checksum-verified, and duplicated across institute storage and an off-site vault. Transcripts are optional but encouraged — many elders prefer audio-only preservation, and we honour that choice.</p><blockquote>Every voice archived is a thread in a fabric that would otherwise unravel within a single generation.</blockquote><h2>Who can access the archive</h2><p>Researchers, journalists, and family members may request access through the institute reading room. Sensitive material — names, locations, or political testimony — can be restricted at the narrator\'s request for a fixed period or permanently.</p><figure><img src="/menu/2.jpg" alt="Recording session" /><figcaption>Field recording in Erbil, 2025 — dialect mapping interview with a community elder.</figcaption></figure><p>Publication online is always opt-in. When excerpts appear on the institute website, they are edited for clarity but never stripped of the speaker\'s own words.</p>',
		excerpt:
			"A long-term programme recording elder voices across Kurdistan — preserving dialect, memory, and family narrative.",
		location: "Erbil",
		projectType: "Education",
		status: "ACTIVE",
		projectDate: "2025-03-12",
		year: "2025",
		tags: ["Oral history", "Kurdistan"],
		keywords: ["memory", "dialect"],
		coverMediaType: "IMAGE",
		coverUrl: "/menu/2.jpg",
		coverThumbnailUrl: null,
		mediaGallery: [],
		image: {
			url: "/menu/2.jpg",
			alt: "Recording session for the oral history archive",
		},
	},
	{
		id: "2",
		slug: "2",
		title: "Manuscript Digitization",
		subtitle: "Sulaymaniyah",
		description:
			"<p>Fragile Kurdish manuscripts are scanned, catalogued, and made searchable for scholars — turning private collections into a shared research commons.</p><h2>Digitisation workflow</h2><p>Each folio is photographed under controlled light, then transcribed where legible. Metadata is bilingual and linked to holding institutions.</p><blockquote>Every page preserved is a door opened for researchers who may never visit the original archive.</blockquote>",
		excerpt:
			"Fragile Kurdish manuscripts are scanned, catalogued, and made searchable for scholars worldwide.",
		location: "Sulaymaniyah",
		projectType: "Heritage",
		status: "COMPLETED",
		projectDate: "2024-09-01",
		year: "2024",
		tags: ["Manuscripts", "Digitization"],
		keywords: ["texts", "library"],
		coverMediaType: "IMAGE",
		coverUrl: "/menu/1.jpg",
		coverThumbnailUrl: null,
		mediaGallery: [
			{
				url: "/menu/1.jpg",
				kind: "IMAGE",
				thumbnailUrl: null,
				caption: "Manuscript folio before conservation.",
				sortOrder: 0,
			},
			{
				url: "/menu/3.jpg",
				kind: "IMAGE",
				thumbnailUrl: null,
				caption: "Digitisation workstation at the institute.",
				sortOrder: 1,
			},
		],
		image: {
			url: "/menu/1.jpg",
			alt: "Manuscript being digitized in the heritage archive",
		},
	},
	{
		id: "3",
		slug: "3",
		title: "Folk Music Collection",
		subtitle: "Duhok",
		description:
			"<p>Regional songs, instruments, and performances are recorded in the field — building an open audio archive of Kurdish musical heritage.</p><h2>Listen in context</h2><p>Recordings include the instrument, the setting, and the story behind each melody. Audio is published alongside notes on region and performer.</p>",
		excerpt:
			"Regional songs, instruments, and performances recorded in the field for an open audio archive.",
		location: "Duhok",
		projectType: "Culture",
		status: "ACTIVE",
		projectDate: "2025-01-20",
		year: "2025",
		tags: ["Music", "Folk"],
		keywords: ["audio", "performance"],
		coverMediaType: "AUDIO",
		coverUrl: "/menu/5.jpg",
		coverThumbnailUrl: "/menu/5.jpg",
		mediaGallery: [
			{
				url: "/menu/5.jpg",
				kind: "IMAGE",
				thumbnailUrl: null,
				caption: "A tanbur player during a field session.",
				sortOrder: 0,
			},
		],
		image: {
			url: "/menu/5.jpg",
			alt: "Musician performing traditional Kurdish folk music",
		},
	},
	{
		id: "4",
		slug: "4",
		title: "Traditional Dress Archive",
		subtitle: "Kirkuk",
		description:
			"<p>Textile patterns, embroidery, and regional dress are documented through photography and oral testimony — mapping identity through cloth.</p>",
		excerpt:
			"Textile patterns and regional dress documented through photography and oral testimony.",
		location: "Kirkuk",
		projectType: "Heritage",
		status: "COMPLETED",
		projectDate: "2023-11-08",
		year: "2023",
		tags: ["Textiles", "Dress"],
		keywords: ["craft", "identity"],
		coverMediaType: "IMAGE",
		coverThumbnailUrl: null,
		mediaGallery: [{ url: "/menu/3.jpg" }],
		image: {
			url: "/menu/3.jpg",
			alt: "Traditional Kurdish dress on display",
		},
	},
	{
		id: "5",
		slug: "5",
		title: "Photographic Heritage",
		subtitle: "Erbil",
		description:
			"<p>Historic family albums and community photographs are collected, restored, and returned to public view — a visual history of everyday Kurdish life.</p>",
		excerpt:
			"Historic family albums collected, restored, and returned to public view.",
		location: "Erbil",
		projectType: "Culture",
		status: "ACTIVE",
		projectDate: "2024-06-15",
		year: "2024",
		tags: ["Photography", "Archive"],
		keywords: ["images", "community"],
		coverMediaType: "IMAGE",
		coverThumbnailUrl: null,
		mediaGallery: [{ url: "/menu/7.jpg" }, { url: "/menu/4.jpg" }],
		image: {
			url: "/menu/7.jpg",
			alt: "Historical photograph from a Kurdish family archive",
		},
	},
	{
		id: "6",
		slug: "6",
		title: "Language Atlas",
		subtitle: "Sulaymaniyah",
		description:
			"<p>Dialect maps, pronunciation guides, and community interviews chart the living geography of Kurdish speech across regions and generations.</p>",
		excerpt:
			"Dialect maps and community interviews chart the living geography of Kurdish speech.",
		location: "Sulaymaniyah",
		projectType: "Education",
		status: "ACTIVE",
		projectDate: "2025-02-02",
		year: "2025",
		tags: ["Language", "Dialect"],
		keywords: ["linguistics", "atlas"],
		coverMediaType: "IMAGE",
		coverThumbnailUrl: null,
		mediaGallery: [],
		image: {
			url: "/menu/6.jpg",
			alt: "Language atlas research materials",
		},
	},
];

const KU_RECORDS: LocaleRecords = [
	{
		id: "1",
		slug: "1",
		title: "Arşîva Dîroka Devkî",
		subtitle: "Hewlêr",
		description:
			"<p>Programa dirêjdem a tomarkirina dengên kal û kalik ji seranserê Kurdistanê — parastina devok, bîr û çîroka malbatî berî ku bi demê re winda bibin.</p>",
		excerpt:
			"Programa dirêjdem a tomarkirina dengên kal û kalik ji seranserê Kurdistanê.",
		location: "Hewlêr",
		projectType: "Perwerdehî",
		status: "ACTIVE",
		projectDate: "2025-03-12",
		year: "2025",
		tags: ["Dîroka devkî", "Kurdistan"],
		keywords: ["bîr", "devok"],
		coverMediaType: "IMAGE",
		coverThumbnailUrl: null,
		mediaGallery: [],
		image: {
			url: "/menu/2.jpg",
			alt: "Danişîna tomarkirina dîroka devkî",
		},
	},
	{
		id: "2",
		slug: "2",
		title: "Dîjîtalîzekirina Destnivîsan",
		subtitle: "Silêmanî",
		description:
			"<p>Destnivîsên kurdî yên tuj têne skan kirin, katalogkirin û ji bo zanistvanan guncaw kirin — koleksiyonên taybet dibin arşîva hevpar.</p>",
		excerpt:
			"Destnivîsên kurdî yên tuj têne skan kirin û ji bo zanistvanan guncaw kirin.",
		location: "Silêmanî",
		projectType: "Mîrat",
		status: "COMPLETED",
		projectDate: "2024-09-01",
		year: "2024",
		tags: ["Destnivîs", "Dîjîtalîzekirin"],
		keywords: ["nivîs", "pirtûkxane"],
		coverMediaType: "IMAGE",
		coverThumbnailUrl: null,
		mediaGallery: [{ url: "/menu/1.jpg" }, { url: "/menu/3.jpg" }],
		image: {
			url: "/menu/1.jpg",
			alt: "Destnivîsek di arşîva mîratê de tê dîjîtalîzekirin",
		},
	},
	{
		id: "3",
		slug: "3",
		title: "Koleksiyona Stranên Gelêrî",
		subtitle: "Dihok",
		description:
			"<p>Stran, amûr û performansên herêmî li qadê têne tomarkirin — avakirina arşîva dengî ya vekirî ya mîrata muzîkî ya kurdî.</p>",
		excerpt:
			"Stran û performansên herêmî li qadê têne tomarkirin ji bo arşîva dengî ya vekirî.",
		location: "Dihok",
		projectType: "Çand",
		status: "ACTIVE",
		projectDate: "2025-01-20",
		year: "2025",
		tags: ["Muzîk", "Gelêrî"],
		keywords: ["deng", "performans"],
		coverMediaType: "IMAGE",
		coverThumbnailUrl: null,
		mediaGallery: [],
		image: {
			url: "/menu/5.jpg",
			alt: "Stranbêjek stranên gelêrî yên kurdî dileyize",
		},
	},
	{
		id: "4",
		slug: "4",
		title: "Arşîva Cilên Kevneşopî",
		subtitle: "Kerkûk",
		description:
			"<p>Desenên tekstîl, qetandin û cilên herêmî bi wêne û şahidiya devkî têne belgekirin — nasname bi cil ve tê nexşandin.</p>",
		excerpt:
			"Desenên tekstîl û cilên herêmî bi wêne û şahidiya devkî têne belgekirin.",
		location: "Kerkûk",
		projectType: "Mîrat",
		status: "COMPLETED",
		projectDate: "2023-11-08",
		year: "2023",
		tags: ["Tekstîl", "Cil"],
		keywords: ["kar", "nasname"],
		coverMediaType: "IMAGE",
		coverThumbnailUrl: null,
		mediaGallery: [{ url: "/menu/3.jpg" }],
		image: {
			url: "/menu/3.jpg",
			alt: "Cilên kevneşopî yên kurdî li pêşangehê",
		},
	},
	{
		id: "5",
		slug: "5",
		title: "Mîrata Wêneyan",
		subtitle: "Hewlêr",
		description:
			"<p>Albûmên malbatî yên dîrokî û wêneyên civakê têne berhevkirin, nûkirin û ji nû ve têne pêşandan — dîroka dîmenî ya jiyana rojane ya kurdî.</p>",
		excerpt:
			"Albûmên malbatî yên dîrokî têne berhevkirin, nûkirin û ji nû ve têne pêşandan.",
		location: "Hewlêr",
		projectType: "Çand",
		status: "ACTIVE",
		projectDate: "2024-06-15",
		year: "2024",
		tags: ["Wêne", "Arşîv"],
		keywords: ["dîmen", "civak"],
		coverMediaType: "IMAGE",
		coverThumbnailUrl: null,
		mediaGallery: [{ url: "/menu/7.jpg" }, { url: "/menu/4.jpg" }],
		image: {
			url: "/menu/7.jpg",
			alt: "Wêneyek dîrokî ji arşîva malbatî ya kurdî",
		},
	},
	{
		id: "6",
		slug: "6",
		title: "Atlasê Zimanê",
		subtitle: "Silêmanî",
		description:
			"<p>Nexşeyên devokî, rêberên dengdanê û hevpeyvînên civakê coografiya zimanê kurdî ya zindî li ser herêm û neslan dinivîsin.</p>",
		excerpt:
			"Nexşeyên devokî û hevpeyvînên civakê coografiya zimanê kurdî ya zindî dinivîsin.",
		location: "Silêmanî",
		projectType: "Perwerdehî",
		status: "ACTIVE",
		projectDate: "2025-02-02",
		year: "2025",
		tags: ["Ziman", "Devok"],
		keywords: ["zimannasî", "atlas"],
		coverMediaType: "IMAGE",
		coverThumbnailUrl: null,
		mediaGallery: [],
		image: {
			url: "/menu/6.jpg",
			alt: "Materyalên lêkolîna atlasê zimanê",
		},
	},
];

const CKB_RECORDS: LocaleRecords = [
	{
		id: "1",
		slug: "1",
		title: "ئارشیڤی مێژووی شفاهی",
		subtitle: "هەولێر",
		description:
			'<p>بەرنامەیەکی درێژخایەن بۆ تۆمارکردنی دەنگی پیر و پیران لە سەرانسەری کوردستان — پاراستنی شێوەزار، یادەوەری و چیرۆکی خێزانی پێش ئەوەی لەگەڵ کاتدا لەدەست بچێت. ئەوەی بە مایکرۆفۆنێک لە ناو ژوورێکی خێزانی دەستی پێکرد، ئێستا بووەتە ئارشیڤێکی مەیدانی هەماهەنگ کە شار، گوند و کۆمەڵگەی دەرەوە دەگرێتەوە.</p><h2>چی تۆمار دەکەین</h2><p>چاوپێکەوتنەکان ژنوسنامەی خێزانی، مێژووی گوند، زانیاری پیشەسازی و گۆرانییەکانی یادەوەری منداڵی دەگرنەوە. هەر دانیشتنێک بە شێوەزاری قسەکەر تۆمار دەکرێت، لەگەڵ ڕەزامەندی نووسراو و کورتە پوختەیەک بە هەردوو زمان Sorani و Kurmanji کە بتوانرێت.</p><p>کارمەندانی مەیدان بە تۆمارکەرەوەی گەڕۆک و پاتری هەڵگری دەچن. دانیشتنەکان زۆرجار دوو کاتژمێر دەخایەنن؛ باشترین ماددەکان زۆرجار دوای پرسیارە فەرمییەکان دەردەکەون، کاتێک چا دەکرێت و یادەوەری دەکرێتەوە.</p><h2>چۆن تۆمارەکان دەپارێزرێن</h2><p>دەنگ لە فۆرماتی بێ لەدەستدانی کوالیتی هەڵدەگیرێت، checksum پشتڕاست دەکرێتەوە و لە کۆگای ئەنستیتووت و شوێنێکی دووردا دووبارە دەکرێتەوە. نووسراوە ئارەزوومەندانە — زۆر پیر هەڵدەبژێرن تەنها دەنگ بپارێزرێت و ئێمە ڕێز لەو هەڵبژاردنە دەگرین.</p><blockquote>هەر دەنگێکی ئارشیڤکراو تارێکە لە قوماشێک کە بەبێ ئەوە لە نەوەیەکدا دەپچڕێت.</blockquote><h2>کێ دەتوانێت ئارشیڤەکە ببینێت</h2><p>لێکۆڵەران، ڕۆژنامەنووسان و ئەندامانی خێزان دەتوانن لە ڕێگەی ژووری خوێندنەوەی ئەنستیتووت داوای دەستگەیشتن بکەن. ماددەی هەستیار — ناو، شوێن یان شایەتی سیاسی — دەتوانرێت بە داوای گێڕەر بۆ ماوەیەکی دیاریکراو یان بە هەمیشەیی سنووردار بکرێت.</p><figure><img src="/menu/2.jpg" alt="دانیشتنی تۆمارکردن" /><figcaption>تۆمارکردنی مەیدانی لە هەولێر، ٢٠٢٥ — چاوپێکەوتنی نەخشەکێشی شێوەزار لەگەڵ پیرێکی کۆمەڵگا.</figcaption></figure><p>بڵاوکردنەوە لەسەر ئینتەرنێت هەمیشە بە ئارەزووی خۆیە. کاتێک پارچە دەق لە ماڵپەڕی ئەنستیتووت دەردەکەوێت، بۆ ڕوونبوونەوە دەستکاری دەکرێت بەڵام هەرگیز وشەکانی قسەکەر ناسڕدرێنەوە.</p>',
		excerpt:
			"بەرنامەیەکی درێژخایەن بۆ تۆمارکردنی دەنگی پیر و پیران لە سەرانسەری کوردستان.",
		location: "هەولێر",
		projectType: "پەروەردەیی",
		status: "ACTIVE",
		projectDate: "2025-03-12",
		year: "2025",
		tags: ["مێژووی شفاهی", "کوردستان"],
		keywords: ["یادەوەری", "شێوەزار"],
		coverMediaType: "IMAGE",
		coverThumbnailUrl: null,
		mediaGallery: [],
		image: {
			url: "/menu/2.jpg",
			alt: "دانیشتنی تۆمارکردنی مێژووی شفاهی",
		},
	},
	{
		id: "2",
		slug: "2",
		title: "دیجیتاڵکردنی دەستنووسەکان",
		subtitle: "سلێمانی",
		description:
			'<p>دەستنووسە لاوازەکانی کوردی سکان دەکرێن، پۆلێن دەکرێن و بۆ زانایان بەردەست دەکرێن — کۆکراوەی تایبەت دەبنە ئارشیڤی هاوبەش.</p><h2>ڕێڕەوی دیجیتاڵکردن</h2><p>هەر لاپەڕەیەک لەژێر ڕووناکی دیاریکراو وێنە دەگیرێت، پاشان لە شوێنی خوێندراوە دەنووسرێتەوە. مێتاداتا دووزمانە و بە دامەزراوەی هەڵگرەوە بەستراوەتەوە.</p><p>پێش سکانکردن، دەستنووسەکان لە ژوورێکی تاریکدا پشکنین دەکرێن بۆ دۆزینەوەی شوێنە لاوازەکان. تیمێکی پاراستن هاوکاری دەکات کاتێک پێویستە پێش دیجیتاڵکردن دەستکاری بکرێت.</p><blockquote>هەر لاپەڕەیەکی پارێزراو دەرگایەکە بۆ لێکۆڵەران کە لەوانەیە هەرگیز سەردانی ئارشیڤی ڕەسەن نەکەن.</blockquote><figure><img src="/menu/1.jpg" alt="دەستنووس پێش پاراستن" /><figcaption>لاپەڕەی دەستنووس پێش پرۆسەی پاراستن لە سلێمانی.</figcaption></figure>',
		excerpt:
			"دەستنووسە لاوازەکانی کوردی سکان دەکرێن و بۆ زانایان بەردەست دەکرێن.",
		location: "سلێمانی",
		projectType: "میرات",
		status: "COMPLETED",
		projectDate: "2024-09-01",
		year: "2024",
		tags: ["دەستنووس", "دیجیتاڵکردن"],
		keywords: ["دەق", "کتێبخانە"],
		coverMediaType: "IMAGE",
		coverThumbnailUrl: null,
		mediaGallery: [{ url: "/menu/1.jpg" }, { url: "/menu/3.jpg" }],
		image: {
			url: "/menu/1.jpg",
			alt: "دەستنووسێک لە ئارشیڤی میراتدا دیجیتاڵ دەکرێت",
		},
	},
	{
		id: "3",
		slug: "3",
		title: "کۆلێکشنەی گۆرانیی گەلەیی",
		subtitle: "دهۆک",
		description:
			"<p>گۆرانی، ئامێر و پیشاندانە هەرێمییەکان لە مەیداندا تۆمار دەکرێن — دروستکردنی ئارشیڤێکی دەنگی کراوە بۆ میراتی میوزیکی کوردی.</p><h2>گوێگرتن لە چوارچێوەی خۆیدا</h2><p>تۆمارەکان ئامێر، شوێن و چیرۆکی پشت هەر لحنێک لەخۆدەگرن. دەنگ لەگەڵ تێبینی هەرێم و هونەرمەند بڵاو دەکرێتەوە.</p><p>ئامانجمان تەنها تۆمارکردنی دەنگ نییە — بەڵکو پاراستنی شێوازی ژنیشتن، دەستی موسیقا و ئەو چیرۆکانەی کە گۆرانییەکان لەگەڵدا دەگوترێن.</p><h2>چۆن بەکاردەهێنرێت</h2><p>مامۆستایان، گۆرانیبێژان و توێژەرانی میوزیک دەتوانن لە ڕێگەی ئارشیڤەکەوە نموونەی ڕاستەقینەی گۆرانی گەلەیی بدۆزنەوە. هەر تۆمارێک بە مێژووی کورت و سەرچاوەی مەیدانی هاوپێچ دەکرێت.</p>",
		excerpt:
			"گۆرانی و پیشاندانە هەرێمییەکان لە مەیداندا تۆمار دەکرێن بۆ ئارشیڤێکی دەنگی کراوە.",
		location: "دهۆک",
		projectType: "فرهنگ",
		status: "ACTIVE",
		projectDate: "2025-01-20",
		year: "2025",
		tags: ["میوزیک", "گەلەیی"],
		keywords: ["دeng", "پیشاندان"],
		coverMediaType: "IMAGE",
		coverThumbnailUrl: null,
		mediaGallery: [],
		image: {
			url: "/menu/5.jpg",
			alt: "مۆزیسیان گۆرانیی گەلەیی کوردی دەژەنێت",
		},
	},
	{
		id: "4",
		slug: "4",
		title: "ئارشیڤی جلی نەریتی",
		subtitle: "کەرکوک",
		description:
			"<p>نموونەی قوماش، گۆرینی و جلی هەرێمی بە وێنە و شاهیدی شفاهی بەڵگە دەکرێن — ناسنامە لە ڕێگەی جلوبەرگەوە دەنێردرێت.</p><h2>چۆن بەڵگە دەکرێن</h2><p>هەر جلێک لە چەند گۆشەوە وێنە دەگیرێت، لەگەڵ وردەکارییەکانی گۆرین و ماددەی بەکارهاتوو. شاهیدانی شفاهی دەڵێن ئەم جلانە لە چ کۆمەڵگەیەکدا و لە چ بۆنەیەکدا لەبەر دەکرێن.</p><p>پێشانگایەکی هەمیشەیی لە ئەنستیتووتدا جلە ڕەسەنەکان لەگەڵ وێنە و دەق پیشان دەدات — بۆ سەردانکەرانی خۆماڵی و میوانانی نێودەوڵەتی.</p>",
		excerpt: "نموونەی قوماش و جلی هەرێمی بە وێنە و شاهیدی شفاهی بەڵگە دەکرێن.",
		location: "کەرکوک",
		projectType: "میرات",
		status: "COMPLETED",
		projectDate: "2023-11-08",
		year: "2023",
		tags: ["قوماش", "جل"],
		keywords: ["پیشە", "ناسنامە"],
		coverMediaType: "IMAGE",
		coverThumbnailUrl: null,
		mediaGallery: [{ url: "/menu/3.jpg" }],
		image: {
			url: "/menu/3.jpg",
			alt: "جلوبەرگی نەریتی کوردی لە پێشانگا",
		},
	},
	{
		id: "5",
		slug: "5",
		title: "میراتی وێنەیی",
		subtitle: "هەولێر",
		description:
			"<p>ئەلبومە خێزانییە مێژووییەکان و وێنەی کۆمەڵایەتی کۆدەکرێنەوە، نوێ دەکرێنەوە و دووبارە پیشان دەدرێن — مێژوویەکی بینراوی ژیانی ڕۆژانەی کوردی.</p><h2>کۆکردنەوە و گەڕاندنەوە</h2><p>خێزانەکان ئەلبومە کۆنەکانیان دەهێنن بۆ سکانکردن. دوای دیجیتاڵکردن، وێنە ڕەسەنەکان بە پارێزگاری دەگەڕێندرێنەوە — ئارشیڤی دیجیتاڵ بۆ هەمووان بەردەست دەبێت.</p><p>هەر وێنەیەک لەگەڵ ناو، شوێن و ساڵی تخمینکراو تۆمار دەکرێت. کاتێک دەتوانرێت، چیرۆکی پشت وێنەکە لەلایەن ئەندامانی خێزانەوە تۆمار دەکرێت.</p><h2>پیشاندان لەسەر ئینتەرنێت</h2><p>هەڵبژاردەی وێنەکان لە ماڵپەڕی ئەنستیتووت بڵاو دەکرێنەوە بە ڕەزامەندی خێزان. ئامانجمان پاراستنی یادەوەری کۆمەڵایەتییە، نەک تەنها کۆکردنەوەی وێنە.</p>",
		excerpt:
			"ئەلبومە خێزانییە مێژووییەکان کۆدەکرێنەوە، نوێ دەکرێنەوە و دووبارە پیشان دەدرێن.",
		location: "هەولێر",
		projectType: "فرهنگ",
		status: "ACTIVE",
		projectDate: "2024-06-15",
		year: "2024",
		tags: ["وێنە", "ئارشیڤ"],
		keywords: ["دیمەن", "کۆمەڵگا"],
		coverMediaType: "IMAGE",
		coverThumbnailUrl: null,
		mediaGallery: [{ url: "/menu/7.jpg" }, { url: "/menu/4.jpg" }],
		image: {
			url: "/menu/7.jpg",
			alt: "وێنەیەکی مێژوویی لە ئارشیڤی خێزانی کوردی",
		},
	},
	{
		id: "6",
		slug: "6",
		title: "نەخشەی زمان",
		subtitle: "سلێمانی",
		description:
			"<p>نەخشەی شێوەزار، ڕێنمایی دەنگدان و چاوپێکەوتنی کۆمەڵایەتی جوغرافیای زاراوەی زیندووی کوردی لەسەر هەرێم و نەوەکان دەنووسن.</p><h2>چۆن نەخشە دروست دەکرێت</h2><p>لێکۆڵەران لە شار و گوندەکاندا دەنگی ناوخۆیی تۆمار دەکەن، وشە و دەستەواژە هەڵدەگرن و لەسەر نەخشەیەکی کارلێکەر نیشان دەدەن. هەر شێوەزارێک بە چیرۆکی خۆی و بەڵگەی دەنگیەوە دەردەکەوێت.</p><p>ئامانجمان دروستکردنی سەرچاوەیەکی کراوە بۆ قوتابخانە، ڕۆژنامەنووسی و لێکۆڵینەوەی زمانناسی — بە ڕێزگرتن لە جیاوازییەکانی ناوخۆی کوردستان.</p>",
		excerpt:
			"نەخشەی شێوەزار و چاوپێکەوتنی کۆمەڵایەتی جوغرافیای زاراوەی زیندووی کوردی دەنووسن.",
		location: "سلێمانی",
		projectType: "پەروەردەیی",
		status: "ACTIVE",
		projectDate: "2025-02-02",
		year: "2025",
		tags: ["زمان", "شێوەزار"],
		keywords: ["زمانناسی", "نەخشە"],
		coverMediaType: "IMAGE",
		coverThumbnailUrl: null,
		mediaGallery: [],
		image: {
			url: "/menu/6.jpg",
			alt: "ماددەکانی لێکۆڵینەوەی نەخشەی زمان",
		},
	},
];

const LOCALE_RECORDS: Record<string, LocaleRecords> = {
	en: EN_RECORDS,
	ku: KU_RECORDS,
	ckb: CKB_RECORDS,
};

function normalizeRecord(record: MockProjectRecord): ProjectListItem {
	return {
		...record,
		coverUrl: record.coverUrl ?? record.image.url,
		mediaGallery: (record.mediaGallery ?? []).map((item, index) => ({
			url: item.url,
			kind: item.kind ?? "IMAGE",
			thumbnailUrl: item.thumbnailUrl ?? null,
			caption: item.caption ?? null,
			sortOrder: item.sortOrder ?? index,
		})),
	};
}

function getRecords(locale: string): ProjectListItem[] {
	return (LOCALE_RECORDS[locale] ?? EN_RECORDS).map(normalizeRecord);
}

export function getProjects(locale: string): ProjectItem[] {
	return getRecords(locale);
}

export function getProjectListItems(locale: string): ProjectListItem[] {
	return getRecords(locale);
}

export function getProjectYears(items: ProjectListItem[]): string[] {
	const years = new Set<string>();
	for (const item of items) {
		if (item.year) years.add(item.year);
	}
	return [...years].sort((a, b) => Number(b) - Number(a));
}

export function getProjectTags(items: ProjectListItem[]): string[] {
	const tags = new Set<string>();
	for (const item of items) {
		for (const tag of item.tags) tags.add(tag);
	}
	return [...tags].sort((a, b) => a.localeCompare(b));
}

export type ProjectFilter = {
	year?: string | null;
	tag?: string | null;
	query?: string | null;
};

export function filterProjects(
	items: ProjectListItem[],
	filter: ProjectFilter,
): ProjectListItem[] {
	let result = items;

	if (filter.year) {
		result = result.filter((item) => item.year === filter.year);
	}

	if (filter.tag) {
		result = result.filter((item) =>
			item.tags.some((tag) => tag.toLowerCase() === filter.tag?.toLowerCase()),
		);
	}

	if (filter.query?.trim()) {
		const q = filter.query.trim().toLowerCase();
		result = result.filter(
			(item) =>
				item.title.toLowerCase().includes(q) ||
				item.excerpt.toLowerCase().includes(q) ||
				item.tags.some((tag) => tag.toLowerCase().includes(q)) ||
				item.keywords.some((kw) => kw.toLowerCase().includes(q)),
		);
	}

	return result;
}

export function paginateProjects(
	items: ProjectListItem[],
	page: number,
	perPage = PROJECTS_PER_PAGE,
) {
	const totalElements = items.length;
	const totalPages = Math.max(1, Math.ceil(totalElements / perPage));
	const currentPage = Math.min(Math.max(1, page), totalPages);
	const start = (currentPage - 1) * perPage;

	return {
		items: items.slice(start, start + perPage),
		totalElements,
		totalPages,
		currentPage,
	};
}

export function getProjectById(
	locale: string,
	id: string,
): ProjectDetail | null {
	const items = getRecords(locale);
	const index = items.findIndex((item) => item.id === id || item.slug === id);
	if (index === -1) return null;

	const item = items[index];
	return {
		...item,
		previous: index > 0 ? items[index - 1] : null,
		next: index < items.length - 1 ? items[index + 1] : null,
	};
}
