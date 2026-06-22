import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { hasLocale, NextIntlClientProvider } from "next-intl";
import {
	getMessages,
	getTranslations,
	setRequestLocale,
} from "next-intl/server";
import { AudioPlayerBar } from "@/components/audio/audio-player-bar";
import { AudioPlayerProvider } from "@/components/audio/audio-player-context";
import { Footer } from "@/components/layout/footer";
import { Header } from "@/components/layout/header";
import { LenisProvider } from "@/components/providers/lenis-provider";
import { routing } from "@/i18n/routing";
import { archivo, clashDisplay, vazirmatn } from "@/lib/fonts";
import { cn } from "@/lib/utils";
import "../globals.css";

type Props = {
	children: React.ReactNode;
	params: Promise<{ locale: string }>;
};

export function generateStaticParams() {
	return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
	params,
}: {
	params: Promise<{ locale: string }>;
}): Promise<Metadata> {
	const { locale } = await params;
	const t = await getTranslations({ locale, namespace: "Nav" });
	const siteName = t("brandAlt");
	const siteUrl = process.env.NEXT_PUBLIC_SITE_URL;

	return {
		metadataBase: siteUrl ? new URL(siteUrl) : undefined,
		// `default` guarantees every route has a <title> even mid-stream; pages
		// add their own title which flows through `template`.
		title: {
			default: siteName,
			template: `%s · ${siteName}`,
		},
		description: t("aboutDescription"),
		openGraph: {
			siteName,
			locale,
			type: "website",
		},
	};
}

function getDir(locale: string): "ltr" | "rtl" {
	return locale === "ckb" ? "rtl" : "ltr";
}

export default async function LocaleLayout({ children, params }: Props) {
	const { locale } = await params;

	if (!hasLocale(routing.locales, locale)) {
		notFound();
	}

	setRequestLocale(locale);

	const messages = await getMessages();
	const isLatin = locale === "ku";

	return (
		<html
			lang={locale}
			dir={getDir(locale)}
			data-script={isLatin ? "latin" : "arabic"}
			className={
				isLatin
					? `${archivo.variable} ${clashDisplay.variable}`
					: vazirmatn.variable
			}
		>
			<body
				className={cn(
					isLatin ? archivo.className : vazirmatn.className,
					"antialiased",
				)}
			>
				<NextIntlClientProvider messages={messages}>
					<LenisProvider>
						<AudioPlayerProvider>
							<Header />
							<div className="pt-26 sm:pt-30">{children}</div>
							<Footer />
							<AudioPlayerBar />
						</AudioPlayerProvider>
					</LenisProvider>
				</NextIntlClientProvider>
			</body>
		</html>
	);
}
