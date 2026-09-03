import {
	HomeSection,
	homeSectionContentClass,
	homeSectionHeaderClass,
} from "@/components/donate/donate-shell";
import { DonateTypeCard } from "@/components/donate/donate-type-card";
import {
	ScrollReveal,
	ScrollRevealBlock,
	ScrollRevealItem,
} from "@/components/motion/scroll-reveal";
import type { DonateTypeCardData } from "@/lib/donate/content";
import { cn } from "@/lib/utils";

type DonateTypesGridProps = {
	eyebrow?: string;
	heading: string;
	description?: string;
	/** Resolved cards, in draw order — the first one is the big featured card. */
	items: DonateTypeCardData[];
};

export function DonateTypesGrid({
	eyebrow,
	heading,
	description,
	items,
}: DonateTypesGridProps) {
	const [featured, ...rail] = items;

	return (
		<HomeSection aria-labelledby="donate-types-heading">
			<ScrollRevealBlock className={homeSectionHeaderClass}>
				<header>
					<div className="max-w-2xl text-start">
						{eyebrow ? <p className="label font-medium">{eyebrow}</p> : null}
						<h2
							id="donate-types-heading"
							className={cn(
								"font-heading text-h1 font-bold leading-[1.1] text-balance",
								eyebrow ? "mt-2" : undefined,
							)}
						>
							{heading}
						</h2>
						{description ? (
							<p className="mt-3 text-body text-muted">{description}</p>
						) : null}
					</div>
				</header>
			</ScrollRevealBlock>

			<div className={homeSectionContentClass}>
				<ScrollReveal className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-12 lg:grid-rows-[minmax(18rem,1fr)_minmax(18rem,1fr)] lg:gap-4">
					{featured ? (
						<ScrollRevealItem className="sm:col-span-2 lg:col-span-7 lg:row-span-2">
							<DonateTypeCard
								index={String(featured.index).padStart(2, "0")}
								title={featured.title}
								description={featured.description}
								image={featured.image}
								variant="featured"
								className="h-full"
							/>
						</ScrollRevealItem>
					) : null}

					<ScrollRevealItem className="lg:col-span-5 lg:row-span-2">
						<ScrollReveal className="grid h-full grid-cols-2 gap-3 sm:gap-4 lg:grid-rows-2">
							{rail.map((item) => (
								<ScrollRevealItem key={item.id}>
									<DonateTypeCard
										index={String(item.index).padStart(2, "0")}
										title={item.title}
										description={item.description}
										image={item.image}
										variant="small"
									/>
								</ScrollRevealItem>
							))}
						</ScrollReveal>
					</ScrollRevealItem>
				</ScrollReveal>
			</div>
		</HomeSection>
	);
}
