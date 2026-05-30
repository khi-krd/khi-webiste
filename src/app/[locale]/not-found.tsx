import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";

export default function NotFound() {
	const t = useTranslations("NotFound");

	return (
		<div className="mx-auto flex min-h-[60vh] max-w-2xl flex-col items-center justify-center gap-4 px-6 text-center">
			<h1 className="text-3xl font-semibold tracking-tight">{t("title")}</h1>
			<p className="text-muted">{t("description")}</p>
			<Link
				href="/"
				className="mt-2 rounded-full bg-foreground px-5 py-2.5 text-sm font-medium text-background transition-colors hover:opacity-90"
			>
				{t("backHome")}
			</Link>
		</div>
	);
}
