import { ArrowRightIcon } from "@heroicons/react/24/outline";
import NextImage from "next/image";
import { DirectionalIcon } from "@/components/ui/directional-icon";
import { Link } from "@/components/ui/link";
import type { PartnerItem } from "@/lib/mock/about";
import { cn } from "@/lib/utils";

const viewAllClass =
	"group/partner relative inline-flex h-10 w-fit shrink-0 items-center gap-2.5 overflow-hidden border border-white/70 bg-white/10 px-5 font-heading text-small font-semibold text-white no-underline backdrop-blur-[2px] transition-[color,gap,box-shadow,background-color,border-color] duration-300 ease-out before:absolute before:inset-0 before:z-0 before:origin-bottom before:scale-y-0 before:bg-white before:transition-transform before:duration-300 before:ease-[cubic-bezier(0.22,1,0.36,1)] fine-hover:gap-3.5 fine-hover:border-white fine-hover:text-foreground fine-hover:shadow-[0_8px_24px_-12px_rgba(0,0,0,0.45)] fine-hover:before:scale-y-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white motion-reduce:before:transition-none motion-reduce:fine-hover:before:scale-y-100 motion-reduce:fine-hover:gap-2.5";

const imageEase = "ease-[cubic-bezier(0.25,0.46,0.45,0.94)]";

type PartnerCardProps = {
	item: PartnerItem;
	eyebrow: string;
	title: string;
	description: string;
	cta: string;
	className?: string;
};

export function PartnerCard({
	item,
	eyebrow,
	title,
	description,
	cta,
	className,
}: PartnerCardProps) {
	return (
		<article
			className={cn(
				"group relative min-h-60 overflow-hidden border border-border sm:min-h-64 lg:min-h-72",
				className,
			)}
		>
			<div className="absolute inset-0 isolate overflow-hidden">
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
						alt={item.image.alt ?? title}
						fill
						sizes="(max-width: 640px) 100vw, 50vw"
						className={cn(
							"object-cover brightness-[0.78] contrast-[1.1] saturate-[0.65]",
							"transition-[filter] duration-[1.35s]",
							imageEase,
							"group-fine:brightness-[0.88] group-fine:saturate-[0.8] motion-reduce:transition-none",
						)}
					/>
				</div>

				<div
					className="pointer-events-none absolute inset-0 z-1 bg-foreground/50"
					aria-hidden
				/>
				<div
					className="pointer-events-none absolute inset-0 z-1 bg-linear-to-t from-foreground from-0% via-foreground/70 via-40% to-transparent to-75%"
					aria-hidden
				/>
			</div>

			<div className="relative z-10 flex h-full min-h-60 flex-col justify-end p-4 sm:min-h-64 sm:p-5 lg:min-h-72 lg:p-6">
				<p className="label font-medium text-white/80">{eyebrow}</p>
				<h3 className="mt-1.5 font-heading text-h3 font-semibold leading-snug text-balance text-white sm:mt-2">
					{title}
				</h3>
				<p className="mt-2.5 max-w-md text-small leading-relaxed text-white/85 sm:mt-3">
					{description}
				</p>
				<Link
					href={item.href}
					variant="nav"
					className={cn(viewAllClass, "mt-4 sm:mt-5")}
				>
					<span className="relative z-1">{cta}</span>
					<DirectionalIcon
						icon={ArrowRightIcon}
						className="relative z-1 size-4"
					/>
				</Link>
			</div>
		</article>
	);
}
