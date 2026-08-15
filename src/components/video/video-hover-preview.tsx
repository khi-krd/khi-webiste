"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { isDirectMediaFileUrl } from "@/lib/video/source";

type VideoHoverPreviewProps = {
	src: string;
	/** Extra classes on the <video> itself (e.g. the memories sepia tint). */
	className?: string;
	/** Hover dwell before any byte loads or playback arms. */
	intentDelayMs?: number;
	/** First-play seek target — never a black first frame. */
	startAtSeconds?: number;
};

/** Idle time after hover-out before the media element unmounts. */
const IDLE_UNMOUNT_MS = 4000;

/**
 * Hover-to-play preview layer for catalogue cards and hero stills.
 *
 * SSR-safe by construction: no `<video>` exists until 300ms of real hover
 * intent, so the rest state costs zero bytes and needs no `ssr:false` wrapper.
 * The host link (marked `data-preview-host`) is the state bus — on the video's
 * `playing` event this component sets `data-previewing` on it, and every visual
 * reaction (fade-in, REC dot, play-pill recede) is pure CSS via
 * `group-data-[previewing]:`. Zero React re-renders during playback.
 *
 * Gates (checked once, self-arming): fine pointer + hover, full motion, no
 * saveData. Hover-out pauses immediately, stores the position
 * (resume-where-you-left-off), and unmounts the element after 4s idle so
 * memory stays bounded. Failures fall back silently to the still layers.
 */
export function VideoHoverPreview({
	src,
	className,
	intentDelayMs = 300,
	startAtSeconds = 0.5,
}: VideoHoverPreviewProps) {
	const wrapperRef = useRef<HTMLDivElement>(null);
	const videoRef = useRef<HTMLVideoElement | null>(null);
	const hostRef = useRef<Element | null>(null);
	const intentTimerRef = useRef<number | null>(null);
	const idleTimerRef = useRef<number | null>(null);
	/** Pointer currently inside the host — playback may start when true. */
	const engagedRef = useRef(false);
	/** Where the film paused last hover — the light-table resume point. */
	const resumeAtRef = useRef<number | null>(null);
	const [mounted, setMounted] = useState(false);
	const [failed, setFailed] = useState(false);

	useEffect(() => {
		const wrapper = wrapperRef.current;
		if (!wrapper || failed) {
			return;
		}
		// Bail entirely — no listeners, never a byte — unless every gate passes.
		if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) {
			return;
		}
		if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
			return;
		}
		const connection = (
			navigator as Navigator & { connection?: { saveData?: boolean } }
		).connection;
		if (connection?.saveData === true) {
			return;
		}

		const host = wrapper.closest("[data-preview-host]");
		if (!host) {
			return;
		}
		hostRef.current = host;

		const handleEnter = () => {
			engagedRef.current = true;
			if (idleTimerRef.current != null) {
				window.clearTimeout(idleTimerRef.current);
				idleTimerRef.current = null;
			}
			if (intentTimerRef.current != null) {
				window.clearTimeout(intentTimerRef.current);
			}
			intentTimerRef.current = window.setTimeout(() => {
				intentTimerRef.current = null;
				// First intent mounts the element; the [mounted] effect below
				// starts playback. Re-hover within the idle window plays directly.
				setMounted(true);
				videoRef.current?.play().catch(() => setFailed(true));
			}, intentDelayMs);
		};

		const handleLeave = () => {
			engagedRef.current = false;
			if (intentTimerRef.current != null) {
				window.clearTimeout(intentTimerRef.current);
				intentTimerRef.current = null;
			}
			const video = videoRef.current;
			if (video && !video.paused) {
				resumeAtRef.current = video.currentTime;
				video.pause();
			}
			host.removeAttribute("data-previewing");
			idleTimerRef.current = window.setTimeout(() => {
				idleTimerRef.current = null;
				setMounted(false);
			}, IDLE_UNMOUNT_MS);
		};

		host.addEventListener("pointerenter", handleEnter);
		host.addEventListener("pointerleave", handleLeave);
		return () => {
			host.removeEventListener("pointerenter", handleEnter);
			host.removeEventListener("pointerleave", handleLeave);
			if (intentTimerRef.current != null) {
				window.clearTimeout(intentTimerRef.current);
				intentTimerRef.current = null;
			}
			if (idleTimerRef.current != null) {
				window.clearTimeout(idleTimerRef.current);
				idleTimerRef.current = null;
			}
			host.removeAttribute("data-previewing");
		};
	}, [failed, intentDelayMs]);

	// First mount lands after the intent timer already fired — start playback
	// here (only if the pointer is still inside the host).
	useEffect(() => {
		if (!mounted) {
			return;
		}
		const video = videoRef.current;
		if (video && engagedRef.current && video.paused) {
			video.play().catch(() => setFailed(true));
		}
	}, [mounted]);

	if (!isDirectMediaFileUrl(src) || failed) {
		return null;
	}

	return (
		<div
			ref={wrapperRef}
			aria-hidden
			className="pointer-events-none absolute inset-0 z-1 opacity-0 transition-opacity duration-[400ms] ease-[cubic-bezier(0.22,1,0.36,1)] group-data-[previewing]:opacity-100 motion-reduce:hidden"
		>
			{mounted ? (
				<video
					ref={videoRef}
					src={src}
					muted
					playsInline
					loop
					preload="none"
					tabIndex={-1}
					disablePictureInPicture
					disableRemotePlayback
					onError={() => setFailed(true)}
					onLoadedMetadata={(event) => {
						const video = event.currentTarget;
						if (!Number.isFinite(video.duration) || video.duration <= 0) {
							return;
						}
						const target =
							resumeAtRef.current ??
							Math.min(startAtSeconds, Math.max(0, video.duration - 0.05));
						if (Math.abs(video.currentTime - target) > 0.05) {
							video.currentTime = target;
						}
					}}
					onPlaying={() => hostRef.current?.setAttribute("data-previewing", "")}
					className={cn("size-full object-cover object-center", className)}
				/>
			) : null}
		</div>
	);
}
