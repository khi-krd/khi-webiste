import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { ServicesBottomCards } from "@/components/services/services-bottom-cards";
import { ServicesHero } from "@/components/services/services-hero";
import { ServicesShell } from "@/components/services/services-shell";
import { VisuallyHidden } from "@/components/ui/visually-hidden";
import {
	getServices,
	getServicesBottomCards,
	getServicesHeroMedia,
} from "@/lib/mock/services";

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
	const services = getServices(locale);
	const bottomCards = getServicesBottomCards(locale);
	const direction = locale === "ckb" ? "rtl" : "ltr";

	const navItems = services.map((service) => ({
		id: service.id,
		title: t(`items.${service.id}.title`),
	}));

	const sections = services.map((service) => ({
		service,
		title: t(`items.${service.id}.title`),
		body: t(`items.${service.id}.body`),
	}));

	const heroNavItems = services.map((service) => ({
		service,
		title: t(`items.${service.id}.title`),
	}));

	const bottomCardItems = bottomCards.map((card) => ({
		card,
		copy: {
			eyebrow: t(`bottom.${card.id}.eyebrow`),
			title: t(`bottom.${card.id}.title`),
			description: t(`bottom.${card.id}.description`),
			cta: t(`bottom.${card.id}.cta`),
		},
	}));

	return (
		<main className="-mt-26 sm:-mt-30">
			<VisuallyHidden as="h1">{t("pageTitle")}</VisuallyHidden>

			<ServicesHero
				heroMedia={getServicesHeroMedia()}
				navItems={heroNavItems}
				firstServiceId={services[0]?.id ?? "institute-hall"}
				eyebrow={t("hero.eyebrow")}
				title={t("hero.title")}
				intro={t("hero.intro")}
				cta={t("hero.cta")}
				navLabel={t("nav.label")}
				direction={direction}
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
