import type { ComponentPropsWithoutRef } from "react";
import { DonateArchiveForm } from "@/components/donate/donate-archive-form";
import { DonateFinancialForm } from "@/components/donate/donate-financial-form";
import {
	HomeSection,
	homeSectionContentClass,
	homeSectionHeaderClass,
} from "@/components/donate/donate-shell";

type DonateFormsSectionProps = {
	eyebrow: string;
	heading: string;
	description: string;
	archiveCopy: ComponentPropsWithoutRef<typeof DonateArchiveForm>["copy"];
	financialCopy: ComponentPropsWithoutRef<typeof DonateFinancialForm>["copy"];
};

export function DonateFormsSection({
	eyebrow,
	heading,
	description,
	archiveCopy,
	financialCopy,
}: DonateFormsSectionProps) {
	return (
		<HomeSection aria-labelledby="donate-forms-heading">
			<header className={homeSectionHeaderClass}>
				<div className="max-w-2xl text-start">
					<p className="label font-medium">{eyebrow}</p>
					<h2
						id="donate-forms-heading"
						className="mt-2 font-heading text-h1 font-bold leading-[1.1] text-balance"
					>
						{heading}
					</h2>
					<p className="mt-3 text-body text-muted">{description}</p>
				</div>
			</header>

			<div className={homeSectionContentClass}>
				<div className="flex flex-col gap-10 sm:gap-12">
					<DonateArchiveForm copy={archiveCopy} />
					<DonateFinancialForm copy={financialCopy} />
				</div>
			</div>
		</HomeSection>
	);
}
