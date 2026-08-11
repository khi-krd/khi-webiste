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
import { RouteProgress } from "@/components/layout/route-progress";
import { NativeScroll } from "@/components/providers/native-scroll";
import { routing } from "@/i18n/routing";
import { assertServerEnv } from "@/lib/env";
import { archivo, clashDisplay, vazirmatn } from "@/lib/fonts";
import { getBorderRadiusHtmlAttrs } from "@/lib/theme/border-radius";
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
		// Next fills in `images` from src/app/opengraph-image.tsx; declaring the
		// card type is what makes X/Twitter render the large preview.
		twitter: {
			card: "summary_large_image",
			title: siteName,
			description: t("aboutDescription"),
		},
	};
}

function getDir(locale: string): "ltr" | "rtl" {
	return locale === "ckb" ? "rtl" : "ltr";
}

export default async function LocaleLayout({ children, params }: Props) {
	// Fails the request loudly in production when required deploy config is
	// missing, instead of silently rendering an empty site.
	assertServerEnv();

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
			{...getBorderRadiusHtmlAttrs()}
			// Vazirmatn ships on BOTH locales: the header wordmark always renders
			// the Sorani institute name, and Archivo/Clash carry no Arabic glyphs,
			// so ku would otherwise fall back to a random system Arabic face.
			className={cn(
				vazirmatn.variable,
				isLatin && `${archivo.variable} ${clashDisplay.variable}`,
			)}
		>
			<body
				className={cn(
					isLatin ? archivo.className : vazirmatn.className,
					"antialiased",
				)}
			>
				<NextIntlClientProvider messages={messages}>
					<NativeScroll>
						<RouteProgress />
						<AudioPlayerProvider>
							<Header />
							{children}
							<Footer />
							<AudioPlayerBar />
						</AudioPlayerProvider>
					</NativeScroll>
				</NextIntlClientProvider>
			</body>
		</html>
	);
}
