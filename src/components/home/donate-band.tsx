import { ArrowRightIcon } from "@heroicons/react/24/outline";
import NextImage from "next/image";
import { MediaMark } from "@/components/ui/media-mark";
import { getTranslations } from "next-intl/server";
import {
	ScrollReveal,
	ScrollRevealItem,
} from "@/components/motion/scroll-reveal";
import { viewAllCtaOnBrandClass } from "@/components/ui/cta-styles";
import { DirectionalIcon } from "@/components/ui/directional-icon";
import { Link } from "@/components/ui/link";
import { DONATE_HREF } from "@/config/site";
import { getDonateBandImageUrl } from "@/lib/api/site-settings";
import { cn } from "@/lib/utils";

/**
 * Full-bleed donate banner above the footer on the home page only: a slanted
 * brand-green panel beside a plain, untransformed archive photograph. The
 * panel's seam mirrors by `dir` (see `.footer-donate-cut` in globals.css) —
 * DOM order alone already flips the panel/photo sides correctly since
 * `flex-row` follows the inline-start direction. The photo carries NO
 * transform: any treatment is baked into the artwork by the designer.
 */
export async function DonateBand() {
	const t = await getTranslations("Footer");
	const imageUrl = await getDonateBandImageUrl();

	return (
		<section className="relative z-10 flex flex-col overflow-hidden bg-foreground sm:h-[15rem] sm:flex-row lg:h-[17rem] 2xl:h-[20rem]">
			<ScrollReveal className="footer-donate-cut relative z-10 flex flex-col justify-center gap-3 bg-brand px-6 py-8 text-start sm:w-[54%] sm:px-10 sm:py-0 lg:px-16 xl:px-20 2xl:w-[46%] 2xl:px-32">
				<ScrollRevealItem>
					<h2 className="max-w-lg text-balance font-heading text-[clamp(1.375rem,2.2vw,1.875rem)] font-bold leading-[1.2] text-white 2xl:max-w-2xl 2xl:text-[2.25rem]">
						{t("donateTitle")}
					</h2>
				</ScrollRevealItem>
				<ScrollRevealItem>
					<p className="max-w-md text-small leading-relaxed text-white/80 2xl:max-w-lg">
						{t("donateDescription")}
					</p>
				</ScrollRevealItem>
				<ScrollRevealItem>
					<Link
						href={DONATE_HREF}
						variant="nav"
						className={cn(viewAllCtaOnBrandClass, "mt-1")}
					>
						<span className="relative z-1">{t("donateCta")}</span>
						<DirectionalIcon
							icon={ArrowRightIcon}
							className="relative z-1 size-4"
						/>
					</Link>
				</ScrollRevealItem>
			</ScrollReveal>

			{/* No CMS photograph — the panel is dropped entirely rather than
			    framing an empty rectangle. The photograph is shown as the plain
			    rectangle it is: any treatment belongs to the artwork itself, so
			    the frame adds no skew, no overhang and no border. */}
			{imageUrl ? (
				<div
					// Slid under the panel by exactly the width of the wedge its
					// clip-path removes (8% of a 54% / 46% panel), so the diagonal
					// seam reveals the photograph rather than the section's black
					// ground. The panel's z-10 keeps the green painted on top.
					className="relative h-44 sm:-ms-[4.32%] sm:h-auto sm:flex-1 2xl:-ms-[3.68%]"
				>
					<NextImage
						src={imageUrl}
						alt=""
						fill
						sizes="(min-width: 1536px) 54vw, (min-width: 640px) 46vw, 100vw"
						quality={75}
						className="object-cover"
					/>
					<MediaMark />
				</div>
			) : null}
		</section>
	);
}
