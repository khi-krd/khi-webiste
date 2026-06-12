import { notFound } from "next/navigation";
import { hasLocale, NextIntlClientProvider } from "next-intl";
import { getMessages, setRequestLocale } from "next-intl/server";
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
