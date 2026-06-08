import {
	HomeSection,
	homeSectionContentClass,
	homeSectionHeaderClass,
} from "@/components/donate/donate-shell";
import { DonateTypeCard } from "@/components/donate/donate-type-card";
import type { DonateTypeItem } from "@/lib/mock/donate";
import { cn } from "@/lib/utils";

type DonateTypesGridProps = {
	eyebrow?: string;
	heading: string;
	description?: string;
	items: DonateTypeItem[];
	getItemCopy: (id: DonateTypeItem["id"]) => {
		title: string;
		description: string;
	};
};

export function DonateTypesGrid({
	eyebrow,
	heading,
	description,
	items,
	getItemCopy,
}: DonateTypesGridProps) {
	const [featured, ...rail] = items;

	return (
		<HomeSection aria-labelledby="donate-types-heading">
			<header className={homeSectionHeaderClass}>
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

			<div className={homeSectionContentClass}>
				<div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-12 lg:grid-rows-[minmax(18rem,1fr)_minmax(18rem,1fr)] lg:gap-4">
					{featured ? (
						<DonateTypeCard
							index={String(featured.index).padStart(2, "0")}
							title={getItemCopy(featured.id).title}
							description={getItemCopy(featured.id).description}
							image={featured.image}
							variant="featured"
							className="sm:col-span-2 lg:col-span-7 lg:row-span-2"
						/>
					) : null}

					<div className="grid grid-cols-2 gap-3 sm:gap-4 lg:col-span-5 lg:row-span-2 lg:grid-rows-2">
						{rail.map((item) => (
							<DonateTypeCard
								key={item.id}
								index={String(item.index).padStart(2, "0")}
								title={getItemCopy(item.id).title}
								description={getItemCopy(item.id).description}
								image={item.image}
								variant="small"
							/>
						))}
					</div>
				</div>
			</div>
		</HomeSection>
	);
}
