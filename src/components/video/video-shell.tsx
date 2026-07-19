import { getTranslations } from "next-intl/server";
import {
	ScrollReveal,
	ScrollRevealBlock,
	ScrollRevealItem,
} from "@/components/motion/scroll-reveal";
import { VideoCard, type VideoCardProps } from "@/components/video/video-card";
import { VideoFilterBar } from "@/components/video/video-filter-bar";
import { VideoPagination } from "@/components/video/video-pagination";
import { homeInsetClass } from "@/lib/layout";
import { cn } from "@/lib/utils";
import { formatDuration } from "@/lib/video/format";
import {
	isShortFilm,
	shortFilmDetailHref,
	videoDetailHref,
} from "@/lib/video/resolve";
import type { ResolvedVideoCard, VideoType } from "@/types/video";

type TopicOption = {
	id: number;
	name: string;
};

type VideoShellProps = {
	id?: string;
	title: string;
	cards: ResolvedVideoCard[];
	showFeatured?: boolean;
	currentPage: number;
	totalPages: number;
	totalElements: number;
	topics: TopicOption[];
	activeType?: VideoType | null;
	activeTopicId?: number | null;
	activeMemories?: boolean | null;
	activeQuery?: string | null;
	noResultsMessage: string;
	/** The filmstrip filter is hidden on the topic-pinned short-films page. */
	showFilters?: boolean;
	/** Route for the filter bar + pager (default catalogue). */
	basePath?: string;
	className?: string;
};

export async function VideoShell({
	id = "videos-grid",
	title,
	cards,
	showFeatured = false,
	currentPage,
	totalPages,
	totalElements,
	topics,
	activeType,
	activeTopicId,
	activeMemories,
	activeQuery,
	noResultsMessage,
	showFilters = true,
	basePath = "/videos",
	className,
}: VideoShellProps) {
	const t = await getTranslations("Video");
	const isEmpty = cards.length === 0;

	const toCardProps = (card: ResolvedVideoCard): VideoCardProps => ({
		id: card.id,
		title: card.title,
		subtitle: card.subtitle,
		coverUrl: card.coverUrl,
		hoverCoverUrl: card.hoverCoverUrl,
		videoType: card.videoType,
		typeLabel: t(`typeBadge.${card.videoType}`),
		topicLabel: card.topicName,
		durationLabel: formatDuration(card.durationSeconds),
		yearLabel: card.year != null ? String(card.year) : null,
		memories: card.albumOfMemories,
		memoriesLabel: card.albumOfMemories ? t("card.memoriesBadge") : null,
		href: isShortFilm(card.topicId)
			? shortFilmDetailHref(card.id)
			: videoDetailHref(card.id, card.clipNumber),
	});

	const cardModels = cards.map(toCardProps);
	const leadCard = showFeatured ? cardModels[0] : undefined;
	const gridCards = showFeatured ? cards.slice(1) : cards;
	const gridModels = leadCard ? cardModels.slice(1) : cardModels;
	/** Remount the reveal grid on page/filter changes so new cards aren't stuck at opacity 0 (`once: true`). */
	const gridKey = [
		currentPage,
		activeType ?? "all",
		activeTopicId ?? "topic",
		activeMemories ? "memories" : "any",
		activeQuery ?? "",
	].join(":");

	return (
		<section
			id={id}
			className={cn(
				"w-full border-t border-border bg-surface/40 py-8 sm:py-10 lg:py-12",
				className,
			)}
			aria-labelledby="videos-grid-heading"
		>
			<div className={homeInsetClass}>
				<ScrollRevealBlock>
					<h2
						id="videos-grid-heading"
						className="font-heading text-h2 font-bold leading-[1.08] text-balance sm:text-h1"
					>
						{title}
					</h2>
				</ScrollRevealBlock>

				{showFilters ? (
					<VideoFilterBar
						topics={topics}
						activeType={activeType}
						activeTopicId={activeTopicId}
						activeMemories={activeMemories}
						activeQuery={activeQuery}
						itemCount={totalElements}
						scrollTargetId={id}
						className="mt-5 sm:mt-6"
					/>
				) : null}

				{isEmpty ? (
					<div className="mt-5 border border-border bg-surface px-6 py-10 text-center sm:mt-6 sm:px-10">
						<p className="text-body text-muted">{noResultsMessage}</p>
					</div>
				) : (
					<>
						{leadCard ? (
							<ScrollRevealBlock key={`featured-${gridKey}`} className="mt-5 sm:mt-6">
								<VideoCard {...leadCard} variant="featured" />
							</ScrollRevealBlock>
						) : null}

						{gridModels.length > 0 ? (
							<ScrollReveal
								key={gridKey}
								className={cn(
									"grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-3",
									leadCard ? "mt-3 sm:mt-4" : "mt-5 sm:mt-6",
								)}
							>
								{gridModels.map((card, index) => {
									const source = gridCards[index];
									const key =
										source?.clipNumber != null
											? `${source.id}-${source.clipNumber}`
											: String(source?.id ?? index);
									return (
										<ScrollRevealItem key={key}>
											<VideoCard {...card} />
										</ScrollRevealItem>
									);
								})}
							</ScrollReveal>
						) : null}
					</>
				)}

				{!isEmpty && totalPages > 1 ? (
					<div className="mt-10 flex justify-center sm:mt-12">
						<VideoPagination
							currentPage={currentPage}
							totalPages={totalPages}
							activeType={activeType}
							activeTopicId={activeTopicId}
							activeMemories={activeMemories}
							activeQuery={activeQuery}
							basePath={basePath}
							omitTopic={!showFilters}
							label={t("pagination.label")}
							previousLabel={t("pagination.previous")}
							nextLabel={t("pagination.next")}
							scrollTargetId={id}
						/>
					</div>
				) : null}
			</div>
		</section>
	);
}
