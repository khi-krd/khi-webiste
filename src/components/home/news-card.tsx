import NextImage from "next/image";
import { Badge } from "@/components/ui/badge";
import { Link } from "@/components/ui/link";
import { newsDetailHref } from "@/lib/content/href";
import type { LatestUpdateItem } from "@/lib/mock/latest-updates";
import { cn } from "@/lib/utils";

export type NewsCardVariant =
	| "featured"
	| "tall"
	| "square"
	| "small"
	| "medium"
	| "wide";

export type NewsCardOverlayTone = "default" | "light";

type NewsCardProps = {
	item: Pick<LatestUpdateItem, "slug" | "title" | "excerpt" | "image">;
	variant: NewsCardVariant;
	categoryLabel: string;
	className?: string;
	overlayTone?: NewsCardOverlayTone;
};

const flatOverlayClass: Record<
	NewsCardOverlayTone,
	{ featured: string; default: string }
> = {
	default: {
		featured: "bg-foreground/28 group-hover:bg-foreground/38",
		default: "bg-foreground/20 group-hover:bg-foreground/32",
	},
	light: {
		featured: "bg-foreground/20 group-hover:bg-foreground/28",
		default: "bg-foreground/14 group-hover:bg-foreground/22",
	},
};

const gradientOverlayClass: Record<
	NewsCardOverlayTone,
	{ featured: string; default: string }
> = {
	default: {
		featured:
			"from-0% via-foreground/68 via-30% to-transparent to-65% group-hover:via-foreground/76",
		default:
			"from-0% via-foreground/58 via-35% to-transparent to-70% group-hover:via-foreground/68",
	},
	light: {
		featured:
			"from-0% via-foreground/55 via-30% to-transparent to-65% group-hover:via-foreground/62",
		default:
			"from-0% via-foreground/46 via-35% to-transparent to-70% group-hover:via-foreground/54",
	},
};

const variantClass: Record<NewsCardVariant, string> = {
	featured: "min-h-80 sm:min-h-96 lg:min-h-0",
	tall: "min-h-72 sm:min-h-80 lg:min-h-0",
	square: "min-h-64 sm:min-h-72",
	small: "min-h-52 sm:min-h-56 lg:min-h-0",
	medium: "min-h-56 sm:min-h-64",
	wide: "min-h-56 sm:min-h-64",
};

const titleClass: Record<NewsCardVariant, string> = {
	featured: "text-h2 lg:text-display",
	tall: "text-h2",
	square: "text-h3",
	small: "text-small font-semibold sm:text-h3 line-clamp-2",
	medium: "text-h3",
	wide: "text-h2 sm:text-h3",
};

/**
 * `sizes` per variant, matching the real rendered column width in the home +
 * news grids. Critical for mobile: the `small` rail is 2-up (~45vw), not 100vw —
 * a wrong value here makes the browser fetch the full-width image variant.
 */
const sizesByVariant: Record<NewsCardVariant, string> = {
	featured: "(max-width: 1024px) 100vw, 58vw",
	tall: "(max-width: 1024px) 100vw, 58vw",
	square: "(max-width: 640px) 100vw, (max-width: 1280px) 50vw, 33vw",
	small: "(max-width: 640px) 45vw, (max-width: 1024px) 25vw, 18vw",
	medium: "(max-width: 640px) 100vw, 50vw",
	wide: "(max-width: 1024px) 100vw, 58vw",
};

export function NewsCard({
	item,
	variant,
	categoryLabel,
	className,
	overlayTone = "default",
}: NewsCardProps) {
	const href = newsDetailHref(item.slug);
	const showExcerpt =
		variant === "featured" || variant === "tall" || variant === "wide";
	const isFeatured = variant === "featured";

	return (
		<Link
			href={href}
			variant="nav"
			className={cn(
				"group relative block h-full w-full items-stretch overflow-hidden border border-border bg-surface no-underline",
				variantClass[variant],
				className,
			)}
			aria-label={item.title}
		>
			<div className="absolute inset-0 isolate">
				<div className="absolute inset-0 overflow-hidden">
					<div className="absolute -inset-[5%] origin-center transition-transform duration-[1.35s] ease-[cubic-bezier(0.25,0.46,0.45,0.94)] group-hover:scale-[1.06] motion-reduce:transition-none motion-reduce:duration-0 motion-reduce:group-hover:scale-100">
						<NextImage
							src={item.image.url}
							alt={item.image.alt ?? item.title}
							fill
							sizes={sizesByVariant[variant]}
							className="object-cover brightness-[0.78] contrast-[1.1] saturate-[0.65]"
						/>
					</div>
				</div>

				<div
					className={cn(
						"pointer-events-none absolute inset-0 z-1 transition-opacity duration-500 ease-out motion-reduce:transition-none",
						isFeatured
							? flatOverlayClass[overlayTone].featured
							: flatOverlayClass[overlayTone].default,
					)}
					aria-hidden
				/>
				<div
					className={cn(
						"pointer-events-none absolute inset-0 z-1 bg-linear-to-t from-foreground transition-opacity duration-500 ease-out motion-reduce:transition-none",
						isFeatured
							? gradientOverlayClass[overlayTone].featured
							: gradientOverlayClass[overlayTone].default,
					)}
					aria-hidden
				/>
			</div>

			<div className="relative z-10 flex h-full min-h-[inherit] flex-col justify-end p-5 text-start text-white transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:-translate-y-1.5 motion-reduce:transition-none motion-reduce:group-hover:translate-y-0 sm:p-6">
				<Badge
					variant="subtle"
					size="sm"
					className="mb-3 w-fit border border-white/20 bg-white/10 text-white/90 transition-[background-color,border-color] duration-300 group-hover:border-white/35 group-hover:bg-white/20 motion-reduce:transition-none"
				>
					{categoryLabel}
				</Badge>
				<h3
					className={cn(
						"font-heading font-semibold text-balance text-white transition-[text-decoration-color] duration-300 group-hover:underline group-hover:decoration-white/40 group-hover:underline-offset-4 motion-reduce:group-hover:no-underline",
						titleClass[variant],
					)}
				>
					{item.title}
				</h3>
				{showExcerpt && (
					<p className="mt-2 line-clamp-2 text-small text-white/85 transition-opacity duration-300 group-hover:text-white/95 sm:line-clamp-3 sm:text-body motion-reduce:transition-none">
						{item.excerpt}
					</p>
				)}
			</div>
		</Link>
	);
}
