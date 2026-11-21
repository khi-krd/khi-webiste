import { ArrowRightIcon } from "@heroicons/react/24/outline";
import { getLocale, getTranslations } from "next-intl/server";
import type { CSSProperties } from "react";
import { WritingRow } from "@/components/home/writing-row";
import {
	ScrollReveal,
	ScrollRevealBlock,
	ScrollRevealItem,
} from "@/components/motion/scroll-reveal";
import { viewAllCtaClass } from "@/components/ui/cta-styles";
import { DirectionalIcon } from "@/components/ui/directional-icon";
import { Link } from "@/components/ui/link";
import { getRandomWritings } from "@/lib/api/writings";

const RANDOM_PICKS_COUNT = 6;

/**
 * "هەڵبژاردنی هەڕەمەکی" — a compact discovery band of randomly picked
 * writings near the page's end. Deliberately not `min-h-svh`: it is a
 * complementary strip, not a snapped section of its own.
 */
export async function RandomPicksSection() {
	const locale = await getLocale();
	const t = await getTranslations("Home");
	const writings = (await getRandomWritings(locale, RANDOM_PICKS_COUNT)).slice(
		0,
		RANDOM_PICKS_COUNT,
	);

	const rows = writings.map((item) => ({
		id: item.id,
		title: item.title,
		writer: item.writer,
		excerpt: item.excerpt,
		coverUrl: item.coverUrl,
		hoverCoverUrl: item.hoverCoverUrl,
		fileUrl: item.fileUrl,
	}));

	if (rows.length === 0) {
		return null;
	}

	return (
		<section
			className="cv-auto w-full border-t border-border bg-sunken/40 py-10 sm:py-12 lg:py-14"
			style={{ "--cv-intrinsic": "640px" } as CSSProperties}
			aria-labelledby="random-picks-heading"
		>
			<div className="px-6 sm:px-8 2xl:px-[calc((100vw-var(--canvas))/2+2rem)]">
				<ScrollRevealBlock className="mb-8">
					<header>
						<div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between sm:gap-8">
							<div>
								<h2
									id="random-picks-heading"
									className="font-heading text-h2 font-bold leading-[1.15] text-balance"
								>
									{t("randomPicks.title")}
								</h2>
								<p className="text-muted-foreground mt-2 max-w-xl text-sm">
									{t("randomPicks.subtitle")}
								</p>
							</div>

							<Link href="/writings" variant="nav" className={viewAllCtaClass}>
								<span className="relative z-1">{t("randomPicks.viewAll")}</span>
								<DirectionalIcon
									icon={ArrowRightIcon}
									className="relative z-1 size-4"
								/>
							</Link>
						</div>
					</header>
				</ScrollRevealBlock>

				<ScrollReveal
					className="grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-2 sm:gap-y-10 lg:grid-cols-3 lg:gap-x-8"
					stagger={0.06}
				>
					{rows.map((item) => (
						<ScrollRevealItem key={item.id}>
							<WritingRow item={item} />
						</ScrollRevealItem>
					))}
				</ScrollReveal>
			</div>
		</section>
	);
}
