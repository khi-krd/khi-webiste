import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { ServicesBottomCards } from "@/components/services/services-bottom-cards";
import { ServicesClearFilters } from "@/components/services/services-clear-filters";
import { ServicesFeaturedHero } from "@/components/services/services-featured-hero";
import { ServicesFilterBar } from "@/components/services/services-filter-bar";
import { ServicesHero } from "@/components/services/services-hero";
import { ServicesShell } from "@/components/services/services-shell";
import { EmptyState } from "@/components/ui/empty-state";
import { VisuallyHidden } from "@/components/ui/visually-hidden";
import {
	findServicesPageHeroRecord,
	resolveServicesHeroCopy,
	resolveServicesHeroImage,
	serviceRecordToPageSettings,
} from "@/lib/api/services-page";
import { homeInsetClass } from "@/lib/layout";
import { localeAlternates } from "@/lib/seo/metadata";
import { buildServiceHeroSlides } from "@/lib/services/hero-slides";
import { loadServicesPageData } from "@/lib/services/page-data";
import { cn } from "@/lib/utils";

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
	searchParams: Promise<{ type?: string; q?: string }>;
};

export default async function ServicesPage({
	params,
	searchParams,
}: ServicesPageProps) {
	const { locale } = await params;
	const { type, q } = await searchParams;
	setRequestLocale(locale);

	const t = await getTranslations("Services");
	const tHero = await getTranslations("Hero");
	const {
		mergedSections,
		heroMediaFallback,
		partnerCards,
		serviceRecords,
		highlights,
		types,
		activeType,
		activeQuery,
	} = await loadServicesPageData(locale, { type, q });

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

			{/* Nothing to filter and nothing filtered — no dead chrome. The search
			    box rides on the records, not on `types`, so a failing
			    `/services/types` narrows the bar instead of deleting it. */}
			{serviceRecords.length > 0 || activeType || activeQuery ? (
				<div className={cn("bg-background py-8 sm:py-10", homeInsetClass)}>
					<ServicesFilterBar
						types={types}
						activeType={activeType}
						activeQuery={activeQuery}
					/>
				</div>
			) : null}

			{sections.length === 0 && (activeType || activeQuery) ? (
				// The hero CTA scrolls to `#services`, which normally lives on the
				// shell — the empty state has to carry it or the target vanishes.
				<div id="services" className="bg-background">
					<EmptyState
						title={t("results.emptyTitle")}
						description={t("results.emptyDescription")}
					>
						<ServicesClearFilters />
					</EmptyState>
				</div>
			) : (
				<ServicesShell
					sections={sections}
					navItems={navItems}
					navLabel={t("nav.label")}
				/>
			)}

			{bottomCardItems.length > 0 ? (
				<ServicesBottomCards items={bottomCardItems} />
			) : null}
		</main>
	);
}
