import Image from "next/image";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { cn } from "@/lib/utils";

/**
 * Brand mark — links to the locale home. Server Component.
 *
 * Shows logo.png with the institute name in the active locale (Sorani on ckb,
 * Kurmanji on ku).
 */
export async function Logo({ className }: { className?: string } = {}) {
	const t = await getTranslations("Nav");

	return (
		<Link
			href="/"
			aria-label={t("brandAlt")}
			className={cn(
				"inline-flex min-w-0 items-center gap-2.5 text-foreground sm:gap-3",
				className,
			)}
		>
			<Image
				src="/logo.png"
				alt=""
				width={56}
				height={56}
				className="size-11 shrink-0 sm:size-14"
				priority
			/>
			<span className="hidden truncate font-heading text-body font-bold leading-tight sm:inline sm:text-title">
				{t("brandAlt")}
			</span>
		</Link>
	);
}
