import { NewsCard } from "@/components/home/news-card";
import {
	ScrollReveal,
	ScrollRevealBlock,
	ScrollRevealItem,
} from "@/components/motion/scroll-reveal";
import { NewsEditorialCard } from "@/components/news/news-editorial-card";
import { getBentoNews, type NewsCategory } from "@/lib/api/news";
import { homeInsetClass } from "@/lib/layout";
import { cn } from "@/lib/utils";

type NewsBentoProps = {
	locale: string;
	categoryLabels: Record<NewsCategory, string>;
	spotlightLabel: string;
	className?: string;
};

export async function NewsBento({
	locale,
	categoryLabels,
	spotlightLabel,
	className,
}: NewsBentoProps) {
	const { hero, rail, editorial, wide } = await getBentoNews(locale);

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
				<ScrollReveal className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-12 lg:grid-rows-[minmax(18rem,1fr)_minmax(18rem,1fr)] lg:gap-4">
					<ScrollRevealItem className="sm:col-span-2 lg:col-span-7 lg:row-span-2">
						<NewsCard
							item={hero}
							variant="featured"
							categoryLabel={categoryLabels[hero.category]}
							className="h-full"
						/>
					</ScrollRevealItem>

					<ScrollRevealItem className="lg:col-span-5 lg:row-span-2">
						<ScrollReveal className="grid h-full grid-cols-2 gap-3 sm:gap-4 lg:grid-rows-2">
							{rail.map((item) => (
								<ScrollRevealItem key={item.id}>
									<NewsCard
										item={item}
										variant="small"
										categoryLabel={categoryLabels[item.category]}
									/>
								</ScrollRevealItem>
							))}
						</ScrollReveal>
					</ScrollRevealItem>
				</ScrollReveal>

				<ScrollReveal className="mt-3 grid grid-cols-1 gap-3 sm:mt-4 sm:grid-cols-2 sm:gap-4 lg:grid-cols-12 lg:gap-4">
					<ScrollRevealItem className="sm:col-span-2 lg:col-span-5">
						<NewsEditorialCard
							item={editorial}
							categoryLabel={categoryLabels[editorial.category]}
						/>
					</ScrollRevealItem>

					<ScrollRevealItem className="sm:col-span-2 lg:col-span-7">
						<NewsCard
							item={wide}
							variant="wide"
							categoryLabel={categoryLabels[wide.category]}
						/>
					</ScrollRevealItem>
				</ScrollReveal>
			</div>
		</section>
	);
}
