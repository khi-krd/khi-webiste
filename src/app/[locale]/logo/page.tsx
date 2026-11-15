import type { Metadata } from "next";
import Image from "next/image";
import { getLocale, getTranslations, setRequestLocale } from "next-intl/server";
import { VisuallyHidden } from "@/components/ui/visually-hidden";
import { getSiteLogoUrl } from "@/lib/api/site-settings";
import { localeAlternates } from "@/lib/seo/metadata";

export async function generateMetadata({
	params,
}: {
	params: Promise<{ locale: string }>;
}): Promise<Metadata> {
	const { locale } = await params;
	const t = await getTranslations({ locale, namespace: "Brand" });

	return {
		alternates: localeAlternates(locale, "/logo"),
		title: t("pageTitle"),
		description: t("metaDescription"),
	};
}

/**
 * Dedicated brand page — the institute logo presented on its own, large,
 * on the brand surface. The mark comes from CMS branding settings with the
 * bundled `/logo.png` as fallback, same as the header/footer.
 */
export default async function LogoPage({
	params,
}: {
	params: Promise<{ locale: string }>;
}) {
	const { locale } = await params;
	setRequestLocale(locale);

	const t = await getTranslations("Brand");
	const nav = await getTranslations("Nav");
	const activeLocale = await getLocale();
	const isSorani = activeLocale === "ckb";
	const logoUrl = (await getSiteLogoUrl()) ?? "/logo.png";

	return (
		<main className="bg-background">
			<VisuallyHidden as="h1">{t("pageTitle")}</VisuallyHidden>

			<section className="mx-auto flex min-h-[70svh] w-full max-w-3xl flex-col items-center justify-center px-6 py-16 text-center sm:py-24">
				<Image
					src={logoUrl}
					alt={nav("brandAlt")}
					width={320}
					height={320}
					className="size-44 object-contain sm:size-64"
					priority
				/>

				<p
					lang={isSorani ? "ckb" : "ku"}
					dir={isSorani ? "rtl" : "ltr"}
					className={
						isSorani
							? "mt-8 font-[family-name:var(--font-app-heading)] text-title font-bold text-foreground"
							: "mt-8 font-heading text-title font-bold text-foreground"
					}
				>
					{isSorani ? nav("brandNameCkb") : nav("brandNameKu")}
				</p>

				<p className="label mt-4 text-muted">{t("tagline")}</p>
			</section>
		</main>
	);
}
