import { getTranslations } from "next-intl/server";
import {
	PlaygroundSection,
	ShowcaseCard,
} from "@/components/dev/playground-block";
import {
	Swatch,
	showcaseGridClass,
} from "@/components/dev/ui-playground/shared";
import { Heading } from "@/components/ui/heading";

export async function TypographySection() {
	const t = await getTranslations("Ui");

	return (
		<PlaygroundSection
			id="typography"
			title={t("sections.typography.title")}
			description={t("sections.typography.description")}
			lazy={false}
		>
			<div className={showcaseGridClass}>
				<ShowcaseCard title={t("typography.display")}>
					<p className="text-display font-bold">
						{t("typography.displaySample")}
					</p>
				</ShowcaseCard>
				<ShowcaseCard title={t("typography.h1")}>
					<p className="text-h1 font-bold">{t("typography.h1Sample")}</p>
				</ShowcaseCard>
				<ShowcaseCard title={t("typography.h2")}>
					<p className="text-h2 font-semibold">{t("typography.h2Sample")}</p>
				</ShowcaseCard>
				<ShowcaseCard title={t("typography.body")}>
					<p className="text-body text-muted">{t("typography.bodySample")}</p>
				</ShowcaseCard>
			</div>
		</PlaygroundSection>
	);
}

export async function HeadingsSection() {
	const t = await getTranslations("Ui");

	return (
		<PlaygroundSection
			id="headings"
			title={t("sections.headings.title")}
			description={t("sections.headings.description")}
			lazy={false}
		>
			<div className={showcaseGridClass}>
				<ShowcaseCard title={t("headings.displaySize")}>
					<Heading level={1} size="display">
						{t("headings.sample")}
					</Heading>
				</ShowcaseCard>
				<ShowcaseCard title={t("headings.level2")}>
					<Heading level={2}>{t("headings.sample")}</Heading>
				</ShowcaseCard>
				<ShowcaseCard title={t("headings.level3")}>
					<Heading level={3}>{t("headings.sample")}</Heading>
				</ShowcaseCard>
				<ShowcaseCard title={t("headings.level4")}>
					<Heading level={4}>{t("headings.sample")}</Heading>
				</ShowcaseCard>
			</div>
		</PlaygroundSection>
	);
}

export async function ColorsSection() {
	const t = await getTranslations("Ui");

	return (
		<PlaygroundSection
			id="colors"
			title={t("sections.colors.title")}
			description={t("sections.colors.description")}
			lazy={false}
		>
			<div className="grid grid-cols-2 gap-6 md:grid-cols-3 xl:grid-cols-4">
				<Swatch name={t("colors.background")} className="bg-background" />
				<Swatch name={t("colors.surface")} className="bg-surface" />
				<Swatch name={t("colors.sunken")} className="bg-sunken" />
				<Swatch name={t("colors.foreground")} className="bg-foreground" />
				<Swatch name={t("colors.muted")} className="bg-muted" />
				<Swatch name={t("colors.border")} className="bg-border" />
				<Swatch name={t("colors.primary")} className="bg-primary" />
			</div>
		</PlaygroundSection>
	);
}
