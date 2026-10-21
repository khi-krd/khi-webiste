import { ArrowRightIcon } from "@heroicons/react/24/outline";
import NextImage from "next/image";
import { MediaMark } from "@/components/ui/media-mark";
import { viewAllCtaOnDarkClass } from "@/components/ui/cta-styles";
import { DirectionalIcon } from "@/components/ui/directional-icon";
import { Link } from "@/components/ui/link";
import type { PartnerItem } from "@/lib/mock/about";
import { cn } from "@/lib/utils";

const imageEase = "ease-[cubic-bezier(0.25,0.46,0.45,0.94)]";

type PartnerCardProps = {
	item: PartnerItem;
	title: string;
	description: string;
	cta: string;
	className?: string;
};

export function PartnerCard({
	item,
	title,
	description,
	cta,
	className,
}: PartnerCardProps) {
	return (
		<article
			className={cn(
				"group relative h-full min-h-60 overflow-hidden border border-border sm:min-h-72 lg:min-h-80",
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
				<MediaMark className="z-2" />

				<div
					className="pointer-events-none absolute inset-0 z-1 bg-foreground/50"
					aria-hidden
				/>
				<div
					className="pointer-events-none absolute inset-0 z-1 bg-linear-to-t from-foreground from-0% via-foreground/70 via-40% to-transparent to-75%"
					aria-hidden
				/>
			</div>

			<div className="relative z-10 flex h-full min-h-60 flex-col justify-end p-4 sm:min-h-72 sm:p-5 lg:min-h-80 lg:p-6">
				<h3 className="font-heading text-h2 font-semibold leading-snug text-balance text-white">
					{title}
				</h3>
				<p className="mt-2.5 max-w-lg text-justify text-body leading-relaxed whitespace-pre-line text-white/85 sm:mt-3">
					{description}
				</p>
				{/* Pinned to the physical bottom-left corner: inline-start in LTR,
				    inline-end in RTL. */}
				<Link
					href={item.href}
					variant="nav"
					className={cn(
						viewAllCtaOnDarkClass,
						"mt-4 self-start rtl:self-end sm:mt-5",
					)}
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
