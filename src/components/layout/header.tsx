import { getTranslations } from "next-intl/server";
import { Logo } from "@/components/layout/logo";
import { NavDrawer } from "@/components/layout/nav-drawer";
import { Container } from "@/components/ui/container";
import { DONATE_HREF, SERVICES_HREF } from "@/config/site";
import { Link } from "@/i18n/navigation";

/**
 * Site header. Server Component shell — only <NavDrawer/> is interactive.
 *
 * Borderless, content-forward bar: a bold wordmark on the leading side and a
 * trailing cluster (Services → Donate → hamburger) on the inline-END. Hierarchy
 * comes from FILL, not boxes: Donate is solid ink (primary CTA), Services is a
 * light fill (secondary) — both the SAME size. Logical properties only, so the
 * bar mirrors automatically from the document dir.
 *
 * No inline desktop nav — the full primary nav lives in the drawer at every
 * breakpoint (deliberate minimal navigation).
 */

// Shared button shape so Services and Donate are guaranteed equal height/size;
// only the fill differs.
const ctaBase =
	"inline-flex h-11 items-center px-5 text-body font-bold transition";

export async function Header() {
	const t = await getTranslations("Nav");

	return (
		<header className="sticky top-0 z-40 bg-background">
			<Container className="flex h-16 max-w-none items-center justify-between gap-4 px-8 sm:h-20 sm:px-10">
				<Logo />

				<div className="flex items-center gap-3">
					<div className="flex items-center">
					{/* Services — secondary CTA: LIGHT fill (sunken), equal size to Donate.
					    Hidden on the smallest screens to keep the mobile bar to CTA + menu.
					    TODO(services): placeholder label + route. */}
					<Link
						href={SERVICES_HREF}
						className={`${ctaBase} hidden bg-sunken text-foreground hover:bg-border sm:inline-flex`}
					>
						{t("services")}
					</Link>

					{/* Donate — primary CTA: solid ink fill. GiftIcon = giving, deliberately
					    NOT a heart. TODO(donate): wire to the donation flow when it exists. */}
					<Link
						href={DONATE_HREF}
						className={`${ctaBase} bg-primary text-primary-foreground hover:opacity-90`}
					>
						{t("donate")}
					</Link>
					</div>

					<NavDrawer />
				</div>
			</Container>
		</header>
	);
}
