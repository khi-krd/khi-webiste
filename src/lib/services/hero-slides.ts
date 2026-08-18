import {
	isLikelyMediaUrl,
	type ServiceHighlight,
} from "@/lib/services/resolve";
import type { HeroSlide } from "@/types/content";

export type ServiceHeroSlideCopy = {
	/** Eyebrow above every slide title — "Featured". */
	typeLabel: string;
	/** Call to action on every slide. */
	actionLabel: string;
	/** "{current} of {total}" — the caller supplies the localized formatter. */
	slideLabel: (current: number, total: number) => string;
};

/**
 * Featured services as hero slides.
 *
 * Featuring a service makes it *the* `/services` hero, not a card inside one —
 * so each featured service becomes a full-bleed slide of the same carousel the
 * homepage uses.
 *
 * A slide with no picture is dropped rather than rendered: the whole design is
 * a photograph with copy over it, and there is nothing to put behind the words.
 * Services keep their gallery fallback (`buildServiceHighlights`), so this only
 * discards records that have no image anywhere. When every featured service is
 * dropped the result is empty and the page falls back to its static hero.
 */
export function buildServiceHeroSlides(
	highlights: ServiceHighlight[],
	copy: ServiceHeroSlideCopy,
): HeroSlide[] {
	const seen = new Set<string>();
	const usable = highlights.filter((highlight) => {
		// The same guard every other media path in `resolve.ts` applies: the CMS
		// can hold a bare "uploads/x.jpg", which would render a broken hero AND
		// suppress the working fallback one.
		if (!isLikelyMediaUrl(highlight.image?.url)) {
			return false;
		}

		// `navAnchorId` is free CMS text with nothing enforcing uniqueness, and it
		// becomes the slide's React key.
		if (seen.has(highlight.anchorId)) {
			return false;
		}

		seen.add(highlight.anchorId);
		return true;
	});

	return usable.map((highlight, index) => ({
		id: highlight.anchorId,
		// A full path rather than a bare "#anchor". next-intl passes a hash-only
		// href through untouched, so both work — but the full path is also what
		// lands in the slide's JSON-LD and in any shared link.
		href: `/services#${highlight.anchorId}`,
		title: highlight.title,
		description: highlight.description ?? "",
		typeLabel: copy.typeLabel,
		actionLabel: copy.actionLabel,
		slideLabel: copy.slideLabel(index + 1, usable.length),
		image: {
			url: (highlight.image?.url ?? "").trim(),
			// Decorative: the photo is a scrimmed ground behind copy that already
			// names the service, and the slide link's own accessible name carries
			// the title. `buildServiceHighlights` sets alt to the title, so passing
			// it through would make a screen reader say it three times.
			alt: "",
		},
	}));
}
