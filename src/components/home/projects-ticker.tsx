"use client";

import { type ReactNode, useEffect, useRef } from "react";

type ProjectsTickerProps = {
	/** Two identical copies of the card list, rendered on the server. */
	children: ReactNode;
	/** Seconds for one copy to pass by — sets the idle drift speed. */
	secondsPerCopy: number;
};

/** Movement past this (px) counts as a drag, so the release must not navigate. */
const DRAG_THRESHOLD_PX = 6;
/** Per-frame velocity decay after a flick, normalized to 60fps below. */
const GLIDE_FRICTION = 0.94;
/** Below this (px/s) the glide is over and the idle drift takes back over. */
const MIN_GLIDE_VELOCITY = 8;
/** Caps a flick so a fast swipe never slingshots the row. */
const MAX_GLIDE_VELOCITY = 4000;

/**
 * Continuous project ticker with pointer drag.
 *
 * Position is a single number — `offset`, the distance the track has travelled
 * forward, always wrapped into `[0, copyWidth)`. Idle drift, flick glide and
 * drag all write to it, so they can never fight each other. The track holds the
 * same list twice and `copyWidth` is exactly one copy, which makes the wrap
 * frame pixel-identical to frame 0 (seamless loop).
 *
 * `sign` folds direction away: forward means the content moves left in LTR and
 * right in RTL, so every formula below is written once. Transform (not native
 * scroll) drives it — `scrollLeft` has three incompatible RTL conventions
 * across browsers, and transforms have none.
 */
export function ProjectsTicker({
	children,
	secondsPerCopy,
}: ProjectsTickerProps) {
	const zoneRef = useRef<HTMLDivElement>(null);
	const trackRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		const zone = zoneRef.current;
		const track = trackRef.current;
		if (!zone || !track) return;

		// JS owns the motion now; the markup ships scrollable so a no-JS visitor
		// can still reach every card.
		zone.style.overflowX = "hidden";

		const sign = getComputedStyle(zone).direction === "rtl" ? 1 : -1;
		const reduceMotion = window.matchMedia(
			"(prefers-reduced-motion: reduce)",
		).matches;
		const canHover = window.matchMedia(
			"(hover: hover) and (pointer: fine)",
		).matches;

		let copyWidth = 0;
		let offset = 0;
		let paused = false;
		let dragging = false;
		let dragStartX = 0;
		let dragStartOffset = 0;
		let velocity = 0;
		let glide = 0;
		let lastSampleX = 0;
		let lastSampleTime = 0;
		let suppressClick = false;
		let captured = false;
		let frameId = 0;
		let lastFrame = 0;

		const wrap = (value: number) =>
			copyWidth > 0 ? ((value % copyWidth) + copyWidth) % copyWidth : 0;

		const apply = () => {
			track.style.transform = `translate3d(${sign * offset}px, 0, 0)`;
		};

		const measure = () => {
			// offsetWidth of one copy — layout width, immune to our own transform.
			copyWidth =
				(track.firstElementChild as HTMLElement | null)?.offsetWidth ?? 0;
			offset = wrap(offset);
			apply();
		};

		const frame = (now: number) => {
			frameId = requestAnimationFrame(frame);
			if (!lastFrame) lastFrame = now;
			// Clamp so a backgrounded tab doesn't resume with one giant jump.
			const dt = Math.min((now - lastFrame) / 1000, 0.05);
			lastFrame = now;

			if (dragging || copyWidth <= 0) return;

			if (glide !== 0) {
				offset += glide * dt;
				glide *= GLIDE_FRICTION ** (dt * 60);
				if (Math.abs(glide) < MIN_GLIDE_VELOCITY) glide = 0;
			} else if (!paused && !reduceMotion) {
				offset += (copyWidth / secondsPerCopy) * dt;
			} else {
				return;
			}

			offset = wrap(offset);
			apply();
		};

		const onPointerDown = (event: PointerEvent) => {
			if (event.pointerType === "mouse" && event.button !== 0) return;
			dragging = true;
			captured = false;
			glide = 0;
			suppressClick = false;
			dragStartX = event.clientX;
			dragStartOffset = offset;
			lastSampleX = event.clientX;
			lastSampleTime = event.timeStamp;
			velocity = 0;
			// Pointer capture is deliberately NOT taken here — see onPointerMove.
		};

		const onPointerMove = (event: PointerEvent) => {
			if (!dragging || copyWidth <= 0) return;

			const dx = event.clientX - dragStartX;

			// Capture only once this is unmistakably a drag. While a pointer is
			// captured the compatibility click event is retargeted to the capturing
			// element, so capturing on pointerdown would stop every card link from
			// navigating on a plain click.
			if (!captured && Math.abs(dx) > DRAG_THRESHOLD_PX) {
				captured = true;
				suppressClick = true;
				track.setPointerCapture(event.pointerId);
			}

			offset = wrap(dragStartOffset + sign * dx);
			apply();

			const dt = (event.timeStamp - lastSampleTime) / 1000;
			if (dt > 0.004) {
				velocity = (sign * (event.clientX - lastSampleX)) / dt;
				lastSampleX = event.clientX;
				lastSampleTime = event.timeStamp;
			}
		};

		const endDrag = (event: PointerEvent) => {
			if (!dragging) return;
			dragging = false;
			captured = false;
			if (track.hasPointerCapture(event.pointerId)) {
				track.releasePointerCapture(event.pointerId);
			}
			glide = Math.max(
				-MAX_GLIDE_VELOCITY,
				Math.min(MAX_GLIDE_VELOCITY, velocity),
			);
			lastFrame = 0;
		};

		// Capture phase: a drag that ends on a card must not follow its link.
		const onClickCapture = (event: MouseEvent) => {
			if (!suppressClick) return;
			event.preventDefault();
			event.stopPropagation();
			suppressClick = false;
		};

		const onDragStart = (event: Event) => event.preventDefault();
		const pause = () => {
			paused = true;
		};
		const resume = () => {
			paused = false;
		};

		measure();
		frameId = requestAnimationFrame(frame);

		track.addEventListener("pointerdown", onPointerDown);
		track.addEventListener("pointermove", onPointerMove);
		track.addEventListener("pointerup", endDrag);
		track.addEventListener("pointercancel", endDrag);
		track.addEventListener("dragstart", onDragStart);
		// Sub-threshold drags hold no capture, so a release outside the track would
		// otherwise never reach it and leave the ticker frozen mid-drag.
		window.addEventListener("pointerup", endDrag);
		window.addEventListener("pointercancel", endDrag);
		zone.addEventListener("click", onClickCapture, true);
		zone.addEventListener("focusin", pause);
		zone.addEventListener("focusout", resume);
		if (canHover) {
			zone.addEventListener("pointerenter", pause);
			zone.addEventListener("pointerleave", resume);
		}

		const observer = new ResizeObserver(measure);
		observer.observe(track);

		return () => {
			cancelAnimationFrame(frameId);
			observer.disconnect();
			track.removeEventListener("pointerdown", onPointerDown);
			track.removeEventListener("pointermove", onPointerMove);
			track.removeEventListener("pointerup", endDrag);
			track.removeEventListener("pointercancel", endDrag);
			track.removeEventListener("dragstart", onDragStart);
			window.removeEventListener("pointerup", endDrag);
			window.removeEventListener("pointercancel", endDrag);
			zone.removeEventListener("click", onClickCapture, true);
			zone.removeEventListener("focusin", pause);
			zone.removeEventListener("focusout", resume);
			zone.removeEventListener("pointerenter", pause);
			zone.removeEventListener("pointerleave", resume);
		};
	}, [secondsPerCopy]);

	return (
		<div
			ref={zoneRef}
			className="overflow-x-auto [scrollbar-width:none] [-ms-overflow-style:none] [mask-image:linear-gradient(to_right,transparent,black_3rem,black_calc(100%_-_3rem),transparent)] [&::-webkit-scrollbar]:hidden"
		>
			{/* `touch-action: pan-y` keeps vertical page scrolling native while the
			    horizontal axis belongs to the drag. */}
			<div
				ref={trackRef}
				className="flex w-max cursor-grab select-none [touch-action:pan-y] will-change-transform active:cursor-grabbing"
			>
				{children}
			</div>
		</div>
	);
}
