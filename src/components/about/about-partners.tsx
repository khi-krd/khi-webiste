import { AboutSection, AboutShell } from "@/components/about/about-shell";
import { PartnerCard } from "@/components/about/partner-card";
import { SectionRuleHeading } from "@/components/about/section-rule-heading";
import type { PartnerItem } from "@/lib/mock/about";

type PartnerCopy = {
	eyebrow: string;
	title: string;
	description: string;
	cta: string;
};

type AboutPartnersProps = {
	partners: PartnerItem[];
	sectionTitle: string;
	getPartnerCopy: (id: string) => PartnerCopy;
	className?: string;
};

export function AboutPartners({
	partners,
	sectionTitle,
	getPartnerCopy,
	className,
}: AboutPartnersProps) {
	return (
		<AboutSection
			bordered
			className={className}
			aria-labelledby="partners-heading"
		>
			<AboutShell>
				<SectionRuleHeading id="partners-heading" title={sectionTitle} />

				<div className="mt-6 grid gap-3 sm:mt-8 sm:grid-cols-2 sm:gap-4 lg:gap-5">
					{partners.map((partner) => {
						const copy = getPartnerCopy(partner.id);
						return (
							<PartnerCard
								key={partner.id}
								item={partner}
								eyebrow={copy.eyebrow}
								title={copy.title}
								description={copy.description}
								cta={copy.cta}
							/>
						);
					})}
				</div>
			</AboutShell>
		</AboutSection>
	);
}
