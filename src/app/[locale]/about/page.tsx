import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { AboutFounder } from "@/components/about/about-founder";
import { AboutHero } from "@/components/about/about-hero";
import { AboutMission } from "@/components/about/about-mission";
import { AboutPartners } from "@/components/about/about-partners";
import { AboutTeamShowcase } from "@/components/about/about-team-showcase";
import { VisuallyHidden } from "@/components/ui/visually-hidden";
import {
	getAboutFounder,
	getAboutHeroMedia,
	getAboutOffices,
	getAboutPartners,
} from "@/lib/mock/about";

export async function generateMetadata({
	params,
}: {
	params: Promise<{ locale: string }>;
}): Promise<Metadata> {
	const { locale } = await params;
	const t = await getTranslations({ locale, namespace: "About" });

	return {
		title: t("pageTitle"),
		description: t("metaDescription"),
	};
}

export default async function AboutPage({
	params,
}: {
	params: Promise<{ locale: string }>;
}) {
	const { locale } = await params;
	setRequestLocale(locale);

	const t = await getTranslations("About");
	const heroMedia = getAboutHeroMedia();
	const founder = getAboutFounder(locale);
	const offices = getAboutOffices(locale);
	const partners = getAboutPartners(locale);
	const direction = locale === "ckb" ? "rtl" : "ltr";

	const officeLabels = {
		sulaymaniyah: t("team.offices.sulaymaniyah"),
		duhok: t("team.offices.duhok"),
	} as const;

	const officesWithCopy = offices.map((office) => ({
		...office,
		members: office.members.map((member) => ({
			...member,
			name: t(`team.members.${member.id}.name`),
			role: t(`team.members.${member.id}.role`),
			image: {
				...member.image,
				alt: t(`team.members.${member.id}.name`),
			},
		})),
	}));

	return (
		<main className="-mt-26 sm:-mt-30">
			<VisuallyHidden as="h1">{t("pageTitle")}</VisuallyHidden>

			<AboutHero
				poster={heroMedia.poster}
				videoSrc={heroMedia.videoSrc}
				title={t("heroTitle")}
				playLabel={t("heroPlayLabel")}
				closeLabel={t("videoCloseLabel")}
			/>

			<AboutMission
				paragraphs={[t("mission.p1"), t("mission.p2"), t("mission.p3")]}
			/>

			<AboutFounder
				person={{
					...founder,
					image: {
						...founder.image,
						alt: t("founder.imageAlt"),
					},
				}}
				name={t("founder.name")}
				role1={t("founder.role1")}
				role2={t("founder.role2")}
			/>

			<AboutTeamShowcase
				offices={officesWithCopy}
				officeLabels={officeLabels}
				sectionLabel={t("team.offices.sulaymaniyah")}
				direction={direction}
			/>

			<AboutPartners
				partners={partners}
				sectionTitle={t("partners.title")}
				getPartnerCopy={(id) => ({
					eyebrow: t(`partners.items.${id}.eyebrow`),
					title: t(`partners.items.${id}.title`),
					description: t(`partners.items.${id}.description`),
					cta: t(`partners.items.${id}.cta`),
				})}
			/>
		</main>
	);
}
