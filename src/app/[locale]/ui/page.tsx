import {
	ArrowRightIcon,
	ChevronRightIcon,
	MagnifyingGlassIcon,
	PlusIcon,
	TagIcon,
} from "@heroicons/react/24/outline";
import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import type { ReactNode } from "react";
import { FormShowcase } from "@/components/dev/form-showcase";
import {
	AboutHeroShowcase,
	AboutTeamPhotoShowcase,
	PartnerCardShowcase,
	SectionRuleHeadingShowcase,
} from "@/components/dev/about-showcases";
import {
	AboutFounderPreview,
	AboutMissionPreview,
	AboutPartnersPreview,
	AboutTeamShowcasePreview,
} from "@/components/dev/about-section-previews";
import {
	FeaturedCarouselShowcase,
	FeaturedSlideShowcase,
	NewsCardShowcase,
	ProjectCardShowcase,
	VideoCardShowcase,
	WritingRowShowcase,
} from "@/components/dev/homepage-showcases";
import {
	FeaturedHero,
	ImageCollectionSection,
	LatestUpdates,
	ProjectsSection,
	SoundSection,
	VideoSection,
	WritingsSection,
} from "@/components/dev/homepage-section-previews";
import {
	GroupHeading,
	PlaygroundBlock,
	ShowcaseCard,
} from "@/components/dev/playground-block";
import { UiPlaygroundIntroduction } from "@/components/dev/ui-playground-introduction";
import { UiPlaygroundMain } from "@/components/dev/ui-playground-main";
import { UiPlaygroundSidebar } from "@/components/dev/ui-playground-sidebar";
import { Badge } from "@/components/ui/badge";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";
import { DirectionalIcon } from "@/components/ui/directional-icon";
import { Divider } from "@/components/ui/divider";
import { EmptyState } from "@/components/ui/empty-state";
import { ErrorState } from "@/components/ui/error-state";
import { Heading } from "@/components/ui/heading";
import { Image } from "@/components/ui/image";
import { Input } from "@/components/ui/input";
import { Link } from "@/components/ui/link";
import { Pagination } from "@/components/ui/pagination";
import { Prose } from "@/components/ui/prose";
import { Section } from "@/components/ui/section";
import { Skeleton, SkeletonText } from "@/components/ui/skeleton";
import { Spinner } from "@/components/ui/spinner";
import { Textarea } from "@/components/ui/textarea";
import { VisuallyHidden } from "@/components/ui/visually-hidden";
import { type Locale } from "@/i18n/routing";

const sectionClass = "scroll-mt-28 py-10 sm:py-12";
const showcaseGridClass = "grid gap-6 lg:gap-7 xl:grid-cols-2";

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
		<UiPlaygroundSidebar locale={locale as Locale}>
			<UiPlaygroundMain>
				<div className="space-y-10 sm:space-y-12">
					<UiPlaygroundIntroduction locale={locale as Locale} />
					<HeroStrip t={t} />
				</div>

				<GroupHeading>{t("groups.foundations")}</GroupHeading>
				<Section
					id="typography"
					titleAs="h3"
					title={t("sections.typography.title")}
					description={t("sections.typography.description")}
					className={sectionClass}
				>
					<div className={showcaseGridClass}>
						<ShowcaseCard title={t("typography.display")}>
							<p className="text-display font-bold">{t("typography.displaySample")}</p>
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
				</Section>

				<Section
					id="headings"
					titleAs="h3"
					title={t("sections.headings.title")}
					description={t("sections.headings.description")}
					className={sectionClass}
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
				</Section>

				<Section
					id="colors"
					titleAs="h3"
					title={t("sections.colors.title")}
					description={t("sections.colors.description")}
					className={sectionClass}
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
				</Section>

				<GroupHeading>{t("groups.primitives")}</GroupHeading>
				<Section
					id="button"
					titleAs="h3"
					title={t("sections.button.title")}
					description={t("sections.button.description")}
					className={sectionClass}
				>
					<div className={showcaseGridClass}>
						<VariantGrid title={t("buttons.primary")}>
							<Button variant="primary" size="sm">{t("buttons.small")}</Button>
							<Button variant="primary" size="md">{t("buttons.medium")}</Button>
							<Button variant="primary" size="lg">{t("buttons.large")}</Button>
							<Button variant="primary" trailingIcon={<DirectionalIcon icon={ArrowRightIcon} />}>
								{t("buttons.trailingIcon")}
							</Button>
						</VariantGrid>
						<VariantGrid title={t("buttons.secondary")}>
							<Button variant="secondary" size="md">{t("buttons.medium")}</Button>
							<Button variant="secondary" size="lg">{t("buttons.large")}</Button>
							<Button variant="ghost" size="lg">{t("buttons.ghost")}</Button>
							<Button variant="primary" disabled>{t("buttons.disabled")}</Button>
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
					<ShowcaseCard title={t("drawn.hint")}>
						<div className="flex flex-wrap gap-3">
							<Button variant="primary" size="lg">{t("buttons.primary")}</Button>
							<Button variant="secondary" size="lg">{t("buttons.secondary")}</Button>
							<Button variant="ghost" size="lg">{t("buttons.ghost")}</Button>
						</div>
						<p className="mt-4 text-small text-muted">{t("drawn.reducedMotion")}</p>
					</ShowcaseCard>
				</Section>

				<Section
					id="link"
					titleAs="h3"
					title={t("sections.link.title")}
					description={t("sections.link.description")}
					className={sectionClass}
				>
					<div className={showcaseGridClass}>
						<ShowcaseCard title={t("links.text")}><Link href="/">{t("links.textSample")}</Link></ShowcaseCard>
						<ShowcaseCard title={t("links.withArrow")}><Link href="/" withArrow>{t("links.withArrowSample")}</Link></ShowcaseCard>
						<ShowcaseCard title={t("links.nav")}><Link href="/" variant="nav">{t("links.navSample")}</Link></ShowcaseCard>
						<ShowcaseCard title={t("links.navActive")}><Link href="/" variant="nav" active>{t("links.navActiveSample")}</Link></ShowcaseCard>
					</div>
				</Section>

				<Section
					id="directionalIcon"
					titleAs="h3"
					title={t("sections.directionalIcon.title")}
					description={t("sections.directionalIcon.description")}
					className={sectionClass}
				>
					<div className={showcaseGridClass}>
						<ShowcaseCard title={t("directionalIcon.directional")}>
							<div className="flex items-center gap-4">
								<DirectionalIcon icon={ArrowRightIcon} className="size-6" />
								<DirectionalIcon icon={ChevronRightIcon} className="size-6" />
								<span className="text-small text-muted">{t("directionalIcon.directionalHint")}</span>
							</div>
						</ShowcaseCard>
						<ShowcaseCard title={t("directionalIcon.nonDirectional")}>
							<div className="flex items-center gap-4">
								<PlusIcon className="size-6" aria-hidden />
								<span className="text-small text-muted">{t("directionalIcon.nonDirectionalHint")}</span>
							</div>
						</ShowcaseCard>
					</div>
				</Section>

				<GroupHeading>{t("groups.forms")}</GroupHeading>
				<Section
					id="input"
					titleAs="h3"
					title={t("sections.input.title")}
					description={t("sections.input.description")}
					className={sectionClass}
				>
					<div className={showcaseGridClass}>
						<ShowcaseCard title={t("inputs.default")}>
							<div className="grid gap-4">
								<Input placeholder={t("inputs.defaultPlaceholder")} />
								<Input defaultValue={t("inputs.withValueSample")} />
								<Textarea placeholder={t("inputs.textareaPlaceholder")} rows={3} />
							</div>
						</ShowcaseCard>
						<ShowcaseCard title={t("inputs.overlayHint")}>
							<div className="grid gap-4 bg-foreground p-5 [&_p]:text-primary-foreground/60">
								<Input variant="overlay" placeholder={t("inputs.overlayPlaceholder")} />
								<Input variant="overlay" fieldSize="lg" placeholder={t("inputs.overlayPlaceholder")} />
								<Input
									variant="overlay"
									fieldSize="lg"
									defaultValue={t("inputs.invalidSample")}
									aria-invalid
								/>
							</div>
						</ShowcaseCard>
					</div>
				</Section>

				<Section
					id="field"
					titleAs="h3"
					title={t("sections.field.title")}
					description={t("sections.field.description")}
					className={sectionClass}
				>
					<ShowcaseCard title={t("sections.field.title")}>
						<FormShowcase />
					</ShowcaseCard>
				</Section>

				<GroupHeading>{t("groups.content")}</GroupHeading>
				<Section
					id="prose"
					titleAs="h3"
					title={t("sections.prose.title")}
					description={t("sections.prose.description")}
					className={sectionClass}
				>
					<ShowcaseCard title={t("sections.prose.title")}>
						<Prose>
							<p>{t("prose.intro")}</p>
							<h2>{t("prose.h2")}</h2>
							<p>{t("prose.body")}</p>
							<blockquote>{t("prose.quote")}</blockquote>
							<p>
								{t("prose.linkBody")}
								<a href="#prose">{t("prose.linkText")}</a>
							</p>
						</Prose>
					</ShowcaseCard>
				</Section>

				<Section
					id="image"
					titleAs="h3"
					title={t("sections.image.title")}
					description={t("sections.image.description")}
					className={sectionClass}
				>
					<div className={showcaseGridClass}>
						<ShowcaseCard title={t("image.landscape")}>
							<Image
								src={LANDSCAPE}
								alt={t("image.caption")}
								aspectRatio="16/9"
								framed
								sizes="(max-width: 768px) 100vw, 50vw"
							/>
						</ShowcaseCard>
						<ShowcaseCard title={t("image.portrait")}>
							<Image
								src={PORTRAIT}
								alt={t("image.caption")}
								aspectRatio="3/4"
								framed
								sizes="(max-width: 768px) 100vw, 50vw"
							/>
						</ShowcaseCard>
					</div>
				</Section>

				<Section
					id="container"
					titleAs="h3"
					title={t("sections.container.title")}
					description={t("sections.container.description")}
					className={sectionClass}
				>
					<div className={showcaseGridClass}>
						<ShowcaseCard title={t("container.default")}>
							<p className="text-small text-muted">{t("container.defaultDescription")}</p>
						</ShowcaseCard>
						<ShowcaseCard title={t("container.prose")}>
							<p className="max-w-2xl text-small text-muted">{t("container.proseDescription")}</p>
						</ShowcaseCard>
					</div>
				</Section>

				<GroupHeading>{t("groups.states")}</GroupHeading>
				<Section
					id="spinner"
					titleAs="h3"
					title={t("sections.spinner.title")}
					description={t("sections.spinner.description")}
					className={sectionClass}
				>
					<ShowcaseCard title={t("sections.spinner.title")}>
						<div className="flex flex-wrap items-end gap-8">
							<Spinner size="sm" label={t("sections.spinner.title")} />
							<Spinner size="md" label={t("sections.spinner.title")} />
							<Spinner size="lg" label={t("sections.spinner.title")} />
						</div>
					</ShowcaseCard>
				</Section>

				<Section
					id="emptyState"
					titleAs="h3"
					title={t("sections.emptyState.title")}
					description={t("sections.emptyState.description")}
					className={sectionClass}
				>
					<div className={showcaseGridClass}>
						<ShowcaseCard title={t("emptyState.withoutAction")}>
							<EmptyState
								icon={<MagnifyingGlassIcon />}
								title={t("emptyState.title")}
								description={t("emptyState.description")}
							/>
						</ShowcaseCard>
						<ShowcaseCard title={t("emptyState.withAction")}>
							<EmptyState
								icon={<MagnifyingGlassIcon />}
								title={t("emptyState.title")}
								description={t("emptyState.description")}
							>
								<Button variant="secondary">{t("emptyState.clearFilters")}</Button>
							</EmptyState>
						</ShowcaseCard>
					</div>
				</Section>

				<Section
					id="errorState"
					titleAs="h3"
					title={t("sections.errorState.title")}
					description={t("sections.errorState.description")}
					className={sectionClass}
				>
					<ShowcaseCard title={t("sections.errorState.title")}>
						<ErrorState
							title={t("errorState.title")}
							description={t("errorState.description")}
							framed
							action={<Button variant="secondary">{t("errorState.retry")}</Button>}
						/>
					</ShowcaseCard>
				</Section>

				<Section
					id="skeleton"
					titleAs="h3"
					title={t("sections.skeleton.title")}
					description={t("sections.skeleton.description")}
					className={sectionClass}
				>
					<div className={showcaseGridClass}>
						<ShowcaseCard title={t("skeleton.text")}><SkeletonText lines={4} /></ShowcaseCard>
						<ShowcaseCard title={t("skeleton.image")}><Skeleton aspectRatio="16/9" className="w-full" /></ShowcaseCard>
					</div>
				</Section>

				<GroupHeading>{t("groups.utilities")}</GroupHeading>
				<Section
					id="visuallyHidden"
					titleAs="h3"
					title={t("sections.visuallyHidden.title")}
					description={t("sections.visuallyHidden.description")}
					className={sectionClass}
				>
					<ShowcaseCard title={t("sections.visuallyHidden.title")}>
						<p className="mb-3 text-small text-muted">{t("visuallyHidden.hint")}</p>
						<VisuallyHidden
							as="a"
							href="#visuallyHidden"
							focusable
							className="focus:z-10 focus:m-1 focus:border focus:border-border-strong focus:bg-surface focus:px-4 focus:py-2 focus:text-small focus:text-foreground"
						>
							{t("visuallyHidden.skipLink")}
						</VisuallyHidden>
					</ShowcaseCard>
				</Section>

				<Section
					id="divider"
					titleAs="h3"
					title={t("sections.divider.title")}
					description={t("sections.divider.description")}
					className={sectionClass}
				>
					<ShowcaseCard title={t("sections.divider.title")}>
						<div className="flex max-w-md flex-col gap-6">
							<Divider />
							<Divider>{t("divider.or")}</Divider>
							<div className="flex h-10 items-center gap-3">
								<span className="text-small text-muted">A</span>
								<Divider orientation="vertical" />
								<span className="text-small text-muted">B</span>
							</div>
						</div>
					</ShowcaseCard>
				</Section>

				<Section
					id="badge"
					titleAs="h3"
					title={t("sections.badge.title")}
					description={t("sections.badge.description")}
					className={sectionClass}
				>
					<ShowcaseCard title={t("sections.badge.title")}>
						<div className="flex flex-wrap items-center gap-3">
							<Badge variant="solid">{t("badge.solid")}</Badge>
							<Badge variant="outline">{t("badge.outline")}</Badge>
							<Badge variant="subtle">{t("badge.subtle")}</Badge>
							<Badge variant="outline" leadingIcon={<TagIcon />}>
								{t("badge.withIcon")}
							</Badge>
						</div>
					</ShowcaseCard>
				</Section>

				<Section
					id="breadcrumb"
					titleAs="h3"
					title={t("sections.breadcrumb.title")}
					description={t("sections.breadcrumb.description")}
					className={sectionClass}
				>
					<ShowcaseCard title={t("sections.breadcrumb.title")}>
						<Breadcrumb
							label={t("breadcrumb.label")}
							items={[
								{ label: t("breadcrumb.home"), href: "/" },
								{ label: t("breadcrumb.library"), href: "/" },
								{ label: t("breadcrumb.books"), href: "/" },
								{ label: t("breadcrumb.current") },
							]}
						/>
					</ShowcaseCard>
				</Section>

				<Section
					id="pagination"
					titleAs="h3"
					title={t("sections.pagination.title")}
					description={t("sections.pagination.description")}
					className={sectionClass}
				>
					<div className={showcaseGridClass}>
						<ShowcaseCard title={t("pagination.label")}>
							<Pagination
								currentPage={5}
								totalPages={20}
								label={t("pagination.label")}
								previousLabel={t("pagination.previous")}
								nextLabel={t("pagination.next")}
								createHref={(page) => `/ui?page=${page}`}
							/>
						</ShowcaseCard>
						<ShowcaseCard title={t("pagination.next")}>
							<Pagination
								currentPage={2}
								totalPages={7}
								label={t("pagination.label")}
								previousLabel={t("pagination.previous")}
								nextLabel={t("pagination.next")}
								createHref={(page) => `/ui?page=${page}`}
							/>
						</ShowcaseCard>
					</div>
				</Section>

				<GroupHeading>{t("groups.homepage")}</GroupHeading>

				<PlaygroundBlock
					id="featuredSlide"
					title={t("sections.featuredSlide.title")}
					description={t("sections.featuredSlide.description")}
				>
					<FeaturedSlideShowcase />
				</PlaygroundBlock>

				<PlaygroundBlock
					id="featuredCarousel"
					title={t("sections.featuredCarousel.title")}
					description={t("sections.featuredCarousel.description")}
				>
					<FeaturedCarouselShowcase />
				</PlaygroundBlock>

				<PlaygroundBlock
					id="newsCard"
					title={t("sections.newsCard.title")}
					description={t("sections.newsCard.description")}
				>
					<NewsCardShowcase />
				</PlaygroundBlock>

				<PlaygroundBlock
					id="projectCard"
					title={t("sections.projectCard.title")}
					description={t("sections.projectCard.description")}
				>
					<ProjectCardShowcase />
				</PlaygroundBlock>

				<PlaygroundBlock
					id="writingRow"
					title={t("sections.writingRow.title")}
					description={t("sections.writingRow.description")}
				>
					<WritingRowShowcase />
				</PlaygroundBlock>

				<PlaygroundBlock
					id="videoCard"
					title={t("sections.videoCard.title")}
					description={t("sections.videoCard.description")}
				>
					<VideoCardShowcase />
				</PlaygroundBlock>

				<PlaygroundBlock
					id="featuredHero"
					title={t("sections.featuredHero.title")}
					description={t("sections.featuredHero.description")}
					fullBleed
				>
					<FeaturedHero compact />
				</PlaygroundBlock>

				<PlaygroundBlock
					id="latestUpdates"
					title={t("sections.latestUpdates.title")}
					description={t("sections.latestUpdates.description")}
					fullBleed
				>
					<LatestUpdates />
				</PlaygroundBlock>

				<PlaygroundBlock
					id="projectsSection"
					title={t("sections.projectsSection.title")}
					description={t("sections.projectsSection.description")}
					fullBleed
				>
					<ProjectsSection />
				</PlaygroundBlock>

				<PlaygroundBlock
					id="soundSection"
					title={t("sections.soundSection.title")}
					description={t("sections.soundSection.description")}
					fullBleed
				>
					<SoundSection compact />
				</PlaygroundBlock>

				<PlaygroundBlock
					id="writingsSection"
					title={t("sections.writingsSection.title")}
					description={t("sections.writingsSection.description")}
					fullBleed
				>
					<WritingsSection />
				</PlaygroundBlock>

				<PlaygroundBlock
					id="videoSection"
					title={t("sections.videoSection.title")}
					description={t("sections.videoSection.description")}
					fullBleed
				>
					<VideoSection />
				</PlaygroundBlock>

				<PlaygroundBlock
					id="imageCollectionSection"
					title={t("sections.imageCollectionSection.title")}
					description={t("sections.imageCollectionSection.description")}
					fullBleed
				>
					<ImageCollectionSection />
				</PlaygroundBlock>

				<GroupHeading>{t("groups.about")}</GroupHeading>

				<PlaygroundBlock
					id="sectionRuleHeading"
					title={t("sections.sectionRuleHeading.title")}
					description={t("sections.sectionRuleHeading.description")}
				>
					<SectionRuleHeadingShowcase />
				</PlaygroundBlock>

				<PlaygroundBlock
					id="aboutTeamPhoto"
					title={t("sections.aboutTeamPhoto.title")}
					description={t("sections.aboutTeamPhoto.description")}
				>
					<AboutTeamPhotoShowcase />
				</PlaygroundBlock>

				<PlaygroundBlock
					id="partnerCard"
					title={t("sections.partnerCard.title")}
					description={t("sections.partnerCard.description")}
				>
					<PartnerCardShowcase />
				</PlaygroundBlock>

				<PlaygroundBlock
					id="aboutHero"
					title={t("sections.aboutHero.title")}
					description={t("sections.aboutHero.description")}
					fullBleed
				>
					<AboutHeroShowcase />
				</PlaygroundBlock>

				<PlaygroundBlock
					id="aboutMission"
					title={t("sections.aboutMission.title")}
					description={t("sections.aboutMission.description")}
					fullBleed
				>
					<AboutMissionPreview />
				</PlaygroundBlock>

				<PlaygroundBlock
					id="aboutFounder"
					title={t("sections.aboutFounder.title")}
					description={t("sections.aboutFounder.description")}
					fullBleed
				>
					<AboutFounderPreview />
				</PlaygroundBlock>

				<PlaygroundBlock
					id="aboutTeamShowcase"
					title={t("sections.aboutTeamShowcase.title")}
					description={t("sections.aboutTeamShowcase.description")}
					fullBleed
				>
					<AboutTeamShowcasePreview />
				</PlaygroundBlock>

				<PlaygroundBlock
					id="aboutPartners"
					title={t("sections.aboutPartners.title")}
					description={t("sections.aboutPartners.description")}
					fullBleed
				>
					<AboutPartnersPreview />
				</PlaygroundBlock>
			</UiPlaygroundMain>
		</UiPlaygroundSidebar>
	);
}

function HeroStrip({ t }: { t: Awaited<ReturnType<typeof getTranslations>> }) {
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
					<Button variant="primary" size="sm">{t("groups.foundations")}</Button>
					<Button variant="secondary" size="sm">{t("groups.primitives")}</Button>
				</div>
			</div>
		</section>
	);
}

function Swatch({ name, className }: { name: string; className: string }) {
	return (
		<div className="flex flex-col gap-2 text-start">
			<span
				className={`size-14 shrink-0  border border-border ${className}`}
				aria-hidden
			/>
			<span className="text-small">{name}</span>
		</div>
	);
}

function VariantGrid({
	title,
	children,
}: {
	title: string;
	children: ReactNode;
}) {
	return (
		<div className="bg-surface p-5 sm:p-6">
			<h4 className="mb-4 text-small font-semibold tracking-wide text-muted">{title}</h4>
			<div className="flex flex-wrap items-center gap-3.5">{children}</div>
		</div>
	);
}
