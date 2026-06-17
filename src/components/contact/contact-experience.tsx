"use client";

import { useState } from "react";
import { ContactMap } from "@/components/contact/contact-map";
import { ContactOfficeCard } from "@/components/contact/contact-office-card";
import {
	HomeSection,
	homeSectionContentClass,
	homeSectionHeaderClass,
} from "@/components/contact/contact-shell";
import type { ContactOffice, OfficeId } from "@/lib/mock/contact";

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
	offices: ContactOffice[];
	officeCopy: OfficeCopyBundle;
	officesEyebrow: string;
	officesHeading: string;
	officesDescription: string;
	selectLabel: string;
	fieldLabels: {
		address: string;
		phone: string;
		email: string;
	};
	badgeLabels: {
		hq: string;
		regional: string;
	};
	mapCopy: {
		heading: string;
		body: string;
		openInMaps: string;
		iframeTitle: string;
	};
};

export function ContactExperience({
	offices,
	officeCopy,
	officesEyebrow,
	officesHeading,
	officesDescription,
	selectLabel,
	fieldLabels,
	badgeLabels,
	mapCopy,
}: ContactExperienceProps) {
	const [selectedId, setSelectedId] = useState<OfficeId>("sulaymaniyah");
	const selectedOffice =
		offices.find((office) => office.id === selectedId) ?? offices[0];

	if (!selectedOffice) {
		return null;
	}

	return (
		<HomeSection aria-labelledby="contact-offices-heading">
			<header className={homeSectionHeaderClass}>
				<div className="max-w-2xl text-start">
					<p className="label font-medium">{officesEyebrow}</p>
					<h2
						id="contact-offices-heading"
						className="mt-2 font-heading text-h1 font-bold leading-[1.1] text-balance"
					>
						{officesHeading}
					</h2>
					{officesDescription ? (
						<p className="mt-3 text-body leading-relaxed text-muted">
							{officesDescription}
						</p>
					) : null}
				</div>
			</header>

			<div className={homeSectionContentClass}>
				<div className="overflow-hidden border border-border bg-surface">
					<div className="grid lg:grid-cols-2">
						{offices.map((office, index) => {
							const copy = officeCopy[office.id];
							return (
								<ContactOfficeCard
									key={office.id}
									office={office}
									isSelected={selectedId === office.id}
									onSelect={setSelectedId}
									className={
										index > 0 ? "lg:border-s lg:border-border" : undefined
									}
									copy={{
										name: copy.name,
										nameLatin: copy.nameLatin,
										subtitle: copy.subtitle,
										address: copy.address,
										badgeLabel: badgeLabels[office.badge],
										addressLabel: fieldLabels.address,
										phoneLabel: fieldLabels.phone,
										emailLabel: fieldLabels.email,
										selectLabel,
									}}
								/>
							);
						})}
					</div>
				</div>

				<ContactMap
					className="mt-10 sm:mt-12"
					office={selectedOffice}
					heading={mapCopy.heading}
					body={mapCopy.body}
					openInMapsLabel={mapCopy.openInMaps}
					iframeTitle={mapCopy.iframeTitle}
				/>
			</div>
		</HomeSection>
	);
}
