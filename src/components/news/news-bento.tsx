import { NewsCard } from "@/components/home/news-card";
import {
	ScrollReveal,
	ScrollRevealBlock,
	ScrollRevealItem,
} from "@/components/motion/scroll-reveal";
import { NewsEditorialCard } from "@/components/news/news-editorial-card";
import { getBentoNews } from "@/lib/api/news";
import { homeInsetClass } from "@/lib/layout";
import {
	type NewsCategoryOption,
	newsItemCategoryLabel,
} from "@/lib/mock/news";
import { cn } from "@/lib/utils";

type NewsBentoProps = {
	locale: string;
	categories: NewsCategoryOption[];
	spotlightLabel: string;
	className?: string;
};

export async function NewsBento({
	locale,
	categories,
	spotlightLabel,
	className,
}: NewsBentoProps) {
	const { hero, rail, editorial, wide } = await getBentoNews(locale);

	if (!hero) {
		return null;
	}

	const showBottomRow = editorial != null || wide != null;

	return (
		<section
			className={cn(
				"w-full border-b border-border bg-background py-12 sm:py-16 lg:py-20",
				className,
			)}
			aria-labelledby="news-bento-heading"
		>
			<ScrollRevealBlock className={cn(homeInsetClass, "mb-8 sm:mb-10")}>
				<header>
					<h2
						id="news-bento-heading"
						className="font-heading text-h1 font-bold leading-[1.1] text-balance"
					>
						{spotlightLabel}
					</h2>
				</header>
			</ScrollRevealBlock>

			<div className={homeInsetClass}>
				<ScrollReveal className="grid grid-cols-1 gap-3 sm:gap-4 sm:grid-cols-2 lg:grid-cols-12 lg:grid-rows-[minmax(18rem,1fr)_minmax(18rem,1fr)] lg:gap-4">
					<ScrollRevealItem className="sm:col-span-2 lg:col-span-7 lg:row-span-2">
						<NewsCard
							item={hero}
							variant="featured"
							categoryLabel={newsItemCategoryLabel(hero, categories)}
							className="h-full"
						/>
					</ScrollRevealItem>

					{rail.length > 0 ? (
						<ScrollRevealItem className="lg:col-span-5 lg:row-span-2">
							<ScrollReveal className="grid h-full grid-cols-2 gap-3 sm:gap-4 lg:grid-rows-2">
								{rail.map((item) => (
									<ScrollRevealItem key={item.id}>
										<NewsCard
											item={item}
											variant="small"
											categoryLabel={newsItemCategoryLabel(item, categories)}
										/>
									</ScrollRevealItem>
								))}
							</ScrollReveal>
						</ScrollRevealItem>
					) : null}
				</ScrollReveal>

				{showBottomRow ? (
					<ScrollReveal className="mt-3 grid grid-cols-1 gap-3 sm:mt-4 sm:grid-cols-2 sm:gap-4 lg:grid-cols-12 lg:gap-4">
						{editorial ? (
							<ScrollRevealItem className="sm:col-span-2 lg:col-span-5">
								<NewsEditorialCard
									item={editorial}
									categoryLabel={newsItemCategoryLabel(editorial, categories)}
								/>
							</ScrollRevealItem>
						) : null}

						{wide ? (
							<ScrollRevealItem
								className={cn(
									"sm:col-span-2",
									editorial ? "lg:col-span-7" : "lg:col-span-12",
								)}
							>
								<NewsCard
									item={wide}
									variant="wide"
									categoryLabel={newsItemCategoryLabel(wide, categories)}
								/>
							</ScrollRevealItem>
						) : null}
					</ScrollReveal>
				) : null}
			</div>
		</section>
	);
}
