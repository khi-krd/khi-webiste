import { ArrowLeftIcon, ArrowRightIcon } from "@heroicons/react/24/outline";
import {
	ScrollReveal,
	ScrollRevealBlock,
} from "@/components/motion/scroll-reveal";
import { ProjectCoverMedia } from "@/components/projects/project-cover-media";
import { ProjectMediaGallery } from "@/components/projects/project-media-gallery";
import { CoverLightbox } from "@/components/ui/cover-lightbox";
import { DirectionalIcon } from "@/components/ui/directional-icon";
import { RichText } from "@/components/ui/rich-text";
import { TaxonomyBadgeLink } from "@/components/ui/taxonomy-badge-link";
import { Link } from "@/i18n/navigation";
import { homeInsetClass } from "@/lib/layout";
import type { ProjectDetail, ProjectListItem } from "@/lib/mock/projects";
import { projectDetailHref, projectsHref } from "@/lib/projects-url";
import { isRichTextEmpty } from "@/lib/rich-text";
import { projectTagHref } from "@/lib/search/taxonomy-href";
import { displayTitleSizeClass, heroTitleBoostClass } from "@/lib/title-scale";
import { cn } from "@/lib/utils";

type ProjectDetailViewProps = {
	detail: ProjectDetail;
	backLabel: string;
	typeLabel: string;
	statusLabel: string;
	dateLabel: string;
	tagsLabel: string;
	contentLabel: string;
	galleryLabel: string;
	navLabel: string;
	previousLabel: string;
	nextLabel: string;
	lightboxCloseLabel: string;
	statusLabels: Record<string, string>;
	formattedDate: string | null;
};

/** One pinned fact in the spec band — quiet label over a confident value. */
function FactCell({
	label,
	children,
}: {
	label: string;
	children: React.ReactNode;
}) {
	return (
		<div className="min-w-0">
			<dt className="label font-medium">{label}</dt>
			<dd className="mt-1.5 text-body font-medium text-foreground">
				{children}
			</dd>
		</div>
	);
}

/** Numbered case-file eyebrow sitting above its section's hairline rule. */
export function SectionEyebrow({
	number,
	label,
	as: Tag = "p",
}: {
	number: string;
	label: string;
	as?: "p" | "h2";
}) {
	return (
		<Tag className="label flex items-baseline gap-3 border-b border-border pb-3 font-medium">
			<span className="tabular-nums font-semibold text-foreground">
				{number}
			</span>
			{label}
		</Tag>
	);
}

function AdjacentLink({
	project,
	label,
	direction,
	withDivider = false,
}: {
	project: ProjectListItem;
	label: string;
	direction: "previous" | "next";
	/** Mobile hairline between stacked cells — only when a sibling exists. */
	withDivider?: boolean;
}) {
	const isNext = direction === "next";

	return (
		<Link
			href={projectDetailHref(project.id)}
			className={cn(
				"group flex flex-col gap-3 py-6 no-underline sm:py-8",
				isNext && "items-end border-border text-end sm:ps-8",
				isNext && withDivider && "border-t sm:border-t-0 sm:border-s",
				!isNext && "sm:pe-8",
			)}
		>
			<span className="label flex items-center gap-2 font-medium">
				<DirectionalIcon
					icon={isNext ? ArrowRightIcon : ArrowLeftIcon}
					className="size-3.5"
				/>
				{label}
			</span>
			<span className="font-heading text-h3 font-bold text-foreground underline decoration-transparent decoration-2 underline-offset-4 transition-[text-decoration-color] duration-300 group-fine:decoration-current">
				{project.title}
			</span>
		</Link>
	);
}

/**
 * Field-dossier project page — a large independent cover column (sticky,
 * click-to-enlarge) beside the article column: display title, location
 * dateline, a border-y spec band of facts (type / status / date / tags),
 * then the narrative as numbered case-file sections.
 */
export function ProjectDetailView({
	detail,
	backLabel,
	typeLabel,
	statusLabel,
	dateLabel,
	tagsLabel,
	contentLabel,
	galleryLabel,
	navLabel,
	previousLabel,
	nextLabel,
	lightboxCloseLabel,
	statusLabels,
	formattedDate,
}: ProjectDetailViewProps) {
	const { previous, next, ...project } = detail;
	const coverKind = project.coverMediaType ?? "IMAGE";
	const coverAlt = project.image.alt ?? project.title;
	const bodyContent = !isRichTextEmpty(project.description)
		? project.description
		: project.excerpt;

	// Case-file numbering skips sections that have nothing to show.
	let sectionCount = 0;
	const nextSectionNumber = () => String(++sectionCount).padStart(2, "0");
	const bodyNumber = bodyContent ? nextSectionNumber() : null;
	const galleryNumber =
		project.mediaGallery.length > 0 ? nextSectionNumber() : null;
	const navNumber = previous || next ? nextSectionNumber() : null;

	const cover = (
		<ProjectCoverMedia
			url={project.coverUrl}
			alt={coverAlt}
			kind={coverKind}
			posterUrl={project.coverThumbnailUrl ?? project.image.url}
			priority
			className={cn(
				coverKind === "IMAGE"
					? "aspect-[4/5] w-full"
					: "min-h-[16rem] w-full sm:min-h-[20rem]",
			)}
			sizes="(max-width: 1024px) 100vw, 34rem"
			imageClassName="brightness-[0.94] saturate-[0.9]"
		/>
	);

	return (
		<article className={cn(homeInsetClass, "pb-12 sm:pb-16")}>
			<ScrollRevealBlock className="pt-10 sm:pt-12">
				<Link
					href={projectsHref()}
					className="group inline-flex w-fit items-center gap-2 no-underline"
				>
					<DirectionalIcon
						icon={ArrowLeftIcon}
						className="size-4 text-muted transition-colors group-fine:text-foreground"
					/>
					<span className="label font-medium transition-colors group-fine:text-foreground">
						{backLabel}
					</span>
				</Link>

				<div className="mt-10 grid gap-10 lg:grid-cols-[minmax(0,28rem)_minmax(0,1fr)] lg:items-start lg:gap-12 xl:grid-cols-[minmax(0,34rem)_minmax(0,1fr)] xl:gap-16">
					{/* Article first in DOM so the title leads on mobile and for screen
					    readers; the dossier rail takes column 1 only at lg. */}
					<div className="min-w-0 lg:col-start-2 lg:row-start-1">
						<h1
							className={cn(
								"display-title max-w-3xl text-balance",
								displayTitleSizeClass(project.title),
								heroTitleBoostClass(project.title),
							)}
						>
							{project.title}
						</h1>

						{project.location && (
							<p className="mt-3 text-lead text-muted">{project.location}</p>
						)}

						{(project.projectType ||
							project.status ||
							formattedDate ||
							project.tags.length > 0) && (
							<dl className="mt-8 grid max-w-3xl grid-cols-2 gap-x-6 gap-y-6 border-y border-border py-5 sm:grid-cols-3">
								{project.projectType && (
									<FactCell label={typeLabel}>{project.projectType}</FactCell>
								)}
								{project.status && (
									<FactCell label={statusLabel}>
										{statusLabels[project.status] ?? project.status}
									</FactCell>
								)}
								{formattedDate && (
									<FactCell label={dateLabel}>
										<time dateTime={project.projectDate ?? undefined}>
											{formattedDate}
										</time>
									</FactCell>
								)}
								{project.tags.length > 0 && (
									<FactCell label={tagsLabel}>
										<span className="flex flex-wrap gap-2">
											{project.tags.map((tag) => (
												<TaxonomyBadgeLink
													key={tag}
													href={projectTagHref(tag)}
													variant="outline"
													size="sm"
												>
													{tag}
												</TaxonomyBadgeLink>
											))}
										</span>
									</FactCell>
								)}
							</dl>
						)}

						{bodyContent && bodyNumber ? (
							<section className="mt-8 sm:mt-10">
								<SectionEyebrow
									as="h2"
									number={bodyNumber}
									label={contentLabel}
								/>
								<div className="project-article-body max-w-3xl pt-6">
									<RichText content={bodyContent} />
								</div>
							</section>
						) : null}
					</div>

					{/* Independent cover column — just the image, large and clickable. */}
					<div className="min-w-0 lg:sticky lg:top-32 lg:col-start-1 lg:row-start-1 lg:self-start">
						{coverKind === "IMAGE" ? (
							<CoverLightbox
								src={project.coverUrl}
								alt={coverAlt}
								closeLabel={lightboxCloseLabel}
								caption={project.title}
							>
								<div className="overflow-hidden border border-border bg-sunken">
									{cover}
								</div>
							</CoverLightbox>
						) : (
							<div className="overflow-hidden border border-border bg-sunken">
								{cover}
							</div>
						)}
					</div>
				</div>
			</ScrollRevealBlock>

			{galleryNumber && (
				<ScrollReveal className="mt-10 sm:mt-12">
					<ProjectMediaGallery
						items={project.mediaGallery}
						title={galleryLabel}
						projectTitle={project.title}
						number={galleryNumber}
						closeLabel={lightboxCloseLabel}
					/>
				</ScrollReveal>
			)}

			{navNumber && (
				<nav aria-label={navLabel} className="mt-10 sm:mt-12">
					<SectionEyebrow number={navNumber} label={navLabel} />
					<div className="grid sm:grid-cols-2">
						{previous ? (
							<AdjacentLink
								project={previous}
								label={previousLabel}
								direction="previous"
							/>
						) : (
							<div aria-hidden className="hidden sm:block" />
						)}
						{next && (
							<AdjacentLink
								project={next}
								label={nextLabel}
								direction="next"
								withDivider={Boolean(previous)}
							/>
						)}
					</div>
				</nav>
			)}
		</article>
	);
}
