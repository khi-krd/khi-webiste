"use client";

import { PlayIcon } from "@heroicons/react/24/solid";
import {
	Controls,
	MediaProvider,
	PlayButton,
	Poster,
	Spinner,
	TimeSlider,
	useMediaRemote,
	useMediaState,
	VolumeSlider,
} from "@vidstack/react";
import {
	type PointerEvent as ReactPointerEvent,
	type ReactNode,
	useRef,
} from "react";

export type KhiVideoPlayerLayoutProps = {
	poster?: string;
	posterAlt?: string;
	embed?: "file" | "youtube";
};

const DBL_CLICK_MS = 280;

/**
 * Immediate play/pause on center click.
 * Vidstack's Gesture waits ~250ms to disambiguate double-clicks; we bypass that.
 */
function PlaybackToggleLayer({
	allowFullscreenDblClick,
}: {
	allowFullscreenDblClick: boolean;
}) {
	const remote = useMediaRemote();
	const lastClickAt = useRef(0);

	const onPointerUp = (event: ReactPointerEvent<HTMLDivElement>) => {
		if (event.button !== 0) return;

		const now = Date.now();
		const isDoubleClick =
			allowFullscreenDblClick && now - lastClickAt.current < DBL_CLICK_MS;
		lastClickAt.current = now;

		remote.togglePaused(event.nativeEvent);
		if (isDoubleClick) {
			remote.toggleFullscreen("prefer-media", event.nativeEvent);
		}
	};

	return (
		<div
			className="khi-player__gesture"
			onPointerUp={onPointerUp}
			aria-hidden
		/>
	);
}

export function PlayerMedia({
	poster,
	posterAlt = "",
	embed = "file",
}: KhiVideoPlayerLayoutProps) {
	const isYouTube = embed === "youtube";

	return (
		<>
			<MediaProvider />
			{poster ? (
				<Poster
					className="vds-poster khi-player__poster"
					src={poster}
					alt={posterAlt}
					crossOrigin={isYouTube ? "anonymous" : undefined}
				/>
			) : null}
			{/* YouTube iframe uses pointer-events: none; playback is API-driven. */}
			<PlaybackToggleLayer allowFullscreenDblClick={!isYouTube} />
		</>
	);
}

export function CenterPlayButton() {
	const started = useMediaState("started");
	const paused = useMediaState("paused");
	const ended = useMediaState("ended");
	const isIdle = !started;
	const show = isIdle || paused || ended;

	if (!show) return null;

	return (
		<div
			className={
				isIdle
					? "khi-player__center-play khi-player__center-play--idle"
					: "khi-player__center-play"
			}
		>
			<PlayButton className="khi-player__center-play-btn">
				<span className="khi-player__center-play-ring" aria-hidden />
				<PlayIcon className="khi-player__center-play-icon" />
			</PlayButton>
		</div>
	);
}

export function BufferingSpinner() {
	const waiting = useMediaState("waiting");

	if (!waiting) return null;

	return (
		<div className="khi-player__spinner" aria-hidden>
			<Spinner.Root>
				<Spinner.Track className="khi-player__spinner-track" />
				<Spinner.TrackFill className="khi-player__spinner-fill" />
			</Spinner.Root>
		</div>
	);
}

export function TimeSliderControl() {
	return (
		<TimeSlider.Root className="vds-time-slider vds-slider khi-player__slider">
			<TimeSlider.Track className="vds-slider-track khi-player__slider-track">
				<TimeSlider.TrackFill className="vds-slider-track-fill vds-slider-track khi-player__slider-fill" />
				<TimeSlider.Progress className="vds-slider-progress vds-slider-track khi-player__slider-progress" />
			</TimeSlider.Track>
			<TimeSlider.Thumb className="vds-slider-thumb khi-player__slider-thumb" />
		</TimeSlider.Root>
	);
}

export function VolumeSliderControl() {
	return (
		<VolumeSlider.Root className="vds-volume-slider vds-slider khi-player__volume-slider">
			<VolumeSlider.Track className="vds-slider-track khi-player__volume-track">
				<VolumeSlider.TrackFill className="vds-slider-track-fill vds-slider-track khi-player__volume-fill" />
			</VolumeSlider.Track>
			<VolumeSlider.Thumb className="vds-slider-thumb khi-player__volume-thumb" />
		</VolumeSlider.Root>
	);
}

export function ControlsSpacer() {
	return (
		<div
			className="vds-controls-spacer khi-player__controls-spacer"
			aria-hidden
		/>
	);
}

export function ControlsDock({ children }: { children: ReactNode }) {
	return (
		<Controls.Group className="vds-controls-group khi-player__dock">
			<div className="khi-player__dock-progress">
				<TimeSliderControl />
			</div>
			<div className="khi-player__dock-bar">{children}</div>
		</Controls.Group>
	);
}
