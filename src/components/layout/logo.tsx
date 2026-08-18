import Image from "next/image";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { getSiteLogoUrl } from "@/lib/api/site-settings";
import { cn } from "@/lib/utils";

/**
 * Brand mark — links to the locale home. Server Component.
 *
 * Bilingual lockup: the CMS logo (falling back to the bundled `/logo.png`),
 * then the institute name in Sorani with the
 * Kurmanji name stacked directly under it. BOTH lines show in BOTH locales —
 * it is one bilingual wordmark, not a translated string, so it must not switch
 * with the active language.
 *
 * Geometry is physical, not logical, and therefore explicit: the mark always
 * sits at the far LEFT with the name block to its right, in ckb (RTL) as well
 * as ku (LTR). `dir-row-unmirrored` un-mirrors the row, and the name block runs
 * `dir="ltr"` so `items-start` pins both lines flush left; each line then
 * carries its own lang/dir so the Arabic-script line still shapes correctly.
 */
export async function Logo({ className }: { className?: string } = {}) {
	const t = await getTranslations("Nav");
	// Editors choose the mark in the CMS; the bundled file is the fallback, so
	// the header never renders without a logo.
	const logoUrl = await getSiteLogoUrl();

	return (
		<Link
			href="/"
			aria-label={t("brandAlt")}
			className={cn(
				"dir-row-unmirrored inline-flex min-w-0 shrink-0 items-center gap-2.5 text-foreground sm:gap-3",
				className,
			)}
		>
			<Image
				src={logoUrl ?? "/logo.png"}
				alt=""
				width={64}
				height={64}
				className="size-13 shrink-0 object-contain sm:size-16"
				priority
			/>

			{/* items-stretch + text-align-last:justify — the wider line sets the
			    block width and the other spreads to match, so both titles start
			    and end on the same two edges. */}
			<span
				dir="ltr"
				className="hidden min-w-0 flex-col items-stretch justify-center gap-2 leading-[1.2] sm:flex"
			>
				<span
					lang="ckb"
					dir="rtl"
					// Pinned to Vazirmatn rather than font-heading: on ku that token
					// resolves to Clash Display, which has no Arabic glyphs.
					className="whitespace-nowrap font-[family-name:var(--font-vazirmatn)] text-small font-bold [text-align-last:justify] lg:text-body"
				>
					{t("brandNameCkb")}
				</span>
				<span
					lang="ku"
					dir="ltr"
					className="whitespace-nowrap font-heading text-small font-bold [text-align-last:justify] lg:text-body"
				>
					{t("brandNameKu")}
				</span>
			</span>
		</Link>
	);
}
