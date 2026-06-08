"use client";

import {
	ArrowsPointingInIcon,
	ArrowsPointingOutIcon,
	BackwardIcon,
	ForwardIcon,
	LanguageIcon,
	PauseIcon,
	PlayIcon,
	RectangleStackIcon,
	SpeakerWaveIcon,
	SpeakerXMarkIcon,
} from "@heroicons/react/24/solid";
import {
	CaptionButton,
	Captions,
	Controls,
	FullscreenButton,
	MuteButton,
	PIPButton,
	PlayButton,
	SeekButton,
	Time,
	Title,
} from "@vidstack/react";
import { useTranslations } from "next-intl";
import { PlaybackSettingsMenu } from "./video-player-settings-menu";
import {
	BufferingSpinner,
	CenterPlayButton,
	ControlsDock,
	ControlsSpacer,
	type KhiVideoPlayerLayoutProps,
	PlayerMedia,
	VolumeSliderControl,
} from "./video-player-shared";

export function KhiVideoPlayerLayoutFull(props: KhiVideoPlayerLayoutProps) {
	const t = useTranslations("Ui.videoPlayer");

	return (
		<>
			<PlayerMedia {...props} />
			<Captions className="khi-player__captions" />
			<BufferingSpinner />
			<CenterPlayButton />
			<Controls.Root className="vds-controls khi-player__controls khi-player__controls--full">
				<Controls.Group className="vds-controls-group khi-player__controls-group khi-player__controls-group--top">
					<Title className="khi-player__title" />
				</Controls.Group>
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
					<CaptionButton className="khi-player__btn" aria-label={t("captions")}>
						<LanguageIcon className="khi-player__icon-cc-off" />
						<LanguageIcon className="khi-player__icon-cc-on" />
					</CaptionButton>
					<PlaybackSettingsMenu speedLabel={t("speed")} />
					<PIPButton className="khi-player__btn" aria-label={t("pip")}>
						<RectangleStackIcon className="khi-player__icon-pip-enter" />
						<ArrowsPointingInIcon className="khi-player__icon-pip-exit" />
					</PIPButton>
					<FullscreenButton className="khi-player__btn">
						<ArrowsPointingOutIcon className="khi-player__icon-fs-enter" />
						<ArrowsPointingInIcon className="khi-player__icon-fs-exit" />
					</FullscreenButton>
				</ControlsDock>
			</Controls.Root>
		</>
	);
}
