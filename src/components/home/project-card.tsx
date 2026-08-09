import { ArrowUpRightIcon } from "@heroicons/react/24/outline";
import NextImage from "next/image";
import { DirectionalIcon } from "@/components/ui/directional-icon";
import { DrawnBorder } from "@/components/ui/drawn-border";
import { Link } from "@/components/ui/link";
import { projectDetailHref } from "@/lib/content/project-href";
import type { ProjectItem } from "@/lib/mock/projects";
import { cn } from "@/lib/utils";

/** Shared with news cards — keep home-section motion consistent. */
const imageEase = "ease-[cubic-bezier(0.25,0.46,0.45,0.94)]";
const liftEase = "ease-[cubic-bezier(0.22,1,0.36,1)]";

type ProjectCardProps = {
	item: ProjectItem;
	className?: string;
	variant?: "default" | "carousel";
	/**
	 * Pass -1 for cards rendered as a visual duplicate (ticker loop copy): they
	 * stay clickable by pointer but leave the tab order, so each project is
	 * reached once by keyboard.
	 */
	tabIndex?: number;
};

const imageShellClass = {
	default:
		"relative aspect-[4/5] min-h-[22rem] w-full sm:min-h-[24rem] lg:min-h-[26rem]",
	carousel:
		"relative aspect-[4/5] w-full min-h-[20rem] sm:min-h-[23rem] lg:min-h-[25rem]",
} as const;

const imageSizes = {
	default: "(max-width: 640px) 86vw, (max-width: 1024px) 58vw, 46vw",
	carousel:
		"(max-width: 640px) 88vw, (max-width: 768px) 60vw, (max-width: 1024px) 46vw, 36vw",
} as const;

export function ProjectCard({
	item,
	className,
	variant = "default",
	tabIndex,
}: ProjectCardProps) {
	const href = projectDetailHref(item.slug);

	return (
		<Link
			href={href}
			variant="nav"
			tabIndex={tabIndex}
			className={cn(
				"group relative block h-full w-full overflow-hidden border border-border bg-surface no-underline",
				variant === "carousel" && "[touch-action:pan-y_pinch-zoom]",
				className,
			)}
			aria-label={item.title}
		>
			<div className={imageShellClass[variant]}>
				<div className="absolute inset-0 overflow-hidden">
					<div
						className={cn(
							"absolute -inset-[5%] origin-center",
							"transition-transform duration-[1.35s]",
							imageEase,
							"group-fine:scale-[1.06] motion-reduce:transition-none motion-reduce:duration-0 motion-reduce:group-fine:scale-100",
						)}
					>
						<NextImage
							src={item.image.url}
							alt={item.image.alt ?? item.title}
							fill
							sizes={imageSizes[variant]}
							className="object-cover brightness-[0.82] contrast-[1.08] saturate-[0.7]"
						/>
					</div>
				</div>

				<div
					className={cn(
						"absolute inset-x-0 bottom-0 z-10 flex items-end gap-4 border-t border-border bg-surface",
						"px-4 pb-4 pt-4 sm:px-5 sm:pb-5 sm:pt-5",
						"transition-[padding] duration-500",
						liftEase,
						"group-fine:pt-10 sm:group-fine:pt-12 motion-reduce:transition-none motion-reduce:group-fine:pt-4 motion-reduce:sm:group-fine:pt-5",
					)}
				>
					<div className="min-w-0 flex-1 text-start">
						<h3
							className={cn(
								"font-heading text-h3 font-semibold leading-snug text-balance text-foreground",
								"transition-[text-decoration-color] duration-300",
								"group-fine:underline group-fine:decoration-border group-fine:underline-offset-4",
								"motion-reduce:group-fine:no-underline",
							)}
						>
							{item.title}
						</h3>
						<p
							className={cn(
								"mt-1.5 line-clamp-2 text-small leading-relaxed text-muted",
								"transition-opacity duration-300 group-fine:text-foreground/80 motion-reduce:transition-none",
							)}
						>
							{item.subtitle}
						</p>
					</div>

					<span
						className="draw-border-host relative isolate inline-flex size-11 shrink-0 items-center justify-center overflow-hidden bg-primary text-primary-foreground transition-opacity duration-300 group-fine:opacity-90 motion-reduce:transition-none"
						aria-hidden
					>
						<DrawnBorder />
						<DirectionalIcon
							icon={ArrowUpRightIcon}
							className="relative z-1 size-4"
						/>
					</span>
				</div>
			</div>
		</Link>
	);
}
