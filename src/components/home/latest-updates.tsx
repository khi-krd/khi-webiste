import { ArrowRightIcon } from "@heroicons/react/24/outline";
import { getLocale, getTranslations } from "next-intl/server";
import { NewsCard } from "@/components/home/news-card";
import {
	ScrollReveal,
	ScrollRevealBlock,
	ScrollRevealItem,
} from "@/components/motion/scroll-reveal";
import { viewAllCtaClass } from "@/components/ui/cta-styles";
import { DirectionalIcon } from "@/components/ui/directional-icon";
import { Link } from "@/components/ui/link";
import { getLatestUpdates } from "@/lib/api/news";
import type {
	LatestUpdateCategory,
	LatestUpdateItem,
} from "@/lib/mock/latest-updates";

function getCategoryLabel(
	t: Awaited<ReturnType<typeof getTranslations>>,
	category: LatestUpdateCategory,
): string {
	return t(`categories.${category}`);
}

function dedupeLatestUpdates(items: LatestUpdateItem[]): LatestUpdateItem[] {
	const seen = new Set<string>();
	const result: LatestUpdateItem[] = [];

	for (const item of items) {
		if (seen.has(item.id)) {
			continue;
		}
		seen.add(item.id);
		result.push(item);
	}

	return result;
}

export async function LatestUpdates() {
	const locale = await getLocale();
	const t = await getTranslations("LatestUpdates");
	const items = dedupeLatestUpdates(await getLatestUpdates(locale));

	if (items.length === 0) {
		return null;
	}

	const [hero, ...rest] = items;
	const rail = rest.slice(0, 4);
	const overflow = rest.slice(4, 6);

	return (
		<section
			// Fills one viewport so the home page's section snap lands on the whole
			// block — never on a seam with the section below.
			className="cv-auto flex min-h-svh w-full flex-col justify-center bg-background py-12 [--cv-intrinsic:100svh] sm:py-16 lg:py-20"
			aria-labelledby="latest-updates-heading"
		>
			<ScrollRevealBlock className="mb-8 px-6 sm:mb-10 sm:px-8">
				<header>
					<div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between sm:gap-8">
						<div className="max-w-2xl text-start">
							<h2
								id="latest-updates-heading"
								className="font-heading text-h1 font-bold leading-[1.1] text-balance"
							>
								{t("title")}
							</h2>
						</div>

						<Link href="/news" variant="nav" className={viewAllCtaClass}>
							<span className="relative z-1">{t("viewAll")}</span>
							<DirectionalIcon
								icon={ArrowRightIcon}
								className="relative z-1 size-4"
							/>
						</Link>
					</div>
				</header>
			</ScrollRevealBlock>

			<div className="px-6 sm:px-8">
				<ScrollReveal className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-12 lg:grid-rows-[minmax(18rem,1fr)_minmax(18rem,1fr)] lg:gap-4">
					{hero ? (
						<ScrollRevealItem className="sm:col-span-2 lg:col-span-7 lg:row-span-2">
							<NewsCard
								item={hero}
								variant="featured"
								categoryLabel={getCategoryLabel(t, hero.category)}
								overlayTone="light"
								className="h-full"
							/>
						</ScrollRevealItem>
					) : null}

					{rail.length > 0 ? (
						<ScrollRevealItem className="lg:col-span-5 lg:row-span-2">
							<ScrollReveal className="grid h-full grid-cols-2 gap-3 sm:gap-4 lg:grid-rows-2">
								{rail.map((item) => (
									<ScrollRevealItem key={item.id}>
										<NewsCard
											item={item}
											variant="small"
											categoryLabel={getCategoryLabel(t, item.category)}
											overlayTone="light"
										/>
									</ScrollRevealItem>
								))}
							</ScrollReveal>
						</ScrollRevealItem>
					) : null}

					{overflow[0] ? (
						<ScrollRevealItem className="sm:col-span-1 lg:hidden">
							<NewsCard
								item={overflow[0]}
								variant="medium"
								categoryLabel={getCategoryLabel(t, overflow[0].category)}
								overlayTone="light"
							/>
						</ScrollRevealItem>
					) : null}
					{overflow[1] ? (
						<ScrollRevealItem className="sm:col-span-2 lg:hidden">
							<NewsCard
								item={overflow[1]}
								variant="wide"
								categoryLabel={getCategoryLabel(t, overflow[1].category)}
								overlayTone="light"
							/>
						</ScrollRevealItem>
					) : null}
				</ScrollReveal>
			</div>
		</section>
	);
}
