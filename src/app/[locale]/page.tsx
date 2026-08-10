import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { FeaturedHero } from "@/components/hero/featured-hero";
import { FilmSection } from "@/components/home/film-section";
import { ImageCollectionSection } from "@/components/home/image-collection-section";
import { LatestUpdates } from "@/components/home/latest-updates";
import { ProjectsSection } from "@/components/home/projects-section";
import { SoundSection } from "@/components/home/sound-section";
import { VideoSection } from "@/components/home/video-section";
import { WritingsSection } from "@/components/home/writings-section";
import { VisuallyHidden } from "@/components/ui/visually-hidden";
import { localeAlternates } from "@/lib/seo/metadata";

export async function generateMetadata({
	params,
}: {
	params: Promise<{ locale: string }>;
}): Promise<Metadata> {
	const { locale } = await params;
	const t = await getTranslations({ locale, namespace: "Nav" });
	return {
		// `absolute` so the homepage title is just the site name (no template suffix).
		title: { absolute: t("brandAlt") },
		alternates: localeAlternates(locale),
	};
}

export default async function Home({
	params,
}: {
	params: Promise<{ locale: string }>;
}) {
	const { locale } = await params;
	setRequestLocale(locale);
	const t = await getTranslations("Hero");

	return (
		// `data-snap-sections` opts this page into section-by-section snap
		// scrolling (see globals.css) — one gesture lands on one whole section.
		<main data-snap-sections>
			<VisuallyHidden as="h1">{t("regionLabel")}</VisuallyHidden>
			<FeaturedHero />
			<LatestUpdates />
			<ProjectsSection />
			<SoundSection />
			<WritingsSection />
			<FilmSection />
			<VideoSection />
			<ImageCollectionSection />
		</main>
	);
}
