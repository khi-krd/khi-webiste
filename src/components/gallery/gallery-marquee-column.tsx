import { ArrowUpRightIcon } from "@heroicons/react/24/outline";
import type { CSSProperties } from "react";
import { galleryPhotoSurfaceClass } from "@/components/gallery/gallery-album-item";
import { DirectionalIcon } from "@/components/ui/directional-icon";
import { DrawnBorder } from "@/components/ui/drawn-border";
import { Image } from "@/components/ui/image";
import type { GalleryHeroImage } from "@/lib/mock/gallery";
import { cn } from "@/lib/utils";

const imageEase = "ease-[cubic-bezier(0.25,0.46,0.45,0.94)]";
const liftEase = "ease-[cubic-bezier(0.22,1,0.36,1)]";

type GalleryMarqueeColumnProps = {
	items: GalleryHeroImage[];
	direction?: "up" | "down";
	durationSeconds?: number;
	className?: string;
};

function MarqueeCard({
	item,
	priority = false,
	eager = false,
}: {
	item: GalleryHeroImage;
	priority?: boolean;
	eager?: boolean;
}) {
	return (
		<figure className="group relative overflow-hidden">
			<div className={cn("relative overflow-hidden", galleryPhotoSurfaceClass)}>
				<Image
					src={item.image.url}
					alt={item.image.alt}
					aspectRatio={item.aspect}
					sizes="(max-width: 1023px) 50vw, 25vw"
					priority={priority}
					loading={eager && !priority ? "eager" : undefined}
					imageClassName={cn(
						"transition-[filter,transform] duration-[1.1s]",
						imageEase,
						"brightness-[0.9] contrast-[1.05] saturate-[0.72]",
						"group-fine:scale-[1.06] group-fine:brightness-[0.96] group-fine:saturate-[0.82]",
						"motion-reduce:transition-none motion-reduce:group-fine:scale-100",
					)}
				/>

				<div
					className={cn(
						"pointer-events-none absolute inset-0 z-1 bg-linear-to-t from-foreground/55 from-0% via-foreground/20 via-45% to-transparent",
						"opacity-0 transition-opacity duration-500 group-fine:opacity-100 motion-reduce:transition-none",
					)}
					aria-hidden
				/>

				<figcaption
					className={cn(
						"pointer-events-none absolute inset-x-0 bottom-0 z-2 flex items-end gap-3 border-t border-border/90 bg-surface/95 px-3.5 py-3 backdrop-blur-[2px] sm:px-4 sm:py-3.5",
						"translate-y-full opacity-0 transition-[transform,opacity] duration-500",
						liftEase,
						"group-fine:translate-y-0 group-fine:opacity-100 motion-reduce:transition-none motion-reduce:group-fine:translate-y-0 motion-reduce:group-fine:opacity-100",
					)}
				>
					<div className="min-w-0 flex-1 text-start">
						{item.categoryLabel ? (
							<p className="label font-medium text-muted">
								{item.categoryLabel}
							</p>
						) : null}
						<p
							className={cn(
								"truncate font-heading text-small font-semibold leading-snug text-foreground",
								item.categoryLabel && "mt-1",
							)}
						>
							{item.title}
						</p>
					</div>
					<span
						className="draw-border-host relative isolate inline-flex size-8 shrink-0 items-center justify-center overflow-hidden bg-primary text-primary-foreground transition-opacity duration-300 group-fine:opacity-90 motion-reduce:transition-none"
						aria-hidden
					>
						<DrawnBorder />
						<DirectionalIcon
							icon={ArrowUpRightIcon}
							className="relative z-1 size-3.5"
						/>
					</span>
				</figcaption>
			</div>
		</figure>
	);
}

export function GalleryMarqueeColumn({
	items,
	direction = "up",
	durationSeconds = 55,
	className,
}: GalleryMarqueeColumnProps) {
	const trackStyle = {
		"--marquee-duration": `${durationSeconds}s`,
	} as CSSProperties;

	const renderList = (hidden: boolean) => (
		<ul className="flex flex-col" aria-hidden={hidden || undefined}>
			{items.map((item, index) => (
				<li key={`${hidden ? "dup" : "orig"}-${item.id}`} className="pb-2">
					<MarqueeCard
						item={item}
						priority={!hidden && index === 0}
						eager={index === 0}
					/>
				</li>
			))}
		</ul>
	);

	return (
		<div className={className}>
			<div
				className={cn(
					"marquee-track",
					direction === "down" && "marquee-track-reverse",
				)}
				style={trackStyle}
			>
				{renderList(false)}
				{renderList(true)}
			</div>
		</div>
	);
}
