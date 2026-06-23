import { ArrowRightIcon } from "@heroicons/react/24/outline";
import { galleryStripTrayClass } from "@/components/gallery/gallery-album-item";
import { GalleryMarqueeColumn } from "@/components/gallery/gallery-marquee-column";
import {
	ScrollReveal,
	ScrollRevealItem,
} from "@/components/motion/scroll-reveal";
import { DirectionalIcon } from "@/components/ui/directional-icon";
import { Link } from "@/components/ui/link";
import type { GalleryHeroColumns } from "@/lib/mock/gallery";
import { cn } from "@/lib/utils";

type GalleryHeroProps = {
	eyebrow: string;
	title: string;
	cta: string;
	columns: GalleryHeroColumns;
};

const galleryCtaClass =
	"group/cta relative mt-10 inline-flex h-10 w-fit shrink-0 items-center gap-2.5 overflow-hidden border border-foreground px-5 font-heading text-small font-semibold text-foreground no-underline transition-[color,gap,box-shadow] duration-300 ease-out before:absolute before:inset-0 before:z-0 before:origin-bottom before:scale-y-0 before:bg-foreground before:transition-transform before:duration-300 before:ease-[cubic-bezier(0.22,1,0.36,1)] fine-hover:gap-3.5 fine-hover:text-primary-foreground fine-hover:shadow-[0_8px_24px_-12px_rgba(26,24,19,0.35)] fine-hover:before:scale-y-100 motion-reduce:before:transition-none motion-reduce:fine-hover:before:scale-y-100 motion-reduce:fine-hover:gap-2.5";

export function GalleryHero({
	eyebrow,
	title,
	cta,
	columns,
}: GalleryHeroProps) {
	return (
		<section
			aria-labelledby="gallery-hero-heading"
			className="relative w-full bg-background"
		>
			<div className="relative z-10 grid min-h-svh grid-cols-1 grid-rows-[auto_minmax(32rem,1fr)] lg:grid-cols-[minmax(0,5fr)_minmax(0,6fr)] lg:grid-rows-1">
				<div className="flex flex-col px-6 pt-30 pb-8 sm:px-8 sm:pt-34 lg:pb-10">
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
								<h1 id="gallery-hero-heading" className="display-title mt-4">
									{title}
								</h1>
							</ScrollRevealItem>
							<ScrollRevealItem>
								<Link
									href="#gallery-content"
									variant="nav"
									className={galleryCtaClass}
								>
									<span className="relative z-1">{cta}</span>
									<DirectionalIcon
										icon={ArrowRightIcon}
										className="relative z-1 size-4"
									/>
								</Link>
							</ScrollRevealItem>
						</ScrollReveal>
					</div>
				</div>

				<div aria-hidden="true" className="relative min-h-full">
					<div
						className={cn(
							"marquee-zone absolute inset-0 overflow-hidden",
							galleryStripTrayClass,
						)}
					>
						<div className="grid h-full grid-cols-2 gap-1.5">
							<GalleryMarqueeColumn items={columns.up} />
							<GalleryMarqueeColumn
								items={columns.down}
								direction="down"
								durationSeconds={75}
							/>
						</div>
					</div>
				</div>
			</div>
		</section>
	);
}
