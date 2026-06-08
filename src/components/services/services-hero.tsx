import {
	ArrowRightIcon,
	WrenchScrewdriverIcon,
} from "@heroicons/react/24/outline";
import NextImage from "next/image";
import {
	ServicesHeroBlock,
	ServicesHeroMotion,
} from "@/components/services/services-motion";
import { ServicesNavCarousel } from "@/components/services/services-nav-carousel";
import { Badge } from "@/components/ui/badge";
import { DirectionalIcon } from "@/components/ui/directional-icon";
import { Link } from "@/components/ui/link";
import type { getServicesHeroMedia, ServiceItem } from "@/lib/mock/services";
import { cn } from "@/lib/utils";

const soundCtaClass =
	"group/sound-cta relative inline-flex h-10 w-fit shrink-0 items-center gap-2.5 overflow-hidden border border-white/70 bg-white/10 px-5 font-heading text-small font-semibold text-white no-underline backdrop-blur-[2px] transition-[color,gap,box-shadow,background-color,border-color] duration-300 ease-out before:absolute before:inset-0 before:z-0 before:origin-bottom before:scale-y-0 before:bg-white before:transition-transform before:duration-300 before:ease-[cubic-bezier(0.22,1,0.36,1)] fine-hover:gap-3.5 fine-hover:border-white fine-hover:text-foreground fine-hover:shadow-[0_8px_24px_-12px_rgba(0,0,0,0.45)] fine-hover:before:scale-y-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white motion-reduce:before:transition-none motion-reduce:fine-hover:before:scale-y-100 motion-reduce:fine-hover:gap-2.5";

type ServicesHeroProps = {
	heroMedia: ReturnType<typeof getServicesHeroMedia>;
	navItems: { service: ServiceItem; title: string }[];
	firstServiceId: string;
	eyebrow: string;
	title: string;
	intro: string;
	cta: string;
	navLabel: string;
	direction: "ltr" | "rtl";
	className?: string;
};

export function ServicesHero({
	heroMedia,
	navItems,
	firstServiceId,
	eyebrow,
	title,
	intro,
	cta,
	navLabel,
	direction,
	className,
}: ServicesHeroProps) {
	return (
		<section
			aria-labelledby="services-hero-heading"
			className={cn(
				"relative w-full overflow-hidden border-b border-border min-h-svh",
				className,
			)}
		>
			<div className="absolute inset-0 isolate">
				<div className="absolute inset-0 [&_img]:h-full [&_img]:w-full [&_img]:object-cover [&_img]:brightness-[0.82] [&_img]:contrast-[1.08] [&_img]:saturate-[0.62]">
					<NextImage
						src={heroMedia.url}
						alt={heroMedia.alt ?? ""}
						fill
						sizes="100vw"
						priority
						className="object-cover"
					/>
				</div>

				<div
					className="pointer-events-none absolute inset-0 z-1 bg-foreground/20"
					aria-hidden
				/>
				<div
					className="pointer-events-none absolute inset-0 z-1 bg-linear-to-t from-foreground/55 from-0% via-foreground/30 via-28% to-transparent to-68%"
					aria-hidden
				/>
				<div
					className="pointer-events-none absolute inset-x-0 top-0 z-1 h-40 bg-linear-to-b from-foreground/40 via-foreground/15 to-transparent sm:h-48"
					aria-hidden
				/>
				<div
					className="pointer-events-none absolute inset-0 z-1 bg-linear-to-r from-foreground/35 from-0% via-foreground/15 via-38% to-transparent to-78% rtl:bg-linear-to-l"
					aria-hidden
				/>
				<div
					className="pointer-events-none absolute inset-0 z-1 bg-[radial-gradient(ellipse_130%_90%_at_50%_115%,var(--color-foreground)_0%,transparent_62%)] opacity-35"
					aria-hidden
				/>
			</div>

			<ServicesHeroMotion className="relative z-10 flex min-h-svh flex-col justify-end px-6 pb-14 sm:px-10 sm:pb-16 lg:px-14 lg:pb-20">
				<div className="grid gap-8 lg:grid-cols-2 lg:items-end lg:gap-12 xl:gap-16">
					<ServicesHeroBlock className="max-w-2xl text-start text-white">
						<Badge
							variant="outline"
							size="md"
							leadingIcon={<WrenchScrewdriverIcon aria-hidden />}
							className="border-white/40 bg-white/10 text-white/90 [&_svg]:text-white/80"
						>
							{eyebrow}
						</Badge>

						<h2
							id="services-hero-heading"
							className="mt-4 font-heading text-display font-bold leading-[1.02] text-balance sm:mt-5"
						>
							{title}
						</h2>
					</ServicesHeroBlock>

					<ServicesHeroBlock className="max-w-xl text-start text-white">
						<p className="text-body leading-relaxed text-white/88">{intro}</p>

						<Link
							href={`#${firstServiceId}`}
							variant="nav"
							className={cn(soundCtaClass, "mt-6 sm:mt-8")}
						>
							<span className="relative z-1">{cta}</span>
							<DirectionalIcon
								icon={ArrowRightIcon}
								className="relative z-1 size-4"
							/>
						</Link>
					</ServicesHeroBlock>
				</div>

				<ServicesHeroBlock>
					<ServicesNavCarousel
						items={navItems}
						navLabel={navLabel}
						direction={direction}
					/>
				</ServicesHeroBlock>
			</ServicesHeroMotion>
		</section>
	);
}
