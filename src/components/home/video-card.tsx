import { PlayIcon } from "@heroicons/react/24/solid";
import NextImage from "next/image";
import { Badge } from "@/components/ui/badge";
import { Link } from "@/components/ui/link";
import type { VideoItem } from "@/lib/mock/videos";
import { cn } from "@/lib/utils";

const imageEase = "ease-[cubic-bezier(0.25,0.46,0.45,0.94)]";

type VideoCardVariant = "featured" | "compact";

type VideoCardProps = {
	item: VideoItem;
	categoryLabel: string;
	variant?: VideoCardVariant;
	/** Absolute-fill layout for bento cells (parent must be `relative` + sized). */
	fill?: boolean;
	className?: string;
};

export function VideoCard({
	item,
	categoryLabel,
	variant = "compact",
	fill = false,
	className,
}: VideoCardProps) {
	const href = `/video/${item.slug}`;

	const frameClass = fill
		? "absolute inset-0 h-full w-full"
		: "relative aspect-video w-full";

	return (
		<Link
			href={href}
			variant="nav"
			className={cn(
				"group relative block overflow-hidden bg-surface no-underline",
				fill ? "absolute inset-0 h-full w-full" : "w-full",
				className,
			)}
			aria-label={item.title}
		>
			<div className={frameClass}>
				<div className="absolute inset-0 isolate overflow-hidden">
					<div
						className={cn(
							"absolute inset-[-5%] origin-center",
							"transition-transform duration-[1.35s]",
							imageEase,
							"fine-group-hover:scale-[1.06] motion-reduce:transition-none motion-reduce:duration-0 motion-reduce:fine-group-hover:scale-100",
						)}
					>
						<NextImage
							src={item.image.url}
							alt={item.image.alt ?? item.title}
							fill
							sizes={
								variant === "featured"
									? "(max-width: 1024px) 100vw, 58vw"
									: "(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 28vw"
							}
							className={cn(
								"object-cover brightness-[0.78] contrast-[1.1] saturate-[0.65]",
								"transition-[filter] duration-[1.35s]",
								imageEase,
								"fine-group-hover:brightness-[0.88] fine-group-hover:saturate-[0.8] motion-reduce:transition-none",
							)}
						/>
					</div>

					<div
						className="pointer-events-none absolute inset-0 z-1 bg-foreground/30 transition-opacity duration-500 ease-out fine-group-hover:bg-foreground/45 motion-reduce:transition-none"
						aria-hidden
					/>
					<div
						className="pointer-events-none absolute inset-0 z-1 bg-linear-to-t from-foreground from-0% via-foreground/75 via-35% to-transparent to-70% transition-opacity duration-500 ease-out fine-group-hover:via-foreground/85 motion-reduce:transition-none"
						aria-hidden
					/>
				</div>

				<div className="absolute inset-x-0 top-0 z-10 p-4 sm:p-5">
					<Badge
						variant="subtle"
						size="sm"
						className="w-fit border border-white/20 bg-white/10 text-white/90 transition-[background-color,border-color] duration-300 fine-group-hover:border-white/35 fine-group-hover:bg-white/20 motion-reduce:transition-none"
					>
						{categoryLabel}
					</Badge>
				</div>

				<div
					className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center"
					aria-hidden
				>
					<span
						className={cn(
							"inline-flex size-14 items-center justify-center rounded-full bg-foreground/70 text-white backdrop-blur-[2px]",
							"transition-[transform,background-color,opacity] duration-300",
							"opacity-80 fine-group-hover:scale-110 fine-group-hover:bg-foreground/85 fine-group-hover:opacity-100",
							"motion-reduce:transition-none motion-reduce:fine-group-hover:scale-100",
						)}
					>
						<PlayIcon className="size-6 translate-x-0.5" />
					</span>
				</div>

				<div className="absolute inset-x-0 bottom-0 z-10 flex items-end justify-between gap-4 p-4 sm:p-5">
					<div className="min-w-0 flex-1 text-start text-white">
						<h3
							className={cn(
								"font-heading font-semibold leading-snug text-balance",
								variant === "featured" ? "text-h2" : "text-h3",
								"transition-[text-decoration-color] duration-300",
								"fine-group-hover:underline fine-group-hover:decoration-white/40 fine-group-hover:underline-offset-4",
								"motion-reduce:fine-group-hover:no-underline",
							)}
						>
							{item.title}
						</h3>
						<p className="mt-1.5 line-clamp-2 text-small text-white/85 transition-opacity duration-300 fine-group-hover:text-white/95 motion-reduce:transition-none">
							{item.subtitle}
						</p>
					</div>

					<span className="shrink-0 text-label font-medium text-white/80">
						{item.duration}
					</span>
				</div>
			</div>
		</Link>
	);
}
