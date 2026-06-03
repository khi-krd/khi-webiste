import NextImage from "next/image";
import { Badge } from "@/components/ui/badge";
import { Link } from "@/components/ui/link";
import { cn } from "@/lib/utils";
import type { LatestUpdateItem } from "@/lib/mock/latest-updates";

export type NewsCardVariant = "tall" | "square" | "small" | "medium" | "wide";

type NewsCardProps = {
	item: LatestUpdateItem;
	variant: NewsCardVariant;
	categoryLabel: string;
	className?: string;
};

const variantClass: Record<NewsCardVariant, string> = {
	tall: "min-h-72 sm:min-h-80 lg:min-h-0",
	square: "min-h-64 sm:min-h-72",
	small: "min-h-52 sm:min-h-56",
	medium: "min-h-56 sm:min-h-64",
	wide: "min-h-56 sm:min-h-64",
};

const titleClass: Record<NewsCardVariant, string> = {
	tall: "text-h2",
	square: "text-h3",
	small: "text-small font-semibold sm:text-h3",
	medium: "text-h3",
	wide: "text-h2 sm:text-h3",
};

export function NewsCard({
	item,
	variant,
	categoryLabel,
	className,
}: NewsCardProps) {
	const href = `/articles/${item.slug}`;
	const showExcerpt = variant === "tall" || variant === "medium" || variant === "wide";

	return (
		<Link
			href={href}
			variant="nav"
			className={cn(
				"group relative block h-full w-full items-stretch overflow-hidden bg-surface no-underline",
				variantClass[variant],
				className,
			)}
			aria-label={item.title}
		>
			<div className="absolute inset-0 isolate">
				<div className="absolute inset-0 overflow-hidden">
					<div className="absolute -inset-[5%] origin-center transition-transform duration-[1.35s] ease-[cubic-bezier(0.25,0.46,0.45,0.94)] will-change-transform group-hover:scale-[1.06] motion-reduce:transition-none motion-reduce:duration-0 motion-reduce:group-hover:scale-100">
						<NextImage
							src={item.image.url}
							alt={item.image.alt ?? item.title}
							fill
							sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
							className="object-cover brightness-[0.78] contrast-[1.1] saturate-[0.65] transition-[filter] duration-[1.35s] ease-[cubic-bezier(0.25,0.46,0.45,0.94)] group-hover:brightness-[0.88] group-hover:saturate-[0.8] motion-reduce:transition-none"
						/>
					</div>
				</div>

				<div
					className="pointer-events-none absolute inset-0 z-1 bg-foreground/30 transition-opacity duration-500 ease-out group-hover:bg-foreground/45 motion-reduce:transition-none"
					aria-hidden
				/>
				<div
					className="pointer-events-none absolute inset-0 z-1 bg-linear-to-t from-foreground from-0% via-foreground/75 via-35% to-transparent to-70% transition-opacity duration-500 ease-out group-hover:via-foreground/85 motion-reduce:transition-none"
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
