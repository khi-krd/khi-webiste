import { getLocale, getTranslations } from "next-intl/server";
import {
	type SoundSectionCardItem,
	SoundSectionCards,
} from "@/components/home/sound-section-cards";
import { SoundSectionContent } from "@/components/home/sound-section-content";
import { SoundSectionVideo } from "@/components/home/sound-section-video";
import { getAudioCarousel } from "@/lib/api/audio";
import { formatDuration } from "@/lib/audio/format";
import { soundTypeLabel } from "@/lib/audio/sound-types";
import { cn } from "@/lib/utils";

type SoundSectionProps = {
	/** Constrained height for UI playground previews. */
	compact?: boolean;
	className?: string;
};

export async function SoundSection({
	compact = false,
	className,
}: SoundSectionProps = {}) {
	const locale = await getLocale();
	const [t, audioT, cards] = await Promise.all([
		getTranslations("Sound"),
		getTranslations("Audio"),
		getAudioCarousel(locale, compact ? 3 : undefined),
	]);

	const cardItems: SoundSectionCardItem[] = cards.map((card) => {
		const typeLabel = soundTypeLabel((key) => audioT(key), card.soundType);
		const durationLabel = formatDuration(card.totalDurationSeconds);
		const trackCountLabel =
			card.trackState === "MULTI"
				? audioT("card.albumTracks", { count: card.totalTracks ?? 0 })
				: null;

		return {
			id: card.id,
			title: card.title,
			typeLabel,
			durationLabel,
			trackCountLabel,
			coverUrl: card.coverUrl,
			queue: card.queue,
		};
	});

	return (
		<section
			aria-labelledby="sound-heading"
			data-snap-section
			className={cn(
				"cv-auto relative w-full overflow-hidden border-t border-border [--cv-intrinsic:1000px]",
				compact ? "min-h-128 sm:min-h-160" : "min-h-svh",
				className,
			)}
		>
			<SoundSectionVideo />

			{/* Warm ink wash + legibility scrims (stacked; strongest at bottom + text side). */}
			<div
				className="pointer-events-none absolute inset-0 z-1 bg-foreground/45"
				aria-hidden
			/>
			<div
				className="pointer-events-none absolute inset-0 z-1 bg-linear-to-t from-foreground from-0% via-foreground/80 via-32% to-transparent to-72%"
				aria-hidden
			/>
			<div
				className="pointer-events-none absolute inset-x-0 top-0 z-1 h-44 bg-linear-to-b from-foreground/85 via-foreground/35 to-transparent sm:h-52"
				aria-hidden
			/>
			<div
				className="pointer-events-none absolute inset-0 z-1 bg-linear-to-r from-foreground/75 from-0% via-foreground/40 via-42% to-transparent to-80% rtl:bg-linear-to-l"
				aria-hidden
			/>
			<div
				className="pointer-events-none absolute inset-0 z-1 bg-[radial-gradient(ellipse_130%_90%_at_50%_115%,var(--color-foreground)_0%,transparent_62%)] opacity-70"
				aria-hidden
			/>

			<div className="relative z-10 flex min-h-[inherit] flex-col justify-end px-6 pb-16 sm:px-10 sm:pb-20 lg:px-14 lg:pb-24">
				<SoundSectionContent
					eyebrow={t("eyebrow")}
					title={t("title")}
					description={t("description")}
					cta={t("cta")}
					ctaHref="/audio"
				/>
				<SoundSectionCards items={cardItems} compact={compact} />
			</div>
		</section>
	);
}
