"use client";

import {
	ArrowsPointingInIcon,
	ArrowsPointingOutIcon,
	BackwardIcon,
	ForwardIcon,
	PauseIcon,
	PlayIcon,
	SpeakerWaveIcon,
	SpeakerXMarkIcon,
} from "@heroicons/react/24/solid";
import {
	Controls,
	FullscreenButton,
	MuteButton,
	PlayButton,
	SeekButton,
	Time,
} from "@vidstack/react";
import { useTranslations } from "next-intl";
import {
	BufferingSpinner,
	CenterPlayButton,
	ControlsDock,
	ControlsSpacer,
	type KhiVideoPlayerLayoutProps,
	PlayerMedia,
	VolumeSliderControl,
} from "./video-player-shared";

/** YouTube embed layout — no PIP, captions menu, or settings portal. */
export function KhiVideoPlayerLayoutYouTube(props: KhiVideoPlayerLayoutProps) {
	const t = useTranslations("Ui.videoPlayer");

	return (
		<>
			<PlayerMedia {...props} embed="youtube" />
			<BufferingSpinner />
			<CenterPlayButton />
			<Controls.Root className="vds-controls khi-player__controls khi-player__controls--full">
				<ControlsSpacer />
				<ControlsDock>
					<PlayButton className="khi-player__btn">
						<PlayIcon className="khi-player__icon-play" />
						<PauseIcon className="khi-player__icon-pause" />
					</PlayButton>
					<SeekButton
						className="khi-player__btn"
						seconds={-10}
						aria-label={t("seekBackward")}
					>
						<BackwardIcon />
					</SeekButton>
					<SeekButton
						className="khi-player__btn"
						seconds={10}
						aria-label={t("seekForward")}
					>
						<ForwardIcon />
					</SeekButton>
					<div className="khi-player__time-group">
						<Time className="khi-player__time" type="current" />
						<span className="khi-player__time-sep" aria-hidden>
							/
						</span>
						<Time className="khi-player__time" type="duration" />
					</div>
					<div className="khi-player__bar-spacer" aria-hidden />
					<div className="khi-player__volume">
						<MuteButton className="khi-player__btn">
							<SpeakerWaveIcon className="khi-player__icon-volume" />
							<SpeakerXMarkIcon className="khi-player__icon-muted" />
						</MuteButton>
						<VolumeSliderControl />
					</div>
					<FullscreenButton className="khi-player__btn">
						<ArrowsPointingOutIcon className="khi-player__icon-fs-enter" />
						<ArrowsPointingInIcon className="khi-player__icon-fs-exit" />
					</FullscreenButton>
				</ControlsDock>
			</Controls.Root>
		</>
	);
}
