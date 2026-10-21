import {
	FilmIcon,
	MusicalNoteIcon,
	PhotoIcon,
} from "@heroicons/react/24/outline";
import { ProjectCoverImage } from "@/components/projects/project-cover-image";
import { Link } from "@/i18n/navigation";
import type { ProjectListItem } from "@/lib/mock/projects";
import { countGalleryMedia } from "@/lib/project/media";
import { projectDetailHref } from "@/lib/projects-url";
import { cn } from "@/lib/utils";
import type { MediaKind } from "@/types/media";

type ProjectCardProps = {
	item: ProjectListItem;
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
 * Editorial project card — cover, title, rich-text teaser. The whole card is
 * the link; no separate CTA.
 */
export function ProjectCard({
	item,
	className,
	priority = false,
}: ProjectCardProps) {
	const coverKind = item.coverMediaType ?? "IMAGE";
	const galleryCounts = countGalleryMedia(item.mediaGallery);
	const hasGallery =
		galleryCounts.images + galleryCounts.videos + galleryCounts.audio > 0;
	const href = projectDetailHref(item.id);

	return (
		<article className={cn("flex h-full flex-col", className)}>
			<div className="flex flex-1 flex-col">
				<Link href={href} className="group block no-underline">
					<div className="relative">
						{/* Fixed 16:10 frame — every card in a row has the same image
						    height whatever the cover's own ratio, title or teaser. */}
						<ProjectCoverImage
							src={item.image.url}
							alt={item.image.alt ?? item.title}
							priority={priority}
							className="aspect-[16/10] w-full"
							imageClassName="brightness-[0.92] contrast-[1.04] saturate-[0.88] transition-transform duration-[1.1s] ease-[cubic-bezier(0.25,0.46,0.45,0.94)] group-fine:scale-[1.03] motion-reduce:transition-none motion-reduce:group-fine:scale-100"
						/>
						<MediaKindBadge kind={coverKind} />
					</div>

					<div className="mt-5 flex flex-wrap items-center gap-2 sm:mt-6">
						{(item.projectTypes?.length
							? item.projectTypes
							: item.projectType
								? [item.projectType]
								: []
						).map((type) => (
							<p key={type} className="label font-medium text-muted">
								{type}
							</p>
						))}
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

					{item.excerpt ? (
						<p className="mt-3 line-clamp-2 text-small leading-relaxed text-muted">
							{item.excerpt}
						</p>
					) : null}
				</Link>
			</div>
		</article>
	);
}
