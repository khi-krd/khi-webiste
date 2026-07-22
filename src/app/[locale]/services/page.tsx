import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { ServicesBottomCards } from "@/components/services/services-bottom-cards";
import { ServicesHero } from "@/components/services/services-hero";
import { ServicesShell } from "@/components/services/services-shell";
import { VisuallyHidden } from "@/components/ui/visually-hidden";
import {
	getMergedServiceSections,
	getServicePartnerCards,
	getServiceRecords,
	getServicesHeroMediaFromApi,
} from "@/lib/api/services";
import {
	findServicesPageHeroRecord,
	resolveServicesHeroCopy,
	resolveServicesHeroImage,
	serviceRecordToPageSettings,
} from "@/lib/api/services-page";

export async function generateMetadata({
	params,
}: {
	params: Promise<{ locale: string }>;
}): Promise<Metadata> {
	const { locale } = await params;
	const t = await getTranslations({ locale, namespace: "Services" });

	return {
		title: t("pageTitle"),
		description: t("metaDescription"),
	};
}

export default async function ServicesPage({
	params,
}: {
	params: Promise<{ locale: string }>;
}) {
	const { locale } = await params;
	setRequestLocale(locale);

	const t = await getTranslations("Services");
	const [mergedSections, heroMediaFallback, partnerCards, serviceRecords] =
		await Promise.all([
			getMergedServiceSections(locale),
			getServicesHeroMediaFromApi(locale),
			getServicePartnerCards(locale),
			getServiceRecords(),
		]);

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

	const navItems = mergedSections.map((section) => ({
		id: section.service.id,
		title:
			section.title ??
			t(`items.${section.mockId}.title`, { defaultValue: section.mockId }),
	}));

	const sections = mergedSections.map((section) => ({
		service: section.service,
		title:
			section.title ??
			t(`items.${section.mockId}.title`, { defaultValue: section.mockId }),
		body:
			section.body ??
			t(`items.${section.mockId}.body`, { defaultValue: "" }),
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

			<ServicesHero
				heroMedia={heroMedia}
				firstServiceId={mergedSections[0]?.service.id ?? "services"}
				eyebrow={heroCopy.eyebrow}
				title={heroCopy.title}
				intro={heroCopy.intro}
				cta={t("hero.cta")}
			/>

			<ServicesShell
				sections={sections}
				navItems={navItems}
				navLabel={t("nav.label")}
			/>

			<ServicesBottomCards items={bottomCardItems} />
		</main>
	);
}
