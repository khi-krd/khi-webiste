import { ArrowRightIcon } from "@heroicons/react/24/outline";
import { getLocale, getTranslations } from "next-intl/server";
import type { CSSProperties } from "react";
import { WritingRow } from "@/components/home/writing-row";
import {
	ScrollReveal,
	ScrollRevealBlock,
	ScrollRevealItem,
} from "@/components/motion/scroll-reveal";
import { DirectionalIcon } from "@/components/ui/directional-icon";
import { Link } from "@/components/ui/link";
import { getWritingsCarousel } from "@/lib/api/writings";

/** 3 columns per row on desktop. */
const HOME_WRITINGS_COUNT = 15;

const viewAllClass =
	"group/viewall relative inline-flex h-10 w-fit shrink-0 items-center gap-2.5 overflow-hidden border border-foreground px-5 font-heading text-small font-semibold text-foreground no-underline transition-[color,gap,box-shadow] duration-300 ease-out before:absolute before:inset-0 before:z-0 before:origin-bottom before:scale-y-0 before:bg-foreground before:transition-transform before:duration-300 before:ease-[cubic-bezier(0.22,1,0.36,1)] fine-hover:gap-3.5 fine-hover:text-primary-foreground fine-hover:shadow-[0_8px_24px_-12px_rgba(26,24,19,0.35)] fine-hover:before:scale-y-100 motion-reduce:before:transition-none motion-reduce:fine-hover:before:scale-y-100 motion-reduce:fine-hover:gap-2.5";

export async function WritingsSection() {
	const locale = await getLocale();
	const t = await getTranslations("Writings");
	const writings = (
		await getWritingsCarousel(locale, HOME_WRITINGS_COUNT)
	).slice(0, HOME_WRITINGS_COUNT);

	const rows = writings.map((item) => ({
		id: item.id,
		title: item.title,
		writer: item.writer,
		excerpt: item.excerpt,
		coverUrl: item.coverUrl,
		fileUrl: item.fileUrl,
	}));

	if (rows.length === 0) {
		return null;
	}

	// One reveal group per desktop row: each batch staggers from 0 as it enters
	// the viewport, instead of item 15 inheriting a ~0.9s absolute slot and
	// sitting invisible after scrolling in.
	const rowChunks: (typeof rows)[] = [];
	for (let i = 0; i < rows.length; i += 3) {
		rowChunks.push(rows.slice(i, i + 3));
	}

	return (
		<section
			className="cv-auto w-full border-t border-border bg-background py-12 sm:py-16 lg:py-20"
			// Placeholder height scales with the actual item count (4..16) so the
			// pre-render scrollbar estimate stays close; self-corrects after paint.
			style={
				{ "--cv-intrinsic": `${500 + rows.length * 140}px` } as CSSProperties
			}
			aria-labelledby="writings-heading"
		>
			{/* Full-bleed gutters (like the video section) instead of the centered
			    Container — the grid hangs from the page's main start line. */}
			<div className="px-6 sm:px-8">
				<ScrollRevealBlock className="mb-8 sm:mb-10">
					<header>
						<div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between sm:gap-8">
							<h2
								id="writings-heading"
								className="font-heading text-h2 font-bold leading-[1.15] text-balance"
							>
								{t("title")}
							</h2>

							<Link href="/writings" variant="nav" className={viewAllClass}>
								<span className="relative z-1">{t("viewAll")}</span>
								<DirectionalIcon
									icon={ArrowRightIcon}
									className="relative z-1 size-4"
								/>
							</Link>
						</div>
					</header>
				</ScrollRevealBlock>

				{/* Chunks stack with the same gap the grids use internally, so the
				    seams between reveal groups are invisible. */}
				<div className="flex flex-col gap-y-8 sm:gap-y-10">
					{rowChunks.map((chunk) => (
						<ScrollReveal
							key={chunk[0].id}
							className="grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-2 sm:gap-y-10 lg:grid-cols-3 lg:gap-x-8"
							stagger={0.06}
						>
							{chunk.map((item) => (
								<ScrollRevealItem key={item.id}>
									<WritingRow item={item} />
								</ScrollRevealItem>
							))}
						</ScrollReveal>
					))}
				</div>
			</div>
		</section>
	);
}
