import { getTranslations } from "next-intl/server";
import { UI_PLAYGROUND_INTRODUCTION_ID } from "@/components/dev/ui-playground-groups";
import { Link } from "@/components/ui/link";
import { type Locale, routing } from "@/i18n/routing";

type UiPlaygroundIntroductionProps = {
	locale: Locale;
};

export async function UiPlaygroundIntroduction({
	locale,
}: UiPlaygroundIntroductionProps) {
	const t = await getTranslations("Ui");

	return (
		<section
			id={UI_PLAYGROUND_INTRODUCTION_ID}
			className="scroll-mt-28 flex flex-col gap-4 pb-10 text-start sm:pb-12"
		>
			<p className="label">{t("eyebrow")}</p>
			<h1 className="text-h1 font-bold tracking-tight">{t("title")}</h1>
			<p className="max-w-3xl text-body text-muted">{t("description")}</p>
			<p className="text-small text-muted">{t("direction")}</p>
			<nav
				className="flex flex-wrap items-center gap-3"
				aria-label={t("title")}
			>
				{routing.locales.map((loc) => (
					<Link
						key={loc}
						href="/ui"
						locale={loc}
						variant="nav"
						active={locale === loc}
					>
						{t(`locales.${loc}`)}
					</Link>
				))}
			</nav>
			<Link href="/" variant="text" withArrow>
				{t("backHome")}
			</Link>
		</section>
	);
}
