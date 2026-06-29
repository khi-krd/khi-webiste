"use client";

import {
	BackwardIcon,
	ForwardIcon,
	SpeakerWaveIcon,
	SpeakerXMarkIcon,
	XMarkIcon,
} from "@heroicons/react/24/outline";
import { PauseIcon, PlayIcon } from "@heroicons/react/24/solid";
import NextImage from "next/image";
import { useTranslations } from "next-intl";
import {
	usePlayer,
	usePlayerTime,
} from "@/components/audio/audio-player-context";
import { DirectionalIcon } from "@/components/ui/directional-icon";
import { Link } from "@/components/ui/link";
import { formatDuration } from "@/lib/audio/format";
import { homeInsetClass } from "@/lib/layout";
import { cn } from "@/lib/utils";

// .khi-audio-range styles live in globals.css (shell component styles).

const controlButtonClass =
	"inline-flex size-9 shrink-0 items-center justify-center rounded-md text-foreground transition-colors fine-hover:bg-sunken focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring";

/**
 * Persistent SoundCloud-style bottom bar. Renders nothing until a queue is
 * loaded; when active, an in-flow spacer keeps the footer reachable under the
 * fixed bar. Mounted once in the locale layout so playback survives
 * navigation.
 */
export function AudioPlayerBar() {
	const { state, actions } = usePlayer();
	const { currentTime, duration } = usePlayerTime();
	const t = useTranslations("Audio.player");

	const current = state.queue[state.index];

	if (!current) {
		return null;
	}

	const isPlaying = state.status === "playing";
	const elapsedLabel = formatDuration(currentTime) ?? "0:00";
	const totalLabel = formatDuration(duration) ?? "0:00";
	const seekMax = Math.max(1, Math.round(duration));
	const progress = duration > 0 ? Math.min(1, currentTime / duration) : 0;
	const volumeProgress = state.muted ? 0 : state.volume;

	return (
		<>
			{/* in-flow spacer so the fixed bar never covers the footer */}
			<div aria-hidden className="h-16 sm:h-18" />

			<section
				aria-label={t("label")}
				className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-surface pb-[env(safe-area-inset-bottom)]"
			>
				{/* mobile progress hairline (full seek group is hidden below md) */}
				<div
					aria-hidden
					className="absolute inset-x-0 top-0 h-px bg-border md:hidden"
				>
					<div
						className="h-full bg-accent"
						style={{ width: `${progress * 100}%` }}
					/>
				</div>

				<div
					className={cn(
						homeInsetClass,
						"flex h-16 items-center gap-3 sm:h-18 sm:gap-4",
					)}
				>
					<div className="relative size-11 shrink-0 overflow-hidden border border-border bg-sunken sm:size-12">
						{current.coverUrl ? (
							<NextImage
								src={current.coverUrl}
								alt=""
								fill
								sizes="48px"
								className="object-cover"
							/>
						) : null}
					</div>

					<div className="min-w-0 flex-1 md:w-56 md:flex-none">
						<Link
							href={current.href}
							variant="nav"
							className="block max-w-full truncate text-small font-medium text-foreground"
						>
							{current.title}
						</Link>
						{current.artist ? (
							<p className="truncate text-label text-muted">{current.artist}</p>
						) : null}
					</div>

					<div className="flex shrink-0 items-center gap-1">
						<button
							type="button"
							onClick={actions.previous}
							aria-label={t("previous")}
							className={controlButtonClass}
						>
							<DirectionalIcon icon={BackwardIcon} className="size-4" />
						</button>
						<button
							type="button"
							onClick={actions.toggle}
							aria-label={isPlaying ? t("pause") : t("play")}
							aria-pressed={isPlaying}
							className={cn(
								controlButtonClass,
								"size-10 bg-primary text-primary-foreground fine-hover:bg-primary fine-hover:opacity-90",
							)}
						>
							{isPlaying ? (
								<PauseIcon aria-hidden className="size-4" />
							) : (
								<PlayIcon aria-hidden className="size-4" />
							)}
						</button>
						<button
							type="button"
							onClick={actions.next}
							aria-label={t("next")}
							className={controlButtonClass}
						>
							<DirectionalIcon icon={ForwardIcon} className="size-4" />
						</button>
					</div>

					<div className="hidden min-w-0 flex-1 items-center gap-3 md:flex">
						<span
							dir="ltr"
							className="shrink-0 text-label text-muted tabular-nums"
						>
							{elapsedLabel}
						</span>
						<input
							type="range"
							min={0}
							max={seekMax}
							step={1}
							value={Math.min(seekMax, Math.round(currentTime))}
							onChange={(event) => actions.seek(Number(event.target.value))}
							aria-label={t("seek")}
							aria-valuetext={`${elapsedLabel} / ${totalLabel}`}
							className="khi-audio-range min-w-0 flex-1"
							style={{ "--progress": progress } as React.CSSProperties}
						/>
						<span
							dir="ltr"
							className="shrink-0 text-label text-muted tabular-nums"
						>
							{totalLabel}
						</span>
					</div>

					<div className="hidden shrink-0 items-center gap-2 sm:flex">
						<button
							type="button"
							onClick={actions.toggleMute}
							aria-label={state.muted ? t("unmute") : t("mute")}
							aria-pressed={state.muted}
							className={controlButtonClass}
						>
							{state.muted ? (
								<SpeakerXMarkIcon aria-hidden className="size-4" />
							) : (
								<SpeakerWaveIcon aria-hidden className="size-4" />
							)}
						</button>
						<input
							type="range"
							min={0}
							max={1}
							step={0.05}
							value={state.muted ? 0 : state.volume}
							onChange={(event) =>
								actions.setVolume(Number(event.target.value))
							}
							aria-label={t("volume")}
							className="khi-audio-range hidden w-20 lg:block"
							style={{ "--progress": volumeProgress } as React.CSSProperties}
						/>
					</div>

					<button
						type="button"
						onClick={actions.close}
						aria-label={t("close")}
						className={controlButtonClass}
					>
						<XMarkIcon aria-hidden className="size-4" />
					</button>
				</div>
			</section>
		</>
	);
}
