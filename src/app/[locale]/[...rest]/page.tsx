import { notFound } from "next/navigation";
import { hasLocale } from "next-intl";
import { setRequestLocale } from "next-intl/server";
import { routing } from "@/i18n/routing";

/**
 * Catch-all for unmatched paths under a valid locale.
 *
 * Without this, `/ckb/does-not-exist` never enters the `[locale]` segment, so
 * Next falls through to the root `app/not-found.tsx` and renders a bare,
 * unlocalised page with no header, footer or fonts. Matching here and calling
 * `notFound()` hands off to `[locale]/not-found.tsx` inside the locale layout.
 *
 * Catch-all segments have the lowest routing priority, so this never shadows a
 * real route.
 */

/**
 * `notFound()` is thrown from generateMetadata, not just the page body, so the
 * 404 status is decided before `loading.tsx` starts streaming the shell with a
 * 200 — the same reason the other dynamic routes do it here. Same trick as
 * `news/[slug]`, `audio/[id]`, etc.
 */
export async function generateMetadata({
	params,
}: {
	params: Promise<{ locale: string }>;
}) {
	const { locale } = await params;
	if (hasLocale(routing.locales, locale)) {
		setRequestLocale(locale);
	}
	notFound();
}

export default function LocaleCatchAll() {
	notFound();
}
