import {
	ScrollReveal,
	ScrollRevealItem,
} from "@/components/motion/scroll-reveal";
import { cn } from "@/lib/utils";

export type AudioStat = {
	key: string;
	label: string;
	value: string;
};

type AudioStatsStripProps = {
	stats: AudioStat[];
	className?: string;
};

/**
 * Hairline stats grid (duration / size / tracks / year). `gap-px` over a
 * border-colored backdrop draws the inner rules, so it mirrors in RTL without
 * physical divide utilities.
 */
export function AudioStatsStrip({ stats, className }: AudioStatsStripProps) {
	if (stats.length === 0) {
		return null;
	}

	return (
		<ScrollReveal
			className={cn(
				"grid grid-cols-2 gap-px border border-border bg-border sm:grid-cols-4",
				stats.length < 4 && "sm:grid-cols-2 lg:grid-cols-4",
				className,
			)}
		>
			{stats.map((stat) => (
				<ScrollRevealItem key={stat.key}>
					<div className="flex flex-col gap-1.5 bg-surface px-4 py-5 sm:px-5">
						<dt className="label font-medium">{stat.label}</dt>
						<dd
							dir="ltr"
							className="font-heading text-h2 font-bold leading-none text-start tabular-nums"
						>
							{stat.value}
						</dd>
					</div>
				</ScrollRevealItem>
			))}
		</ScrollReveal>
	);
}
