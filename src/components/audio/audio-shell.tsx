import { getTranslations } from "next-intl/server";
import { AudioCard, type AudioCardProps } from "@/components/audio/audio-card";
import { AudioFilterBar } from "@/components/audio/audio-filter-bar";
import { AudioPagination } from "@/components/audio/audio-pagination";
import { formatDuration } from "@/lib/audio/format";
import { soundTypeLabel } from "@/lib/audio/sound-types";
import { homeInsetClass } from "@/lib/layout";
import { cn } from "@/lib/utils";
import type { ResolvedAudioCard, TrackState } from "@/types/audio";

type TopicOption = {
	id: number;
	name: string;
};

type AudioShellProps = {
	id?: string;
	title: string;
	cards: ResolvedAudioCard[];
	currentPage: number;
	totalPages: number;
	totalElements: number;
	soundTypes: string[];
	topics: TopicOption[];
	activeType?: string | null;
	activeState?: TrackState | null;
	activeTopicId?: number | null;
	activeQuery?: string | null;
	noResultsMessage: string;
	className?: string;
};

export async function AudioShell({
	id = "audio-grid",
	title,
	cards,
	currentPage,
	totalPages,
	totalElements,
	soundTypes,
	topics,
	activeType,
	activeState,
	activeTopicId,
	activeQuery,
	noResultsMessage,
	className,
}: AudioShellProps) {
	const t = await getTranslations("Audio");
	const isEmpty = cards.length === 0;

	const cardProps: AudioCardProps[] = cards.map((card) => {
		const typeLabel = soundTypeLabel((key) => t(key), card.soundType);
		const metaLabel =
			card.trackState === "MULTI"
				? `${typeLabel} · ${t("card.albumTracks", { count: card.totalTracks ?? 0 })}`
				: typeLabel;

		return {
			id: card.id,
			title: card.title,
			subtitle: card.subtitle,
			coverUrl: card.coverUrl,
			hoverCoverUrl: card.hoverCoverUrl,
			metaLabel,
			instituteLabel: card.thisProjectOfInstitute
				? t("card.instituteBadge")
				: null,
			durationLabel: formatDuration(card.totalDurationSeconds),
			yearLabel:
				card.publishmentYear != null ? String(card.publishmentYear) : null,
			memories: card.albumOfMemories,
			memoriesLabel: card.albumOfMemories ? t("memories.badge") : null,
			queue: card.queue,
		};
	});

	return (
		<section
			id={id}
			className={cn(
				"w-full border-t border-border bg-background py-12 sm:py-16 lg:py-20",
				className,
			)}
			aria-labelledby="audio-grid-heading"
		>
			<div className={homeInsetClass}>
				<h2
					id="audio-grid-heading"
					className="font-heading text-display font-bold leading-[1.05] text-balance"
				>
					{title}
				</h2>

				<AudioFilterBar
					soundTypes={soundTypes}
					topics={topics}
					activeType={activeType}
					activeState={activeState}
					activeTopicId={activeTopicId}
					activeQuery={activeQuery}
					itemCount={totalElements}
					scrollTargetId={id}
					className="mt-8 sm:mt-10"
				/>

				{isEmpty ? (
					<div className="mt-8 border border-border bg-surface px-6 py-12 text-center sm:mt-10 sm:px-10">
						<p className="text-body text-muted">{noResultsMessage}</p>
					</div>
				) : (
					<div className="mt-8 grid grid-cols-2 gap-3 sm:mt-10 sm:gap-4 lg:grid-cols-3 xl:grid-cols-4">
						{cardProps.map((card) => (
							<AudioCard key={card.id} {...card} />
						))}
					</div>
				)}

				{!isEmpty && totalPages > 1 ? (
					<div className="mt-10 flex justify-center sm:mt-12">
						<AudioPagination
							currentPage={currentPage}
							totalPages={totalPages}
							activeType={activeType}
							activeState={activeState}
							activeTopicId={activeTopicId}
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
