import NextImage from "next/image";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

type DonateTypeCardProps = {
	index: string;
	title: string;
	description: string;
	image: { url: string; alt?: string };
	className?: string;
};

export function DonateTypeCard({
	index,
	title,
	description,
	image,
	className,
}: DonateTypeCardProps) {
	return (
		<article
			className={cn(
				"group relative block h-full w-full overflow-hidden border border-border bg-surface",
				className,
			)}
		>
			<div className="absolute inset-0 isolate">
				<div className="absolute inset-0 overflow-hidden">
					<div className="absolute -inset-[5%] origin-center transition-transform duration-[1.35s] ease-[cubic-bezier(0.25,0.46,0.45,0.94)] will-change-transform group-fine:scale-[1.06] motion-reduce:transition-none motion-reduce:duration-0 motion-reduce:group-fine:scale-100">
						<NextImage
							src={image.url}
							alt={image.alt ?? title}
							fill
							sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
							className="object-cover brightness-[0.78] contrast-[1.1] saturate-[0.65] transition-[filter] duration-[1.35s] ease-[cubic-bezier(0.25,0.46,0.45,0.94)] group-fine:brightness-[0.88] group-fine:saturate-[0.8] motion-reduce:transition-none"
						/>
					</div>
				</div>

				<div
					className={cn(
						"pointer-events-none absolute inset-0 z-1 bg-foreground/35 transition-opacity duration-500 ease-out group-fine:bg-foreground/48 motion-reduce:transition-none",
					)}
					aria-hidden
				/>
				<div
					className={cn(
						"pointer-events-none absolute inset-0 z-1 bg-linear-to-t from-foreground from-0% via-foreground/80 via-32% to-transparent to-68% transition-opacity duration-500 ease-out group-fine:via-foreground/88 motion-reduce:transition-none",
					)}
					aria-hidden
				/>
			</div>

			<div className="relative z-10 flex h-full min-h-[inherit] flex-col justify-end p-5 text-start text-white transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-fine:-translate-y-1.5 motion-reduce:transition-none motion-reduce:group-fine:translate-y-0 sm:p-6">
				<Badge
					variant="subtle"
					size="sm"
					className="mb-3 w-fit border border-white/20 bg-white/10 text-white/90 transition-[background-color,border-color] duration-300 group-fine:border-white/35 group-fine:bg-white/20 motion-reduce:transition-none"
				>
					{index}
				</Badge>
				<h3 className="font-heading text-h3 font-semibold text-balance text-white sm:text-h2">
					{title}
				</h3>
				{description ? (
					<p className="mt-2 line-clamp-2 text-small text-white/85">
						{description}
					</p>
				) : null}
			</div>
		</article>
	);
}
