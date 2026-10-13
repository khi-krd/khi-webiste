import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { FeaturedHero } from "@/components/hero/featured-hero";
import { DonateBand } from "@/components/home/donate-band";
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
		// `data-snap-sections` gives this page gentle section alignment (see
		// globals.css) — free continuous scroll that settles flush on a rest.
		// `type-defaults` keeps the authored type scale here: the dashboard
		// title/body/caption sizes are for detail pages, not the home layout.
		<main data-snap-sections className="type-defaults">
			<VisuallyHidden as="h1">{t("regionLabel")}</VisuallyHidden>
			<FeaturedHero />
			<LatestUpdates />
			<ProjectsSection />
			<SoundSection />
			<WritingsSection />
			<FilmSection />
			<VideoSection />
			<ImageCollectionSection />
			<DonateBand />
		</main>
	);
}
