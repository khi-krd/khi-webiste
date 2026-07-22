import NextImage from "next/image";
import { DonateHeroContent } from "@/components/donate/donate-hero-content";
import type { DonateHeroMedia } from "@/lib/mock/donate";
import { cn } from "@/lib/utils";

type DonateHeroProps = {
	heroMedia: DonateHeroMedia;
	eyebrow: string;
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
	eyebrow,
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
				"relative w-full overflow-hidden border-b border-border min-h-[68svh] sm:min-h-[72svh]",
				className,
			)}
		>
			<div className="absolute inset-0 isolate">
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

			<div className="relative z-10 flex min-h-[68svh] flex-col justify-end px-6 pb-14 sm:min-h-[72svh] sm:px-10 sm:pb-16 lg:px-14 lg:pb-20">
				<DonateHeroContent
					eyebrow={eyebrow}
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
