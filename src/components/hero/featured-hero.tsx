import { getLocale, getTranslations } from "next-intl/server";
import { FeaturedCarousel } from "@/components/hero/featured-carousel";
import { getPathname } from "@/i18n/navigation";
import { getFeaturedItems } from "@/lib/api/featured";
import { contentDetailHref, contentListingHref } from "@/lib/content/href";
import type { HeroSlide } from "@/types/content";

function toAbsoluteUrl(locale: string, href: string): string {
	const siteUrl = process.env.NEXT_PUBLIC_SITE_URL;
	if (!siteUrl) {
		return href;
	}

	try {
		const localizedHref = getPathname({ locale, href });
		return new URL(localizedHref, siteUrl).toString();
	} catch {
		return href;
	}
}

type MockCopy = {
	title: string;
	description: string;
	typeLabel: string;
	actionLabel: string;
};

function getMockCopy(locale: string): MockCopy[] {
	if (locale === "ckb") {
		return [
			{
				title: "کتێب و بەڵگەنامەی میرات",
				description:
					"کۆکراوەیەک لە کتێب، دەستنووس و بەڵگەنامەی مێژوویی کە بە شێوەی دیجیتاڵ پارێزراون.",
				typeLabel: "کتێب",
				actionLabel: "خوێندنەوە",
			},
			{
				title: "ئەرشیفی گۆرانی و دەنگ",
				description:
					"گوێبگرە لە گۆرانییە کەلتوورییەکان و تۆمارە دەنگییە گرنگەکانی مێژووی شفاهی.",
				typeLabel: "دەنگ",
				actionLabel: "گوێگرتن",
			},
			{
				title: "وێنە و ڤیدیۆی کەلتووری",
				description:
					"بینینی گەلەری و ڤیدیۆکانی پەیوەندیدار بە ژیان، هونەر و مێژووی کوردی.",
				typeLabel: "گەلەری",
				actionLabel: "بینین",
			},
		];
	}

	if (locale === "ku") {
		return [
			{
				title: "Pirtûk û Belgeyên Mîratê",
				description:
					"Berhevoka pirtûk, destnivîs û belgeyên dîrokî yên ku bi awayekî dîjîtal hatiye parastin.",
				typeLabel: "Pirtûk",
				actionLabel: "Bixwîne",
			},
			{
				title: "Arşîva Stran û Deng",
				description:
					"Bihîse stranên çandî û tomarên dengî yên girîng ji dîroka devkî ya kurdî.",
				typeLabel: "Deng",
				actionLabel: "Bihîse",
			},
			{
				title: "Wêne û Vîdyoyên Çandî",
				description:
					"Temaşe bike galerî û vîdyoyên girêdayî bi jiyan, huner û dîroka kurdî.",
				typeLabel: "Galerî",
				actionLabel: "Bibîne",
			},
		];
	}

	return [
		{
			title: "Featured Heritage Library",
			description:
				"Browse curated books, manuscripts, and historical records from Kurdish cultural collections.",
			typeLabel: "Book",
			actionLabel: "Read",
		},
		{
			title: "Music and Oral History Archive",
			description:
				"Listen to songs, interviews, and oral history recordings preserved for the digital archive.",
			typeLabel: "Audio",
			actionLabel: "Listen",
		},
		{
			title: "Photo and Video Highlights",
			description:
				"Explore galleries and visual stories documenting Kurdish heritage across regions and generations.",
			typeLabel: "Gallery",
			actionLabel: "View",
		},
	];
}

type FeaturedHeroProps = {
	/** Constrained height for UI playground previews. */
	compact?: boolean;
};

export async function FeaturedHero({
	compact = false,
}: FeaturedHeroProps = {}) {
	const locale = await getLocale();
	const t = await getTranslations("Hero");
	const featuredItems = await getFeaturedItems(locale);
	const direction = locale === "ckb" ? "rtl" : "ltr";
	const slideHeight = compact ? "playground" : "viewport";
	const sectionClass = compact
		? "relative isolate"
		: "relative isolate min-h-screen";

	if (featuredItems.length === 0) {
		const fallbackImageNames = ["5.jpg", "6.jpg", "7.jpg"] as const;
		const mockCopy = getMockCopy(locale);
		const fallbackHrefs = [
			contentListingHref("book"),
			contentListingHref("audio"),
			contentListingHref("gallery"),
		] as const;
		const fallbackSlides: HeroSlide[] = fallbackImageNames.map(
			(imageName, index) => {
				const copy = mockCopy[index];
				return {
					id: `fallback-${imageName}`,
					href: fallbackHrefs[index],
					title: copy.title,
					description: copy.description,
					typeLabel: copy.typeLabel,
					actionLabel: copy.actionLabel,
					slideLabel: t("slideLabel", {
						current: index + 1,
						total: fallbackImageNames.length,
					}),
					image: {
						url: `/menu/${imageName}`,
						alt: copy.title,
					},
				};
			},
		);

		return (
			<section
				className={sectionClass}
				data-scroll-section
				aria-label={t("regionLabel")}
			>
				<FeaturedCarousel
					slides={fallbackSlides}
					direction={direction}
					height={slideHeight}
					labels={{
						pagination: t("pagination"),
					}}
				/>
			</section>
		);
	}

	const slides: HeroSlide[] = featuredItems.map((item, index) => ({
		id: item.id,
		href: contentDetailHref(item),
		title: item.title,
		description: item.description,
		typeLabel: t(`types.${item.type}`),
		actionLabel: t(`actions.${item.type}`),
		slideLabel: t("slideLabel", {
			current: index + 1,
			total: featuredItems.length,
		}),
		image: item.image,
	}));

	const jsonLd = {
		"@context": "https://schema.org",
		"@type": "ItemList",
		name: t("regionLabel"),
		itemListElement: slides.map((slide, index) => ({
			"@type": "ListItem",
			position: index + 1,
			url: toAbsoluteUrl(locale, slide.href),
			name: slide.title,
		})),
	};

	return (
		<section
			// biome-ignore lint/a11y/noRedundantRoles: explicit role requested for carousel landmark semantics.
			role="region"
			aria-roledescription="carousel"
			aria-label={t("regionLabel")}
			className={sectionClass}
			data-scroll-section
		>
			{compact ? null : (
				<script type="application/ld+json">{JSON.stringify(jsonLd)}</script>
			)}
			<FeaturedCarousel
				slides={slides}
				direction={direction}
				height={slideHeight}
				labels={{
					pagination: t("pagination"),
				}}
			/>
		</section>
	);
}
