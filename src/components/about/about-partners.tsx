import { AboutSection, AboutShell } from "@/components/about/about-shell";
import { PartnerCard } from "@/components/about/partner-card";
import { SectionRuleHeading } from "@/components/about/section-rule-heading";
import {
	ScrollReveal,
	ScrollRevealBlock,
	ScrollRevealItem,
} from "@/components/motion/scroll-reveal";
import type { PartnerItem } from "@/lib/mock/about";

type PartnerCopy = {
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
				<ScrollRevealBlock>
					<SectionRuleHeading id="partners-heading" title={sectionTitle} />
				</ScrollRevealBlock>

				<ScrollReveal className="mt-6 grid gap-3 sm:mt-8 sm:grid-cols-2 sm:gap-4 lg:gap-5">
					{partners.map((partner) => {
						const copy = getPartnerCopy(partner.id);
						return (
							<ScrollRevealItem key={partner.id} className="h-full">
								<PartnerCard
									item={partner}
									title={copy.title}
									description={copy.description}
									cta={copy.cta}
								/>
							</ScrollRevealItem>
						);
					})}
				</ScrollReveal>
			</AboutShell>
		</AboutSection>
	);
}
