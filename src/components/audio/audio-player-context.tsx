"use client";

import {
	createContext,
	useCallback,
	useContext,
	useEffect,
	useMemo,
	useRef,
	useState,
} from "react";
import type { PlayerTrackPayload } from "@/types/audio";

const VOLUME_STORAGE_KEY = "khi-player-volume";

type PlayerStatus = "playing" | "paused";

export type PlayerState = {
	queue: PlayerTrackPayload[];
	index: number;
	status: PlayerStatus;
	volume: number;
	muted: boolean;
};

export type PlayerTime = {
	currentTime: number;
	duration: number;
};

export type PlayerActions = {
	/** Loads a queue and starts playback. Must be called from a user gesture. */
	playQueue: (queue: PlayerTrackPayload[], startIndex?: number) => void;
	toggle: () => void;
	next: () => void;
	/** Restarts the current track when more than 3s in; otherwise steps back. */
	previous: () => void;
	seek: (seconds: number) => void;
	setVolume: (volume: number) => void;
	toggleMute: () => void;
	/** Stops playback and dismisses the player bar. */
	close: () => void;
};

type PlayerContextValue = {
	state: PlayerState;
	actions: PlayerActions;
};

const PlayerContext = createContext<PlayerContextValue | null>(null);
/** Separate context so 4×/sec timeupdate renders stay inside the bar. */
const PlayerTimeContext = createContext<PlayerTime>({
	currentTime: 0,
	duration: 0,
});

export function usePlayer(): PlayerContextValue {
	const value = useContext(PlayerContext);
	if (!value) {
		throw new Error("usePlayer must be used within <AudioPlayerProvider>");
	}
	return value;
}

export function usePlayerTime(): PlayerTime {
	return useContext(PlayerTimeContext);
}

export function useIsCurrentTrack(fileId: number): {
	isCurrent: boolean;
	isPlaying: boolean;
} {
	const { state } = usePlayer();
	const current = state.queue[state.index];
	const isCurrent = current?.fileId === fileId;
	return { isCurrent, isPlaying: isCurrent && state.status === "playing" };
}

export function AudioPlayerProvider({
	children,
}: {
	children: React.ReactNode;
}) {
	const audioRef = useRef<HTMLAudioElement>(null);

	const [queue, setQueue] = useState<PlayerTrackPayload[]>([]);
	const [index, setIndex] = useState(0);
	const [status, setStatus] = useState<PlayerStatus>("paused");
	const [volume, setVolumeState] = useState(1);
	const [muted, setMuted] = useState(false);
	const [time, setTime] = useState<PlayerTime>({ currentTime: 0, duration: 0 });

	// refs mirror state for stable <audio> event handlers
	const queueRef = useRef(queue);
	const indexRef = useRef(index);
	queueRef.current = queue;
	indexRef.current = index;

	const startPlayback = useCallback((audio: HTMLAudioElement) => {
		audio.play().catch(() => {
			// autoplay policy / low-power mode rejection — surface as paused
			setStatus("paused");
		});
	}, []);

	const loadTrack = useCallback(
		(payload: PlayerTrackPayload, autoplay: boolean) => {
			const audio = audioRef.current;
			if (!audio) {
				return;
			}
			audio.src = payload.audioUrl;
			setTime({ currentTime: 0, duration: payload.durationSeconds ?? 0 });
			if (autoplay) {
				startPlayback(audio);
			}
		},
		[startPlayback],
	);

	const playQueue = useCallback(
		(nextQueue: PlayerTrackPayload[], startIndex = 0) => {
			if (nextQueue.length === 0) {
				return;
			}
			const safeIndex = Math.min(Math.max(0, startIndex), nextQueue.length - 1);
			setQueue(nextQueue);
			setIndex(safeIndex);
			loadTrack(nextQueue[safeIndex], true);
		},
		[loadTrack],
	);

	const toggle = useCallback(() => {
		const audio = audioRef.current;
		if (!audio || queueRef.current.length === 0) {
			return;
		}
		if (audio.paused) {
			startPlayback(audio);
		} else {
			audio.pause();
		}
	}, [startPlayback]);

	const next = useCallback(() => {
		const currentQueue = queueRef.current;
		const nextIndex = indexRef.current + 1;
		if (nextIndex >= currentQueue.length) {
			audioRef.current?.pause();
			return;
		}
		setIndex(nextIndex);
		loadTrack(currentQueue[nextIndex], true);
	}, [loadTrack]);

	const seek = useCallback((seconds: number) => {
		const audio = audioRef.current;
		if (!audio) {
			return;
		}
		audio.currentTime = seconds;
		setTime((current) => ({ ...current, currentTime: seconds }));
	}, []);

	const previous = useCallback(() => {
		const audio = audioRef.current;
		if (!audio) {
			return;
		}
		if (audio.currentTime > 3 || indexRef.current === 0) {
			seek(0);
			return;
		}
		const prevIndex = indexRef.current - 1;
		setIndex(prevIndex);
		loadTrack(queueRef.current[prevIndex], true);
	}, [loadTrack, seek]);

	const setVolume = useCallback((value: number) => {
		const audio = audioRef.current;
		const clamped = Math.min(1, Math.max(0, value));
		if (audio) {
			audio.volume = clamped;
			if (clamped > 0) {
				audio.muted = false;
			}
		}
		setVolumeState(clamped);
		try {
			window.localStorage.setItem(VOLUME_STORAGE_KEY, String(clamped));
		} catch {
			// storage unavailable (private mode) — volume just won't persist
		}
	}, []);

	const toggleMute = useCallback(() => {
		const audio = audioRef.current;
		if (audio) {
			audio.muted = !audio.muted;
		}
	}, []);

	const close = useCallback(() => {
		const audio = audioRef.current;
		if (audio) {
			audio.pause();
			audio.removeAttribute("src");
			audio.load();
		}
		setQueue([]);
		setIndex(0);
		setStatus("paused");
		setTime({ currentTime: 0, duration: 0 });
	}, []);

	// restore persisted volume once on mount
	useEffect(() => {
		try {
			const stored = window.localStorage.getItem(VOLUME_STORAGE_KEY);
			if (stored != null) {
				const parsed = Number.parseFloat(stored);
				if (Number.isFinite(parsed)) {
					const clamped = Math.min(1, Math.max(0, parsed));
					setVolumeState(clamped);
					if (audioRef.current) {
						audioRef.current.volume = clamped;
					}
				}
			}
		} catch {
			// storage unavailable — keep default volume
		}
	}, []);

	const currentPayload = queue[index] ?? null;

	// media session metadata + hardware/lock-screen controls
	useEffect(() => {
		if (typeof navigator === "undefined" || !("mediaSession" in navigator)) {
			return;
		}
		if (!currentPayload) {
			navigator.mediaSession.metadata = null;
			return;
		}
		navigator.mediaSession.metadata = new MediaMetadata({
			title: currentPayload.title,
			artist: currentPayload.artist ?? undefined,
			artwork: currentPayload.coverUrl
				? [{ src: currentPayload.coverUrl }]
				: undefined,
		});
		navigator.mediaSession.setActionHandler("play", toggle);
		navigator.mediaSession.setActionHandler("pause", toggle);
		navigator.mediaSession.setActionHandler("previoustrack", previous);
		navigator.mediaSession.setActionHandler("nexttrack", next);
		return () => {
			navigator.mediaSession.setActionHandler("play", null);
			navigator.mediaSession.setActionHandler("pause", null);
			navigator.mediaSession.setActionHandler("previoustrack", null);
			navigator.mediaSession.setActionHandler("nexttrack", null);
		};
	}, [currentPayload, toggle, previous, next]);

	const actions = useMemo<PlayerActions>(
		() => ({
			playQueue,
			toggle,
			next,
			previous,
			seek,
			setVolume,
			toggleMute,
			close,
		}),
		[playQueue, toggle, next, previous, seek, setVolume, toggleMute, close],
	);

	const state = useMemo<PlayerState>(
		() => ({ queue, index, status, volume, muted }),
		[queue, index, status, volume, muted],
	);

	const contextValue = useMemo<PlayerContextValue>(
		() => ({ state, actions }),
		[state, actions],
	);

	const handleTimeUpdate = useCallback(() => {
		const audio = audioRef.current;
		if (!audio) {
			return;
		}
		setTime({
			currentTime: audio.currentTime,
			duration:
				Number.isFinite(audio.duration) && audio.duration > 0
					? audio.duration
					: (queueRef.current[indexRef.current]?.durationSeconds ?? 0),
		});
	}, []);

	const handleVolumeChange = useCallback(() => {
		const audio = audioRef.current;
		if (!audio) {
			return;
		}
		setVolumeState(audio.volume);
		setMuted(audio.muted);
	}, []);

	return (
		<PlayerContext.Provider value={contextValue}>
			<PlayerTimeContext.Provider value={time}>
				{children}
				{/* biome-ignore lint/a11y/useMediaCaption: archival audio recordings have no caption tracks */}
				<audio
					ref={audioRef}
					preload="metadata"
					className="hidden"
					onPlay={() => setStatus("playing")}
					onPause={() => setStatus("paused")}
					onEnded={next}
					onTimeUpdate={handleTimeUpdate}
					onLoadedMetadata={handleTimeUpdate}
					onDurationChange={handleTimeUpdate}
					onVolumeChange={handleVolumeChange}
				/>
			</PlayerTimeContext.Provider>
		</PlayerContext.Provider>
	);
}
