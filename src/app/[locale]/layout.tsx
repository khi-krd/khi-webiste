import { Vazirmatn } from "next/font/google";
import { notFound } from "next/navigation";
import { hasLocale, NextIntlClientProvider } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { type Locale, localeDirection, routing } from "@/i18n/routing";
import { alternates } from "@/lib/seo/metadata";
import "../globals.css";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

// Vazirmatn covers both Arabic (Sorani) and Latin (Kurmanji) glyphs.
const vazirmatn = Vazirmatn({
	subsets: ["arabic", "latin"],
	variable: "--font-sans",
	display: "swap",
});

// Render both locales statically at build time (SEO priority).
export function generateStaticParams() {
	return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
	params,
}: {
	params: Promise<{ locale: Locale }>;
}) {
	const { locale } = await params;
	const t = await getTranslations({ locale, namespace: "Metadata" });

	return {
		metadataBase: new URL(siteUrl),
		title: {
			default: t("defaultTitle"),
			template: t("titleTemplate"),
		},
		description: t("defaultDescription"),
		alternates: alternates(locale),
	};
}

export default async function LocaleLayout({
	children,
	params,
}: {
	children: React.ReactNode;
	params: Promise<{ locale: string }>;
}) {
	const { locale } = await params;
	if (!hasLocale(routing.locales, locale)) {
		notFound();
	}

	// Enable static rendering for this request.
	setRequestLocale(locale);

	return (
		<html
			lang={locale}
			dir={localeDirection[locale]}
			className={`${vazirmatn.variable} h-full antialiased`}
		>
			<body className="min-h-full bg-background text-foreground">
				<NextIntlClientProvider>{children}</NextIntlClientProvider>
			</body>
		</html>
	);
}
