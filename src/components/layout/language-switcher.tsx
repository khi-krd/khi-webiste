"use client";

import { useLocale, useTranslations } from "next-intl";
import { Link } from "@/components/ui/link";
import { LOCALE_LABELS } from "@/config/site";
import { usePathname } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";

/**
 * Locale switcher. Client Component — it reads the CURRENT pathname (locale
 * stripped) via the next-intl navigation helper and re-links it under each
 * locale, so switching language preserves the route the user is on.
 *
 * Each option is rendered in its OWN language (autonym) with a matching `lang`
 * so the browser shapes it with the correct script — e.g. the ckb option is
 * Arabic script even inside the Latin (ku/en) UI, and a reader who can't read
 * the current UI language can still find theirs. The active locale is marked
 * with aria-current. Layout mirrors automatically from the document dir.
 */
export function LanguageSwitcher() {
	const t = useTranslations("LanguageSwitcher");
	const activeLocale = useLocale();
	const pathname = usePathname();

	return (
		<nav aria-label={t("label")}>
			<ul className="flex flex-wrap items-center gap-x-5 gap-y-2">
				{routing.locales.map((locale) => (
					<li key={locale}>
						<Link
							href={pathname}
							locale={locale}
							lang={locale}
							variant="nav"
							active={locale === activeLocale}
							className="text-small"
						>
							{LOCALE_LABELS[locale]}
						</Link>
					</li>
				))}
			</ul>
		</nav>
	);
}
