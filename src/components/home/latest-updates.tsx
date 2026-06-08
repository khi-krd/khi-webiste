import { ArrowRightIcon } from "@heroicons/react/24/outline";
import { getLocale, getTranslations } from "next-intl/server";
import { NewsCard } from "@/components/home/news-card";
import { DirectionalIcon } from "@/components/ui/directional-icon";
import { Link } from "@/components/ui/link";
import {
	getLatestUpdates,
	type LatestUpdateCategory,
} from "@/lib/mock/latest-updates";

function getCategoryLabel(
	t: Awaited<ReturnType<typeof getTranslations>>,
	category: LatestUpdateCategory,
): string {
	return t(`categories.${category}`);
}

export async function LatestUpdates() {
	const locale = await getLocale();
	const t = await getTranslations("LatestUpdates");
	const items = getLatestUpdates(locale);

	const [
		hero,
		railA,
		railB,
		railC,
		railD,
		overflowA,
		overflowB,
	] = items;

	return (
		<section
			className="w-full bg-background py-12 sm:py-16 lg:py-20"
			aria-labelledby="latest-updates-heading"
		>
			<header className="mb-8 px-6 sm:mb-10 sm:px-8">
				<div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between sm:gap-8">
					<div className="max-w-2xl text-start">
						<h2
							id="latest-updates-heading"
							className="font-heading text-h1 font-bold leading-[1.1] text-balance"
						>
							{t("title")}
						</h2>
						<p className="mt-3 text-body text-muted">{t("description")}</p>
					</div>

					<Link
						href="/articles"
						variant="nav"
						className="group/viewall relative inline-flex w-fit shrink-0 items-center gap-2.5 overflow-hidden border border-foreground px-5 py-2.5 font-heading text-small font-semibold text-foreground no-underline transition-[color,gap,box-shadow] duration-300 ease-out before:absolute before:inset-0 before:z-0 before:origin-bottom before:scale-y-0 before:bg-foreground before:transition-transform before:duration-300 before:ease-[cubic-bezier(0.22,1,0.36,1)] hover:gap-3.5 hover:text-primary-foreground hover:shadow-[0_8px_24px_-12px_rgba(26,24,19,0.35)] hover:before:scale-y-100 motion-reduce:before:transition-none motion-reduce:hover:before:scale-y-100 motion-reduce:hover:gap-2.5"
					>
						<span className="relative z-1">{t("viewAll")}</span>
						<DirectionalIcon
							icon={ArrowRightIcon}
							className="relative z-1 size-4"
						/>
					</Link>
				</div>
			</header>

			<div className="px-6 sm:px-8">
				<div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-12 lg:grid-rows-[minmax(18rem,1fr)_minmax(18rem,1fr)] lg:gap-4">
					<NewsCard
						item={hero}
						variant="featured"
						categoryLabel={getCategoryLabel(t, hero.category)}
						className="sm:col-span-2 lg:col-span-7 lg:row-span-2"
					/>

					<div className="grid grid-cols-2 gap-3 sm:gap-4 lg:col-span-5 lg:row-span-2 lg:grid-rows-2">
						<NewsCard
							item={railA}
							variant="small"
							categoryLabel={getCategoryLabel(t, railA.category)}
						/>
						<NewsCard
							item={railB}
							variant="small"
							categoryLabel={getCategoryLabel(t, railB.category)}
						/>
						<NewsCard
							item={railC}
							variant="small"
							categoryLabel={getCategoryLabel(t, railC.category)}
						/>
						<NewsCard
							item={railD}
							variant="small"
							categoryLabel={getCategoryLabel(t, railD.category)}
						/>
					</div>

					<NewsCard
						item={overflowA}
						variant="medium"
						categoryLabel={getCategoryLabel(t, overflowA.category)}
						className="sm:col-span-1 lg:hidden"
					/>
					<NewsCard
						item={overflowB}
						variant="wide"
						categoryLabel={getCategoryLabel(t, overflowB.category)}
						className="sm:col-span-2 lg:hidden"
					/>
				</div>
			</div>
		</section>
	);
}
