"use client";

import { useLocale, useTranslations } from "next-intl";
import { useTransition } from "react";
import { Link as UiLink } from "@/components/ui/link";
import { LOCALE_LABELS, LOCALE_SHORT_LABELS } from "@/config/site";
import { usePathname, useRouter } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";
import { cn } from "@/lib/utils";

type LanguageSwitcherProps = {
	/** "links" = autonym text links; "group" = segmented toggle with short codes. */
	variant?: "links" | "group";
	/** Dark overlay footer — light-on-ink token overrides for the grouped toggle. */
	overlay?: boolean;
	/** Called before navigating to the new locale (e.g. close the nav overlay). */
	onLocaleChange?: () => void;
};

/**
 * Locale switcher. Preserves the current pathname when switching language.
 *
 * Group variant: CKB · KU · EN segmented control (body font, not display).
 * Links variant: autonyms in each language's own script.
 */
export function LanguageSwitcher({
	variant = "links",
	overlay = false,
	onLocaleChange,
}: LanguageSwitcherProps) {
	const t = useTranslations("LanguageSwitcher");
	const activeLocale = useLocale();
	const pathname = usePathname();
	const router = useRouter();
	const [isPending, startTransition] = useTransition();

	function switchLocale(locale: (typeof routing.locales)[number]) {
		if (locale === activeLocale) return;
		onLocaleChange?.();
		startTransition(() => {
			router.replace(pathname, { locale });
		});
	}

	if (variant === "group") {
		return (
			<div
				role="group"
				aria-label={t("label")}
				className={cn(
					"inline-flex overflow-hidden rounded-md",
					overlay
						? "border border-primary-foreground/25"
						: "border border-border-strong",
				)}
			>
				{routing.locales.map((locale, index) => {
					const isActive = locale === activeLocale;

					return (
						<button
							key={locale}
							type="button"
							lang={locale}
							aria-current={isActive ? "page" : undefined}
							aria-label={t("label")}
							disabled={isPending || isActive}
							onClick={() => switchLocale(locale)}
							className={cn(
								"inline-flex h-11 min-w-11 items-center justify-center px-3 font-sans text-small font-medium transition-colors",
								(isPending || isActive) && "cursor-default",
								index > 0 &&
									(overlay
										? "border-s border-primary-foreground/25"
										: "border-s border-border-strong"),
								overlay
									? isActive
										? "bg-primary-foreground/10 text-primary-foreground"
										: "text-primary-foreground/55 fine-hover:bg-primary-foreground/5 fine-hover:text-primary-foreground"
									: isActive
										? "bg-sunken text-foreground"
										: "text-muted fine-hover:bg-sunken fine-hover:text-foreground",
							)}
						>
							{LOCALE_SHORT_LABELS[locale]}
						</button>
					);
				})}
			</div>
		);
	}

	return (
		<nav aria-label={t("label")}>
			<ul className="flex flex-wrap items-center gap-x-5 gap-y-2">
				{routing.locales.map((locale) => (
					<li key={locale}>
						<UiLink
							href={pathname}
							locale={locale}
							lang={locale}
							variant="nav"
							active={locale === activeLocale}
							className="text-small"
						>
							{LOCALE_LABELS[locale]}
						</UiLink>
					</li>
				))}
			</ul>
		</nav>
	);
}
