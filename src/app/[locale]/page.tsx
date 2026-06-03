import { getTranslations, setRequestLocale } from "next-intl/server";
import { FeaturedHero } from "@/components/hero/featured-hero";
import { LatestUpdates } from "@/components/home/latest-updates";
import { ProjectsSection } from "@/components/home/projects-section";
import { VisuallyHidden } from "@/components/ui/visually-hidden";

export default async function Home({
	params,
}: {
	params: Promise<{ locale: string }>;
}) {
	const { locale } = await params;
	setRequestLocale(locale);
	const t = await getTranslations("Hero");

	return (
		<main className="-mt-26 sm:-mt-30">
			<VisuallyHidden as="h1">{t("regionLabel")}</VisuallyHidden>
			<FeaturedHero />
			<LatestUpdates />
			<ProjectsSection />
		</main>
	);
}
