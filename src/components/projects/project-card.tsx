import { ArrowUpRightIcon, FilmIcon, MusicalNoteIcon, PhotoIcon } from "@heroicons/react/24/outline";
import { ProjectCoverImage } from "@/components/projects/project-cover-image";
import { DirectionalIcon } from "@/components/ui/directional-icon";
import { RichText } from "@/components/ui/rich-text";
import { Link } from "@/i18n/navigation";
import type { ProjectListItem } from "@/lib/mock/projects";
import { countGalleryMedia } from "@/lib/project/media";
import { projectDetailHref } from "@/lib/projects-url";
import { isRichTextEmpty } from "@/lib/rich-text";
import type { MediaKind } from "@/types/media";
import { cn } from "@/lib/utils";

type ProjectCardCopy = {
	preview: string;
};

type ProjectCardProps = {
	item: ProjectListItem;
	globalIndex: number;
	copy: ProjectCardCopy;
	className?: string;
	priority?: boolean;
};

function MediaKindBadge({ kind }: { kind: MediaKind }) {
	if (kind === "IMAGE") return null;

	return (
		<span className="pointer-events-none absolute start-3 top-3 z-20 inline-flex items-center gap-1.5 border border-border/80 bg-background/92 px-2 py-1 label font-semibold uppercase tracking-[0.12em] text-foreground">
			{kind === "VIDEO" ? (
				<FilmIcon className="size-3.5" aria-hidden />
			) : (
				<MusicalNoteIcon className="size-3.5" aria-hidden />
			)}
			{kind === "VIDEO" ? "Video" : "Audio"}
		</span>
	);
}

/**
 * Editorial project card — index numeral, cover, title, rich-text teaser, CTA.
 */
export function ProjectCard({
	item,
	globalIndex,
	copy,
	className,
	priority = false,
}: ProjectCardProps) {
	const indexLabel = String(globalIndex + 1);
	const coverKind = item.coverMediaType ?? "IMAGE";
	const galleryCounts = countGalleryMedia(item.mediaGallery);
	const hasGallery =
		galleryCounts.images + galleryCounts.videos + galleryCounts.audio > 0;
	const href = projectDetailHref(item.id);

	return (
		<article className={cn("flex h-full flex-col", className)}>
			<span
				className="font-heading text-[clamp(3rem,8vw,5.5rem)] font-bold leading-[0.85] text-foreground/[0.12]"
				aria-hidden
			>
				{indexLabel}
			</span>

			<div className="mt-4 flex flex-1 flex-col sm:mt-6">
				<Link href={href} className="group block no-underline">
					<div className="relative">
						<ProjectCoverImage
							src={item.image.url}
							alt={item.image.alt ?? item.title}
							priority={priority}
							className="aspect-[4/3] w-full"
							imageClassName="brightness-[0.92] contrast-[1.04] saturate-[0.88] transition-transform duration-[1.1s] ease-[cubic-bezier(0.25,0.46,0.45,0.94)] group-fine:scale-[1.03] motion-reduce:transition-none motion-reduce:group-fine:scale-100"
						/>
						<MediaKindBadge kind={coverKind} />
					</div>

					<div className="mt-5 flex flex-wrap items-center gap-2 sm:mt-6">
						{(item.projectType || item.year) && (
							<p className="label font-medium text-muted">
								{[item.projectType, item.year].filter(Boolean).join(" · ")}
							</p>
						)}
						{hasGallery && (
							<span className="inline-flex items-center gap-1 label font-medium text-muted">
								<PhotoIcon className="size-3.5" aria-hidden />
								{galleryCounts.images +
									galleryCounts.videos +
									galleryCounts.audio}
							</span>
						)}
					</div>

					<h3 className="mt-3 font-heading text-h3 font-bold leading-snug text-balance text-foreground transition-[text-decoration-color] duration-300 group-fine:underline group-fine:decoration-border group-fine:underline-offset-4 motion-reduce:group-fine:no-underline">
						{item.title}
					</h3>
				</Link>

				{!isRichTextEmpty(item.description) ? (
					<RichText
						content={item.description}
						compact
						className="project-card-preview mt-3 flex-1 text-muted"
					/>
				) : (
					<p className="mt-3 line-clamp-5 flex-1 text-small leading-relaxed text-muted">
						{item.excerpt}
					</p>
				)}

				<Link
					href={href}
					className="group/cta mt-6 inline-flex w-fit items-center gap-2.5 font-heading text-small font-semibold text-foreground no-underline"
				>
					{copy.preview}
					<DirectionalIcon
						icon={ArrowUpRightIcon}
						className="size-4 transition-transform duration-300 group-fine/cta:translate-x-0.5 group-fine/cta:-translate-y-0.5 motion-reduce:transition-none motion-reduce:group-fine/cta:translate-x-0 motion-reduce:group-fine/cta:translate-y-0"
					/>
				</Link>
			</div>
		</article>
	);
}
