import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { ServicesBottomCards } from "@/components/services/services-bottom-cards";
import { ServicesFeaturedHero } from "@/components/services/services-featured-hero";
import { ServicesHero } from "@/components/services/services-hero";
import { ServicesShell } from "@/components/services/services-shell";
import { VisuallyHidden } from "@/components/ui/visually-hidden";
import {
	findServicesPageHeroRecord,
	resolveServicesHeroCopy,
	resolveServicesHeroImage,
	serviceRecordToPageSettings,
} from "@/lib/api/services-page";
import { localeAlternates } from "@/lib/seo/metadata";
import { buildServiceHeroSlides } from "@/lib/services/hero-slides";
import { loadServicesPageData } from "@/lib/services/page-data";

export async function generateMetadata({
	params,
}: {
	params: Promise<{ locale: string }>;
}): Promise<Metadata> {
	const { locale } = await params;
	const t = await getTranslations({ locale, namespace: "Services" });

	return {
		alternates: localeAlternates(locale, "/services"),
		title: t("pageTitle"),
		description: t("metaDescription"),
	};
}

type ServicesPageProps = {
	params: Promise<{ locale: string }>;
};

export default async function ServicesPage({ params }: ServicesPageProps) {
	const { locale } = await params;
	setRequestLocale(locale);

	const t = await getTranslations("Services");
	const tHero = await getTranslations("Hero");
	// No filter/search chrome on this page: the full catalogue is always shown.
	const {
		mergedSections,
		heroMediaFallback,
		partnerCards,
		serviceRecords,
		highlights,
	} = await loadServicesPageData(locale, {});

	const pageSettings = (() => {
		const hero = findServicesPageHeroRecord(serviceRecords);
		return hero ? serviceRecordToPageSettings(hero) : null;
	})();

	const heroCopy = resolveServicesHeroCopy(locale, pageSettings, {
		eyebrow: t("hero.eyebrow"),
		title: t("hero.title"),
		intro: t("hero.intro"),
	});
	const heroMedia = resolveServicesHeroImage(
		pageSettings,
		heroMediaFallback.url,
		heroMediaFallback.alt ?? heroCopy.title,
	);

	const featuredSlides = buildServiceHeroSlides(highlights, {
		typeLabel: t("featured.eyebrow"),
		// The per-slide action, not the standing hero's "see our services" —
		// the slide opens one service, and this is the key the homepage already
		// uses for its own service slides.
		actionLabel: tHero("actions.service"),
		slideLabel: (current, total) => tHero("slideLabel", { current, total }),
	});

	// Titles and bodies come from the CMS; the translation keys only cover the
	// CMS catalogue, so they stay as a last resort for an untitled record.
	const navItems = mergedSections.map((section) => ({
		id: section.service.id,
		title:
			section.title ??
			t(`items.${section.anchorId}.title`, { defaultValue: section.anchorId }),
	}));

	const sections = mergedSections.map((section) => ({
		service: section.service,
		title:
			section.title ??
			t(`items.${section.anchorId}.title`, { defaultValue: section.anchorId }),
		body:
			section.body ?? t(`items.${section.anchorId}.body`, { defaultValue: "" }),
	}));

	const bottomCardItems = partnerCards.map((card) => ({
		card,
		copy: card.title
			? {
					eyebrow: "",
					title: card.title,
					description: card.description ?? "",
					cta: t("hero.cta"),
				}
			: {
					eyebrow: t(`bottom.${card.id}.eyebrow`),
					title: t(`bottom.${card.id}.title`),
					description: t(`bottom.${card.id}.description`),
					cta: t(`bottom.${card.id}.cta`),
				},
	}));

	return (
		<main>
			<VisuallyHidden as="h1">{t("pageTitle")}</VisuallyHidden>

			{/* Featuring a service makes it the hero. Only when nothing is
			    featured (or nothing featured has a picture) does the page fall
			    back to its own standing hero. */}
			{featuredSlides.length > 0 ? (
				<ServicesFeaturedHero
					slides={featuredSlides}
					direction={locale === "ckb" ? "rtl" : "ltr"}
					regionLabel={t("featured.title")}
					paginationLabel={tHero("pagination")}
				/>
			) : (
				<ServicesHero
					heroMedia={heroMedia}
					firstServiceId={mergedSections[0]?.service.id ?? "services"}
					eyebrow={heroCopy.eyebrow}
					title={heroCopy.title}
					intro={heroCopy.intro}
					cta={t("hero.cta")}
				/>
			)}

			<ServicesShell
				sections={sections}
				navItems={navItems}
				navLabel={t("nav.label")}
			/>

			{bottomCardItems.length > 0 ? (
				<ServicesBottomCards items={bottomCardItems} />
			) : null}
		</main>
	);
}
