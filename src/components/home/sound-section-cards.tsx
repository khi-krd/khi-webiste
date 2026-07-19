"use client";

import NextImage from "next/image";
import { AudioPlayButton } from "@/components/audio/audio-play-button";
import { usePlayer } from "@/components/audio/audio-player-context";
import {
	ScrollReveal,
	ScrollRevealItem,
} from "@/components/motion/scroll-reveal";
import { Link } from "@/components/ui/link";
import { audioDetailHref } from "@/lib/audio/resolve";
import { cn } from "@/lib/utils";
import type { PlayerTrackPayload } from "@/types/audio";

export type SoundSectionCardItem = {
	id: number;
	title: string;
	typeLabel: string;
	durationLabel: string | null;
	trackCountLabel: string | null;
	coverUrl: string | null;
	queue: PlayerTrackPayload[];
};

type SoundSectionCardsProps = {
	items: SoundSectionCardItem[];
	compact?: boolean;
};

function SoundSectionCard({ item }: { item: SoundSectionCardItem }) {
	const { state } = usePlayer();
	const current = state.queue[state.index];
	const isActive = item.queue.some((track) => track.fileId === current?.fileId);
	const isPlaying = isActive && state.status === "playing";

	const metaParts = [item.trackCountLabel].filter(Boolean);

	return (
		<article
			className={cn(
				"group relative flex min-w-0 items-start gap-4 px-4 py-5 transition-colors duration-300 sm:gap-5 sm:px-5 sm:py-6",
				isActive && "bg-primary-foreground/10",
				!isActive && "fine-hover:bg-primary-foreground/6",
			)}
		>
			<div className="relative size-32 shrink-0 overflow-hidden rounded-md ring-1 ring-primary-foreground/20 sm:size-40">
				{item.coverUrl ? (
					<NextImage
						src={item.coverUrl}
						alt=""
						fill
						sizes="(max-width: 640px) 8rem, 10rem"
						className={cn(
							"object-cover transition-[filter,transform] duration-500",
							isActive
								? "brightness-100 saturate-100"
								: "brightness-[0.92] saturate-[0.9] group-fine:scale-[1.04]",
						)}
					/>
				) : (
					<div
						aria-hidden
						className="flex h-full w-full items-center justify-center bg-primary-foreground/8"
					>
						<span className="font-heading text-title font-bold text-primary-foreground/25">
							{item.title.charAt(0)}
						</span>
					</div>
				)}

				<div
					aria-hidden
					className={cn(
						"absolute inset-0 rounded-md bg-foreground/25 transition-opacity duration-300",
						isPlaying ? "opacity-100" : "opacity-0 group-fine:opacity-45",
					)}
				/>

				{item.queue.length > 0 ? (
					<AudioPlayButton
						queue={item.queue}
						size="overlay"
						className={cn(
							"absolute bottom-1.5 start-1.5 z-2 size-10 rounded-md border-0 bg-primary text-primary-foreground opacity-90 transition-opacity duration-300 fine-hover:opacity-100 [&_svg]:size-4",
							isPlaying && "opacity-100",
						)}
					/>
				) : null}
			</div>

			<div className="min-w-0 flex-1">
				<div className="flex items-center gap-2">
					<span className="label border border-primary-foreground/20 bg-primary-foreground/10 px-2 py-0.5 font-medium text-primary-foreground/80">
						{item.typeLabel}
					</span>
					{item.durationLabel ? (
						<span
							dir="ltr"
							className="ms-auto shrink-0 text-small tabular-nums text-primary-foreground/50"
						>
							{item.durationLabel}
						</span>
					) : null}
				</div>

				<h3 className="mt-2.5 font-heading text-body font-semibold leading-snug text-primary-foreground">
					<Link
						href={audioDetailHref(item.id)}
						variant="nav"
						className="text-inherit no-underline after:absolute after:inset-0 after:z-1 after:content-[''] line-clamp-2 transition-[text-decoration-color] duration-300 group-fine:underline group-fine:decoration-primary-foreground/35 group-fine:underline-offset-[0.2em] motion-reduce:group-fine:no-underline"
					>
						{item.title}
					</Link>
				</h3>

				{metaParts.length > 0 ? (
					<p className="mt-1.5 truncate text-small text-primary-foreground/55">
						{metaParts.join(" · ")}
					</p>
				) : null}

				<div
					aria-hidden
					className={cn(
						"mt-2.5 h-px bg-primary-foreground/70 transition-opacity duration-300",
						isPlaying ? "opacity-100" : "opacity-0",
					)}
				/>
			</div>
		</article>
	);
}

export function SoundSectionCards({
	items,
	compact = false,
}: SoundSectionCardsProps) {
	if (items.length === 0) {
		return null;
	}

	return (
		<ScrollReveal className="mt-8 sm:mt-10 lg:mt-12">
			<ScrollRevealItem>
				<div className="overflow-hidden rounded-md border border-primary-foreground/18 bg-primary-foreground/8 backdrop-blur-md">
					<div
						className={cn(
							"grid grid-cols-1 sm:grid-cols-2",
							compact && "lg:grid-cols-2",
						)}
					>
						{items.map((item) => (
							<SoundSectionCard key={item.id} item={item} />
						))}
					</div>
				</div>
			</ScrollRevealItem>
		</ScrollReveal>
	);
}