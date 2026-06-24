import { ProjectCoverMedia } from "@/components/projects/project-cover-media";
import { ProjectMediaGallery } from "@/components/projects/project-media-gallery";
import { ArrowLeftIcon, ArrowRightIcon } from "@heroicons/react/24/outline";
import {
	ScrollReveal,
	ScrollRevealBlock,
} from "@/components/motion/scroll-reveal";
import { Badge } from "@/components/ui/badge";
import { DirectionalIcon } from "@/components/ui/directional-icon";
import { RichText } from "@/components/ui/rich-text";
import { Link } from "@/i18n/navigation";
import { homeInsetClass } from "@/lib/layout";
import type { ProjectDetail, ProjectListItem } from "@/lib/mock/projects";
import { projectDetailHref, projectsHref } from "@/lib/projects-url";
import { isRichTextEmpty } from "@/lib/rich-text";
import { cn } from "@/lib/utils";

type ProjectDetailViewProps = {
	detail: ProjectDetail;
	backLabel: string;
	locationLabel: string;
	typeLabel: string;
	statusLabel: string;
	dateLabel: string;
	tagsLabel: string;
	galleryLabel: string;
	navLabel: string;
	previousLabel: string;
	nextLabel: string;
	statusLabels: Record<string, string>;
	formattedDate: string | null;
};

function CreditCell({
	label,
	children,
	className,
}: {
	label: string;
	children: React.ReactNode;
	className?: string;
}) {
	return (
		<div className={cn("flex flex-col gap-2 py-5 sm:py-6", className)}>
			<dt className="label font-medium">{label}</dt>
			<dd className="text-small text-foreground">{children}</dd>
		</div>
	);
}

function AdjacentLink({
	project,
	label,
	direction,
}: {
	project: ProjectListItem;
	label: string;
	direction: "previous" | "next";
}) {
	const isNext = direction === "next";

	return (
		<Link
			href={projectDetailHref(project.id)}
			className={cn(
				"group flex flex-col gap-3 py-8 no-underline sm:py-10",
				isNext &&
					"items-end border-t border-border text-end sm:border-t-0 sm:border-s sm:ps-8",
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
 * Blog-style project article — cover beside a long-form rich-text body,
 * metadata strip, optional media gallery, prev/next navigation.
 */
export function ProjectDetailView({
	detail,
	backLabel,
	locationLabel,
	typeLabel,
	statusLabel,
	dateLabel,
	tagsLabel,
	galleryLabel,
	navLabel,
	previousLabel,
	nextLabel,
	statusLabels,
	formattedDate,
}: ProjectDetailViewProps) {
	const { previous, next, ...project } = detail;
	const coverKind = project.coverMediaType ?? "IMAGE";
	const bodyContent = !isRichTextEmpty(project.description)
		? project.description
		: project.excerpt;

	return (
		<article className={cn(homeInsetClass, "pb-16 sm:pb-20")}>
			<ScrollRevealBlock className="pt-30 sm:pt-34">
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

				<div className="mt-10 grid gap-10 lg:grid-cols-[minmax(0,22rem)_minmax(0,1fr)] lg:items-start lg:gap-14 xl:grid-cols-[minmax(0,26rem)_minmax(0,1fr)] xl:gap-20">
					<div className="min-w-0 lg:sticky lg:top-32 lg:self-start">
						<div className="overflow-hidden border border-border bg-sunken">
							<ProjectCoverMedia
								url={project.coverUrl}
								alt={project.image.alt ?? project.title}
								kind={coverKind}
								posterUrl={project.coverThumbnailUrl ?? project.image.url}
								priority
								className={cn(
									coverKind === "IMAGE"
										? "aspect-[4/5] w-full"
										: "min-h-[16rem] w-full sm:min-h-[20rem]",
								)}
								sizes="(max-width: 1024px) 100vw, 26rem"
								imageClassName="brightness-[0.94] saturate-[0.9]"
							/>
						</div>
					</div>

					<div className="min-w-0">
						<div className="flex flex-wrap items-center gap-2">
							{project.projectType && (
								<Badge variant="outline" size="sm">
									{project.projectType}
								</Badge>
							)}
							{project.status && (
								<Badge variant="subtle" size="sm">
									{statusLabels[project.status] ?? project.status}
								</Badge>
							)}
							{formattedDate && (
								<time
									dateTime={project.projectDate ?? undefined}
									className="text-small text-muted"
								>
									{formattedDate}
								</time>
							)}
						</div>

						<h1 className="display-title mt-5 max-w-3xl text-balance">
							{project.title}
						</h1>

						{project.location && (
							<p className="mt-3 text-lead text-muted">{project.location}</p>
						)}

						{bodyContent ? (
							<div className="project-article-body mt-8 max-w-3xl border-t border-border pt-8 sm:mt-10 sm:pt-10">
								<RichText content={bodyContent} />
							</div>
						) : null}
					</div>
				</div>
			</ScrollRevealBlock>

			<ScrollReveal className="mt-12 sm:mt-16">
				<dl className="grid gap-0 border-y border-border sm:grid-cols-2 lg:grid-cols-4">
					{project.location && (
						<CreditCell label={locationLabel}>{project.location}</CreditCell>
					)}
					{project.projectType && (
						<CreditCell label={typeLabel}>{project.projectType}</CreditCell>
					)}
					{project.status && (
						<CreditCell label={statusLabel}>
							{statusLabels[project.status] ?? project.status}
						</CreditCell>
					)}
					{formattedDate && (
						<CreditCell label={dateLabel}>{formattedDate}</CreditCell>
					)}
				</dl>

				{project.tags.length > 0 && (
					<div className="border-b border-border py-6">
						<p className="label font-medium">{tagsLabel}</p>
						<ul className="mt-3 flex flex-wrap gap-2">
							{project.tags.map((tag) => (
								<li key={tag}>
									<Badge variant="outline" size="sm">
										{tag}
									</Badge>
								</li>
							))}
						</ul>
					</div>
				)}

				<ProjectMediaGallery
					items={project.mediaGallery}
					title={galleryLabel}
					projectTitle={project.title}
				/>
			</ScrollReveal>

			{(previous || next) && (
				<nav
					aria-label={navLabel}
					className="mt-12 border-t border-border sm:mt-16"
				>
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
							/>
						)}
					</div>
				</nav>
			)}
		</article>
	);
}
