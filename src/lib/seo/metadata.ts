import type { Metadata } from "next";
import { type Locale, routing } from "@/i18n/routing";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

/** Maps our locale codes to BCP-47 hreflang values. */
const hreflang: Record<Locale, string> = {
	ckb: "ckb-IQ",
	ku: "ku",
};

/**
 * Builds canonical + hreflang alternates for a page. Pass the locale-agnostic
 * path (e.g. "/library/books/123"); this prefixes each locale and emits the
 * full set of `<link rel="alternate" hreflang>` tags Next renders for us.
 */
export function alternates(locale: Locale, path = ""): Metadata["alternates"] {
	const clean = path.replace(/^\/|\/$/g, "");
	const url = (l: Locale) => `${siteUrl}/${l}${clean ? `/${clean}` : ""}`;

	const languages: Record<string, string> = {};
	for (const l of routing.locales) {
		languages[hreflang[l]] = url(l);
	}
	// x-default points at the default locale.
	languages["x-default"] = url(routing.defaultLocale);

	return { canonical: url(locale), languages };
}

/** Convenience: full metadata for a page with title, description, alternates. */
export function buildMetadata(opts: {
	locale: Locale;
	path?: string;
	title?: string;
	description?: string;
}): Metadata {
	return {
		metadataBase: new URL(siteUrl),
		title: opts.title,
		description: opts.description,
		alternates: alternates(opts.locale, opts.path),
		openGraph: {
			type: "website",
			locale: opts.locale,
			url: `${siteUrl}/${opts.locale}${opts.path ?? ""}`,
			title: opts.title,
			description: opts.description,
		},
	};
}
