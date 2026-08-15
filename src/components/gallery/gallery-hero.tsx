import { galleryStripTrayClass } from "@/components/gallery/gallery-album-item";
import { GalleryMarqueeColumn } from "@/components/gallery/gallery-marquee-column";
import {
	ScrollReveal,
	ScrollRevealItem,
} from "@/components/motion/scroll-reveal";
import type { GalleryHeroColumns } from "@/lib/mock/gallery";
import { cn } from "@/lib/utils";

type GalleryHeroProps = {
	eyebrow: string;
	title: string;
	columns: GalleryHeroColumns;
};

export function GalleryHero({ eyebrow, title, columns }: GalleryHeroProps) {
	// Third marquee column exists only ≥2xl (see hidden 2xl:block below).
	// It reuses both pools combined and reversed: a marquee track always shows
	// item 0 of the visible copy at load, so the reversed order surfaces the
	// tail items — the ones columns one and two are NOT showing — and with the
	// small CMS pools any single-pool rotation still duplicated the first
	// column's visible frame.
	const wideColumnItems = [...columns.up, ...columns.down].reverse();

	return (
		<section
			aria-labelledby="gallery-hero-heading"
			className="relative w-full bg-background"
		>
			<div className="relative z-10 grid min-h-svh grid-cols-1 grid-rows-[auto_minmax(32rem,1fr)] lg:grid-cols-[minmax(0,5fr)_minmax(0,6fr)] lg:grid-rows-1">
				{/* 2xl start inset mirrors homeInsetClass's wide-screen padding so the
				    hero title shares one start line with the capped sections below,
				    while the marquee side stays full-bleed. */}
				<div className="flex flex-col px-6 pt-10 pb-8 sm:px-8 sm:pt-12 lg:pb-10 2xl:ps-[calc((100vw-96rem)/2+2rem)]">
					<div className="flex flex-1 flex-col justify-center py-8 lg:py-10">
						<ScrollReveal className="max-w-xl">
							<ScrollRevealItem>
								<p className="label font-medium">
									<span aria-hidden="true" className="me-2">
										{"//"}
									</span>
									{eyebrow}
								</p>
							</ScrollRevealItem>
							<ScrollRevealItem>
								{/* .display-title's clamp() ceiling (5rem) is saturated by
								    1440px — give the headline back its weight on wide canvases. */}
								<h1
									id="gallery-hero-heading"
									className="display-title mt-4 2xl:text-[5.5rem]"
								>
									{title}
								</h1>
							</ScrollRevealItem>
						</ScrollReveal>
					</div>
				</div>

				<div className="relative min-h-full">
					<div
						className={cn(
							"marquee-zone absolute inset-0 overflow-hidden",
							galleryStripTrayClass,
						)}
					>
						<div className="grid h-full grid-cols-2 gap-1.5 2xl:grid-cols-3">
							<GalleryMarqueeColumn items={columns.up} />
							<GalleryMarqueeColumn
								items={columns.down}
								direction="down"
								durationSeconds={75}
							/>
							<GalleryMarqueeColumn
								items={wideColumnItems}
								durationSeconds={95}
								className="hidden 2xl:block"
							/>
						</div>
					</div>
				</div>
			</div>
		</section>
	);
}
