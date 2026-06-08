"use client";

import {
	ArrowsPointingInIcon,
	ArrowsPointingOutIcon,
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
	Time,
} from "@vidstack/react";
import {
	BufferingSpinner,
	CenterPlayButton,
	ControlsDock,
	ControlsSpacer,
	type KhiVideoPlayerLayoutProps,
	PlayerMedia,
} from "./video-player-shared";

export function KhiVideoPlayerLayout(props: KhiVideoPlayerLayoutProps) {
	return (
		<>
			<PlayerMedia {...props} />
			<BufferingSpinner />
			<CenterPlayButton />
			<Controls.Root className="vds-controls khi-player__controls">
				<ControlsSpacer />
				<ControlsDock>
					<PlayButton className="khi-player__btn">
						<PlayIcon className="khi-player__icon-play" />
						<PauseIcon className="khi-player__icon-pause" />
					</PlayButton>
					<div className="khi-player__time-group">
						<Time className="khi-player__time" type="current" />
						<span className="khi-player__time-sep" aria-hidden>
							/
						</span>
						<Time className="khi-player__time" type="duration" />
					</div>
					<div className="khi-player__bar-spacer" aria-hidden />
					<MuteButton className="khi-player__btn">
						<SpeakerWaveIcon className="khi-player__icon-volume" />
						<SpeakerXMarkIcon className="khi-player__icon-muted" />
					</MuteButton>
					<FullscreenButton className="khi-player__btn">
						<ArrowsPointingOutIcon className="khi-player__icon-fs-enter" />
						<ArrowsPointingInIcon className="khi-player__icon-fs-exit" />
					</FullscreenButton>
				</ControlsDock>
			</Controls.Root>
		</>
	);
}
