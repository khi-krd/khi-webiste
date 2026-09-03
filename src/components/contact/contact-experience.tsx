"use client";

import { useState } from "react";
import { ContactMap } from "@/components/contact/contact-map";
import { ContactOfficeCard } from "@/components/contact/contact-office-card";
import {
	HomeSection,
	homeSectionContentClass,
	homeSectionHeaderClass,
} from "@/components/contact/contact-shell";
import { ScrollRevealBlock } from "@/components/motion/scroll-reveal";
import type { ResolvedContactOffice } from "@/lib/contact/resolve";
import type { OfficeId } from "@/lib/mock/contact";

type OfficeCopyBundle = Record<
	OfficeId,
	{
		name: string;
		nameLatin: string;
		subtitle?: string;
		address: string;
	}
>;

type ContactExperienceProps = {
	offices: ResolvedContactOffice[];
	officeCopy: OfficeCopyBundle;
	officesHeading: string;
	officesDescription: string;
	fieldLabels: {
		address: string;
		workingHours: string;
		phone: string;
		email: string;
	};
	mapCopy: {
		heading: string;
		body: string;
		openInMaps: string;
		iframeTitle: string;
		selectOffice: string;
	};
};

export function ContactExperience({
	offices,
	officeCopy,
	officesHeading,
	officesDescription,
	fieldLabels,
	mapCopy,
}: ContactExperienceProps) {
	const [selectedId, setSelectedId] = useState<OfficeId | null>(null);
	const selectedOffice =
		offices.find((office) => office.id === selectedId) ?? offices[0];

	if (!selectedOffice) {
		return null;
	}

	// The card used to be one big <button>, which put <a href="tel:…"> inside a
	// button — invalid HTML, and it made the whole card a click target whose only
	// effect was scrolling a map further down. Choosing an office now lives on the
	// map itself, where the result of the choice is visible.
	const cards = offices.flatMap((office) => {
		const localized = office.localizedCopy;
		const fallback = officeCopy[office.id];
		// CMS copy wins; the bundled copy is the fallback and carries no hours.
		const copy = localized?.address ? localized : fallback;
		if (!copy) {
			return [];
		}
		return [
			{
				office,
				name: copy.name,
				nameLatin: copy.nameLatin,
				subtitle: copy.subtitle,
				address: copy.address,
				workingHours: localized?.address ? localized.workingHours : undefined,
			},
		];
	});

	return (
		<HomeSection divider={false} aria-labelledby="contact-offices-heading">
			<ScrollRevealBlock className={homeSectionHeaderClass}>
				<header className="max-w-2xl text-start">
					<h2
						id="contact-offices-heading"
						className="font-heading text-h1 font-bold leading-[1.1] text-balance"
					>
						{officesHeading}
					</h2>
					{officesDescription ? (
						<p className="mt-3 text-body leading-relaxed text-muted">
							{officesDescription}
						</p>
					) : null}
				</header>
			</ScrollRevealBlock>

			<div className={homeSectionContentClass}>
				<ScrollRevealBlock>
					<div className="overflow-hidden border border-border bg-surface">
						<div className="grid lg:grid-cols-2">
							{cards.map((entry, index) => (
								<ContactOfficeCard
									key={entry.office.id}
									office={entry.office}
									className={
										index > 0
											? "border-t border-border lg:border-t-0 lg:border-s"
											: undefined
									}
									copy={{
										name: entry.name,
										nameLatin: entry.nameLatin,
										subtitle: entry.subtitle,
										address: entry.address,
										workingHours: entry.workingHours,
										addressLabel: fieldLabels.address,
										workingHoursLabel: fieldLabels.workingHours,
										phoneLabel: fieldLabels.phone,
										emailLabel: fieldLabels.email,
									}}
								/>
							))}
						</div>
					</div>
				</ScrollRevealBlock>

				<ScrollRevealBlock className="mt-10 sm:mt-12">
					<ContactMap
						office={selectedOffice}
						heading={mapCopy.heading}
						body={mapCopy.body}
						openInMapsLabel={mapCopy.openInMaps}
						iframeTitle={mapCopy.iframeTitle}
						selectOfficeLabel={mapCopy.selectOffice}
						onSelect={setSelectedId}
						options={cards.map((entry) => ({
							id: entry.office.id,
							label: entry.name,
						}))}
					/>
				</ScrollRevealBlock>
			</div>
		</HomeSection>
	);
}
