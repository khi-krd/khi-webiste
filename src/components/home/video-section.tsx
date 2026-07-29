import { ArrowRightIcon } from "@heroicons/react/24/outline";
import { getLocale, getTranslations } from "next-intl/server";
import {
	type HomeVideoCardItem,
	VideoCard,
} from "@/components/home/video-card";
import {
	ScrollReveal,
	ScrollRevealBlock,
	ScrollRevealItem,
} from "@/components/motion/scroll-reveal";
import { DirectionalIcon } from "@/components/ui/directional-icon";
import { Link } from "@/components/ui/link";
import { getVideoListing } from "@/lib/api/videos";
import { formatDuration } from "@/lib/video/format";
import { buildVideoHref } from "@/lib/video-url";
import type { ResolvedVideoCard } from "@/types/video";

const viewAllClass =
	"group/viewall relative inline-flex h-10 w-fit shrink-0 items-center gap-2.5 overflow-hidden border border-foreground px-5 font-heading text-small font-semibold text-foreground no-underline transition-[color,gap,box-shadow] duration-300 ease-out before:absolute before:inset-0 before:z-0 before:origin-bottom before:scale-y-0 before:bg-foreground before:transition-transform before:duration-300 before:ease-[cubic-bezier(0.22,1,0.36,1)] fine-hover:gap-3.5 fine-hover:text-primary-foreground fine-hover:shadow-[0_8px_24px_-12px_rgba(26,24,19,0.35)] fine-hover:before:scale-y-100 motion-reduce:before:transition-none motion-reduce:fine-hover:before:scale-y-100 motion-reduce:fine-hover:gap-2.5";

const HOME_VIDEO_COUNT = 5;

export async function VideoSection() {
	const locale = await getLocale();
	const t = await getTranslations("Video");
	const listing = await getVideoListing(locale, {
		videoType: "VIDEO_CLIP",
		page: 1,
		size: HOME_VIDEO_COUNT,
		mockContext: "home",
	});

	if (listing.items.length === 0) {
		return null;
	}

	const [featured, second, third, fourth, fifth, ...more] = listing.items;

	const toItem = (card: ResolvedVideoCard): HomeVideoCardItem => ({
		id: card.id,
		title: card.title,
		subtitle: card.subtitle ?? (card.excerpt || null),
		durationLabel: formatDuration(card.durationSeconds),
		coverUrl: card.coverUrl,
	});

	const categoryLabel = (card: ResolvedVideoCard) =>
		card.topicName ?? t(`typeBadge.${card.videoType}`);

	return (
		<section
			className="cv-auto flex w-full flex-col overflow-hidden border-t border-border bg-background [--cv-intrinsic:1400px]"
			aria-labelledby="video-heading"
		>
			<ScrollRevealBlock className="shrink-0 px-6 pt-12 pb-8 sm:px-8 sm:pt-16 sm:pb-10 lg:pt-20">
				<header>
					<div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between sm:gap-8">
						<div className="max-w-2xl text-start">
							<p className="label font-medium">{t("eyebrow")}</p>
							<h2
								id="video-heading"
								className="mt-2 font-heading text-h1 font-bold leading-[1.1] text-balance"
							>
								{t("title")}
							</h2>
							<p className="mt-3 text-body text-muted">{t("description")}</p>
						</div>

						<Link
							href={buildVideoHref({})}
							variant="nav"
							className={viewAllClass}
						>
							<span className="relative z-1">{t("viewAll")}</span>
							<DirectionalIcon
								icon={ArrowRightIcon}
								className="relative z-1 size-4"
							/>
						</Link>
					</div>
				</header>
			</ScrollRevealBlock>

			<div className="px-6 pb-12 sm:px-8 sm:pb-16 lg:pb-20">
				<ScrollReveal className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-12 lg:grid-rows-[minmax(28rem,1fr)_minmax(16rem,0.55fr)] lg:gap-4 lg:min-h-[min(100svh,56rem)]">
					{featured ? (
						<ScrollRevealItem className="relative aspect-video min-h-0 sm:col-span-2 lg:col-span-7 lg:row-start-1 lg:aspect-auto lg:h-full">
							<VideoCard
								item={toItem(featured)}
								categoryLabel={categoryLabel(featured)}
								variant="featured"
								fill
							/>
						</ScrollRevealItem>
					) : null}

					<ScrollRevealItem className="grid grid-cols-1 gap-3 sm:col-span-2 sm:grid-cols-2 sm:gap-4 lg:col-span-5 lg:col-start-8 lg:row-start-1 lg:h-full lg:grid-cols-1 lg:grid-rows-2 lg:gap-4">
						{second ? (
							<div className="relative aspect-video min-h-0 lg:aspect-auto lg:h-full">
								<VideoCard
									item={toItem(second)}
									categoryLabel={categoryLabel(second)}
									fill
								/>
							</div>
						) : null}
						{third ? (
							<div className="relative aspect-video min-h-0 lg:aspect-auto lg:h-full">
								<VideoCard
									item={toItem(third)}
									categoryLabel={categoryLabel(third)}
									fill
								/>
							</div>
						) : null}
					</ScrollRevealItem>

					{fourth ? (
						<ScrollRevealItem className="relative aspect-video min-h-0 lg:col-span-6 lg:row-start-2 lg:aspect-auto lg:h-full">
							<VideoCard
								item={toItem(fourth)}
								categoryLabel={categoryLabel(fourth)}
								fill
							/>
						</ScrollRevealItem>
					) : null}

					{fifth ? (
						<ScrollRevealItem className="relative aspect-video min-h-0 lg:col-span-6 lg:col-start-7 lg:row-start-2 lg:aspect-auto lg:h-full">
							<VideoCard
								item={toItem(fifth)}
								categoryLabel={categoryLabel(fifth)}
								fill
							/>
						</ScrollRevealItem>
					) : null}
				</ScrollReveal>

				{more.length > 0 ? (
					<ScrollReveal className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-3 lg:gap-4">
						{more.map((card) => (
							<ScrollRevealItem
								key={card.id}
								className="relative aspect-video min-h-0"
							>
								<VideoCard
									item={toItem(card)}
									categoryLabel={categoryLabel(card)}
									fill
								/>
							</ScrollRevealItem>
						))}
					</ScrollReveal>
				) : null}
			</div>
		</section>
	);
}
