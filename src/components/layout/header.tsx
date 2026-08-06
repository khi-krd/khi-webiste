import { getTranslations } from "next-intl/server";
import { HeaderNav } from "@/components/layout/header-nav";
import { HeaderShell } from "@/components/layout/header-shell";
import { Logo } from "@/components/layout/logo";
import {
	navTriggerClass,
	navTriggerLabelClass,
} from "@/components/layout/nav-styles";
import { PublicationsDropdown } from "@/components/layout/publications-dropdown";
import { Container } from "@/components/ui/container";
import { DrawnBorder } from "@/components/ui/drawn-border";

/**
 * Site header. Server Component shell — interactive items live in <HeaderNav/>.
 *
 * Sticky top bar in document flow (not a floating overlay): logo + institute
 * name on the leading side, immediately followed by بڵاوکراوە/ئەرشیڤ/کتێبخانە
 * so that group reads as one brand-adjacent cluster. Trailing cluster holds
 * the rest of primary nav (about · services), utilities (search · language),
 * and the menu hamburger. Search opens the drawer overlay in search mode.
 */
export async function Header() {
	const t = await getTranslations("Nav");

	return (
		<HeaderShell>
			<Container className="relative flex h-16 max-w-none items-center justify-between gap-4 px-8 sm:h-20 sm:px-10">
				<div className="flex min-w-0 items-center gap-2 sm:gap-3">
					<Logo />

					<div className="hidden items-center gap-0.5 sm:flex sm:gap-1">
						<PublicationsDropdown />

						<button type="button" className={navTriggerClass}>
							<DrawnBorder />
							<span className={navTriggerLabelClass}>{t("archive")}</span>
						</button>

						<button type="button" className={navTriggerClass}>
							<DrawnBorder />
							<span className={navTriggerLabelClass}>{t("library")}</span>
						</button>
					</div>
				</div>

				<HeaderNav />
			</Container>
		</HeaderShell>
	);
}
