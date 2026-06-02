import { getTranslations, setRequestLocale } from "next-intl/server";
import { FeaturedHero } from "@/components/hero/featured-hero";
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
		<main>
			<VisuallyHidden as="h1">{t("regionLabel")}</VisuallyHidden>
			<FeaturedHero />
		</main>
	);
}
