import { HOME_IMAGE_BENTO_COUNT } from "@/lib/home/image-bento";

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

type ImageBase = {
	id: string;
	slug: string;
	url: string;
};

type LocaleCopy = {
	title: string;
	subtitle: string;
	alt: string;
};

const IMAGE_BASES: ImageBase[] = [
	{ id: "plate-01", slug: "the-mountain-keeps-us", url: "/gallery/1.jpg" },
	{ id: "plate-02", slug: "threads-of-identity", url: "/gallery/2.jpg" },
	{ id: "plate-03", slug: "made-by-hand", url: "/gallery/3.jpg" },
	{ id: "plate-04", slug: "city-of-poets", url: "/gallery/4.jpg" },
	{ id: "plate-05", slug: "the-radio-years", url: "/gallery/5.jpg" },
	{ id: "plate-06", slug: "festivals-of-the-plain", url: "/gallery/6.jpg" },
	{ id: "plate-07", slug: "doors-of-the-old-quarter", url: "/gallery/7.jpg" },
	{ id: "plate-08", slug: "bread-and-salt", url: "/gallery/8.jpg" },
	{ id: "plate-09", slug: "the-mountain-keeps-us", url: "/menu/4.jpg" },
	{ id: "plate-10", slug: "threads-of-identity", url: "/menu/6.jpg" },
	{ id: "plate-11", slug: "city-of-poets", url: "/menu/7.jpg" },
	{ id: "plate-12", slug: "made-by-hand", url: "/menu/3.jpg" },
	{ id: "plate-13", slug: "the-radio-years", url: "/menu/1.jpg" },
	{ id: "plate-14", slug: "festivals-of-the-plain", url: "/menu/2.jpg" },
	{ id: "plate-15", slug: "doors-of-the-old-quarter", url: "/menu/5.jpg" },
	{ id: "plate-16", slug: "bread-and-salt", url: "/news/1.jpg" },
];

const EN_COPY: Record<string, LocaleCopy> = {
	"plate-01": {
		title: "Hawraman in spring",
		subtitle: "Photography",
		alt: "Terraced village of Hawraman in spring",
	},
	"plate-02": {
		title: "Kurdish bridal dress",
		subtitle: "Traditional dress",
		alt: "Traditional Kurdish bridal dress with embroidered fabric",
	},
	"plate-03": {
		title: "Coppersmiths of Sulaymaniyah",
		subtitle: "Handicrafts",
		alt: "Engraved copperwork in the Sulaymaniyah bazaar",
	},
	"plate-04": {
		title: "Shepherds below Qandil",
		subtitle: "Photography",
		alt: "Shepherds with their flock in the Qandil foothills",
	},
	"plate-05": {
		title: "Klash weaving, Hawraman",
		subtitle: "Handicrafts",
		alt: "Hands weaving traditional klash footwear",
	},
	"plate-06": {
		title: "Newroz fires",
		subtitle: "Photography",
		alt: "Newroz celebration fires at dusk",
	},
	"plate-07": {
		title: "Glass-plate portrait, 1923",
		subtitle: "Photography",
		alt: "Restored glass-plate portrait from the early archive",
	},
	"plate-08": {
		title: "Kilim motifs of Sine",
		subtitle: "Handicrafts",
		alt: "Woven kilim with geometric motifs from Sine",
	},
	"plate-09": {
		title: "Traditional Architecture",
		subtitle: "Erbil & Sulaymaniyah",
		alt: "Stone courtyard of a traditional Kurdish house",
	},
	"plate-10": {
		title: "Textile Patterns",
		subtitle: "Duhok region",
		alt: "Handwoven Kurdish textile with regional motifs",
	},
	"plate-11": {
		title: "Family Archives",
		subtitle: "Historic photographs",
		alt: "Black and white photograph from a Kurdish family archive",
	},
	"plate-12": {
		title: "Craftsmanship",
		subtitle: "Metalwork & wood carving",
		alt: "Traditional Kurdish dress and handcrafted details",
	},
	"plate-13": {
		title: "The daf maker's workshop",
		subtitle: "Handicrafts",
		alt: "Craftsman stretching skin over a daf frame",
	},
	"plate-14": {
		title: "Mountain village, Badinan",
		subtitle: "Photography",
		alt: "Stone houses of a mountain village in Badinan",
	},
	"plate-15": {
		title: "Women's headdress, Soran",
		subtitle: "Traditional dress",
		alt: "Traditional women's headdress from the Soran region",
	},
	"plate-16": {
		title: "Teahouse storytellers",
		subtitle: "Photography",
		alt: "Storytellers gathered in a traditional teahouse",
	},
};

const KU_COPY: Record<string, LocaleCopy> = {
	"plate-01": {
		title: "Hewraman di biharê de",
		subtitle: "Wêne",
		alt: "Gundê pêlekanî yê Hewramanê di biharê de",
	},
	"plate-02": {
		title: "Cilê bûkê yê kurdî",
		subtitle: "Cilên kevneşopî",
		alt: "Cilê bûkê yê kevneşopî bi qumaşê neqişandî",
	},
	"plate-03": {
		title: "Misgerên Silêmaniyê",
		subtitle: "Kariya destan",
		alt: "Karê misî yê neqişandî li bazara Silêmaniyê",
	},
	"plate-04": {
		title: "Şivanên bin Qendîlê",
		subtitle: "Wêne",
		alt: "Şivan bi keriyên xwe re li binê çiyayê Qendîlê",
	},
	"plate-05": {
		title: "Çêkirina kilaşê, Hewraman",
		subtitle: "Kariya destan",
		alt: "Dest di dema çêkirina kilaşê kevneşopî de",
	},
	"plate-06": {
		title: "Agirê Newrozê",
		subtitle: "Wêne",
		alt: "Agirê pîrozbahiya Newrozê di êvarê de",
	},
	"plate-07": {
		title: "Portreya camî, 1923",
		subtitle: "Wêne",
		alt: "Portreyeke camî ya nûvekirî ji arşîva kevn",
	},
	"plate-08": {
		title: "Motîfên kilîma Sineyê",
		subtitle: "Kariya destan",
		alt: "Kilîma honandî bi motîfên geometrîk ên Sineyê",
	},
	"plate-09": {
		title: "Mîmariya Kevneşopî",
		subtitle: "Hewlêr & Silêmanî",
		alt: "Avahiya kevneşopî ya kurdî",
	},
	"plate-10": {
		title: "Desenên Tekstîlê",
		subtitle: "Herêma Dihokê",
		alt: "Tekstîla kurdî ya bi destan hatî dokirin",
	},
	"plate-11": {
		title: "Arşîva Malbatî",
		subtitle: "Wêneyên dîrokî",
		alt: "Wêneyek dîrokî ji arşîva malbatî",
	},
	"plate-12": {
		title: "Kariya Destan",
		subtitle: "Xemilandin & darxistin",
		alt: "Cil û hunera destan a kurdî",
	},
	"plate-13": {
		title: "Atolyeya defçêker",
		subtitle: "Kariya destan",
		alt: "Pîşekarek çerm li ser çarçoveya defê dikişîne",
	},
	"plate-14": {
		title: "Gundê çiyayî, Badînan",
		subtitle: "Wêne",
		alt: "Xaniyên kevirîn ên gundekî çiyayî li Badînanê",
	},
	"plate-15": {
		title: "Serpoşa jinan, Soran",
		subtitle: "Cilên kevneşopî",
		alt: "Serpoşa kevneşopî ya jinan ji herêma Soranê",
	},
	"plate-16": {
		title: "Çîrokbêjên çayxaneyê",
		subtitle: "Wêne",
		alt: "Çîrokbêj li çayxaneyeke kevneşopî civiyane",
	},
};

const CKB_COPY: Record<string, LocaleCopy> = {
	"plate-01": {
		title: "هەورامان لە بەهاردا",
		subtitle: "وێنە",
		alt: "گوندە پلیکانەییەکانی هەورامان لە بەهاردا",
	},
	"plate-02": {
		title: "جلوبەرگی بووکی کوردی",
		subtitle: "جلوبەرگی کۆن",
		alt: "جلوبەرگی بووکی کوردی بە قوماشی نەخشێنراو",
	},
	"plate-03": {
		title: "مسگەرانی سلێمانی",
		subtitle: "پیشەی دەستی",
		alt: "کاری مسی نەخشێنراو لە بازاڕی سلێمانی",
	},
	"plate-04": {
		title: "شوانەکانی بناری قەندیل",
		subtitle: "وێنە",
		alt: "شوانەکان لەگەڵ مەڕەکانیان لە بناری قەندیل",
	},
	"plate-05": {
		title: "چنینی کڵاش، هەورامان",
		subtitle: "پیشەی دەستی",
		alt: "دەستەکان لە کاتی چنینی کڵاشی هەورامی",
	},
	"plate-06": {
		title: "ئاگری نەورۆز",
		subtitle: "وێنە",
		alt: "ئاگری ئاهەنگی نەورۆز لە ئێوارەدا",
	},
	"plate-07": {
		title: "وێنەی شووشەیی، ١٩٢٣",
		subtitle: "وێنە",
		alt: "وێنەیەکی شووشەیی گەڕێندراوە لە ئارشیڤی سەرەتایی",
	},
	"plate-08": {
		title: "نموونەی گەلیمی سینە",
		subtitle: "پیشەی دەستی",
		alt: "گەلیمی بەرگ لە نموونەی هندسی سینە",
	},
	"plate-09": {
		title: "تەلارسازی نەریتی",
		subtitle: "هەولێر و سلێمانی",
		alt: "حەوشەی بەردی ماڵێکی نەریتی کوردی",
	},
	"plate-10": {
		title: "نموونەی قوماش",
		subtitle: "هەرێمی دهۆک",
		alt: "قوماشی دەستی کوردی بە نموونەی هەرێمی",
	},
	"plate-11": {
		title: "ئارشیڤی خێزانی",
		subtitle: "وێنەی مێژوویی",
		alt: "وێنەیەکی ڕەش و سپی لە ئارشیڤی خێزانی",
	},
	"plate-12": {
		title: "پیشەسازی دەستی",
		subtitle: "کاری کانزا و دار",
		alt: "جلوبەرگ و وردەکاری دەستی کوردی",
	},
	"plate-13": {
		title: "کارگەی دروستکەری دەف",
		subtitle: "پیشەی دەستی",
		alt: "پیشەسازێک پێست لەسەر چوارچێوەی دەفەکە دەکێشێت",
	},
	"plate-14": {
		title: "گوندی چیایی، بادینان",
		subtitle: "وێنە",
		alt: "خانووە بەردینەکانی گوندێکی چیایی لە بادینان",
	},
	"plate-15": {
		title: "سەرپۆشی ژنان، سۆران",
		subtitle: "جلوبەرگی کۆن",
		alt: "سەرپۆشی نەریتی ژنان لە هەرێمی سۆران",
	},
	"plate-16": {
		title: "چیرۆکبێژانی چایخانە",
		subtitle: "وێنە",
		alt: "چیرۆکبێژان لە چایخانەیەکی نەریتی کۆبوونەوە",
	},
};

const LOCALE_COPY: Record<string, Record<string, LocaleCopy>> = {
	en: EN_COPY,
	ku: KU_COPY,
	ckb: CKB_COPY,
};

function buildItems(locale: string): ImageCollectionItem[] {
	const copy = LOCALE_COPY[locale] ?? EN_COPY;

	return IMAGE_BASES.slice(0, HOME_IMAGE_BENTO_COUNT).map((base, index) => {
		const text = copy[base.id] ?? EN_COPY[base.id];
		return {
			id: base.id,
			slug: base.slug,
			title: text.title,
			subtitle: text.subtitle,
			catalogRef: `Plate ${String(index + 1).padStart(2, "0")}`,
			image: {
				url: base.url,
				alt: text.alt,
			},
		};
	});
}

export function getImageCollection(locale: string): ImageCollectionItem[] {
	return buildItems(locale);
}
