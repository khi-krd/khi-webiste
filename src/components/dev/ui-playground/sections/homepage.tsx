import { getTranslations } from "next-intl/server";
import {
	FeaturedHero,
	ImageCollectionSection,
	LatestUpdates,
	ProjectsSection,
	SoundSection,
	VideoSection,
	WritingsSection,
} from "@/components/dev/homepage-section-previews";
import {
	FeaturedCarouselShowcase,
	FeaturedSlideShowcase,
	NewsCardShowcase,
	ProjectCardShowcase,
	VideoCardShowcase,
	WritingRowShowcase,
} from "@/components/dev/homepage-showcases";
import { PlaygroundBlock } from "@/components/dev/playground-block";

export async function FeaturedSlideSection() {
	const t = await getTranslations("Ui");

	return (
		<PlaygroundBlock
			id="featuredSlide"
			title={t("sections.featuredSlide.title")}
			description={t("sections.featuredSlide.description")}
			lazy={false}
		>
			<FeaturedSlideShowcase />
		</PlaygroundBlock>
	);
}

export async function FeaturedCarouselSection() {
	const t = await getTranslations("Ui");

	return (
		<PlaygroundBlock
			id="featuredCarousel"
			title={t("sections.featuredCarousel.title")}
			description={t("sections.featuredCarousel.description")}
			lazy={false}
		>
			<FeaturedCarouselShowcase />
		</PlaygroundBlock>
	);
}

export async function NewsCardSection() {
	const t = await getTranslations("Ui");

	return (
		<PlaygroundBlock
			id="newsCard"
			title={t("sections.newsCard.title")}
			description={t("sections.newsCard.description")}
			lazy={false}
		>
			<NewsCardShowcase />
		</PlaygroundBlock>
	);
}

export async function ProjectCardSection() {
	const t = await getTranslations("Ui");

	return (
		<PlaygroundBlock
			id="projectCard"
			title={t("sections.projectCard.title")}
			description={t("sections.projectCard.description")}
			lazy={false}
		>
			<ProjectCardShowcase />
		</PlaygroundBlock>
	);
}

export async function WritingRowSection() {
	const t = await getTranslations("Ui");

	return (
		<PlaygroundBlock
			id="writingRow"
			title={t("sections.writingRow.title")}
			description={t("sections.writingRow.description")}
			lazy={false}
		>
			<WritingRowShowcase />
		</PlaygroundBlock>
	);
}

export async function VideoCardSection() {
	const t = await getTranslations("Ui");

	return (
		<PlaygroundBlock
			id="videoCard"
			title={t("sections.videoCard.title")}
			description={t("sections.videoCard.description")}
			lazy={false}
		>
			<VideoCardShowcase />
		</PlaygroundBlock>
	);
}

export async function FeaturedHeroSection() {
	const t = await getTranslations("Ui");

	return (
		<PlaygroundBlock
			id="featuredHero"
			title={t("sections.featuredHero.title")}
			description={t("sections.featuredHero.description")}
			fullBleed
			lazy={false}
		>
			<FeaturedHero compact />
		</PlaygroundBlock>
	);
}

export async function LatestUpdatesSection() {
	const t = await getTranslations("Ui");

	return (
		<PlaygroundBlock
			id="latestUpdates"
			title={t("sections.latestUpdates.title")}
			description={t("sections.latestUpdates.description")}
			fullBleed
			lazy={false}
		>
			<LatestUpdates />
		</PlaygroundBlock>
	);
}

export async function ProjectsSectionPreview() {
	const t = await getTranslations("Ui");

	return (
		<PlaygroundBlock
			id="projectsSection"
			title={t("sections.projectsSection.title")}
			description={t("sections.projectsSection.description")}
			fullBleed
			lazy={false}
		>
			<ProjectsSection />
		</PlaygroundBlock>
	);
}

export async function SoundSectionPreview() {
	const t = await getTranslations("Ui");

	return (
		<PlaygroundBlock
			id="soundSection"
			title={t("sections.soundSection.title")}
			description={t("sections.soundSection.description")}
			fullBleed
			lazy={false}
		>
			<SoundSection compact />
		</PlaygroundBlock>
	);
}

export async function WritingsSectionPreview() {
	const t = await getTranslations("Ui");

	return (
		<PlaygroundBlock
			id="writingsSection"
			title={t("sections.writingsSection.title")}
			description={t("sections.writingsSection.description")}
			fullBleed
			lazy={false}
		>
			<WritingsSection />
		</PlaygroundBlock>
	);
}

export async function VideoSectionPreview() {
	const t = await getTranslations("Ui");

	return (
		<PlaygroundBlock
			id="videoSection"
			title={t("sections.videoSection.title")}
			description={t("sections.videoSection.description")}
			fullBleed
			lazy={false}
		>
			<VideoSection />
		</PlaygroundBlock>
	);
}

export async function ImageCollectionSectionPreview() {
	const t = await getTranslations("Ui");

	return (
		<PlaygroundBlock
			id="imageCollectionSection"
			title={t("sections.imageCollectionSection.title")}
			description={t("sections.imageCollectionSection.description")}
			fullBleed
			lazy={false}
		>
			<ImageCollectionSection />
		</PlaygroundBlock>
	);
}
