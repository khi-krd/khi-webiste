import { getTranslations } from "next-intl/server";
import { Button } from "@/components/ui/button";

export async function UiPlaygroundHeroStrip() {
	const t = await getTranslations("Ui");

	return (
		<section className="grid gap-6 bg-surface px-6 py-7 sm:px-8 sm:py-9 xl:grid-cols-[1.2fr_0.8fr]">
			<div>
				<p className="label mb-3">{t("eyebrow")}</p>
				<h2 className="text-h2 font-bold tracking-tight">{t("title")}</h2>
				<p className="mt-4 max-w-2xl text-body text-muted">{t("description")}</p>
			</div>
			<div className="grid content-start gap-4">
				<p className="text-small text-muted">{t("direction")}</p>
				<div className="flex flex-wrap gap-3">
					<Button variant="primary" size="sm">
						{t("groups.foundations")}
					</Button>
					<Button variant="secondary" size="sm">
						{t("groups.primitives")}
					</Button>
				</div>
			</div>
		</section>
	);
}
