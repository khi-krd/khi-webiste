import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";

/**
 * Brand wordmark — links to the locale home. Server Component.
 *
 * TODO(logo): PLACEHOLDER inline-SVG wordmark ("KHI"). Swap for the real
 * institute mark when the asset is ready; keep the accessible label (Nav.brandAlt)
 * and the link-to-home behaviour. The mark is `currentColor` so it inherits the
 * foreground ink token — no hardcoded color. Square by design (no rounding).
 */
export async function Logo() {
	const t = await getTranslations("Nav");

	return (
		<Link
			href="/"
			aria-label={t("brandAlt")}
			className="inline-flex items-center text-foreground"
		>
			{/* Decorative: the link's aria-label carries the accessible name. */}
			{/* viewBox is tightened to the glyph box so the wordmark sits flush to the
			    leading edge in BOTH directions; overflow-visible guards subpixel bleed. */}
			<svg
				viewBox="0 0 44 24"
				className="h-7 w-auto overflow-visible sm:h-8"
				fill="black"
				aria-hidden="true"
				focusable="false"
			>
				<image href="/next.svg" width="44" height="24" />
			</svg>
		</Link>
	);
}
