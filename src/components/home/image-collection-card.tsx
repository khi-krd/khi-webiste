import { ArrowUpRightIcon } from "@heroicons/react/24/outline";
import NextImage from "next/image";
import { Link } from "@/components/ui/link";
import { galleryDetailHref } from "@/lib/content/href";
import type { ImageCollectionItem } from "@/lib/mock/image-collection";
import { cn } from "@/lib/utils";

const imageEase = "ease-[cubic-bezier(0.22,1,0.36,1)]";

type ImageCollectionCardProps = {
	item: ImageCollectionItem;
	priority?: boolean;
	className?: string;
};

export function ImageCollectionCard({
	item,
	priority = false,
	className,
}: ImageCollectionCardProps) {
	const href = galleryDetailHref(item.slug);

	return (
		<Link
			href={href}
			variant="nav"
			className={cn(
				"group relative block h-full w-full overflow-hidden bg-surface no-underline",
				"transition-[box-shadow,transform,z-index] duration-500",
				imageEase,
				"fine-hover:z-20 fine-hover:shadow-[0_12px_32px_-16px_color-mix(in_oklch,var(--color-foreground)_50%,transparent)]",
				className,
			)}
			aria-label={item.title}
		>
			<div className="absolute inset-0">
				<div className="absolute inset-0 isolate overflow-hidden">
					<div
						className={cn(
							"absolute inset-[-5%] origin-center",
							"transition-transform duration-[1.4s]",
							imageEase,
							"group-fine:scale-[1.08] motion-reduce:transition-none motion-reduce:duration-0 motion-reduce:group-fine:scale-100",
						)}
					>
						<NextImage
							src={item.image.url}
							alt={item.image.alt ?? item.title}
							fill
							priority={priority}
							sizes="(max-width: 1024px) 25vw, 13vw"
							className="object-cover object-center brightness-[0.94] contrast-[1.06] saturate-[0.9] transition-[filter] duration-700 group-fine:brightness-[0.82] group-fine:saturate-[0.95] motion-reduce:transition-none"
						/>
					</div>

					<div
						className={cn(
							"pointer-events-none absolute inset-0 z-1 bg-foreground/25 opacity-0 transition-opacity duration-500",
							imageEase,
							"group-fine:opacity-100 group-focus-visible:opacity-100",
							"motion-reduce:opacity-100 motion-reduce:transition-none",
						)}
						aria-hidden
					/>
					<div
						className={cn(
							"pointer-events-none absolute inset-0 z-1 bg-linear-to-t from-foreground from-0% via-foreground/70 via-42% to-transparent to-78% opacity-0 transition-opacity duration-500",
							imageEase,
							"group-fine:opacity-100 group-focus-visible:opacity-100",
							"motion-reduce:opacity-100 motion-reduce:transition-none",
						)}
						aria-hidden
					/>
				</div>

				<div
					className={cn(
						"absolute inset-x-0 bottom-0 z-10 flex items-end justify-between gap-2 p-2 sm:p-2.5",
						"translate-y-3 opacity-0 transition-[opacity,transform] duration-500",
						imageEase,
						"group-fine:translate-y-0 group-fine:opacity-100",
						"group-focus-visible:translate-y-0 group-focus-visible:opacity-100",
						"motion-reduce:translate-y-0 motion-reduce:opacity-100",
					)}
				>
					<div className="min-w-0 text-start text-primary-foreground">
						<h3
							className={cn(
								"font-heading text-label font-bold leading-snug text-balance sm:text-small",
								"translate-y-1.5 opacity-0 transition-[opacity,transform,text-decoration-color] duration-300",
								imageEase,
								"group-fine:translate-y-0 group-fine:opacity-100 group-fine:delay-75",
								"group-fine:underline group-fine:decoration-primary-foreground/35 group-fine:underline-offset-2",
								"group-focus-visible:translate-y-0 group-focus-visible:opacity-100",
								"motion-reduce:translate-y-0 motion-reduce:opacity-100 motion-reduce:group-fine:no-underline",
							)}
						>
							{item.title}
						</h3>
						<p
							className={cn(
								"mt-0.5 line-clamp-1 text-label text-primary-foreground/75",
								"translate-y-1.5 opacity-0 transition-[opacity,transform] duration-300",
								imageEase,
								"group-fine:translate-y-0 group-fine:opacity-100 group-fine:delay-100",
								"group-focus-visible:translate-y-0 group-focus-visible:opacity-100",
								"motion-reduce:translate-y-0 motion-reduce:opacity-100",
							)}
						>
							{item.subtitle}
						</p>
					</div>

					<ArrowUpRightIcon
						className={cn(
							"size-3.5 shrink-0 translate-x-1 stroke-[1.25] text-primary-foreground/85 opacity-0 sm:size-4",
							"transition-[transform,opacity] duration-300",
							imageEase,
							"group-fine:translate-x-0 group-fine:opacity-100 group-fine:delay-150",
							"group-focus-visible:translate-x-0 group-focus-visible:opacity-100",
							"motion-reduce:translate-x-0 motion-reduce:opacity-100",
						)}
						aria-hidden
					/>
				</div>
			</div>
		</Link>
	);
}
