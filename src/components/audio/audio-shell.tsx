import { getTranslations } from "next-intl/server";
import { AudioCard, type AudioCardProps } from "@/components/audio/audio-card";
import { AudioFilters } from "@/components/audio/audio-filters";
import { AudioPagination } from "@/components/audio/audio-pagination";
import {
	ScrollReveal,
	ScrollRevealItem,
} from "@/components/motion/scroll-reveal";
import { homeInsetClass } from "@/lib/layout";
import { cn } from "@/lib/utils";
import type { ResolvedAudioCard, TrackState } from "@/types/audio";

type TopicOption = {
	id: number;
	name: string;
};

type AudioShellProps = {
	id?: string;
	cards: ResolvedAudioCard[];
	currentPage: number;
	totalPages: number;
	topics: TopicOption[];
	soundTypes: string[];
	soundTypeLabels: Record<string, string>;
	activeType?: string | null;
	activeState?: TrackState | null;
	activeTopicId?: number | null;
	activeTag?: string | null;
	activeQuery?: string | null;
	noResultsMessage: string;
	className?: string;
	resultCount?: number | null;
};

export async function AudioShell({
	id = "audio-grid",
	cards,
	currentPage,
	totalPages,
	topics,
	soundTypes,
	soundTypeLabels,
	activeType,
	activeState,
	activeTopicId,
	activeTag,
	activeQuery,
	noResultsMessage,
	className,
	resultCount,
}: AudioShellProps) {
	const t = await getTranslations("Audio");
	const isEmpty = cards.length === 0;

	const cardProps: AudioCardProps[] = cards.map((card) => ({
		id: card.id,
		title: card.title,
		coverUrl: card.coverUrl,
		hoverCoverUrl: card.hoverCoverUrl,
		queue: card.queue,
	}));

	return (
		<section
			id={id}
			className={cn(
				"w-full border-t border-border bg-background pt-6 pb-12 sm:pt-8 sm:pb-16 lg:pt-10 lg:pb-20",
				className,
			)}
			aria-label={t("grid.allTitle")}
		>
			<div className={homeInsetClass}>
				<AudioFilters
					topics={topics}
					soundTypes={soundTypes}
					soundTypeLabels={soundTypeLabels}
					activeType={activeType}
					activeState={activeState}
					activeTopicId={activeTopicId}
					activeTag={activeTag}
					activeQuery={activeQuery}
					resultCount={resultCount ?? 0}
					title={t("grid.allTitle")}
					scrollTargetId={id}
				/>

				{isEmpty ? (
					<div className="mt-8 border border-border bg-surface px-6 py-12 text-center sm:mt-10 sm:px-10">
						<p className="text-body text-muted">{noResultsMessage}</p>
					</div>
				) : (
					<ScrollReveal className="mt-8 grid grid-cols-2 gap-3 sm:mt-10 sm:gap-4 lg:grid-cols-3 xl:grid-cols-4">
						{cardProps.map((card) => (
							<ScrollRevealItem key={card.id}>
								<AudioCard {...card} />
							</ScrollRevealItem>
						))}
					</ScrollReveal>
				)}

				{!isEmpty && totalPages > 1 ? (
					<div className="mt-10 flex justify-center sm:mt-12">
						<AudioPagination
							currentPage={currentPage}
							totalPages={totalPages}
							activeType={activeType}
							activeState={activeState}
							activeTopicId={activeTopicId}
							activeTag={activeTag}
							activeQuery={activeQuery}
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
