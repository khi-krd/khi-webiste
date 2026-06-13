"use client";

import { PlayIcon, SpeakerWaveIcon } from "@heroicons/react/24/solid";
import { cn } from "@/lib/utils";
import { formatDuration } from "@/lib/video/format";
import type { ResolvedVideoClip } from "@/types/video";

export type VideoClipListLabels = {
	title: string;
	play: string;
	nowPlaying: string;
};

type VideoClipListProps = {
	clips: ResolvedVideoClip[];
	activeClipNumber: number;
	onSelect: (clipNumber: number) => void;
	labels: VideoClipListLabels;
	className?: string;
};

export function VideoClipList({
	clips,
	activeClipNumber,
	onSelect,
	labels,
	className,
}: VideoClipListProps) {
	if (clips.length === 0) {
		return null;
	}

	return (
		<section className={cn(className)} aria-label={labels.title}>
			<p className="label font-medium">{labels.title}</p>
			<ol className="mt-4 border-t border-border">
				{clips.map((clip) => {
					const isActive = clip.clipNumber === activeClipNumber;
					const duration = formatDuration(clip.durationSeconds);

					return (
						<li key={clip.clipNumber}>
							<button
								type="button"
								onClick={() => onSelect(clip.clipNumber)}
								aria-current={isActive ? "true" : undefined}
								className={cn(
									"flex w-full items-center gap-4 border-b border-border px-3 py-3.5 text-start transition-colors sm:px-4",
									isActive
										? "bg-sunken"
										: "bg-transparent fine-hover:bg-sunken/60",
								)}
							>
								<span
									className={cn(
										"flex size-8 shrink-0 items-center justify-center border text-small tabular-nums transition-colors",
										isActive
											? "border-foreground bg-primary text-primary-foreground"
											: "border-border-strong text-muted",
									)}
								>
									{isActive ? (
										<SpeakerWaveIcon className="size-4" aria-hidden />
									) : (
										<span aria-hidden>{clip.clipNumber}</span>
									)}
								</span>

								<span className="min-w-0 flex-1">
									<span className="block truncate font-heading text-body font-medium text-foreground">
										{clip.title}
									</span>
									{isActive ? (
										<span className="label text-muted">
											{labels.nowPlaying}
										</span>
									) : null}
								</span>

								{duration ? (
									<span
										dir="ltr"
										className="label shrink-0 text-muted tabular-nums"
									>
										{duration}
									</span>
								) : (
									<PlayIcon
										className="size-4 shrink-0 text-muted"
										aria-hidden
									/>
								)}
							</button>
						</li>
					);
				})}
			</ol>
		</section>
	);
}
