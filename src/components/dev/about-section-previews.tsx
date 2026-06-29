import { getLocale, getTranslations } from "next-intl/server";
import { AboutFounder } from "@/components/about/about-founder";
import { AboutMission } from "@/components/about/about-mission";
import { AboutPartners } from "@/components/about/about-partners";
import { AboutTeamShowcase } from "@/components/about/about-team-showcase";
import {
	getAboutFounder,
	getAboutOffices,
	getAboutPartners,
} from "@/lib/mock/about";

export async function AboutMissionPreview() {
	const t = await getTranslations("About");

	return (
		<AboutMission
			paragraphs={[t("mission.p1"), t("mission.p2"), t("mission.p3")]}
		/>
	);
}

export async function AboutFounderPreview() {
	const locale = await getLocale();
	const t = await getTranslations("About");
	const founder = getAboutFounder(locale);

	return (
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
	);
}

export async function AboutTeamShowcasePreview() {
	const locale = await getLocale();
	const t = await getTranslations("About");
	const offices = getAboutOffices(locale);
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
		<AboutTeamShowcase
			offices={officesWithCopy}
			officeLabels={officeLabels}
		/>
	);
}

export async function AboutPartnersPreview() {
	const locale = await getLocale();
	const t = await getTranslations("About");
	const partners = getAboutPartners(locale);

	return (
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
	);
}
