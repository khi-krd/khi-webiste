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

function statsGridClass(count: number): string {
	if (count <= 1) {
		return "grid-cols-1";
	}
	if (count === 2) {
		return "grid-cols-2";
	}
	if (count === 3) {
		return "grid-cols-1 sm:grid-cols-3";
	}
	return "grid-cols-2 sm:grid-cols-4";
}

/**
 * Hairline stats grid (duration / size / tracks / year). `gap-px` over a
 * border-colored backdrop draws the inner rules; column count matches the
 * number of stats so empty cells never appear.
 */
export function AudioStatsStrip({ stats, className }: AudioStatsStripProps) {
	if (stats.length === 0) {
		return null;
	}

	return (
		<ScrollReveal
			className={cn(
				"grid gap-px border border-border bg-border",
				statsGridClass(stats.length),
				className,
			)}
		>
			{stats.map((stat) => (
				<ScrollRevealItem key={stat.key}>
					<div className="flex h-full flex-col gap-1.5 bg-surface px-4 py-5 text-start sm:px-5">
						<p className="label font-medium">{stat.label}</p>
						<p
							dir="ltr"
							className="font-heading text-h2 font-bold leading-none tabular-nums"
						>
							{stat.value}
						</p>
					</div>
				</ScrollRevealItem>
			))}
		</ScrollReveal>
	);
}
