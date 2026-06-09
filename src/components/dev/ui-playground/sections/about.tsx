import { getTranslations } from "next-intl/server";
import {
	AboutFounderPreview,
	AboutMissionPreview,
	AboutPartnersPreview,
	AboutTeamShowcasePreview,
} from "@/components/dev/about-section-previews";
import {
	AboutHeroShowcase,
	AboutTeamPhotoShowcase,
	PartnerCardShowcase,
	SectionRuleHeadingShowcase,
} from "@/components/dev/about-showcases";
import { PlaygroundBlock } from "@/components/dev/playground-block";

export async function SectionRuleHeadingSection() {
	const t = await getTranslations("Ui");

	return (
		<PlaygroundBlock
			id="sectionRuleHeading"
			title={t("sections.sectionRuleHeading.title")}
			description={t("sections.sectionRuleHeading.description")}
			lazy={false}
		>
			<SectionRuleHeadingShowcase />
		</PlaygroundBlock>
	);
}

export async function AboutTeamPhotoSection() {
	const t = await getTranslations("Ui");

	return (
		<PlaygroundBlock
			id="aboutTeamPhoto"
			title={t("sections.aboutTeamPhoto.title")}
			description={t("sections.aboutTeamPhoto.description")}
			lazy={false}
		>
			<AboutTeamPhotoShowcase />
		</PlaygroundBlock>
	);
}

export async function PartnerCardSection() {
	const t = await getTranslations("Ui");

	return (
		<PlaygroundBlock
			id="partnerCard"
			title={t("sections.partnerCard.title")}
			description={t("sections.partnerCard.description")}
			lazy={false}
		>
			<PartnerCardShowcase />
		</PlaygroundBlock>
	);
}

export async function AboutHeroSection() {
	const t = await getTranslations("Ui");

	return (
		<PlaygroundBlock
			id="aboutHero"
			title={t("sections.aboutHero.title")}
			description={t("sections.aboutHero.description")}
			fullBleed
			lazy={false}
		>
			<AboutHeroShowcase />
		</PlaygroundBlock>
	);
}

export async function AboutMissionSection() {
	const t = await getTranslations("Ui");

	return (
		<PlaygroundBlock
			id="aboutMission"
			title={t("sections.aboutMission.title")}
			description={t("sections.aboutMission.description")}
			fullBleed
			lazy={false}
		>
			<AboutMissionPreview />
		</PlaygroundBlock>
	);
}

export async function AboutFounderSection() {
	const t = await getTranslations("Ui");

	return (
		<PlaygroundBlock
			id="aboutFounder"
			title={t("sections.aboutFounder.title")}
			description={t("sections.aboutFounder.description")}
			fullBleed
			lazy={false}
		>
			<AboutFounderPreview />
		</PlaygroundBlock>
	);
}

export async function AboutTeamShowcaseSection() {
	const t = await getTranslations("Ui");

	return (
		<PlaygroundBlock
			id="aboutTeamShowcase"
			title={t("sections.aboutTeamShowcase.title")}
			description={t("sections.aboutTeamShowcase.description")}
			fullBleed
			lazy={false}
		>
			<AboutTeamShowcasePreview />
		</PlaygroundBlock>
	);
}

export async function AboutPartnersSection() {
	const t = await getTranslations("Ui");

	return (
		<PlaygroundBlock
			id="aboutPartners"
			title={t("sections.aboutPartners.title")}
			description={t("sections.aboutPartners.description")}
			fullBleed
			lazy={false}
		>
			<AboutPartnersPreview />
		</PlaygroundBlock>
	);
}
