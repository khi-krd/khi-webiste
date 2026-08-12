import {
	ScrollReveal,
	ScrollRevealBlock,
} from "@/components/motion/scroll-reveal";
import { ProjectCoverMedia } from "@/components/projects/project-cover-media";
import { ProjectMediaGallery } from "@/components/projects/project-media-gallery";
import { CoverLightbox } from "@/components/ui/cover-lightbox";
import { RichText } from "@/components/ui/rich-text";
import { Link } from "@/i18n/navigation";
import { homeInsetClass } from "@/lib/layout";
import type { ProjectDetail } from "@/lib/mock/projects";
import { isRichTextEmpty } from "@/lib/rich-text";
import { projectTagHref } from "@/lib/search/taxonomy-href";
import { cn } from "@/lib/utils";

/**
 * Project titles share the column with stat tiles/tags/content below them —
 * length-adaptive like displayTitleSizeClass, just scaled down a tier so a
 * short title holds one line here instead of the hero-sized 2-line wrap.
 */
function projectTitleSizeClass(title: string): string {
	const length = title.trim().length;
	if (length <= 24) return "text-[clamp(1.75rem,3vw+1rem,3rem)]";
	if (length <= 48) return "text-[clamp(1.5rem,1.8vw+0.9rem,2.25rem)]";
	return "text-[clamp(1.3rem,1.2vw+0.8rem,1.875rem)]";
}

type ProjectDetailViewProps = {
	detail: ProjectDetail;
	locale: string;
	typeLabel: string;
	statusLabel: string;
	dateLabel: string;
	tagsLabel: string;
	contentLabel: string;
	galleryLabel: string;
	lightboxCloseLabel: string;
	statusLabels: Record<string, string>;
};

/** Same locale mapping as formatNewsDate — ckb has no Intl data, ar-IQ is the closest match. */
function formatProjectDate(locale: string, iso: string): string {
	try {
		return new Intl.DateTimeFormat(locale === "ckb" ? "ar-IQ" : locale, {
			year: "numeric",
			month: "long",
			day: "numeric",
		}).format(new Date(iso));
	} catch {
		return iso;
	}
}

/** One stat card in the spec row — quiet label over a confident value, on a recessed tile. */
function FactCell({
	label,
	children,
}: {
	label: string;
	children: React.ReactNode;
}) {
	return (
		<div className="min-w-0 rounded-md bg-sunken px-4 py-3">
			<dt className="label font-medium">{label}</dt>
			<dd className="mt-1 text-body font-bold text-foreground">{children}</dd>
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

/**
 * Field-dossier project page — a large independent cover column (sticky,
 * click-to-enlarge) beside the article column: display title, location,
 * a spec row of stat tiles (type / status), tags, then the narrative body.
 * The cover sits physically left and the article physically right in both
 * locales — see .project-detail-spread in globals.css.
 */
export function ProjectDetailView({
	detail,
	locale,
	typeLabel,
	statusLabel,
	dateLabel,
	tagsLabel,
	contentLabel,
	galleryLabel,
	lightboxCloseLabel,
	statusLabels,
}: ProjectDetailViewProps) {
	const project = detail;
	const coverKind = project.coverMediaType ?? "IMAGE";
	const coverAlt = project.image.alt ?? project.title;
	const bodyContent = !isRichTextEmpty(project.description)
		? project.description
		: project.excerpt;

	// Case-file numbering skips sections that have nothing to show.
	let sectionCount = 0;
	const nextSectionNumber = () => String(++sectionCount).padStart(2, "0");
	const galleryNumber =
		project.mediaGallery.length > 0 ? nextSectionNumber() : null;

	const cover = (
		<ProjectCoverMedia
			url={project.coverUrl}
			alt={coverAlt}
			kind={coverKind}
			posterUrl={project.coverThumbnailUrl ?? project.image.url}
			priority
			className={cn(
				coverKind === "IMAGE"
					? "w-full"
					: "min-h-[16rem] w-full sm:min-h-[20rem]",
			)}
			naturalRatio={coverKind === "IMAGE"}
			sizes="(max-width: 1024px) 100vw, 34rem"
		/>
	);

	return (
		<article className={cn(homeInsetClass, "mx-auto max-w-6xl pb-12 sm:pb-16")}>
			<ScrollRevealBlock className="pt-10 sm:pt-12">
				<div className="project-detail-spread flex flex-col gap-10 lg:flex-row lg:items-start lg:gap-12 xl:gap-16">
					{/* Article first in DOM so the title leads on mobile and for screen
					    readers; flex-direction (not column position) puts the cover
					    physically left at lg — see .project-detail-spread in globals.css. */}
					<div className="min-w-0 flex-1">
						<h1
							className={cn(
								"display-title max-w-3xl text-balance lg:text-nowrap",
								projectTitleSizeClass(project.title),
							)}
						>
							{project.title}
						</h1>

						{project.location && (
							<p className="mt-3 text-lead text-muted">{project.location}</p>
						)}

						{(project.projectType || project.status || project.projectDate) && (
							<dl className="mt-6 grid grid-cols-2 gap-2.5 sm:grid-cols-3">
								{project.projectType && (
									<FactCell label={typeLabel}>{project.projectType}</FactCell>
								)}
								{project.status && (
									<FactCell label={statusLabel}>
										<span className="inline-flex items-center gap-2">
											<span
												aria-hidden
												className="size-2 shrink-0 rounded-full bg-brand"
											/>
											{statusLabels[project.status] ?? project.status}
										</span>
									</FactCell>
								)}
								{project.projectDate && (
									<FactCell label={dateLabel}>
										{formatProjectDate(locale, project.projectDate)}
									</FactCell>
								)}
							</dl>
						)}

						{project.tags.length > 0 && (
							<div className="mt-5 flex flex-wrap items-center gap-2">
								<span className="label font-medium text-muted">
									{tagsLabel}
								</span>
								{project.tags.map((tag) => (
									<Link
										key={tag}
										href={projectTagHref(tag)}
										className="rounded-md bg-accent/10 px-3.5 py-1.5 text-small font-bold text-brand no-underline transition-colors fine-hover:bg-brand fine-hover:text-white"
									>
										{tag}
									</Link>
								))}
							</div>
						)}

						{bodyContent ? (
							<section className="mt-8 sm:mt-10">
								<div className="flex items-center gap-3">
									<h2 className="shrink-0 font-heading text-body font-bold text-foreground">
										{contentLabel}
									</h2>
									<span aria-hidden className="h-px flex-1 bg-border" />
								</div>
								<div className="project-article-body max-w-3xl pt-5">
									<RichText content={bodyContent} />
								</div>
							</section>
						) : null}
					</div>

					{/* Independent cover column — just the image, large and clickable. */}
					<figure className="min-w-0 lg:sticky lg:top-32 lg:w-[28rem] lg:shrink-0 lg:self-start xl:w-[34rem]">
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
						<figcaption className="mt-2.5 text-small text-muted">
							{project.title}
						</figcaption>
					</figure>
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
		</article>
	);
}
