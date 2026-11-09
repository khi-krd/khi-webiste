"use client";

import { ArrowRightIcon } from "@heroicons/react/24/outline";
import {
	ScrollReveal,
	ScrollRevealItem,
} from "@/components/motion/scroll-reveal";
import { viewAllCtaOnDarkClass } from "@/components/ui/cta-styles";
import { DirectionalIcon } from "@/components/ui/directional-icon";
import { Link } from "@/components/ui/link";

type DonateHeroContentProps = {
	title: string;
	intro: string;
	ctaArchive: string;
	ctaFinancial: string;
	showArchiveCta?: boolean;
	showFinancialCta?: boolean;
};

export function DonateHeroContent({
	title,
	intro,
	ctaArchive,
	ctaFinancial,
	showArchiveCta = true,
	showFinancialCta = true,
}: DonateHeroContentProps) {
	return (
		<ScrollReveal className="max-w-4xl text-start text-white">
			<ScrollRevealItem>
				<h2 id="donate-hero-heading" className="hero-slide-title">
					{title}
				</h2>
			</ScrollRevealItem>
			<ScrollRevealItem>
				<p className="hero-slide-description donate-hero-description mt-5 max-w-2xl whitespace-pre-line">
					{intro}
				</p>
			</ScrollRevealItem>
			{showArchiveCta || showFinancialCta ? (
				<ScrollRevealItem>
					<div className="mt-8 flex flex-wrap gap-3">
						{showArchiveCta ? (
							<Link
								href="#archive-form"
								variant="nav"
								className={viewAllCtaOnDarkClass}
							>
								<span className="relative z-1">{ctaArchive}</span>
								<DirectionalIcon
									icon={ArrowRightIcon}
									className="relative z-1 size-4"
								/>
							</Link>
						) : null}
						{showFinancialCta ? (
							<Link
								href="#financial-form"
								variant="nav"
								className={viewAllCtaOnDarkClass}
							>
								<span className="relative z-1">{ctaFinancial}</span>
								<DirectionalIcon
									icon={ArrowRightIcon}
									className="relative z-1 size-4"
								/>
							</Link>
						) : null}
					</div>
				</ScrollRevealItem>
			) : null}
		</ScrollReveal>
	);
}
