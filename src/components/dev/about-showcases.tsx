"use client";

import { useLocale, useTranslations } from "next-intl";
import { AboutHero } from "@/components/about/about-hero";
import { AboutTeamPhoto } from "@/components/about/about-team-photo";
import { PartnerCard } from "@/components/about/partner-card";
import { SectionRuleHeading } from "@/components/about/section-rule-heading";
import { ShowcaseCard } from "@/components/dev/playground-block";
import {
	getAboutHeroMedia,
	getAboutOffices,
	getAboutPartners,
} from "@/lib/mock/about";

export function SectionRuleHeadingShowcase() {
	const t = useTranslations("About");

	return (
		<ShowcaseCard title={t("team.offices.sulaymaniyah")}>
			<SectionRuleHeading title={t("team.offices.sulaymaniyah")} />
		</ShowcaseCard>
	);
}

export function AboutTeamPhotoShowcase() {
	const t = useTranslations("About");
	const offices = getAboutOffices(useLocale());
	const member = offices[0]?.members[0];

	if (!member) {
		return null;
	}

	return (
		<ShowcaseCard title={t(`team.members.${member.id}.name`)}>
			<div className="max-w-48">
				<AboutTeamPhoto
					member={member}
					name={t(`team.members.${member.id}.name`)}
					role={t(`team.members.${member.id}.role`)}
				/>
			</div>
		</ShowcaseCard>
	);
}

export function PartnerCardShowcase() {
	const t = useTranslations("About");
	const partners = getAboutPartners(useLocale());
	const partner = partners[0];

	if (!partner) {
		return null;
	}

	const copy = {
		eyebrow: t(`partners.items.${partner.id}.eyebrow`),
		title: t(`partners.items.${partner.id}.title`),
		description: t(`partners.items.${partner.id}.description`),
		cta: t(`partners.items.${partner.id}.cta`),
	};

	return (
		<ShowcaseCard title={copy.title}>
			<PartnerCard
				item={partner}
				eyebrow={copy.eyebrow}
				title={copy.title}
				description={copy.description}
				cta={copy.cta}
			/>
		</ShowcaseCard>
	);
}

export function AboutHeroShowcase() {
	const t = useTranslations("About");
	const heroMedia = getAboutHeroMedia();

	return (
		<AboutHero
			poster={heroMedia.poster}
			videoSrc={heroMedia.videoSrc}
			title={t("heroTitle")}
			playLabel={t("heroPlayLabel")}
			closeLabel={t("videoCloseLabel")}
			compact
		/>
	);
}
