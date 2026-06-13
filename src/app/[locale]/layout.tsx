import { notFound } from "next/navigation";
import { hasLocale, NextIntlClientProvider } from "next-intl";
import { getMessages, setRequestLocale } from "next-intl/server";
import { AudioPlayerBar } from "@/components/audio/audio-player-bar";
import { AudioPlayerProvider } from "@/components/audio/audio-player-context";
import { Footer } from "@/components/layout/footer";
import { Header } from "@/components/layout/header";
import { PAGE_LOADER_CRITICAL_CSS } from "@/components/layout/page-loader-critical";
import { PageLoaderOverlay } from "@/components/layout/page-loader-overlay";
import { PageLoaderStatic } from "@/components/layout/page-loader-static";
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
	const isLatin = locale === "ku" || locale === "en";

	return (
		<html
			lang={locale}
			dir={getDir(locale)}
			data-script={isLatin ? "latin" : "arabic"}
			data-page-loading=""
			className={
				isLatin
					? `${archivo.variable} ${clashDisplay.variable}`
					: vazirmatn.variable
			}
		>
			<head>
				{/* Blocking first-paint preloader — must not depend on the CSS bundle. */}
				<style>{PAGE_LOADER_CRITICAL_CSS}</style>
			</head>
			<body
				className={cn(
					isLatin ? archivo.className : vazirmatn.className,
					"antialiased",
				)}
			>
				<PageLoaderStatic />
				<NextIntlClientProvider messages={messages}>
					<LenisProvider>
						<AudioPlayerProvider>
							<PageLoaderOverlay />
							<div id="khi-app-shell">
								<div id="khi-app-header">
									<Header />
								</div>
								<div id="khi-app-content">
									<div className="pt-26 sm:pt-30">{children}</div>
									<Footer />
									<AudioPlayerBar />
								</div>
							</div>
						</AudioPlayerProvider>
					</LenisProvider>
				</NextIntlClientProvider>
			</body>
		</html>
	);
}
