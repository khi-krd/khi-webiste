import { getTranslations, setRequestLocale } from "next-intl/server";

export default async function Home({
	params,
}: {
	params: Promise<{ locale: string }>;
}) {
	const { locale } = await params;
	setRequestLocale(locale);

	if (locale === "ckb") {
		const t = await getTranslations("Home");
		return <div>{t("placeholder")}</div>;
	}

	return <div>Home</div>;
}
