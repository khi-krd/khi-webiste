"use client";

import { PauseIcon, PlayIcon } from "@heroicons/react/24/solid";
import { useEffect, useRef, useState } from "react";
import { Spinner } from "@/components/ui/spinner";
import { cn } from "@/lib/utils";

function formatTime(seconds: number): string {
	if (!Number.isFinite(seconds) || seconds < 0) {
		return "0:00";
	}
	const whole = Math.floor(seconds);
	const h = Math.floor(whole / 3600);
	const m = Math.floor((whole % 3600) / 60);
	const s = whole % 60;
	const mm = h > 0 ? String(m).padStart(2, "0") : String(m);
	const ss = String(s).padStart(2, "0");
	return h > 0 ? `${h}:${mm}:${ss}` : `${mm}:${ss}`;
}

type PlatformAudioPlayerProps = {
	/** Absolute stream URL — the platform proxy answers Range requests. */
	src: string;
	playLabel: string;
	pauseLabel: string;
	seekLabel: string;
	playerLabel: string;
	unsupportedText: string;
	className?: string;
};

/**
 * Self-contained transport for one platform recording: play/pause, a seekable
 * progress rule and times. Deliberately independent from the site's own album
 * player — platform items live outside the CMS track model. The strip is
 * LTR regardless of locale: a timeline reads left→right like the digits on it.
 */
export function PlatformAudioPlayer({
	src,
	playLabel,
	pauseLabel,
	seekLabel,
	playerLabel,
	unsupportedText,
	className,
}: PlatformAudioPlayerProps) {
	const audioRef = useRef<HTMLAudioElement>(null);
	const [playing, setPlaying] = useState(false);
	const [buffering, setBuffering] = useState(false);
	const [currentTime, setCurrentTime] = useState(0);
	const [duration, setDuration] = useState(0);
	const [failed, setFailed] = useState(false);

	useEffect(() => {
		const audio = audioRef.current;
		if (!audio) {
			return;
		}

		const onTime = () => setCurrentTime(audio.currentTime);
		const onMeta = () => setDuration(audio.duration);
		const onPlay = () => setPlaying(true);
		const onPause = () => setPlaying(false);
		const onWaiting = () => setBuffering(true);
		const onReady = () => setBuffering(false);
		const onEnded = () => {
			setPlaying(false);
			setCurrentTime(0);
		};
		const onError = () => {
			setFailed(true);
			setBuffering(false);
		};

		audio.addEventListener("timeupdate", onTime);
		audio.addEventListener("loadedmetadata", onMeta);
		audio.addEventListener("durationchange", onMeta);
		audio.addEventListener("play", onPlay);
		audio.addEventListener("pause", onPause);
		audio.addEventListener("waiting", onWaiting);
		audio.addEventListener("playing", onReady);
		audio.addEventListener("canplay", onReady);
		audio.addEventListener("ended", onEnded);
		audio.addEventListener("error", onError);
		return () => {
			audio.removeEventListener("timeupdate", onTime);
			audio.removeEventListener("loadedmetadata", onMeta);
			audio.removeEventListener("durationchange", onMeta);
			audio.removeEventListener("play", onPlay);
			audio.removeEventListener("pause", onPause);
			audio.removeEventListener("waiting", onWaiting);
			audio.removeEventListener("playing", onReady);
			audio.removeEventListener("canplay", onReady);
			audio.removeEventListener("ended", onEnded);
			audio.removeEventListener("error", onError);
		};
	}, []);

	function toggle() {
		const audio = audioRef.current;
		if (!audio) {
			return;
		}
		if (playing) {
			audio.pause();
		} else {
			void audio.play().catch(() => setFailed(true));
		}
	}

	function seek(value: number) {
		const audio = audioRef.current;
		if (!audio || !Number.isFinite(audio.duration)) {
			return;
		}
		audio.currentTime = value;
		setCurrentTime(value);
	}

	if (failed) {
		return (
			<p className={cn("text-small text-muted", className)}>
				{unsupportedText}
			</p>
		);
	}

	const progress = duration > 0 ? Math.min(currentTime / duration, 1) : 0;

	return (
		<section
			dir="ltr"
			aria-label={playerLabel}
			className={cn(
				"flex items-center gap-4 border border-border bg-surface p-3 sm:p-4",
				className,
			)}
		>
			{/* biome-ignore lint/a11y/useMediaCaption: archive recordings carry no caption tracks */}
			<audio ref={audioRef} src={src} preload="metadata" />

			<button
				type="button"
				onClick={toggle}
				aria-label={playing ? pauseLabel : playLabel}
				className={cn(
					"inline-flex size-12 shrink-0 cursor-pointer items-center justify-center",
					"bg-primary text-primary-foreground transition-opacity fine-hover:opacity-90",
				)}
			>
				{buffering && playing ? (
					<Spinner size="sm" className="text-primary-foreground" />
				) : playing ? (
					<PauseIcon className="size-5" aria-hidden />
				) : (
					<PlayIcon className="size-5 translate-x-px" aria-hidden />
				)}
			</button>

			<span className="w-12 shrink-0 text-end text-small tabular-nums text-foreground">
				{formatTime(currentTime)}
			</span>

			<div className="relative flex h-6 min-w-0 flex-1 items-center">
				{/* Track + fill drawn under a transparent native range for a11y. */}
				<span aria-hidden className="absolute inset-x-0 h-1 bg-border" />
				<span
					aria-hidden
					className="absolute h-1 bg-accent"
					style={{ width: `${progress * 100}%`, insetInlineStart: 0, left: 0 }}
				/>
				<input
					type="range"
					min={0}
					max={duration > 0 ? duration : 0}
					step={0.1}
					value={Math.min(currentTime, duration || 0)}
					disabled={duration <= 0}
					aria-label={seekLabel}
					onChange={(event) => seek(Number(event.target.value))}
					className={cn(
						"relative z-1 h-6 w-full cursor-pointer appearance-none bg-transparent",
						"disabled:cursor-default",
						"[&::-webkit-slider-thumb]:size-3 [&::-webkit-slider-thumb]:appearance-none",
						"[&::-webkit-slider-thumb]:bg-primary",
						"[&::-moz-range-thumb]:size-3 [&::-moz-range-thumb]:border-0",
						"[&::-moz-range-thumb]:rounded-none [&::-moz-range-thumb]:bg-primary",
					)}
				/>
			</div>

			<span className="w-12 shrink-0 text-small tabular-nums text-muted">
				{formatTime(duration)}
			</span>
		</section>
	);
}
