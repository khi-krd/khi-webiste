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
 * Sleeve fine print (duration / size / tracks / year): a single centered line
 * of stats between top and bottom hairlines, like the print run details on a
 * record sleeve spine.
 */
export function AudioStatsStrip({ stats, className }: AudioStatsStripProps) {
	if (stats.length === 0) {
		return null;
	}

	return (
		<ScrollReveal
			className={cn(
				"flex flex-wrap items-baseline justify-center gap-x-10 gap-y-4 border-y border-border px-4 py-5",
				className,
			)}
		>
			{stats.map((stat) => (
				<ScrollRevealItem key={stat.key}>
					<div className="flex flex-col items-center gap-1 text-center">
						<p className="label font-medium text-muted">{stat.label}</p>
						<p
							dir="ltr"
							className="font-heading text-h3 font-bold leading-none tabular-nums"
						>
							{stat.value}
						</p>
					</div>
				</ScrollRevealItem>
			))}
		</ScrollReveal>
	);
}
