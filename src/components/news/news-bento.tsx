import { NewsCard } from "@/components/home/news-card";
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
			<header className={cn(homeInsetClass, "mb-8 sm:mb-10")}>
				<h2
					id="news-bento-heading"
					className="font-heading text-h1 font-bold leading-[1.1] text-balance"
				>
					{spotlightLabel}
				</h2>
			</header>

			<div className={homeInsetClass}>
				{/* Row 1–2: same mosaic as homepage Latest Updates */}
				<div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-12 lg:grid-rows-[minmax(18rem,1fr)_minmax(18rem,1fr)] lg:gap-4">
					<NewsCard
						item={hero}
						variant="featured"
						categoryLabel={categoryLabels[hero.category]}
						className="sm:col-span-2 lg:col-span-7 lg:row-span-2"
					/>

					<div className="grid grid-cols-2 gap-3 sm:gap-4 lg:col-span-5 lg:row-span-2 lg:grid-rows-2">
						{rail.map((item) => (
							<NewsCard
								key={item.id}
								item={item}
								variant="small"
								categoryLabel={categoryLabels[item.category]}
							/>
						))}
					</div>
				</div>

				{/* Row 3: editorial accent + wide */}
				<div className="mt-3 grid grid-cols-1 gap-3 sm:mt-4 sm:grid-cols-2 sm:gap-4 lg:grid-cols-12 lg:gap-4">
					<NewsEditorialCard
						item={editorial}
						categoryLabel={categoryLabels[editorial.category]}
						className="sm:col-span-2 lg:col-span-5"
					/>

					<NewsCard
						item={wide}
						variant="wide"
						categoryLabel={categoryLabels[wide.category]}
						className="sm:col-span-2 lg:col-span-7"
					/>
				</div>
			</div>
		</section>
	);
}
