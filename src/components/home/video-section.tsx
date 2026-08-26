import { ArrowRightIcon } from "@heroicons/react/24/outline";
import { getLocale, getTranslations } from "next-intl/server";
import {
	type HomeVideoCardItem,
	VideoStage,
} from "@/components/home/video-card";
import { ScrollRevealBlock } from "@/components/motion/scroll-reveal";
import { viewAllCtaClass } from "@/components/ui/cta-styles";
import { DirectionalIcon } from "@/components/ui/directional-icon";
import { Link } from "@/components/ui/link";
import { getVideoListing } from "@/lib/api/videos";
import { cardIdentity } from "@/lib/video/filter";
import { formatDuration } from "@/lib/video/format";
import { buildVideoHref } from "@/lib/video-url";
import type { ResolvedVideoCard } from "@/types/video";

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
		// Over-fetch: the listing can return the same clip more than once, and the
		// stage drops the repeats below. Without the slack a duplicate would cost
		// the queue a line.
		size: HOME_VIDEO_COUNT + 3,
		variant: "home",
	});

	if (listing.items.length === 0) {
		return null;
	}

	const toItem = (card: ResolvedVideoCard): HomeVideoCardItem => ({
		key: cardIdentity(card),
		id: card.id,
		title: card.title,
		subtitle: card.subtitle ?? (card.excerpt || null),
		durationLabel: formatDuration(card.durationSeconds),
		coverUrl: card.coverUrl,
		previewVideoUrl: card.previewVideoUrl,
		categoryLabel: card.topicName ?? t(`typeBadge.${card.videoType}`),
		href: `/videos/${card.id}`,
	});

	// De-duplicated by clip identity: the listing expands each video into one
	// card per clip, and repeats do occur — which showed as the same clip twice
	// in the queue, and as a duplicate React key that broke the swap's identity.
	const seen = new Set<string>();
	const stageItems: HomeVideoCardItem[] = [];
	for (const card of listing.items) {
		const identity = cardIdentity(card);
		if (seen.has(identity)) continue;
		seen.add(identity);
		stageItems.push(toItem(card));
		if (stageItems.length === HOME_VIDEO_COUNT) break;
	}

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
			<ScrollRevealBlock className="px-6 pt-18 pb-4 sm:px-8 sm:pt-20 sm:pb-5 lg:pt-24 2xl:px-[calc((100vw-var(--canvas))/2+2rem)]">
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
						className={viewAllCtaClass}
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
			<div className="px-6 pb-8 sm:px-8 sm:pb-10 2xl:px-[calc((100vw-var(--canvas))/2+2rem)]">
				<ScrollRevealBlock delay={0.06}>
					<VideoStage
						items={stageItems}
						// Stacked under the hero, the full queue would push the section
						// past one viewport — the tail only rides along once the queue is
						// a column beside it.
						mobileQueueCount={MOBILE_PLAYLIST_COUNT}
					/>
				</ScrollRevealBlock>
			</div>
		</section>
	);
}
