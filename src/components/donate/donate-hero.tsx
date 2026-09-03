import NextImage from "next/image";
import { DonateHeroContent } from "@/components/donate/donate-hero-content";
import type { DonateHeroMedia } from "@/lib/donate/content";
import { cn } from "@/lib/utils";

type DonateHeroProps = {
	heroMedia: DonateHeroMedia;
	title: string;
	intro: string;
	ctaArchive: string;
	ctaFinancial: string;
	showArchiveCta?: boolean;
	showFinancialCta?: boolean;
	className?: string;
};

export function DonateHero({
	heroMedia,
	title,
	intro,
	ctaArchive,
	ctaFinancial,
	showArchiveCta = true,
	showFinancialCta = true,
	className,
}: DonateHeroProps) {
	return (
		<section
			aria-labelledby="donate-hero-heading"
			className={cn(
				"relative w-full overflow-hidden border-b border-border min-h-[68svh] sm:min-h-[72svh] 2xl:min-h-[min(72svh,52rem)]",
				className,
			)}
		>
			<div className="absolute inset-0 isolate">
				{/* No picture in the CMS — the gradients carry the hero on a solid
				    ground, rather than an <img> with an empty src. */}
				{heroMedia.url ? (
					<div className="absolute inset-0 [&_img]:h-full [&_img]:w-full [&_img]:object-cover [&_img]:brightness-[0.72] [&_img]:contrast-[1.12] [&_img]:saturate-[0.58]">
						<NextImage
							src={heroMedia.url}
							alt={heroMedia.alt ?? ""}
							fill
							sizes="100vw"
							priority
							className="object-cover"
						/>
					</div>
				) : (
					<div className="absolute inset-0 bg-foreground" aria-hidden />
				)}

				<div
					className="pointer-events-none absolute inset-0 z-1 bg-foreground/45"
					aria-hidden
				/>
				<div
					className="pointer-events-none absolute inset-0 z-1 bg-linear-to-t from-foreground from-0% via-foreground/80 via-32% to-transparent to-72%"
					aria-hidden
				/>
				<div
					className="pointer-events-none absolute inset-x-0 top-0 z-1 h-44 bg-linear-to-b from-foreground/85 via-foreground/35 to-transparent sm:h-52"
					aria-hidden
				/>
				<div
					className="pointer-events-none absolute inset-0 z-1 bg-linear-to-r from-foreground/75 from-0% via-foreground/40 via-42% to-transparent to-80% rtl:bg-linear-to-l"
					aria-hidden
				/>
				<div
					className="pointer-events-none absolute inset-0 z-1 bg-[radial-gradient(ellipse_130%_90%_at_50%_115%,var(--color-foreground)_0%,transparent_62%)] opacity-70"
					aria-hidden
				/>
			</div>

			{/* 2xl: height stops tracking svh so the text block keeps its 1440 share of the
			    frame, and padding grows to the shared 96rem canvas inset (+1.5rem, matching
			    lg:px-14 vs px-8 below; calc equals 3.5rem exactly at 1536px). */}
			<div className="relative z-10 flex min-h-[68svh] flex-col justify-end px-6 pb-14 sm:min-h-[72svh] sm:px-10 sm:pb-16 lg:px-14 lg:pb-20 2xl:min-h-[min(72svh,52rem)] 2xl:px-[calc((100vw-var(--canvas))/2+3.5rem)] 2xl:pb-24">
				<DonateHeroContent
					title={title}
					intro={intro}
					ctaArchive={ctaArchive}
					ctaFinancial={ctaFinancial}
					showArchiveCta={showArchiveCta}
					showFinancialCta={showFinancialCta}
				/>
			</div>
		</section>
	);
}
