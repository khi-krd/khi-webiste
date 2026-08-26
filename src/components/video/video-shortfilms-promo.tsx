import { ArrowRightIcon } from "@heroicons/react/24/outline";
import { getLocale, getTranslations } from "next-intl/server";
import {
	ScrollReveal,
	ScrollRevealBlock,
	ScrollRevealItem,
} from "@/components/motion/scroll-reveal";
import { viewAllCtaOnDarkClass } from "@/components/ui/cta-styles";
import { DirectionalIcon } from "@/components/ui/directional-icon";
import { Link } from "@/components/ui/link";
import {
	VideoPosterCard,
	type VideoPosterCardProps,
} from "@/components/video/video-poster-card";
import { getVideoListing } from "@/lib/api/videos";
import { homeInsetClass } from "@/lib/layout";
import { cn } from "@/lib/utils";
import { formatDuration } from "@/lib/video/format";
import {
	SHORT_FILM_LISTING_FILTERS,
	shortFilmDetailHref,
} from "@/lib/video/resolve";
import type { ResolvedVideoCard } from "@/types/video";

/** Enough posters for a dense 2–3 row shelf on common breakpoints. */
const PREVIEW_COUNT = 12;

function toPoster(card: ResolvedVideoCard): VideoPosterCardProps {
	return {
		id: card.id,
		title: card.title,
		subtitle: card.subtitle,
		coverUrl: card.coverUrl,
		previewVideoUrl: card.previewVideoUrl,
		durationLabel: formatDuration(card.durationSeconds),
		href: shortFilmDetailHref(card.id),
		dark: true,
	};
}

export async function VideoShortFilmsPromo() {
	const locale = await getLocale();
	const t = await getTranslations("Video");

	const listing = await getVideoListing(locale, {
		...SHORT_FILM_LISTING_FILTERS,
		size: 100,
	});
	const shortFilms = listing.items.slice(0, PREVIEW_COUNT);

	if (shortFilms.length === 0) {
		return null;
	}

	const posters = shortFilms.map(toPoster);

	return (
		<section
			className="border-y border-primary-foreground/20 bg-foreground py-8 text-primary-foreground sm:py-10"
			aria-labelledby="shortfilms-promo-heading"
		>
			<div className={homeInsetClass}>
				<ScrollRevealBlock>
					{/* Title and the way through — nothing else. */}
					<div className="flex flex-wrap items-end justify-between gap-4">
						<h2
							id="shortfilms-promo-heading"
							className="font-heading text-h2 font-bold leading-tight text-balance sm:text-h1"
						>
							{t("shortfilms.promo.title")}
						</h2>

						<Link
							href="/videos/shortfilms"
							variant="nav"
							className={viewAllCtaOnDarkClass}
						>
							<span className="relative z-1">{t("shortfilms.promo.cta")}</span>
							<DirectionalIcon
								icon={ArrowRightIcon}
								className="relative z-1 size-4 shrink-0"
							/>
						</Link>
					</div>
				</ScrollRevealBlock>

				{/* Dense 2–3 row shelf of short-film posters. The spotlight scope:
				    hovering one poster dims its siblings — the projector beam. */}
				<ScrollReveal
					className={cn(
						"spotlight-grid-dark mt-5 grid grid-cols-2 gap-2 sm:mt-6 sm:grid-cols-3 sm:gap-3 lg:grid-cols-4 xl:grid-cols-6",
					)}
				>
					{posters.map((card) => (
						<ScrollRevealItem key={card.id}>
							<VideoPosterCard {...card} />
						</ScrollRevealItem>
					))}
				</ScrollReveal>
			</div>
		</section>
	);
}
