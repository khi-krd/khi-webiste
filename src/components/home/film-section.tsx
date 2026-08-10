import { ArrowRightIcon } from "@heroicons/react/24/outline";
import { getLocale, getTranslations } from "next-intl/server";
import {
	type FilmCardItem,
	FilmCinemaHero,
	FilmGridCard,
} from "@/components/home/film-section-card";
import {
	ScrollReveal,
	ScrollRevealBlock,
	ScrollRevealItem,
} from "@/components/motion/scroll-reveal";
import { DirectionalIcon } from "@/components/ui/directional-icon";
import { Link } from "@/components/ui/link";
import { getVideoListing } from "@/lib/api/videos";
import { formatDuration } from "@/lib/video/format";
import {
	SHORT_FILM_LISTING_FILTERS,
	shortFilmDetailHref,
} from "@/lib/video/resolve";
import type { ResolvedVideoCard } from "@/types/video";

const FILM_COUNT = 5;
const GRID_COUNT = 4;
const SHORT_FILMS_HREF = "/videos/shortfilms";

const filmCtaClass =
	"group/film-cta relative inline-flex h-10 w-fit shrink-0 items-center gap-2.5 overflow-hidden border border-primary-foreground/50 bg-primary-foreground/8 px-5 font-heading text-small font-semibold text-primary-foreground no-underline backdrop-blur-[2px] transition-[color,gap,box-shadow,background-color,border-color] duration-300 ease-out before:absolute before:inset-0 before:z-0 before:origin-bottom before:scale-y-0 before:bg-primary-foreground before:transition-transform before:duration-300 before:ease-[cubic-bezier(0.22,1,0.36,1)] fine-hover:gap-3.5 fine-hover:border-primary-foreground fine-hover:text-foreground fine-hover:shadow-[0_12px_36px_-14px_rgba(0,0,0,0.55)] fine-hover:before:scale-y-100 motion-reduce:before:transition-none motion-reduce:fine-hover:before:scale-y-100 motion-reduce:fine-hover:gap-2.5";

function toFilmItem(
	card: ResolvedVideoCard,
	categoryLabel: string,
): FilmCardItem {
	return {
		id: card.id,
		href: shortFilmDetailHref(card.id),
		title: card.title,
		subtitle: card.subtitle,
		topicLabel: card.topicName ?? categoryLabel,
		durationLabel: formatDuration(card.durationSeconds),
		yearLabel: card.year ? String(card.year) : null,
		coverUrl: card.coverUrl,
	};
}

export async function FilmSection() {
	const locale = await getLocale();
	const t = await getTranslations("Video");

	const listing = await getVideoListing(locale, {
		...SHORT_FILM_LISTING_FILTERS,
		size: FILM_COUNT,
		mockContext: "home",
	});

	if (listing.items.length === 0) {
		return null;
	}

	const categoryLabel = (card: ResolvedVideoCard) =>
		card.topicName ?? t(`typeBadge.${card.videoType}`);

	const items = listing.items.map((card) =>
		toFilmItem(card, categoryLabel(card)),
	);
	const [featured, ...rest] = items;
	const gridItems = rest.slice(0, GRID_COUNT);

	return (
		<section
			// `min-h-svh` + centred content: the section owns a whole viewport, which
			// is what the home page's section snap scrolls between.
			className="cv-auto relative flex min-h-svh w-full flex-col justify-center overflow-hidden border-t border-primary-foreground/15 bg-foreground text-primary-foreground [--cv-intrinsic:100svh]"
			aria-labelledby="film-heading"
		>
			<div
				aria-hidden
				className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_100%_60%_at_50%_0%,var(--color-primary-foreground)_0%,transparent_50%)] opacity-[0.035]"
			/>

			<div className="relative z-10">
				{/* Header is full-bleed (not inside the centered 7xl column) so the
				    CTA parks in the section's top corner, where every other home
				    section keeps its زیاتر. One word, hero scale. */}
				<ScrollRevealBlock className="px-6 pt-10 pb-6 sm:px-8 sm:pt-12 sm:pb-7">
					<header className="flex flex-row items-center justify-between gap-6">
						<h2
							id="film-heading"
							className="font-heading text-[clamp(1.9rem,4vw,4rem)] font-bold leading-[1.1] text-primary-foreground"
						>
							{t("films.home.title")}
						</h2>

						<Link
							href={SHORT_FILMS_HREF}
							variant="nav"
							className={filmCtaClass}
						>
							<span className="relative z-1">{t("films.home.viewAll")}</span>
							<DirectionalIcon
								icon={ArrowRightIcon}
								className="relative z-1 size-4"
							/>
						</Link>
					</header>
				</ScrollRevealBlock>

				<div className="mx-auto max-w-7xl">
					<ScrollRevealBlock className="border-y border-primary-foreground/15">
						<FilmCinemaHero
							item={featured}
							featuredLabel={t("films.home.featuredLabel")}
						/>
					</ScrollRevealBlock>

					{gridItems.length > 0 ? (
						<div className="px-6 py-7 sm:px-8 sm:py-8">
							<ScrollRevealBlock>
								<p className="text-label font-medium text-primary-foreground/50">
									{t("films.home.moreLabel")}
								</p>
							</ScrollRevealBlock>

							<ScrollReveal className="mt-4 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
								{gridItems.map((item) => (
									<ScrollRevealItem key={item.id}>
										<FilmGridCard item={item} />
									</ScrollRevealItem>
								))}
							</ScrollReveal>
						</div>
					) : null}
				</div>
			</div>
		</section>
	);
}
