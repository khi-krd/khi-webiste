import { getTranslations } from "next-intl/server";
import { VideoCard, type VideoCardProps } from "@/components/video/video-card";
import { VideoFilterBar } from "@/components/video/video-filter-bar";
import { VideoPagination } from "@/components/video/video-pagination";
import { homeInsetClass } from "@/lib/layout";
import { cn } from "@/lib/utils";
import { formatDuration } from "@/lib/video/format";
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
		clipCountLabel:
			card.clipCount != null
				? t("card.clipCount", {
						count: card.clipCount,
						formatted: String(card.clipCount),
					})
				: null,
		yearLabel: card.year != null ? String(card.year) : null,
		memories: card.albumOfMemories,
		memoriesLabel: card.albumOfMemories ? t("card.memoriesBadge") : null,
	});

	const cardModels = cards.map(toCardProps);
	const leadCard = showFeatured ? cardModels[0] : undefined;
	const gridModels = leadCard ? cardModels.slice(1) : cardModels;

	return (
		<section
			id={id}
			className={cn(
				"w-full border-t border-border bg-surface/40 py-12 sm:py-16 lg:py-20",
				className,
			)}
			aria-labelledby="videos-grid-heading"
		>
			<div className={homeInsetClass}>
				<h2
					id="videos-grid-heading"
					className="font-heading text-h1 font-bold leading-[1.08] text-balance sm:text-display"
				>
					{title}
				</h2>

				{showFilters ? (
					<VideoFilterBar
						topics={topics}
						activeType={activeType}
						activeTopicId={activeTopicId}
						activeMemories={activeMemories}
						activeQuery={activeQuery}
						itemCount={totalElements}
						scrollTargetId={id}
						className="mt-8 sm:mt-10"
					/>
				) : null}

				{isEmpty ? (
					<div className="mt-8 border border-border bg-surface px-6 py-12 text-center sm:mt-10 sm:px-10">
						<p className="text-body text-muted">{noResultsMessage}</p>
					</div>
				) : (
					<>
						{leadCard ? (
							<div className="mt-8 sm:mt-10">
								<VideoCard {...leadCard} variant="featured" />
							</div>
						) : null}

						{gridModels.length > 0 ? (
							<div
								className={cn(
									"grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5 lg:grid-cols-3 lg:gap-6",
									leadCard ? "mt-4 sm:mt-5" : "mt-8 sm:mt-10",
								)}
							>
								{gridModels.map((card) => (
									<VideoCard key={card.id} {...card} />
								))}
							</div>
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
