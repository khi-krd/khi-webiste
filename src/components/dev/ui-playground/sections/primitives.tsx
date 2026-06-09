import {
	ArrowRightIcon,
	ChevronRightIcon,
	PlusIcon,
} from "@heroicons/react/24/outline";
import { getTranslations } from "next-intl/server";
import {
	PlaygroundSection,
	ShowcaseCard,
} from "@/components/dev/playground-block";
import {
	showcaseGridClass,
	VariantGrid,
} from "@/components/dev/ui-playground/shared";
import { Button } from "@/components/ui/button";
import { DirectionalIcon } from "@/components/ui/directional-icon";
import { Link } from "@/components/ui/link";

export async function ButtonSection() {
	const t = await getTranslations("Ui");

	return (
		<PlaygroundSection
			id="button"
			title={t("sections.button.title")}
			description={t("sections.button.description")}
			lazy={false}
		>
			<div className={showcaseGridClass}>
				<VariantGrid title={t("buttons.primary")}>
					<Button variant="primary" size="sm">
						{t("buttons.small")}
					</Button>
					<Button variant="primary" size="md">
						{t("buttons.medium")}
					</Button>
					<Button variant="primary" size="lg">
						{t("buttons.large")}
					</Button>
					<Button
						variant="primary"
						trailingIcon={<DirectionalIcon icon={ArrowRightIcon} />}
					>
						{t("buttons.trailingIcon")}
					</Button>
				</VariantGrid>
				<VariantGrid title={t("buttons.secondary")}>
					<Button variant="secondary" size="md">
						{t("buttons.medium")}
					</Button>
					<Button variant="secondary" size="lg">
						{t("buttons.large")}
					</Button>
					<Button variant="ghost" size="lg">
						{t("buttons.ghost")}
					</Button>
					<Button variant="primary" disabled>
						{t("buttons.disabled")}
					</Button>
				</VariantGrid>
			</div>
		</PlaygroundSection>
	);
}

export async function DrawnBorderSection() {
	const t = await getTranslations("Ui");

	return (
		<PlaygroundSection
			id="drawnBorder"
			title={t("sections.drawnBorder.title")}
			description={t("sections.drawnBorder.description")}
			lazy={false}
		>
			<ShowcaseCard title={t("drawn.hint")}>
				<div className="flex flex-wrap gap-3">
					<Button variant="primary" size="lg">
						{t("buttons.primary")}
					</Button>
					<Button variant="secondary" size="lg">
						{t("buttons.secondary")}
					</Button>
					<Button variant="ghost" size="lg">
						{t("buttons.ghost")}
					</Button>
				</div>
				<p className="mt-4 text-small text-muted">{t("drawn.reducedMotion")}</p>
			</ShowcaseCard>
		</PlaygroundSection>
	);
}

export async function LinkSection() {
	const t = await getTranslations("Ui");

	return (
		<PlaygroundSection
			id="link"
			title={t("sections.link.title")}
			description={t("sections.link.description")}
			lazy={false}
		>
			<div className={showcaseGridClass}>
				<ShowcaseCard title={t("links.text")}>
					<Link href="/">{t("links.textSample")}</Link>
				</ShowcaseCard>
				<ShowcaseCard title={t("links.withArrow")}>
					<Link href="/" withArrow>
						{t("links.withArrowSample")}
					</Link>
				</ShowcaseCard>
				<ShowcaseCard title={t("links.nav")}>
					<Link href="/" variant="nav">
						{t("links.navSample")}
					</Link>
				</ShowcaseCard>
				<ShowcaseCard title={t("links.navActive")}>
					<Link href="/" variant="nav" active>
						{t("links.navActiveSample")}
					</Link>
				</ShowcaseCard>
			</div>
		</PlaygroundSection>
	);
}

export async function DirectionalIconSection() {
	const t = await getTranslations("Ui");

	return (
		<PlaygroundSection
			id="directionalIcon"
			title={t("sections.directionalIcon.title")}
			description={t("sections.directionalIcon.description")}
			lazy={false}
		>
			<div className={showcaseGridClass}>
				<ShowcaseCard title={t("directionalIcon.directional")}>
					<div className="flex items-center gap-4">
						<DirectionalIcon icon={ArrowRightIcon} className="size-6" />
						<DirectionalIcon icon={ChevronRightIcon} className="size-6" />
						<span className="text-small text-muted">
							{t("directionalIcon.directionalHint")}
						</span>
					</div>
				</ShowcaseCard>
				<ShowcaseCard title={t("directionalIcon.nonDirectional")}>
					<div className="flex items-center gap-4">
						<PlusIcon className="size-6" aria-hidden />
						<span className="text-small text-muted">
							{t("directionalIcon.nonDirectionalHint")}
						</span>
					</div>
				</ShowcaseCard>
			</div>
		</PlaygroundSection>
	);
}
