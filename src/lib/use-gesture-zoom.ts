"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { prefersReducedMotion } from "@/components/motion/scroll-reveal";

/**
 * Gesture-driven zoom for an image inside a scroll box — shared by the gallery
 * lightbox and the audio booklet reader so both feel identical.
 *
 * The pattern: `viewportRef` goes on an `overflow-auto` box; inside it a
 * `relative` child is sized `zoomLevel * 100%`, so a `fill` image (and its
 * watermark) scale together while every edge stays reachable by scrolling.
 * Sized rather than transform-scaled ON PURPOSE: the scroll range is real and
 * already settled when the re-center effect runs, and the double-click glide
 * re-runs that effect every frame, which is what keeps the gesture anchored.
 *
 * Gestures:
 * - Plain wheel (and the ctrl+wheel a trackpad pinch emits) zooms on an
 *   exponential curve anchored at the pointer. A wheel that cannot change the
 *   zoom (already at a bound) falls through so the page keeps scrolling.
 * - Double-click / double-tap glides fitted ↔ `doubleClickZoom`; a second
 *   double-click while zoomed returns to fitted.
 * - While zoomed, a mouse drag pans (grab/grabbing cursors). Touch panning is
 *   the scroll box's own native scrolling, so it is deliberately left alone.
 *
 * MIN 1 keeps the fitted size — shrinking below fit is pointless here.
 */
const MIN_ZOOM = 1;
/** Divisor for wheel deltaY — higher means a gentler wheel zoom. */
const WHEEL_ZOOM_EASE = 200;
/**
 * Firefox mouse wheels report `deltaMode === DOM_DELTA_LINE`: deltas in lines,
 * not pixels. Normalized with this line height so a notch zooms the same.
 */
const WHEEL_LINE_HEIGHT_PX = 16;
/** A press only becomes a pan after this much movement — clicks stay clicks. */
const DRAG_THRESHOLD_PX = 4;

type UseGestureZoomOptions = {
	/** Changing this resets to the fitted size — the page/slide index. */
	resetKey: unknown;
	/** Upper zoom bound, reachable by wheel/pinch. */
	maxZoom?: number;
	/** The comfortable reading step double-click glides to. */
	doubleClickZoom?: number;
};

export function useGestureZoom({
	resetKey,
	maxZoom = 3,
	doubleClickZoom = 2,
}: UseGestureZoomOptions) {
	const [zoomLevel, setZoomLevel] = useState(1);
	const viewportRef = useRef<HTMLDivElement>(null);
	// Mirrors zoomLevel for handlers that must read it without re-binding.
	const zoomLevelRef = useRef(1);
	useEffect(() => {
		zoomLevelRef.current = zoomLevel;
	}, [zoomLevel]);

	const zoomTweenRef = useRef<number | null>(null);
	const stopZoomTween = useCallback(() => {
		if (zoomTweenRef.current !== null) {
			cancelAnimationFrame(zoomTweenRef.current);
			zoomTweenRef.current = null;
		}
	}, []);
	useEffect(() => stopZoomTween, [stopZoomTween]);

	// Where the next zoom change should land: the content point (fractions
	// fx/fy of the scroll size) to pin under the viewport point vx/vy. Set by
	// the gesture handlers, consumed once by the re-scroll effect below;
	// null = keep the middle of the page in view.
	const zoomAnchorRef = useRef<{
		fx: number;
		fy: number;
		vx: number;
		vy: number;
	} | null>(null);

	// Records the content point under a gesture so the same spot stays put
	// (roughly) once the page has been re-laid-out at the new zoom level.
	const computeZoomAnchor = useCallback((clientX: number, clientY: number) => {
		const viewport = viewportRef.current;
		if (!viewport) return null;
		const rect = viewport.getBoundingClientRect();
		// In RTL scrollLeft runs 0 → negative; normalize to a 0-based offset
		// from the content's left edge.
		const leftOffset =
			document.documentElement.dir === "rtl"
				? viewport.scrollLeft + viewport.scrollWidth - viewport.clientWidth
				: viewport.scrollLeft;
		const vx = clientX - rect.left;
		const vy = clientY - rect.top;
		return {
			fx: (vx + leftOffset) / viewport.scrollWidth,
			fy: (vy + viewport.scrollTop) / viewport.scrollHeight,
			vx,
			vy,
		};
	}, []);

	const setZoomAnchor = useCallback(
		(clientX: number, clientY: number) => {
			zoomAnchorRef.current = computeZoomAnchor(clientX, clientY);
		},
		[computeZoomAnchor],
	);

	// Glides the zoom level to `target` over a short rAF tween instead of
	// jumping. The re-scroll effect consumes one anchor per zoom change, so the
	// gesture point is re-pinned every frame — that is what keeps it stationary
	// while the page grows or shrinks under it. Reduced motion jumps straight
	// to the target.
	const animateZoomTo = useCallback(
		(target: number, clientX: number, clientY: number) => {
			stopZoomTween();
			const anchor = computeZoomAnchor(clientX, clientY);
			const from = zoomLevelRef.current;
			if (!anchor || prefersReducedMotion() || Math.abs(target - from) < 0.01) {
				zoomAnchorRef.current = anchor;
				zoomLevelRef.current = target;
				setZoomLevel(target);
				return;
			}
			const started = performance.now();
			const durationMs = 300;
			const tick = (now: number) => {
				const progress = Math.min(1, (now - started) / durationMs);
				const eased = 1 - (1 - progress) ** 3;
				zoomAnchorRef.current = { ...anchor };
				const level = from + (target - from) * eased;
				zoomLevelRef.current = level;
				setZoomLevel(level);
				zoomTweenRef.current =
					progress < 1 ? requestAnimationFrame(tick) : null;
			};
			zoomTweenRef.current = requestAnimationFrame(tick);
		},
		[computeZoomAnchor, stopZoomTween],
	);

	// Every page opens at the fitted size — zoom never carries across pages.
	// biome-ignore lint/correctness/useExhaustiveDependencies: resetKey is the reset trigger, not an input.
	useEffect(() => {
		stopZoomTween();
		zoomAnchorRef.current = null;
		zoomLevelRef.current = 1;
		setZoomLevel(1);
	}, [resetKey]);

	// Keep the gesture's anchor point — or, with no gesture, the middle of the
	// page — in view on each zoom change; a center-origin `scale()` would do
	// the centering implicitly, and the edges are what the scroll box adds.
	// In RTL the horizontal scroll range runs 0 → negative.
	// biome-ignore lint/correctness/useExhaustiveDependencies: zoomLevel is the re-scroll trigger; the scroll metrics it resizes are read off the DOM.
	useEffect(() => {
		const viewport = viewportRef.current;
		if (!viewport) return;
		const maxX = viewport.scrollWidth - viewport.clientWidth;
		const maxY = viewport.scrollHeight - viewport.clientHeight;
		const anchor = zoomAnchorRef.current ?? {
			fx: 0.5,
			fy: 0.5,
			vx: viewport.clientWidth / 2,
			vy: viewport.clientHeight / 2,
		};
		zoomAnchorRef.current = null;
		const x = Math.min(
			maxX,
			Math.max(0, anchor.fx * viewport.scrollWidth - anchor.vx),
		);
		viewport.scrollTo({
			left: document.documentElement.dir === "rtl" ? x - maxX : x,
			top: Math.min(
				maxY,
				Math.max(0, anchor.fy * viewport.scrollHeight - anchor.vy),
			),
		});
	}, [zoomLevel]);

	// Plain wheel zooms — panning is a drag now, so wheel no longer needs to
	// scroll the zoomed page. A native non-passive listener because React
	// registers wheel handlers passively, and a handled wheel must
	// preventDefault so the browser doesn't scroll or zoom the page. A wheel
	// that cannot change the zoom (already at a bound) falls through — except
	// ctrl/cmd+wheel (a trackpad pinch), which is always swallowed so a pinch
	// past the bound never triggers the browser's page zoom.
	// biome-ignore lint/correctness/useExhaustiveDependencies: resetKey re-binds the listener when a page (re)mounts the viewport node.
	useEffect(() => {
		const viewport = viewportRef.current;
		if (!viewport) return;
		const onWheel = (event: WheelEvent) => {
			const isPinch = event.ctrlKey || event.metaKey;
			if (isPinch) event.preventDefault();
			const deltaY =
				event.deltaMode === WheelEvent.DOM_DELTA_LINE
					? event.deltaY * WHEEL_LINE_HEIGHT_PX
					: event.deltaY;
			const level = zoomLevelRef.current;
			const next = Math.min(
				maxZoom,
				Math.max(MIN_ZOOM, level * Math.exp(-deltaY / WHEEL_ZOOM_EASE)),
			);
			if (Math.abs(next - level) < 0.001) return;
			if (!isPinch) event.preventDefault();
			stopZoomTween();
			setZoomAnchor(event.clientX, event.clientY);
			zoomLevelRef.current = next;
			setZoomLevel(next);
		};
		viewport.addEventListener("wheel", onWheel, { passive: false });
		return () => viewport.removeEventListener("wheel", onWheel);
	}, [maxZoom, setZoomAnchor, stopZoomTween, resetKey]);

	// Drag-to-pan, mouse only: touch already pans via the scroll box's native
	// scrolling and must not be re-implemented on top of it. Raw scrollLeft
	// deltas are direction-agnostic — RTL only shifts the range to
	// 0 → negative, and the browser clamps out-of-range values.
	const panRef = useRef<{
		pointerId: number;
		startX: number;
		startY: number;
		scrollLeft: number;
		scrollTop: number;
		dragging: boolean;
	} | null>(null);
	// Set once a press crosses the drag threshold — the double-click handler
	// reads it, so releasing a pan can never accidentally toggle the zoom.
	const didDragRef = useRef(false);
	const [isPanning, setIsPanning] = useState(false);

	const onPointerDown = useCallback(
		(event: React.PointerEvent<HTMLDivElement>) => {
			if (event.pointerType !== "mouse" || event.button !== 0) return;
			didDragRef.current = false;
			if (zoomLevelRef.current <= MIN_ZOOM) return;
			const viewport = viewportRef.current;
			if (!viewport) return;
			panRef.current = {
				pointerId: event.pointerId,
				startX: event.clientX,
				startY: event.clientY,
				scrollLeft: viewport.scrollLeft,
				scrollTop: viewport.scrollTop,
				dragging: false,
			};
			viewport.setPointerCapture(event.pointerId);
		},
		[],
	);

	const onPointerMove = useCallback(
		(event: React.PointerEvent<HTMLDivElement>) => {
			const pan = panRef.current;
			const viewport = viewportRef.current;
			if (!pan || !viewport || event.pointerId !== pan.pointerId) return;
			const dx = event.clientX - pan.startX;
			const dy = event.clientY - pan.startY;
			if (!pan.dragging) {
				if (
					Math.abs(dx) < DRAG_THRESHOLD_PX &&
					Math.abs(dy) < DRAG_THRESHOLD_PX
				) {
					return;
				}
				pan.dragging = true;
				didDragRef.current = true;
				setIsPanning(true);
			}
			viewport.scrollLeft = pan.scrollLeft - dx;
			viewport.scrollTop = pan.scrollTop - dy;
		},
		[],
	);

	const endPan = useCallback((event: React.PointerEvent<HTMLDivElement>) => {
		const pan = panRef.current;
		if (!pan || event.pointerId !== pan.pointerId) return;
		panRef.current = null;
		setIsPanning(false);
	}, []);

	const onDoubleClick = useCallback(
		(event: React.MouseEvent<HTMLDivElement>) => {
			if (didDragRef.current) {
				didDragRef.current = false;
				return;
			}
			animateZoomTo(
				zoomLevelRef.current > MIN_ZOOM ? MIN_ZOOM : doubleClickZoom,
				event.clientX,
				event.clientY,
			);
		},
		[animateZoomTo, doubleClickZoom],
	);

	const viewportProps = {
		onDoubleClick,
		onPointerDown,
		onPointerMove,
		onPointerUp: endPan,
		onPointerCancel: endPan,
	};

	// grab/grabbing while zoomed (drag pans); zoom-in invites the double-click
	// at the fitted size.
	const cursorClass =
		zoomLevel > MIN_ZOOM
			? isPanning
				? "cursor-grabbing"
				: "cursor-grab"
			: "cursor-zoom-in";

	return { zoomLevel, viewportRef, viewportProps, cursorClass };
}
