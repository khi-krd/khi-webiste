import { getLocale, getTranslations } from "next-intl/server";
import {
	type SoundSectionCardItem,
	SoundSectionCards,
} from "@/components/home/sound-section-cards";
import { SoundSectionContent } from "@/components/home/sound-section-content";
import { SoundSectionVideo } from "@/components/home/sound-section-video";
import { getAudioCarousel, getSoundReklamVideo } from "@/lib/api/audio";
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
	const [t, cards, reklam] = await Promise.all([
		getTranslations("Sound"),
		getAudioCarousel(locale, compact ? 4 : undefined),
		getSoundReklamVideo(),
	]);

	const cardItems: SoundSectionCardItem[] = cards.map((card) => ({
		id: card.id,
		title: card.title,
		subtitle: card.subtitle,
		coverUrl: card.coverUrl,
		queue: card.queue,
	}));

	return (
		<section
			aria-labelledby="sound-heading"
			className={cn(
				"cv-auto relative w-full overflow-hidden border-t border-border [--cv-intrinsic:1000px]",
				compact ? "min-h-128 sm:min-h-160" : "min-h-svh",
				className,
			)}
		>
			<SoundSectionVideo src={reklam?.videoUrl ?? null} />

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

			{/* Heading + album wall share one flex column: the grid is `flex-1`, so
			    it takes exactly the height the heading leaves over and both rows
			    stay inside this section's viewport. `pt` clears the sticky header. */}
			<div className="relative z-10 flex min-h-[inherit] flex-col justify-end gap-5 px-6 pt-20 pb-10 sm:gap-6 sm:px-10 sm:pt-24 sm:pb-12 lg:px-14">
				<SoundSectionContent
					title={t("title")}
					ctaLabel={t("cta")}
					ctaHref="/audio"
				/>
				<SoundSectionCards items={cardItems} compact={compact} />
			</div>
		</section>
	);
}
