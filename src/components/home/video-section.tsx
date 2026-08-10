import { ArrowRightIcon, QueueListIcon } from "@heroicons/react/24/outline";
import { getLocale, getTranslations } from "next-intl/server";
import {
	type HomeVideoCardItem,
	VideoCard,
	VideoPlaylistRow,
} from "@/components/home/video-card";
import { ScrollRevealBlock } from "@/components/motion/scroll-reveal";
import { DirectionalIcon } from "@/components/ui/directional-icon";
import { Link } from "@/components/ui/link";
import { getVideoListing } from "@/lib/api/videos";
import { formatDuration } from "@/lib/video/format";
import { buildVideoHref } from "@/lib/video-url";
import type { ResolvedVideoCard } from "@/types/video";

const viewAllClass =
	"group/viewall relative inline-flex h-10 w-fit shrink-0 items-center gap-2.5 overflow-hidden border border-foreground px-5 font-heading text-small font-semibold text-foreground no-underline transition-[color,gap,box-shadow] duration-300 ease-out before:absolute before:inset-0 before:z-0 before:origin-bottom before:scale-y-0 before:bg-foreground before:transition-transform before:duration-300 before:ease-[cubic-bezier(0.22,1,0.36,1)] fine-hover:gap-3.5 fine-hover:text-primary-foreground fine-hover:shadow-[0_8px_24px_-12px_rgba(26,24,19,0.35)] fine-hover:before:scale-y-100 motion-reduce:before:transition-none motion-reduce:fine-hover:before:scale-y-100 motion-reduce:fine-hover:gap-2.5";

/** One hero + the queue beside it — four spaced lines fill the hero's height. */
const PLAYLIST_COUNT = 4;
/** Under `lg` the queue stacks under the hero, so it shows a shorter tail. */
const MOBILE_PLAYLIST_COUNT = 3;
const HOME_VIDEO_COUNT = PLAYLIST_COUNT + 1;

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

	const [featured, ...rest] = listing.items;
	const playlist = rest.slice(0, PLAYLIST_COUNT);

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
			// `min-h-svh` + centred content: the section owns one whole viewport,
			// which is what the home page's section snap scrolls between.
			className="cv-auto relative flex min-h-svh w-full flex-col justify-center overflow-hidden border-t border-border bg-background [--cv-intrinsic:100svh]"
			aria-labelledby="video-heading"
		>
			{/* Header is full-bleed and top-aligned: the زیاتر CTA parks in the
			    section's top corner, the fixed spot every other home section keeps
			    it in. */}
			<ScrollRevealBlock className="px-6 pt-18 pb-4 sm:px-8 sm:pt-20 sm:pb-5 lg:pt-24">
				<header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between sm:gap-10">
					<h2
						id="video-heading"
						className="max-w-xl font-heading text-[clamp(1.5rem,2.4vw,2.75rem)] font-bold leading-[1.1] text-balance"
					>
						{t("title")}
					</h2>

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
				</header>
			</ScrollRevealBlock>

			{/* One framed stage: the latest video large, the rest as a queue down its
			    side. The two halves meet on a hairline (gap-px over a border-coloured
			    backdrop) so the block reads as a single player panel; the spacing
			    lives inside the queue instead. At `lg` the stage takes a capped share
			    of the viewport so the whole section still lands in one snap step. */}
			<div className="px-6 pb-8 sm:px-8 sm:pb-10">
				<ScrollRevealBlock delay={0.06}>
					<div className="overflow-hidden border border-border bg-border">
						<div className="grid grid-cols-1 gap-px lg:h-[min(74svh,52rem)] lg:grid-cols-[minmax(0,1fr)_clamp(22rem,30vw,30rem)]">
							<div className="relative aspect-video min-h-0 lg:aspect-auto lg:h-full">
								<VideoCard
									item={toItem(featured)}
									categoryLabel={categoryLabel(featured)}
								/>
							</div>

							{playlist.length > 0 ? (
								<div className="flex min-h-0 flex-col bg-background lg:h-full">
									<div className="flex shrink-0 items-center gap-2 px-4 pt-4 pb-1 lg:px-5 lg:pt-5">
										<QueueListIcon
											aria-hidden
											className="size-4 shrink-0 text-muted"
										/>
										<p className="label truncate font-medium">{t("eyebrow")}</p>
									</div>

									{/* Queue lines are spaced, not seamed — each still is its own
									    little screen, so it needs air around it rather than the
									    hairline rule the outer frame uses. */}
									<div className="flex min-h-0 flex-1 flex-col gap-2.5 overflow-y-auto p-3 lg:gap-3 lg:p-4">
										{playlist.map((card, index) => (
											<VideoPlaylistRow
												key={card.id}
												item={toItem(card)}
												categoryLabel={categoryLabel(card)}
												// Stacked under the hero, the full queue would push the
												// section past one viewport — the tail only rides along
												// once the queue is a column beside it.
												className={
													index >= MOBILE_PLAYLIST_COUNT ? "max-lg:hidden" : ""
												}
											/>
										))}
									</div>
								</div>
							) : null}
						</div>
					</div>
				</ScrollRevealBlock>
			</div>
		</section>
	);
}
