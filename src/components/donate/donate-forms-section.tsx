import type { ComponentPropsWithoutRef } from "react";
import { DonateArchiveForm } from "@/components/donate/donate-archive-form";
import { DonateFinancialForm } from "@/components/donate/donate-financial-form";
import {
	HomeSection,
	homeSectionContentClass,
	homeSectionHeaderClass,
} from "@/components/donate/donate-shell";
import {
	ScrollReveal,
	ScrollRevealBlock,
	ScrollRevealItem,
} from "@/components/motion/scroll-reveal";

type DonateFormsSectionProps = {
	heading: string;
	description: string;
	showArchive?: boolean;
	showFinancial?: boolean;
	archiveCopy: ComponentPropsWithoutRef<typeof DonateArchiveForm>["copy"];
	financialCopy: ComponentPropsWithoutRef<typeof DonateFinancialForm>["copy"];
};

export function DonateFormsSection({
	heading,
	description,
	showArchive = true,
	showFinancial = true,
	archiveCopy,
	financialCopy,
}: DonateFormsSectionProps) {
	if (!showArchive && !showFinancial) {
		return null;
	}
	return (
		<HomeSection aria-labelledby="donate-forms-heading">
			<ScrollRevealBlock className={homeSectionHeaderClass}>
				<header className="max-w-2xl text-start">
					<h2
						id="donate-forms-heading"
						className="font-heading text-h1 font-bold leading-[1.1] text-balance"
					>
						{heading}
					</h2>
					{description ? (
						<p className="mt-3 text-body text-muted">{description}</p>
					) : null}
				</header>
			</ScrollRevealBlock>

			<div className={homeSectionContentClass}>
				<ScrollReveal className="flex flex-col gap-10 sm:gap-12">
					{showArchive ? (
						<ScrollRevealItem>
							<DonateArchiveForm copy={archiveCopy} />
						</ScrollRevealItem>
					) : null}
					{showFinancial ? (
						<ScrollRevealItem>
							<DonateFinancialForm copy={financialCopy} />
						</ScrollRevealItem>
					) : null}
				</ScrollReveal>
			</div>
		</HomeSection>
	);
}
