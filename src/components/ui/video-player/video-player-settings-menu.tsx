"use client";

import { Cog6ToothIcon } from "@heroicons/react/24/outline";
import { CheckIcon } from "@heroicons/react/24/solid";
import { Menu, usePlaybackRateOptions } from "@vidstack/react";

type PlaybackSettingsMenuProps = {
	speedLabel: string;
};

export function PlaybackSettingsMenu({
	speedLabel,
}: PlaybackSettingsMenuProps) {
	const options = usePlaybackRateOptions();

	return (
		<Menu.Root>
			<Menu.Button
				className="khi-player__btn"
				aria-label={speedLabel}
				disabled={options.disabled}
			>
				<Cog6ToothIcon />
			</Menu.Button>
			<Menu.Portal>
				<Menu.Content className="khi-player__menu">
					<p className="khi-player__menu-heading">{speedLabel}</p>
					<Menu.RadioGroup
						className="khi-player__menu-group"
						value={options.selectedValue}
					>
						{options.map(({ label, value, select }) => (
							<Menu.Radio
								key={value}
								className="khi-player__menu-item"
								value={value}
								onSelect={select}
							>
								<CheckIcon className="khi-player__menu-check" aria-hidden />
								<span>{label}</span>
							</Menu.Radio>
						))}
					</Menu.RadioGroup>
				</Menu.Content>
			</Menu.Portal>
		</Menu.Root>
	);
}
