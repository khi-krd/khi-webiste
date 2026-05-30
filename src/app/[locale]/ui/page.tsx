import {
	ArrowRightIcon,
	ChevronRightIcon,
	PlusIcon,
} from "@heroicons/react/24/outline";
import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import type { ReactNode } from "react";
import { FormShowcase } from "@/components/dev/form-showcase";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { DirectionalIcon } from "@/components/ui/directional-icon";
import { Heading } from "@/components/ui/heading";
import { Image } from "@/components/ui/image";
import { Input } from "@/components/ui/input";
import { Link } from "@/components/ui/link";
import { Prose } from "@/components/ui/prose";
import { Section } from "@/components/ui/section";
import { Textarea } from "@/components/ui/textarea";
import { type Locale, routing } from "@/i18n/routing";

const sectionClass = "scroll-mt-24 py-8 sm:py-10";

// Showcase organization: each group lists the section ids it contains. Drives
// both the sticky table-of-contents and the section ordering below.
const GROUPS = [
	{ key: "foundations", sections: ["typography", "headings", "colors"] },
	{
		key: "primitives",
		sections: ["button", "drawnBorder", "link", "directionalIcon"],
	},
	{ key: "forms", sections: ["input", "field"] },
	{ key: "content", sections: ["prose", "image", "container"] },
] as const;

const LANDSCAPE = "/sample/archive-landscape.png";
const PORTRAIT = "/sample/archive-portrait.png";

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

				<div className="mt-8 grid gap-x-12 lg:grid-cols-[12rem_minmax(0,1fr)] lg:gap-x-16">
					{/* Sticky table of contents (logical: sits inline-start, mirrors in RTL) */}
					<nav aria-label={t("toc")} className="hidden lg:block">
						<div className="sticky top-8 flex flex-col gap-5 text-start">
							<p className="label">{t("toc")}</p>
							{GROUPS.map((group) => (
								<div key={group.key} className="flex flex-col gap-1.5">
									<p className="text-small font-medium text-foreground">
										{t(`groups.${group.key}`)}
									</p>
									<ul className="flex flex-col gap-1">
										{group.sections.map((id) => (
											<li key={id}>
												<a
													href={`#${id}`}
													className="text-small text-muted transition-colors hover:text-foreground"
												>
													{t(`sections.${id}.title`)}
												</a>
											</li>
										))}
									</ul>
								</div>
							))}
						</div>
					</nav>

					<div className="min-w-0">
						{/* ===== FOUNDATIONS ===== */}
						<GroupHeading>{t("groups.foundations")}</GroupHeading>

						<Section
							id="typography"
							titleAs="h3"
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
									<p className="text-h1 font-bold">
										{t("typography.h1Sample")}
									</p>
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
							id="headings"
							titleAs="h3"
							title={t("sections.headings.title")}
							description={t("sections.headings.description")}
							className={sectionClass}
						>
							<div className="flex flex-col gap-5">
								<Sample label={t("headings.displaySize")}>
									<Heading level={1} size="display">
										{t("headings.sample")}
									</Heading>
								</Sample>
								<Sample label={t("headings.level1")}>
									<Heading level={1}>{t("headings.sample")}</Heading>
								</Sample>
								<Sample label={t("headings.level2")}>
									<Heading level={2}>{t("headings.sample")}</Heading>
								</Sample>
								<Sample label={t("headings.level3")}>
									<Heading level={3}>{t("headings.sample")}</Heading>
								</Sample>
								<Sample label={t("headings.level4")}>
									<Heading level={4}>{t("headings.sample")}</Heading>
								</Sample>
								<Sample label={t("headings.decoupled")}>
									<Heading level={2} size="display">
										{t("headings.sample")}
									</Heading>
								</Sample>
							</div>
						</Section>

						<Section
							id="colors"
							titleAs="h3"
							title={t("sections.colors.title")}
							description={t("sections.colors.description")}
							className={sectionClass}
						>
							<div className="grid grid-cols-2 gap-6 sm:grid-cols-3">
								<Swatch
									name={t("colors.background")}
									className="bg-background"
								/>
								<Swatch name={t("colors.surface")} className="bg-surface" />
								<Swatch name={t("colors.sunken")} className="bg-sunken" />
								<Swatch
									name={t("colors.foreground")}
									className="bg-foreground"
								/>
								<Swatch name={t("colors.muted")} className="bg-muted" />
								<Swatch name={t("colors.border")} className="bg-border" />
								<Swatch name={t("colors.primary")} className="bg-primary" />
							</div>
						</Section>

						{/* ===== PRIMITIVES ===== */}
						<GroupHeading>{t("groups.primitives")}</GroupHeading>

						<Section
							id="button"
							titleAs="h3"
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
									<Button
										variant="primary"
										trailingIcon={<DirectionalIcon icon={ArrowRightIcon} />}
									>
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

								<VariantGrid
									title={t("buttons.ghost")}
									className="sm:col-span-2"
								>
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
							id="drawnBorder"
							titleAs="h3"
							title={t("sections.drawnBorder.title")}
							description={t("sections.drawnBorder.description")}
							className={sectionClass}
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
							id="link"
							titleAs="h3"
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
							id="directionalIcon"
							titleAs="h3"
							title={t("sections.directionalIcon.title")}
							description={t("sections.directionalIcon.description")}
							className={sectionClass}
						>
							<p className="mb-4 text-small text-muted">
								{t("directionalIcon.note")}
							</p>
							<div className="flex flex-wrap gap-10">
								<Sample label={t("directionalIcon.directional")}>
									<div className="flex items-center gap-3">
										<DirectionalIcon
											icon={ArrowRightIcon}
											className="size-7 text-foreground"
										/>
										<DirectionalIcon
											icon={ChevronRightIcon}
											className="size-7 text-foreground"
										/>
										<span className="text-small text-muted">
											{t("directionalIcon.directionalHint")}
										</span>
									</div>
								</Sample>
								<Sample label={t("directionalIcon.nonDirectional")}>
									<div className="flex items-center gap-3">
										<PlusIcon className="size-7 text-foreground" aria-hidden />
										<span className="text-small text-muted">
											{t("directionalIcon.nonDirectionalHint")}
										</span>
									</div>
								</Sample>
							</div>
						</Section>

						{/* ===== FORMS ===== */}
						<GroupHeading>{t("groups.forms")}</GroupHeading>

						<Section
							id="input"
							titleAs="h3"
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
									<Input
										placeholder={t("inputs.disabledPlaceholder")}
										disabled
									/>
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
							id="field"
							titleAs="h3"
							title={t("sections.field.title")}
							description={t("sections.field.description")}
							className={sectionClass}
						>
							<FormShowcase />
						</Section>

						{/* ===== CONTENT & MEDIA ===== */}
						<GroupHeading>{t("groups.content")}</GroupHeading>

						<Section
							id="prose"
							titleAs="h3"
							title={t("sections.prose.title")}
							description={t("sections.prose.description")}
							className={sectionClass}
						>
							<Prose>
								<p>{t("prose.intro")}</p>
								<h2>{t("prose.h2")}</h2>
								<p>{t("prose.body")}</p>
								<p>
									{t.rich("prose.emphasis", {
										b: (c) => <strong>{c}</strong>,
										i: (c) => <em>{c}</em>,
									})}
								</p>
								<p>{t("prose.listIntro")}</p>
								<ul>
									<li>{t("prose.li1")}</li>
									<li>{t("prose.li2")}</li>
									<li>{t("prose.li3")}</li>
								</ul>
								<blockquote>{t("prose.quote")}</blockquote>
								<h3>{t("prose.h3")}</h3>
								<ol>
									<li>{t("prose.li1")}</li>
									<li>{t("prose.li2")}</li>
									<li>{t("prose.li3")}</li>
								</ol>
								<p>
									{t("prose.linkBody")}
									<a href="#prose">{t("prose.linkText")}</a> —{" "}
									<code>{t("prose.code")}</code>
								</p>
								<hr />
								<p>{t("prose.outro")}</p>
							</Prose>
						</Section>

						<Section
							id="image"
							titleAs="h3"
							title={t("sections.image.title")}
							description={t("sections.image.description")}
							className={sectionClass}
						>
							<div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
								<figure className="flex flex-col gap-2">
									<Image
										src={LANDSCAPE}
										alt={t("image.caption")}
										aspectRatio="16/9"
										framed
										sizes="(max-width: 768px) 100vw, 33vw"
									/>
									<figcaption className="text-small text-muted">
										{t("image.landscape")} · {t("image.framed")}
									</figcaption>
								</figure>
								<figure className="flex flex-col gap-2">
									<Image
										src={LANDSCAPE}
										alt={t("image.caption")}
										aspectRatio="square"
										sizes="(max-width: 768px) 100vw, 33vw"
									/>
									<figcaption className="text-small text-muted">
										{t("image.square")} · {t("image.unframed")}
									</figcaption>
								</figure>
								<figure className="flex flex-col gap-2">
									<Image
										src={PORTRAIT}
										alt={t("image.caption")}
										aspectRatio="3/4"
										framed
										sizes="(max-width: 768px) 100vw, 33vw"
									/>
									<figcaption className="text-small text-muted">
										{t("image.portrait")} · {t("image.framed")}
									</figcaption>
								</figure>
								<figure className="flex flex-col gap-2">
									<Image
										src={PORTRAIT}
										alt={t("image.caption")}
										aspectRatio="4/3"
										objectFit="contain"
										framed
										sizes="(max-width: 768px) 100vw, 33vw"
									/>
									<figcaption className="text-small text-muted">
										{t("image.ratio43")} · {t("image.contain")}
									</figcaption>
								</figure>
							</div>
						</Section>

						<Section
							id="container"
							titleAs="h3"
							title={t("sections.container.title")}
							description={t("sections.container.description")}
							className={sectionClass}
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
				</div>
			</Container>
		</main>
	);
}

/** Quiet group divider — a hairline rule + eyebrow label organizing the page. */
function GroupHeading({ children }: { children: ReactNode }) {
	return (
		<h2 className="label mt-14 border-t border-border pt-6 first:mt-0 first:border-t-0 first:pt-0">
			{children}
		</h2>
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
				className={`size-14 shrink-0 border border-border ${className}`}
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
			<h4 className="mb-3 text-small font-medium text-muted">{title}</h4>
			<div className="flex flex-wrap items-center gap-3">{children}</div>
		</div>
	);
}
