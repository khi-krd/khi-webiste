import Image from "next/image";
import { getLocale, getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { getSiteLogoUrl } from "@/lib/api/site-settings";
import { cn } from "@/lib/utils";

/**
 * Brand mark — links to the locale home. Server Component.
 *
 * Renders the CMS logo (falling back to the bundled `/logo.png`) plus ONE
 * name line chosen by the active locale: the Sorani Arabic-script name on
 * "ckb", the Latin Kurmanji name on "ku". The former bilingual stacked
 * lockup (both names shown in both locales) is suspended — both message
 * keys `Nav.brandNameCkb` / `Nav.brandNameKu` remain in messages/*.json.
 *
 * Geometry is physical, not logical, and therefore explicit: the mark always
 * sits at the far LEFT with the name to its right, in ckb (RTL) as well as
 * ku (LTR). `dir-row-unmirrored` un-mirrors the row, and the name line
 * carries its own lang/dir so each script shapes correctly.
 */
export async function Logo({
	className,
	reverse = false,
}: {
	className?: string;
	reverse?: boolean;
} = {}) {
	const t = await getTranslations("Nav");
	const locale = await getLocale();
	// routing.locales is exactly ["ckb", "ku"] (src/i18n/routing.ts), so a
	// boolean is safe; anything unexpected falls through to the Latin line.
	const isSorani = locale === "ckb";
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
			{/* `order` swaps which element sits physically first without touching
			    dir-row-unmirrored's direction math — used by the footer's lockup,
			    which reads text-then-mark rather than the header's mark-then-text. */}
			<Image
				src={logoUrl ?? "/logo.png"}
				alt=""
				width={64}
				height={64}
				className={cn(
					"size-13 shrink-0 object-contain sm:size-16",
					reverse && "order-2",
				)}
				priority
			/>

			{/* One name line, switched by locale. Each script keeps its own lang/dir. */}
			<span
				lang={isSorani ? "ckb" : "ku"}
				dir={isSorani ? "rtl" : "ltr"}
				className={cn(
					"hidden min-w-0 whitespace-nowrap text-small font-bold leading-[1.2] sm:block lg:text-body",
					// ckb is pinned to Vazirmatn rather than font-heading: on ku that
					// token resolves to Clash Display, which has no Arabic glyphs.
					isSorani
						? "font-[family-name:var(--font-vazirmatn)]"
						: "font-heading",
					reverse && "order-1",
				)}
			>
				{isSorani ? t("brandNameCkb") : t("brandNameKu")}
			</span>
		</Link>
	);
}
