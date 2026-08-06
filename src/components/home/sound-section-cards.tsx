"use client";

import { ArrowRightIcon } from "@heroicons/react/24/outline";
import NextImage from "next/image";
import { AudioDialButton } from "@/components/audio/audio-dial-button";
import { usePlayer } from "@/components/audio/audio-player-context";
import {
	ScrollReveal,
	ScrollRevealItem,
} from "@/components/motion/scroll-reveal";
import { DirectionalIcon } from "@/components/ui/directional-icon";
import { Link } from "@/components/ui/link";
import { audioDetailHref } from "@/lib/audio/resolve";
import { cn } from "@/lib/utils";
import type { PlayerTrackPayload } from "@/types/audio";

export type SoundSectionCardItem = {
	id: number;
	title: string;
	/** Reader/artist — shown as the "singer" line under the title. */
	subtitle: string | null;
	coverUrl: string | null;
	queue: PlayerTrackPayload[];
};

type SoundSectionCardsProps = {
	items: SoundSectionCardItem[];
	compact?: boolean;
	ctaLabel: string;
	ctaHref: string;
};

const GRID_MAX_ITEMS = 12;
const COMPACT_MAX_ITEMS = 4;

const soundCtaClass =
	"group/sound-cta relative inline-flex h-10 w-fit shrink-0 items-center gap-2.5 overflow-hidden rounded-tl-lg rounded-br-lg border border-primary-foreground/70 bg-primary-foreground/10 px-5 font-heading text-small font-semibold text-primary-foreground no-underline backdrop-blur-[2px] transition-[color,gap,box-shadow,background-color,border-color] duration-300 ease-out before:absolute before:inset-0 before:z-0 before:origin-bottom before:scale-y-0 before:bg-primary-foreground before:transition-transform before:duration-300 before:ease-[cubic-bezier(0.22,1,0.36,1)] fine-hover:gap-3.5 fine-hover:border-primary-foreground fine-hover:text-foreground fine-hover:shadow-[0_8px_24px_-12px_color-mix(in_oklch,var(--color-foreground)_55%,transparent)] fine-hover:before:scale-y-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-foreground motion-reduce:before:transition-none motion-reduce:fine-hover:before:scale-y-100 motion-reduce:fine-hover:gap-2.5";

function SoundSectionCard({ item }: { item: SoundSectionCardItem }) {
	const { state } = usePlayer();
	const current = state.queue[state.index];
	const isActive = item.queue.some((track) => track.fileId === current?.fileId);
	const isPlaying = isActive && state.status === "playing";

	return (
		<article
			className={cn(
				"group relative flex flex-col overflow-hidden rounded-lg border border-primary-foreground/15 bg-primary-foreground/6 [will-change:transform] transition-[transform,box-shadow,background-color,border-color] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]",
				"fine-hover:-translate-y-1.5 fine-hover:border-primary-foreground/35 fine-hover:bg-primary-foreground/10 fine-hover:shadow-[0_24px_50px_-22px_rgba(0,0,0,0.65)]",
				isActive &&
					"border-accent/40 bg-primary-foreground/12 shadow-[0_24px_50px_-22px_rgba(0,0,0,0.65)]",
			)}
		>
			<div className="relative aspect-square w-full overflow-hidden bg-foreground/50">
				{item.coverUrl ? (
					<NextImage
						src={item.coverUrl}
						alt=""
						fill
						sizes="(max-width: 640px) 45vw, (max-width: 1024px) 30vw, 22vw"
						className={cn(
							"object-cover transition-[filter,transform] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]",
							isActive
								? "brightness-100 saturate-100"
								: "brightness-[0.85] saturate-[0.9] group-fine:scale-[1.05] group-fine:brightness-100",
						)}
					/>
				) : (
					<div
						aria-hidden
						className="flex h-full w-full items-center justify-center bg-primary-foreground/8"
					>
						<span className="font-heading text-h2 font-bold text-primary-foreground/20">
							{item.title.charAt(0)}
						</span>
					</div>
				)}

				<div
					aria-hidden
					className={cn(
						"absolute inset-0 bg-linear-to-t from-foreground/80 via-foreground/10 to-transparent transition-opacity duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]",
						isPlaying ? "opacity-100" : "opacity-70 group-fine:opacity-85",
					)}
				/>

				{item.queue.length > 0 ? (
					<AudioDialButton
						queue={item.queue}
						className="absolute inset-0 z-2 m-auto size-16 sm:size-20"
					/>
				) : null}
			</div>

			<div className="flex flex-1 flex-col gap-1 px-4 py-4 sm:px-5">
				<h3 className="line-clamp-2 font-heading text-body font-semibold leading-snug text-primary-foreground">
					<Link
						href={audioDetailHref(item.id)}
						variant="nav"
						className="text-inherit no-underline after:absolute after:inset-0 after:z-1 after:content-[''] transition-[text-decoration-color] duration-300 hover:text-primary-foreground! group-fine:underline group-fine:decoration-primary-foreground/35 group-fine:underline-offset-[0.2em] motion-reduce:group-fine:no-underline"
					>
						{item.title}
					</Link>
				</h3>
				{item.subtitle ? (
					<p className="truncate text-small text-primary-foreground/60">
						{item.subtitle}
					</p>
				) : null}
			</div>
		</article>
	);
}

export function SoundSectionCards({
	items,
	compact = false,
	ctaLabel,
	ctaHref,
}: SoundSectionCardsProps) {
	if (items.length === 0) {
		return null;
	}

	const visibleItems = items.slice(
		0,
		compact ? COMPACT_MAX_ITEMS : GRID_MAX_ITEMS,
	);

	return (
		<ScrollReveal className="mt-8 sm:mt-10 lg:mt-12">
			<ScrollRevealItem>
				<div className="relative overflow-hidden rounded-lg border border-primary-foreground/18 bg-primary-foreground/8 backdrop-blur-md">
					<Link
						href={ctaHref}
						variant="nav"
						className={cn(soundCtaClass, "absolute! left-0 top-0 z-10")}
					>
						<span className="relative z-1">{ctaLabel}</span>
						<DirectionalIcon
							icon={ArrowRightIcon}
							className="relative z-1 size-4"
						/>
					</Link>

					<div className="grid grid-cols-2 gap-3 px-5 pb-5 pt-16 sm:grid-cols-3 sm:gap-4 sm:px-6 sm:pb-6 sm:pt-20 lg:grid-cols-4 lg:gap-5">
						{visibleItems.map((item) => (
							<SoundSectionCard key={item.id} item={item} />
						))}
					</div>
				</div>
			</ScrollRevealItem>
		</ScrollReveal>
	);
}
