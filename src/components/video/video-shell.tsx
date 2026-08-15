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
import { cardIdentity } from "@/lib/video/filter";
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
	featuredLead?: ResolvedVideoCard | null;
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
	featuredLead,
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

	const toCardProps = (card: ResolvedVideoCard): VideoCardProps => ({
		id: card.id,
		title: card.title,
		subtitle: card.subtitle,
		coverUrl: card.coverUrl,
		previewVideoUrl: card.previewVideoUrl,
		hoverCoverUrl: card.hoverCoverUrl,
		videoType: card.videoType,
		typeLabel: t(`typeBadge.${card.videoType}`),
		topicLabel: card.topicName,
		durationLabel: formatDuration(card.durationSeconds),
		memories: card.albumOfMemories,
		memoriesLabel: card.albumOfMemories ? t("card.memoriesBadge") : null,
		href: isShortFilm(card)
			? shortFilmDetailHref(card.id)
			: videoDetailHref(card.id, card.clipNumber),
	});

	const leadSource =
		showFeatured && featuredLead
			? featuredLead
			: showFeatured
				? cards[0]
				: undefined;
	const leadCard = leadSource ? toCardProps(leadSource) : undefined;
	const leadKey = leadSource ? cardIdentity(leadSource) : null;
	const gridCards =
		leadKey != null
			? cards.filter((card) => cardIdentity(card) !== leadKey)
			: cards;
	const gridModels = gridCards.map(toCardProps);
	const isEmpty = gridModels.length === 0 && !leadCard;
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
					// The dead timecode — the projector with no reel.
					<div className="mt-5 border border-border bg-surface px-6 py-12 text-center sm:mt-6 sm:px-10">
						<p
							aria-hidden="true"
							dir="ltr"
							className="label font-medium tabular-nums text-muted"
						>
							{"// --:--"}
						</p>
						<p className="mt-2 text-body text-muted">{noResultsMessage}</p>
					</div>
				) : (
					<>
						{leadCard ? (
							<ScrollRevealBlock
								key={`featured-${gridKey}`}
								className="mt-5 sm:mt-6"
							>
								<p className="label mb-3 font-medium text-muted">
									<span aria-hidden="true" className="me-2">
										{"//"}
									</span>
									{t("films.home.featuredLabel")}
								</p>
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
					// Folio line under a hairline — `02 / 07`, decorative; the
					// shared Pagination announces page state accessibly.
					<div className="mt-10 border-t border-border pt-6 sm:mt-12">
						<p
							aria-hidden="true"
							dir="ltr"
							className="label mb-3 text-center font-medium tabular-nums text-muted"
						>
							{String(currentPage).padStart(2, "0")} /{" "}
							{String(totalPages).padStart(2, "0")}
						</p>
						<div className="flex justify-center">
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
					</div>
				) : null}
			</div>
		</section>
	);
}
