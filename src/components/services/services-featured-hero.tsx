import { FeaturedCarousel } from "@/components/hero/featured-carousel";
import type { HeroSlide } from "@/types/content";

type ServicesFeaturedHeroProps = {
	/** Non-empty — the caller renders the static hero when there are no slides. */
	slides: HeroSlide[];
	direction: "ltr" | "rtl";
	/** Names the carousel region — "Featured services". */
	regionLabel: string;
	paginationLabel: string;
};

/**
 * The `/services` hero, built from the featured services.
 *
 * Featuring a service promotes it to the top of its own page, so it *is* the
 * hero — same full-bleed carousel the homepage uses, one slide per featured
 * service, each linking down to that service's own section.
 *
 * Height is the `"page"` variant — the viewport minus the sticky header — not
 * the homepage's `"viewport"`. The homepage hero is full `100svh` and still fits
 * because its snap scrolling parks the header out of view; `/services` has no
 * snap, so a full-height slide would push its CTA and pagination under the fold.
 */
export function ServicesFeaturedHero({
	slides,
	direction,
	regionLabel,
	paginationLabel,
}: ServicesFeaturedHeroProps) {
	if (slides.length === 0) {
		return null;
	}

	return (
		<section
			// biome-ignore lint/a11y/noRedundantRoles: explicit role requested for carousel landmark semantics.
			role="region"
			aria-roledescription="carousel"
			aria-label={regionLabel}
			className="relative isolate min-h-[calc(100svh-var(--header-h,5rem))] border-b border-border"
		>
			<FeaturedCarousel
				slides={slides}
				direction={direction}
				height="page"
				labels={{ pagination: paginationLabel }}
			/>
		</section>
	);
}
