import { AboutSection, AboutShell } from "@/components/about/about-shell";
import { PartnerCard } from "@/components/about/partner-card";
import { ServicesReveal } from "@/components/services/services-motion";
import type { PartnerItem } from "@/lib/mock/about";

type BottomCardCopy = {
	eyebrow: string;
	title: string;
	description: string;
	cta: string;
};

type BottomCardItem = {
	card: PartnerItem;
	copy: BottomCardCopy;
};

type ServicesBottomCardsProps = {
	items: BottomCardItem[];
	className?: string;
};

export function ServicesBottomCards({
	items,
	className,
}: ServicesBottomCardsProps) {
	return (
		<AboutSection bordered className={className}>
			<AboutShell>
				<div className="grid gap-3 sm:grid-cols-2 sm:gap-4 lg:gap-5">
					{items.map(({ card, copy }, index) => (
						<ServicesReveal key={card.id} delay={index * 0.08}>
							<PartnerCard
								item={card}
								eyebrow={copy.eyebrow}
								title={copy.title}
								description={copy.description}
								cta={copy.cta}
							/>
						</ServicesReveal>
					))}
				</div>
			</AboutShell>
		</AboutSection>
	);
}
