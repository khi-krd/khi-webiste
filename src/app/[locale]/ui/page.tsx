import { ArrowRightIcon, PlusIcon } from "@heroicons/react/24/outline";
import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import type { ReactNode } from "react";
import { FormShowcase } from "@/components/dev/form-showcase";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { Input } from "@/components/ui/input";
import { Link } from "@/components/ui/link";
import { Section } from "@/components/ui/section";
import { Textarea } from "@/components/ui/textarea";
import { type Locale, routing } from "@/i18n/routing";

const sectionClass = "py-8 sm:py-10";

export async function generateMetadata({
	params,
}: {
	params: Promise<{ locale: string }>;
}): Promise<Metadata> {
	const { locale } = await params;
	const t = await getTranslations({ locale, namespace: "Ui" });

	return {
		title: t("title"),
		robots: { index: false, follow: false },
	};
}

export default async function UiPlaygroundPage({
	params,
}: {
	params: Promise<{ locale: string }>;
}) {
	const { locale } = await params;
	setRequestLocale(locale);

	const t = await getTranslations("Ui");

	return (
		<main className="min-h-dvh pb-16">
			<Container as="div" className="pt-10">
				<header className="mb-6 flex flex-col gap-3 text-start">
					<p className="label">{t("eyebrow")}</p>
					<h1 className="text-h1 font-bold">{t("title")}</h1>
					<p className="max-w-2xl text-body text-muted">{t("description")}</p>
					<p className="text-small text-muted">{t("direction")}</p>
					<nav
						className="flex flex-wrap items-center gap-4"
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
								{t(`locales.${loc as Locale}`)}
							</Link>
						))}
					</nav>
					<Link href="/" variant="text" withArrow>
						{t("backHome")}
					</Link>
				</header>

				<div className="grid gap-x-12 lg:grid-cols-2 lg:gap-x-16">
					<Section
						title={t("sections.typography.title")}
						description={t("sections.typography.description")}
						className={sectionClass}
					>
						<div className="grid gap-x-8 gap-y-4 sm:grid-cols-2">
							<Sample label={t("typography.display")}>
								<p className="text-display font-bold">
									{t("typography.displaySample")}
								</p>
							</Sample>
							<Sample label={t("typography.h1")}>
								<p className="text-h1 font-bold">{t("typography.h1Sample")}</p>
							</Sample>
							<Sample label={t("typography.h2")}>
								<p className="text-h2 font-semibold">
									{t("typography.h2Sample")}
								</p>
							</Sample>
							<Sample label={t("typography.h3")}>
								<p className="text-h3 font-semibold">
									{t("typography.h3Sample")}
								</p>
							</Sample>
							<Sample label={t("typography.body")} className="sm:col-span-2">
								<p className="text-body">{t("typography.bodySample")}</p>
							</Sample>
							<Sample label={t("typography.small")}>
								<p className="text-small text-muted">
									{t("typography.smallSample")}
								</p>
							</Sample>
							<Sample label={t("typography.label")}>
								<p className="label">{t("typography.labelSample")}</p>
							</Sample>
						</div>
					</Section>

					<Section
						title={t("sections.button.title")}
						description={t("sections.button.description")}
						className={sectionClass}
					>
						<div className="grid gap-8 sm:grid-cols-2">
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
								<Button variant="primary" leadingIcon={<PlusIcon />}>
									{t("buttons.leadingIcon")}
								</Button>
								<Button variant="primary" trailingIcon={<ArrowRightIcon />}>
									{t("buttons.trailingIcon")}
								</Button>
								<Button variant="primary" disabled>
									{t("buttons.disabled")}
								</Button>
							</VariantGrid>

							<VariantGrid title={t("buttons.secondary")}>
								<Button variant="secondary" size="sm">
									{t("buttons.small")}
								</Button>
								<Button variant="secondary" size="md">
									{t("buttons.medium")}
								</Button>
								<Button variant="secondary" size="lg">
									{t("buttons.large")}
								</Button>
							</VariantGrid>

							<VariantGrid title={t("buttons.ghost")} className="sm:col-span-2">
								<Button variant="ghost" size="sm">
									{t("buttons.small")}
								</Button>
								<Button variant="ghost" size="md">
									{t("buttons.medium")}
								</Button>
								<Button variant="ghost" size="lg">
									{t("buttons.large")}
								</Button>
							</VariantGrid>
						</div>
					</Section>

					<Section
						title={t("sections.drawnBorder.title")}
						description={t("sections.drawnBorder.description")}
						className={`${sectionClass} lg:col-span-2`}
					>
						<p className="mb-4 text-small text-muted">
							{t("drawn.hint")} · {t("drawn.squareHint")}
						</p>
						<div className="flex flex-wrap items-center gap-4">
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
						<p className="mt-4 text-small text-muted">
							{t("drawn.reducedMotion")}
						</p>
					</Section>

					<Section
						title={t("sections.colors.title")}
						description={t("sections.colors.description")}
						className={sectionClass}
					>
						<div className="grid gap-6 sm:grid-cols-2">
							<Swatch name={t("colors.background")} className="bg-background" />
							<Swatch name={t("colors.surface")} className="bg-surface" />
							<Swatch name={t("colors.sunken")} className="bg-sunken" />
							<Swatch name={t("colors.foreground")} className="bg-foreground" />
							<Swatch name={t("colors.muted")} className="bg-muted" />
							<Swatch name={t("colors.border")} className="bg-border" />
							<Swatch name={t("colors.primary")} className="bg-primary" />
						</div>
					</Section>

					<Section
						title={t("sections.input.title")}
						description={t("sections.input.description")}
						className={sectionClass}
					>
						<div className="grid gap-6 sm:grid-cols-2">
							<Sample label={t("inputs.default")}>
								<Input placeholder={t("inputs.defaultPlaceholder")} />
							</Sample>
							<Sample label={t("inputs.withValue")}>
								<Input defaultValue={t("inputs.withValueSample")} />
							</Sample>
							<Sample label={t("inputs.disabled")}>
								<Input placeholder={t("inputs.disabledPlaceholder")} disabled />
							</Sample>
							<Sample label={t("inputs.invalid")}>
								<Input
									defaultValue={t("inputs.invalidSample")}
									aria-invalid
									aria-describedby="input-error"
								/>
							</Sample>
							<Sample label={t("inputs.textarea")}>
								<Textarea
									placeholder={t("inputs.textareaPlaceholder")}
									rows={3}
								/>
							</Sample>
							<Sample label={t("inputs.textareaDisabled")}>
								<Textarea
									placeholder={t("inputs.textareaDisabledPlaceholder")}
									disabled
									rows={3}
								/>
							</Sample>
						</div>
					</Section>

					<Section
						title={t("sections.link.title")}
						description={t("sections.link.description")}
						className={sectionClass}
					>
						<div className="grid gap-4 sm:grid-cols-2">
							<Sample label={t("links.text")}>
								<Link href="/">{t("links.textSample")}</Link>
							</Sample>
							<Sample label={t("links.withArrow")}>
								<Link href="/" withArrow>
									{t("links.withArrowSample")}
								</Link>
							</Sample>
							<Sample label={t("links.nav")}>
								<Link href="/" variant="nav">
									{t("links.navSample")}
								</Link>
							</Sample>
							<Sample label={t("links.navActive")}>
								<Link href="/" variant="nav" active>
									{t("links.navActiveSample")}
								</Link>
							</Sample>
						</div>
					</Section>

					<Section
						title={t("sections.field.title")}
						description={t("sections.field.description")}
						className={sectionClass}
					>
						<FormShowcase />
					</Section>

					<Section
						title={t("sections.container.title")}
						description={t("sections.container.description")}
						className={`${sectionClass} lg:col-span-2`}
					>
						<div className="grid gap-8 lg:grid-cols-2">
							<Sample label={t("container.default")}>
								<p className="text-small text-muted">
									{t("container.defaultDescription")}
								</p>
							</Sample>
							<Sample label={t("container.prose")}>
								<div className="max-w-2xl">
									<p className="text-small text-muted">
										{t("container.proseDescription")}
									</p>
								</div>
							</Sample>
						</div>
					</Section>
				</div>
			</Container>
		</main>
	);
}

function Sample({
	label,
	children,
	className,
}: {
	label: string;
	children: ReactNode;
	className?: string;
}) {
	return (
		<div className={className}>
			<p className="mb-2 text-small text-muted">{label}</p>
			{children}
		</div>
	);
}

function Swatch({ name, className }: { name: string; className: string }) {
	return (
		<div className="flex flex-col gap-2 text-start">
			<span
				className={`size-14 shrink-0 rounded-none ${className}`}
				aria-hidden
			/>
			<span className="text-small">{name}</span>
		</div>
	);
}

function VariantGrid({
	title,
	children,
	className,
}: {
	title: string;
	children: ReactNode;
	className?: string;
}) {
	return (
		<div className={className}>
			<h3 className="mb-3 text-small font-medium text-muted">{title}</h3>
			<div className="flex flex-wrap items-center gap-3">{children}</div>
		</div>
	);
}
