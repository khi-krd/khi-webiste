import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { AboutFounder } from "@/components/about/about-founder";
import { AboutHero } from "@/components/about/about-hero";
import { AboutMission } from "@/components/about/about-mission";
import { AboutPartners } from "@/components/about/about-partners";
import { AboutTeamShowcase } from "@/components/about/about-team-showcase";
import { VisuallyHidden } from "@/components/ui/visually-hidden";
import { resolveFounderFromAbout } from "@/lib/about/resolve";
import {
	getAboutFounder,
	getAboutHeroMedia,
	getAboutManagers,
	getAboutOffices,
	getAboutPartners,
	getPrimaryAboutPage,
	resolveAboutContent,
} from "@/lib/api/about";
import { plainTextFromRichContent } from "@/lib/rich-text";
import { localeAlternates } from "@/lib/seo/metadata";

export async function generateMetadata({
	params,
}: {
	params: Promise<{ locale: string }>;
}): Promise<Metadata> {
	const { locale } = await params;
	const t = await getTranslations({ locale, namespace: "About" });
	const aboutPage = await getPrimaryAboutPage(locale);
	const aboutContent = aboutPage
		? resolveAboutContent(locale, aboutPage)
		: null;

	return {
		alternates: localeAlternates(locale, "/about"),
		title: aboutContent?.title ?? t("pageTitle"),
		description:
			aboutContent?.metaDescription ??
			plainTextFromRichContent(aboutContent?.body) ??
			t("metaDescription"),
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
	const aboutPage = await getPrimaryAboutPage(locale);
	const aboutContent = aboutPage
		? resolveAboutContent(locale, aboutPage)
		: null;
	const [heroMedia, founder, offices, partners, managers] = await Promise.all([
		getAboutHeroMedia(locale),
		getAboutFounder(locale),
		getAboutOffices(locale),
		getAboutPartners(locale),
		getAboutManagers(locale),
	]);
	const apiFounder = aboutPage
		? resolveFounderFromAbout(locale, aboutPage)
		: null;
	const officeLabels = {
		sulaymaniyah: t("team.offices.sulaymaniyah"),
		duhok: t("team.offices.duhok"),
	} as const;
	const cityLabels = {
		sulaymaniyah: t("team.cities.sulaymaniyah"),
		duhok: t("team.cities.duhok"),
	} as const;

	const withCopy = <
		T extends {
			id: string;
			name?: string;
			role?: string;
			image: { alt?: string };
		},
	>(
		member: T,
	) => ({
		...member,
		name: member.name ?? t(`team.members.${member.id}.name`),
		role: member.role ?? t(`team.members.${member.id}.role`),
		image: {
			...member.image,
			alt: member.name ?? t(`team.members.${member.id}.name`),
		},
	});

	const officesWithCopy = offices.map((office) => ({
		...office,
		members: office.members.map(withCopy),
	}));

	const managersWithCopy = managers.map((m) => ({
		...withCopy(m),
		officeLabel: cityLabels[m.officeId],
	}));

	return (
		<main>
			<VisuallyHidden as="h1">{t("pageTitle")}</VisuallyHidden>

			<AboutHero
				poster={heroMedia.poster}
				videoSrc={heroMedia.videoSrc}
				title={aboutContent?.title ?? t("heroTitle")}
				playLabel={t("heroPlayLabel")}
				closeLabel={t("videoCloseLabel")}
			/>

			<AboutMission
				body={aboutContent?.body?.trim() || undefined}
				paragraphs={
					aboutContent?.body?.trim()
						? undefined
						: [t("mission.p1"), t("mission.p2"), t("mission.p3")]
				}
			/>

			{/* Each block below renders only while the CMS has something to put in
			    it — an empty team or partner list drops the section entirely. */}
			{founder && apiFounder ? (
				<AboutFounder
					person={{
						...founder,
						image: {
							...founder.image,
							alt: apiFounder.name ?? t("founder.imageAlt"),
						},
					}}
					name={apiFounder.name ?? t("founder.name")}
					role1={t("founder.role1")}
					role2={apiFounder.bio ?? t("founder.role2")}
				/>
			) : null}

			{officesWithCopy.length > 0 || managersWithCopy.length > 0 ? (
				<AboutTeamShowcase
					offices={officesWithCopy}
					officeLabels={officeLabels}
					managers={managersWithCopy}
					managersLabel={t("team.managers")}
				/>
			) : null}

			{partners.length > 0 ? (
				<AboutPartners
					partners={partners}
					sectionTitle={t("partners.title")}
					getPartnerCopy={(id) => {
						const partner = partners.find((item) => item.id === id);
						return {
							title: partner?.title ?? partner?.slug ?? "",
							description: partner?.description ?? "",
							cta: t("partners.more"),
						};
					}}
				/>
			) : null}
		</main>
	);
}
