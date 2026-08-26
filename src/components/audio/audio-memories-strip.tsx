import NextImage from "next/image";
import { AudioCardTransport } from "@/components/audio/audio-card-transport";
import {
	ScrollReveal,
	ScrollRevealBlock,
	ScrollRevealItem,
} from "@/components/motion/scroll-reveal";
import { Link } from "@/components/ui/link";
import { formatDuration } from "@/lib/audio/format";
import { audioDetailHref } from "@/lib/audio/resolve";
import { homeInsetClass } from "@/lib/layout";
import { cn } from "@/lib/utils";
import type { ResolvedAudioCard } from "@/types/audio";

type AudioMemoriesStripProps = {
	title: string;
	description: string;
	items: ResolvedAudioCard[];
	className?: string;
};

function MemoriesCard({ item }: { item: ResolvedAudioCard }) {
	const durationLabel = formatDuration(item.totalDurationSeconds);
	const metaItems = [item.subtitle, durationLabel].filter(Boolean);

	return (
		<article className="group relative w-52 shrink-0 snap-start sm:w-60">
			<div className="relative aspect-square w-full overflow-hidden border border-border bg-sunken">
				{item.coverUrl ? (
					<NextImage
						src={item.coverUrl}
						alt=""
						fill
						sizes="(max-width: 640px) 13rem, 15rem"
						className="object-cover brightness-[0.94] saturate-[0.88] sepia-[0.3] contrast-[0.96] transition-[filter,transform] duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] group-fine:scale-[1.04] group-fine:brightness-100 group-fine:saturate-100"
					/>
				) : null}
				<AudioCardTransport seedId={item.id} queue={item.queue} />
			</div>

			<h3 className="mt-3 font-heading text-body font-bold leading-snug">
				<Link
					href={audioDetailHref(item.id)}
					variant="nav"
					className="text-inherit no-underline after:absolute after:inset-0 after:z-1 after:content-['']"
				>
					{item.title}
				</Link>
			</h3>
			{metaItems.length > 0 ? (
				<p className="mt-1 truncate text-small text-muted">
					{metaItems.join(" · ")}
				</p>
			) : null}
		</article>
	);
}

/** Hairline-boxed horizontal strip for the Album-of-Memories collection. */
export function AudioMemoriesStrip({
	title,
	description,
	items,
	className,
}: AudioMemoriesStripProps) {
	if (items.length === 0) {
		return null;
	}

	return (
		<section
			aria-labelledby="audio-memories-heading"
			className={cn("w-full bg-background py-12 sm:py-16", className)}
		>
			<div className={homeInsetClass}>
				<div className="border border-border bg-surface">
					<ScrollRevealBlock className="flex flex-wrap items-baseline justify-between gap-3 border-b border-border px-5 py-5 sm:px-6">
						<h2
							id="audio-memories-heading"
							className="font-heading text-h2 font-bold"
						>
							{title}
						</h2>
						<p className="max-w-md text-small text-muted">{description}</p>
					</ScrollRevealBlock>

					<ScrollReveal className="flex snap-x snap-mandatory gap-4 overflow-x-auto px-5 py-6 sm:gap-5 sm:px-6">
						{items.map((item) => (
							<ScrollRevealItem key={item.id}>
								<MemoriesCard item={item} />
							</ScrollRevealItem>
						))}
					</ScrollReveal>
				</div>
			</div>
		</section>
	);
}
