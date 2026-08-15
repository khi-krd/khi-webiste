import { getLocale, getTranslations } from "next-intl/server";
import { HeaderNav } from "@/components/layout/header-nav";
import { HeaderShell } from "@/components/layout/header-shell";
import { Logo } from "@/components/layout/logo";
import {
	navBoxTriggerClass,
	navBoxTriggerLabelClass,
	navLinkClass,
} from "@/components/layout/nav-styles";
import { PublicationsDropdown } from "@/components/layout/publications-dropdown";
import { Container } from "@/components/ui/container";
import { DrawnBorder } from "@/components/ui/drawn-border";
import { SERVICES_HREF } from "@/config/site";
import { Link } from "@/i18n/navigation";
import { getNavMenuOverrides } from "@/lib/api/nav-menu";

/**
 * Site header. Server Component shell — interactive items live in <HeaderNav/>.
 *
 * Sticky top bar in document flow (not a floating overlay).
 *
 * Layout is PHYSICAL, not logical — the same geometry in ckb (RTL) and ku (LTR):
 *
 *   [logo · brand · ئێمە · خزمەتگوزارییەکان] … [کتێبخانە · ئەرشیڤ · بڵاوکراوە · search|lang · ☰]
 *
 * `dir-row-unmirrored` un-mirrors the three structural rows (the bar and its two
 * clusters) so those blocks never swap sides between locales. Everything nested
 * inside them keeps normal flow, so ckb still READS right-to-left: ☰,
 * search/lang, بڵاوکراوە, ئەرشیڤ, کتێبخانە … ئێمە, خزمەتگوزارییەکان, brand.
 *
 * Only ئەرشیڤ/کتێبخانە carry the drawn rectangle; بڵاوکراوە deliberately
 * shares the plain underline hover of ئێمە/خزمەتگوزارییەکان.
 */
export async function Header() {
	const t = await getTranslations("Nav");
	const locale = await getLocale();
	// CMS overlay for the mega menu (labels, descriptions, background photos).
	// Empty when the API is unreachable — the overlay then renders the static
	// config alone, so the menu never depends on the CMS being up.
	const navMenu = await getNavMenuOverrides(locale);

	return (
		<HeaderShell>
			<Container className="dir-row-unmirrored relative flex h-16 max-w-none items-center justify-between gap-4 px-8 sm:h-20 sm:px-10 2xl:max-w-[96rem]">
				<div className="dir-row-unmirrored flex min-w-0 items-center gap-2 sm:gap-3">
					<Logo />

					<nav
						aria-label={t("primary")}
						className="hidden items-center gap-0.5 sm:flex sm:gap-1"
					>
						<Link href="/about" className={navLinkClass}>
							{t("us")}
						</Link>

						<Link href={SERVICES_HREF} className={navLinkClass}>
							{t("services")}
						</Link>
					</nav>
				</div>

				{/* Wider seam here keeps the link group clearly apart from the
				    search/language tray. */}
				<div className="dir-row-unmirrored flex min-w-0 items-center gap-2 sm:gap-32">
					<div className="hidden items-center gap-0.5 sm:flex sm:gap-1">
						<PublicationsDropdown />

						<button type="button" className={navBoxTriggerClass}>
							<DrawnBorder />
							<span className={navBoxTriggerLabelClass}>{t("archive")}</span>
						</button>

						<button type="button" className={navBoxTriggerClass}>
							<DrawnBorder />
							<span className={navBoxTriggerLabelClass}>{t("library")}</span>
						</button>
					</div>

					<HeaderNav navMenu={navMenu} />
				</div>
			</Container>
		</HeaderShell>
	);
}
