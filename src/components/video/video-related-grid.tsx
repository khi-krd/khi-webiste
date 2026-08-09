import {
	VideoPosterCard,
	type VideoPosterCardProps,
} from "@/components/video/video-poster-card";
import { cn } from "@/lib/utils";

/** One row only — enough cards to fill the row with no overflow scroll. */
export const RELATED_VIDEOS_VISIBLE = 3;

type VideoRelatedGridProps = {
	title: string;
	cards: VideoPosterCardProps[];
	/** Dark theme for the cinema short-film detail page. */
	dark?: boolean;
	className?: string;
	/**
	 * Padding below the top hairline. A prop (not className) because cn() is a
	 * plain joiner — a caller's pt-* utility cannot reliably override the
	 * default in the compiled sheet.
	 */
	seamClassName?: string;
};

/**
 * Fixed single row of related posters — no carousel, no horizontal scroll.
 */
export function VideoRelatedGrid({
	title,
	cards,
	dark = false,
	className,
	seamClassName = "pt-8 sm:pt-10",
}: VideoRelatedGridProps) {
	const visible = cards.slice(0, RELATED_VIDEOS_VISIBLE);

	if (visible.length === 0) {
		return null;
	}

	return (
		<section
			className={cn(
				"border-t",
				seamClassName,
				dark ? "border-primary-foreground/20" : "border-border",
				className,
			)}
			aria-labelledby="video-related-heading"
		>
			<h2
				id="video-related-heading"
				className={cn(
					"font-heading text-h3 font-bold",
					dark ? "text-primary-foreground" : "text-foreground",
				)}
			>
				{title}
			</h2>

			<div className="mt-4 grid grid-cols-1 gap-4 sm:mt-5 sm:grid-cols-3 sm:gap-5">
				{visible.map((card) => (
					<VideoPosterCard
						key={card.id}
						{...card}
						dark={dark}
						className="min-w-0"
					/>
				))}
			</div>
		</section>
	);
}
