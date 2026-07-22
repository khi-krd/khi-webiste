import { ArrowRightIcon } from "@heroicons/react/24/outline";
import { getLocale, getTranslations } from "next-intl/server";
import {
	ScrollReveal,
	ScrollRevealBlock,
	ScrollRevealItem,
} from "@/components/motion/scroll-reveal";
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

const ctaClass =
	"group inline-flex h-11 items-center gap-2 border border-primary-foreground bg-primary-foreground px-6 font-heading text-small font-semibold text-foreground no-underline transition-[gap,box-shadow] duration-300 fine-hover:gap-2.5 fine-hover:shadow-[0_12px_32px_-14px_rgba(0,0,0,0.35)]";

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
	const totalCount = listing.totalElements;

	return (
		<section
			className="border-y border-primary-foreground/20 bg-foreground py-8 text-primary-foreground sm:py-10"
			aria-labelledby="shortfilms-promo-heading"
		>
			<div className={homeInsetClass}>
				<ScrollRevealBlock>
					<div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
						<div className="max-w-xl">
							<p className="text-label font-medium text-primary-foreground/60">
								{t("shortfilms.hero.eyebrow")}
							</p>
							<h2
								id="shortfilms-promo-heading"
								className="mt-1.5 font-heading text-h2 font-bold leading-tight text-balance sm:text-h1"
							>
								{t("shortfilms.promo.title")}
							</h2>
							<p className="mt-2 text-body text-primary-foreground/75">
								{t("shortfilms.promo.description")}
							</p>
							<p className="mt-2 text-label text-primary-foreground/55">
								{t("shortfilms.promo.count", {
									count: totalCount,
									formatted: String(totalCount),
								})}
							</p>
						</div>

						<Link href="/videos/shortfilms" variant="nav" className={ctaClass}>
							<span>{t("shortfilms.promo.cta")}</span>
							<DirectionalIcon icon={ArrowRightIcon} className="size-4" />
						</Link>
					</div>
				</ScrollRevealBlock>

				{/* Dense 2–3 row shelf of short-film posters */}
				<ScrollReveal
					className={cn(
						"mt-5 grid grid-cols-2 gap-2 sm:mt-6 sm:grid-cols-3 sm:gap-3 lg:grid-cols-4 xl:grid-cols-6",
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
