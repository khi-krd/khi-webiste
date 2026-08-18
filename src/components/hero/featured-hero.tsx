import { getLocale, getTranslations } from "next-intl/server";
import { FeaturedCarousel } from "@/components/hero/featured-carousel";
import { getPathname } from "@/i18n/navigation";
import { getFeaturedItems } from "@/lib/api/featured";
import { contentDetailHref } from "@/lib/content/href";
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

	// Nothing featured in the CMS — the homepage opens on the first section
	// rather than on invented slides.
	if (featuredItems.length === 0) {
		return null;
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
