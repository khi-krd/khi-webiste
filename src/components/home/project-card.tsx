import NextImage from "next/image";
import { Link } from "@/components/ui/link";
import { projectDetailHref } from "@/lib/content/project-href";
import type { ProjectItem } from "@/lib/mock/projects";
import { cn } from "@/lib/utils";

/** Shared with news cards — keep home-section motion consistent. */
const imageEase = "ease-[cubic-bezier(0.25,0.46,0.45,0.94)]";

type ProjectCardProps = {
	item: ProjectItem;
	className?: string;
};

/**
 * Home grid tile: cover image + title, nothing else.
 *
 * The image cell is `flex-1`, so a row of cards inherits its height from the
 * grid — that is what lets the two-row block fit one viewport exactly.
 */
export function ProjectCard({ item, className }: ProjectCardProps) {
	const href = projectDetailHref(item.slug);

	return (
		<Link
			href={href}
			variant="nav"
			className={cn(
				// No `h-full` — the card is a grid item and stretches to the row height.
				"group relative flex w-full flex-col overflow-hidden border border-border bg-surface no-underline",
				className,
			)}
			aria-label={item.title}
		>
			<div className="relative min-h-0 w-full flex-1 overflow-hidden bg-sunken">
				{/* `object-contain`: two rows inside one viewport makes the cells
				    landscape, and `cover` would slice the top and foot off every
				    portrait book cover. Contain shows each cover whole. */}
				<div
					className={cn(
						"absolute inset-0 origin-center p-3 sm:p-4",
						"transition-transform duration-[1.35s]",
						imageEase,
						"group-fine:scale-[1.04] motion-reduce:transition-none motion-reduce:duration-0 motion-reduce:group-fine:scale-100",
					)}
				>
					<div className="relative h-full w-full">
						<NextImage
							src={item.image.url}
							alt={item.image.alt ?? item.title}
							fill
							sizes="(max-width: 640px) 46vw, (max-width: 1024px) 31vw, (max-width: 1280px) 23vw, 19vw"
							className="object-contain"
						/>
					</div>
				</div>
			</div>

			<div className="shrink-0 border-t border-border bg-surface px-3 py-3 text-start sm:px-4 sm:py-3.5">
				<h3
					className={cn(
						"line-clamp-2 font-heading text-body font-semibold leading-snug text-balance text-foreground",
						"transition-[text-decoration-color] duration-300",
						"group-fine:underline group-fine:decoration-border group-fine:underline-offset-4",
						"motion-reduce:group-fine:no-underline",
					)}
				>
					{item.title}
				</h3>
			</div>
		</Link>
	);
}
