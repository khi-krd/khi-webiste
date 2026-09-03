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

type DonateTypesGridProps = {
	heading: string;
	/** Resolved cards, in draw order. Every card is drawn at the same size. */
	items: DonateTypeCardData[];
};

export function DonateTypesGrid({ heading, items }: DonateTypesGridProps) {
	return (
		<HomeSection aria-labelledby="donate-types-heading">
			<ScrollRevealBlock className={homeSectionHeaderClass}>
				<header className="max-w-2xl text-start">
					<h2
						id="donate-types-heading"
						className="font-heading text-h1 font-bold leading-[1.1] text-balance"
					>
						{heading}
					</h2>
				</header>
			</ScrollRevealBlock>

			<div className={homeSectionContentClass}>
				{/* One size for every block. The layout used to promote item 1 into a
				    half-width hero and shrink the rest into a 2x2 rail, which made the
				    set read as "one important thing plus leftovers" and left the small
				    cards too short for their titles. Every donation type is equal, so
				    every tile is now the same 4:3 box. */}
				<ScrollReveal className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-3">
					{items.map((item) => (
						<ScrollRevealItem key={item.id} className="aspect-[4/3]">
							<DonateTypeCard
								index={String(item.index).padStart(2, "0")}
								title={item.title}
								description={item.description}
								image={item.image}
								className="h-full"
							/>
						</ScrollRevealItem>
					))}
				</ScrollReveal>
			</div>
		</HomeSection>
	);
}
