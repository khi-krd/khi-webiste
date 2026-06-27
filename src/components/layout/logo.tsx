import Image from "next/image";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";

/**
 * Brand mark — links to the locale home. Server Component.
 *
 * Shows logo.png with the institute name in the active locale (Sorani on ckb,
 * Kurmanji on ku).
 */
export async function Logo() {
	const t = await getTranslations("Nav");

	return (
		<Link
			href="/"
			aria-label={t("brandAlt")}
			className="inline-flex min-w-0 items-center gap-2.5 text-foreground sm:gap-3"
		>
			<Image
				src="/logo.png"
				alt=""
				width={40}
				height={40}
				className="size-9 shrink-0 sm:size-10"
				priority
			/>
			<span className="hidden truncate font-heading text-small font-bold leading-tight sm:inline sm:text-body">
				{t("brandAlt")}
			</span>
		</Link>
	);
}
