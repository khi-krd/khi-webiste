import { ArrowRightIcon } from "@heroicons/react/24/outline";
import { getLocale, getTranslations } from "next-intl/server";
import { DirectionalIcon } from "@/components/ui/directional-icon";
import { Link } from "@/components/ui/link";
import {
	VideoPosterCard,
	type VideoPosterCardProps,
} from "@/components/video/video-poster-card";
import { getVideoListing } from "@/lib/api/videos";
import { homeInsetClass } from "@/lib/layout";
import { SHORT_FILMS_TOPIC_ID } from "@/lib/mock/videos";
import { cn } from "@/lib/utils";
import { formatDuration } from "@/lib/video/format";
import { shortFilmDetailHref } from "@/lib/video/resolve";
import type { ResolvedVideoCard } from "@/types/video";

const PREVIEW_COUNT = 6;

function toPoster(card: ResolvedVideoCard): VideoPosterCardProps {
	return {
		id: card.id,
		title: card.title,
		subtitle: card.subtitle,
		coverUrl: card.coverUrl,
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
		topicId: SHORT_FILMS_TOPIC_ID,
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
			className="border-y border-primary-foreground/20 bg-foreground py-12 text-primary-foreground sm:py-16"
			aria-labelledby="shortfilms-promo-heading"
		>
			<div className={homeInsetClass}>
				<div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
					<div className="max-w-xl">
						<p className="text-label font-medium text-primary-foreground/60">
							{t("shortfilms.hero.eyebrow")}
						</p>
						<h2
							id="shortfilms-promo-heading"
							className="mt-2 font-heading text-h2 font-bold leading-tight text-balance sm:text-h1"
						>
							{t("shortfilms.promo.title")}
						</h2>
						<p className="mt-3 text-body text-primary-foreground/75">
							{t("shortfilms.promo.description")}
						</p>
						<p className="mt-4 text-label text-primary-foreground/55">
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

				<div
					className={cn(
						"mt-8 flex gap-3 overflow-x-auto pb-2 sm:mt-10 sm:gap-4",
					)}
				>
					{posters.map((card) => (
						<div key={card.id} className="w-36 shrink-0 sm:w-40 lg:w-44">
							<VideoPosterCard {...card} />
						</div>
					))}
				</div>
			</div>
		</section>
	);
}
