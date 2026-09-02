"use client";

import NextImage from "next/image";
import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

/** Bundled brand mark — always present, unlike the CMS logo record. */
const LOGO_SRC = "/logo.png";

/**
 * The dodge fires while the mark sits within this margin of the visible rect,
 * so it gets out of the way just before the zoomed view reaches it.
 */
const DODGE_MARGIN_PX = 24;
/**
 * Slack before the picture counts as overflowing its viewport — a fitted 1×
 * view can hang over by a rounding hair and must never trigger a dodge.
 */
const OVERFLOW_TOLERANCE_PX = 4;
/** Cool-down between dodges so a continuous pan/zoom never makes it thrash. */
const DODGE_COOLDOWN_MS = 800;
/** Safety poll for transform-scale zooms that fire neither scroll nor resize. */
const POLL_INTERVAL_MS = 600;

/**
 * Which of the picture's four corners the mark occupies: cx/cy are 0|1
 * multipliers on the measured drift travel. {0,0} is home — bottom-start.
 */
type Corner = { cx: 0 | 1; cy: 0 | 1 };
const HOME_CORNER: Corner = { cx: 0, cy: 0 };

type Rect = { left: number; top: number; right: number; bottom: number };

function intersects(a: Rect, b: Rect): boolean {
	return (
		a.left < b.right && a.right > b.left && a.top < b.bottom && a.bottom > b.top
	);
}

type ImageWatermarkProps = {
	/**
	 * Pass the displayed image's src when it is letterboxed by `object-contain`
	 * inside a bigger box (a `fill` image in a fixed-height frame). The mark then
	 * tracks the PICTURE's corner rather than the frame's, so it never floats in
	 * the empty band beside a portrait scan. Omit for a frame that already
	 * wraps the picture. The value doubles as the re-measure key when the viewer
	 * moves to the next image.
	 */
	contain?: string | null;
	/**
	 * Extra px to lift the mark above the picture's bottom edge — for viewers
	 * that pin a caption strip to the same corner. Applied to the inline offset
	 * rather than as a padding class ON PURPOSE: `cn()` is a plain joiner, so a
	 * `pb-*` class handed in from outside loses to this component's own
	 * `sm:p-4` in the compiled sheet at every width ≥640px.
	 */
	clearance?: number;
	/** Extra classes for the positioned box. */
	className?: string;
};

/**
 * Brand watermark stamped on the bottom-left of an image while it is OPEN —
 * lightboxes, media modals, booklet/brochure readers. Never on in-page
 * thumbnails: it marks the picture a visitor is actually looking at (and might
 * save), not the browsing surface.
 *
 * Geometry is PHYSICAL, not logical: bottom-LEFT in Sorani (RTL) exactly as in
 * Kurmanji, like the header lockup. The host element must be positioned
 * (`relative`); the mark is decorative and never intercepts pointer events, so
 * it cannot block a backdrop-click close.
 *
 * Placement is MEASURED rather than assumed, because "the corner of the frame"
 * is not "the corner of the picture" in either layout this is used in: an
 * intrinsic image capped by `max-h` renders narrower than its box (and sits at
 * the box's inline START, which flips with the locale), while a `fill` image
 * letterboxes inside a fixed-height frame. Both are resolved from the real
 * rendered rect of the <img>, re-run on resize and on load, and the mark only
 * fades in once that measurement has landed — otherwise it would visibly jump
 * from the frame corner to the picture corner on every next/previous step.
 *
 * Once placed, the mark RESTS in its bottom-start corner. It moves only to get
 * out of the way: when the picture overflows its clipping viewport (zoomed or
 * panned) and the visible part of the view closes in on the mark, it glides to
 * the picture corner farthest from what is on screen — preferably one fully
 * out of view — and glides back home once the picture fits again. The dodge is
 * functional, not decorative, so reduced motion keeps it but repositions
 * instantly instead of gliding.
 */
export function ImageWatermark({
	contain,
	clearance = 0,
	className,
}: ImageWatermarkProps) {
	const ref = useRef<HTMLSpanElement>(null);
	const [placement, setPlacement] = useState<{
		x: number;
		y: number;
		/** Corner-to-corner travel across the artwork (layout px). */
		driftX: number;
		driftY: number;
		ready: boolean;
	}>({ x: 0, y: 0, driftX: 0, driftY: 0, ready: false });
	const [corner, setCorner] = useState<Corner>(HOME_CORNER);
	const cornerRef = useRef(corner);
	useEffect(() => {
		cornerRef.current = corner;
	}, [corner]);

	useEffect(() => {
		const mark = ref.current;
		const host = mark?.parentElement;
		if (!mark || !host) {
			return;
		}

		// The displayed picture: the first <img> that is neither the mark's own
		// logo nor a decorative copy. Skipping `aria-hidden` matters — the
		// letterboxing viewers put a blurred `scale-110 object-cover` ambient
		// fill behind the picture, and measuring THAT would hand back a box 10%
		// larger than the frame.
		const picture = Array.from(host.querySelectorAll("img")).find(
			(candidate) =>
				!mark.contains(candidate) &&
				candidate.getAttribute("aria-hidden") !== "true",
		);

		let cancelled = false;
		let rafId: number | null = null;
		let lastDodgeAt = 0;
		setPlacement((current) => ({ ...current, ready: false }));
		cornerRef.current = HOME_CORNER;
		setCorner(HOME_CORNER);

		// Keeps the ref in lockstep so a batched evaluate never dodges twice
		// off a stale corner before React re-renders.
		const applyCorner = (next: Corner) => {
			cornerRef.current = next;
			setCorner(next);
		};

		/**
		 * The PICTURE's rendered rect in viewport (client) coordinates, with
		 * `object-contain` letterboxing resolved, plus the host's transform
		 * scale. getBoundingClientRect reports POST-transform pixels, but the
		 * inline offsets are applied inside the same transform (a host may be
		 * transform-scaled); normalising by the host's own scale keeps the mark
		 * on the artwork either way.
		 */
		const measureGeometry = () => {
			const hostRect = host.getBoundingClientRect();
			if (hostRect.width <= 0 || hostRect.height <= 0) {
				return null;
			}
			const scale =
				host.offsetWidth > 0 ? hostRect.width / host.offsetWidth : 1;
			const safeScale = scale > 0 ? scale : 1;

			let left = hostRect.left;
			let top = hostRect.top;
			let width = hostRect.width;
			let height = hostRect.height;

			if (picture) {
				const rect = picture.getBoundingClientRect();
				if (rect.width > 0 && rect.height > 0) {
					left = rect.left;
					top = rect.top;
					width = rect.width;
					height = rect.height;
				}
			}

			// `object-contain` fits the tighter axis and centers the remainder.
			const ratio =
				picture?.naturalWidth && picture.naturalHeight
					? picture.naturalWidth / picture.naturalHeight
					: 0;
			if (contain) {
				if (ratio <= 0) {
					// Bytes not in yet — hold the previous placement rather than
					// flashing the mark into the frame's corner.
					return null;
				}
				const wide = width / height > ratio;
				const shownWidth = wide ? height * ratio : width;
				const shownHeight = wide ? height : width / ratio;
				left += (width - shownWidth) / 2;
				top += (height - shownHeight) / 2;
				width = shownWidth;
				height = shownHeight;
			}

			return { hostRect, safeScale, left, top, width, height };
		};

		const measure = () => {
			if (cancelled) {
				return;
			}
			const g = measureGeometry();
			if (!g) {
				return;
			}

			// Drift travel is measured per picture and normalised into the same
			// layout-px space as x/y (see the scale note above); it clamps to 0
			// when the picture is smaller than the mark. The `clearance` lift is
			// part of the mark's base position, so it comes off the vertical
			// travel too — otherwise a top-corner dodge would carry the mark
			// past the picture's top edge.
			const markW = mark.offsetWidth;
			const markH = mark.offsetHeight;

			setPlacement({
				x: Math.max(0, (g.left - g.hostRect.left) / g.safeScale),
				y: Math.max(0, (g.hostRect.bottom - (g.top + g.height)) / g.safeScale),
				driftX: Math.max(0, g.width / g.safeScale - markW),
				driftY: Math.max(0, g.height / g.safeScale - markH - clearance),
				ready: true,
			});
		};

		// Two frames of reference, deliberately separate. `clip` is the RAW
		// rect of the nearest ancestor that clips the picture (the lightbox
		// zoom scroll box, the booklet slide frame, a modal frame; the window
		// only when no such ancestor exists) — overflow is judged against it,
		// because "zoomed/panned past its box" is a fact about the box, not
		// about the window: intersecting with the window first would make a
		// fitted 1× inline booklet read as overflowing the moment the page
		// scrolls it across a window edge, and the mark would dodge onto the
		// off-screen half while the visitor merely scrolls the article.
		// `visible` is that box intersected with the window — the right frame
		// for the danger rect and corner targeting, where "what is actually on
		// screen" is what the mark must stay away from.
		const measureClip = (): { clip: Rect; visible: Rect } => {
			const windowRect: Rect = {
				left: 0,
				top: 0,
				right: window.innerWidth,
				bottom: window.innerHeight,
			};
			let clip = windowRect;
			for (let node = host.parentElement; node; node = node.parentElement) {
				const style = getComputedStyle(node);
				if (
					/(auto|scroll|hidden|clip)/.test(style.overflowX + style.overflowY)
				) {
					const rect = node.getBoundingClientRect();
					clip = {
						left: rect.left,
						top: rect.top,
						right: rect.right,
						bottom: rect.bottom,
					};
					break;
				}
			}
			return {
				clip,
				visible: {
					left: Math.max(windowRect.left, clip.left),
					top: Math.max(windowRect.top, clip.top),
					right: Math.min(windowRect.right, clip.right),
					bottom: Math.min(windowRect.bottom, clip.bottom),
				},
			};
		};

		/**
		 * The dodge: rect compares only, so it is cheap enough for the safety
		 * poll. While the picture fits its clipping box the mark stays (or
		 * returns) home; once the picture overflows that box (zoomed/panned)
		 * and the on-screen part of it — expanded by DODGE_MARGIN_PX — reaches
		 * the mark, it relocates to the corner whose resulting rect lands
		 * farthest from the visible center, preferring one fully out of view.
		 * Panning onto the new corner simply dodges it again, rate-limited by
		 * DODGE_COOLDOWN_MS.
		 */
		const evaluate = () => {
			rafId = null;
			if (cancelled) {
				return;
			}
			const g = measureGeometry();
			if (!g) {
				return;
			}
			const markRect = mark.getBoundingClientRect();
			const markW = markRect.width;
			const markH = markRect.height;
			const clearanceClient = clearance * g.safeScale;
			const driftX = Math.max(0, g.width - markW);
			const driftY = Math.max(0, g.height - markH - clearanceClient);
			const { clip, visible } = measureClip();

			const overflowing =
				g.left < clip.left - OVERFLOW_TOLERANCE_PX ||
				g.top < clip.top - OVERFLOW_TOLERANCE_PX ||
				g.left + g.width > clip.right + OVERFLOW_TOLERANCE_PX ||
				g.top + g.height > clip.bottom + OVERFLOW_TOLERANCE_PX;

			const current = cornerRef.current;
			if (!overflowing) {
				// Fitted again — glide home.
				if (current.cx !== HOME_CORNER.cx || current.cy !== HOME_CORNER.cy) {
					applyCorner(HOME_CORNER);
				}
				return;
			}

			// Where the mark's rect would sit at a corner, in client px. Uses
			// the DESTINATION corner (not the mid-glide rect) so decisions are
			// stable while a glide is in flight.
			const rectAt = (c: Corner): Rect => {
				const left = g.left + c.cx * driftX;
				const bottom = g.top + g.height - clearanceClient - c.cy * driftY;
				return { left, top: bottom - markH, right: left + markW, bottom };
			};

			const danger: Rect = {
				left: visible.left - DODGE_MARGIN_PX,
				top: visible.top - DODGE_MARGIN_PX,
				right: visible.right + DODGE_MARGIN_PX,
				bottom: visible.bottom + DODGE_MARGIN_PX,
			};
			if (!intersects(rectAt(current), danger)) {
				return; // Resting safely out of the visible view — stay put.
			}
			if (performance.now() - lastDodgeAt < DODGE_COOLDOWN_MS) {
				return; // Hysteresis: never thrash mid pan/zoom stream.
			}

			const centerX = (visible.left + visible.right) / 2;
			const centerY = (visible.top + visible.bottom) / 2;
			let best = current;
			let bestScore = Number.NEGATIVE_INFINITY;
			for (const cx of [0, 1] as const) {
				for (const cy of [0, 1] as const) {
					const rect = rectAt({ cx, cy });
					const distance = Math.hypot(
						(rect.left + rect.right) / 2 - centerX,
						(rect.top + rect.bottom) / 2 - centerY,
					);
					// A corner fully clear of the (expanded) visible rect always
					// beats one still in view, however far.
					const score = (intersects(rect, danger) ? 0 : 1_000_000) + distance;
					if (score > bestScore) {
						bestScore = score;
						best = { cx, cy };
					}
				}
			}
			if (best.cx === current.cx && best.cy === current.cy) {
				return;
			}
			lastDodgeAt = performance.now();
			applyCorner(best);
		};

		// rAF batching: many triggers per frame collapse into one evaluate.
		const schedule = () => {
			if (rafId === null) {
				rafId = requestAnimationFrame(evaluate);
			}
		};

		measure();
		schedule();

		const observer = new ResizeObserver(() => {
			measure();
			schedule();
		});
		observer.observe(host);
		if (picture) {
			observer.observe(picture);
			// naturalWidth is 0 until the bytes arrive; re-measure once they do.
			picture.addEventListener("load", measure);
		}

		// Capture-phase so a scroll of ANY ancestor (the lightbox zoom scroll
		// box, the page itself) re-runs the dodge check; filtered so unrelated
		// panes don't.
		const onScroll = (event: Event) => {
			const target = event.target;
			if (
				target !== document &&
				!(target instanceof Element && target.contains(host))
			) {
				return;
			}
			schedule();
		};
		window.addEventListener("scroll", onScroll, {
			capture: true,
			passive: true,
		});

		const interval = window.setInterval(schedule, POLL_INTERVAL_MS);

		return () => {
			cancelled = true;
			observer.disconnect();
			picture?.removeEventListener("load", measure);
			window.removeEventListener("scroll", onScroll, { capture: true });
			window.clearInterval(interval);
			if (rafId !== null) {
				cancelAnimationFrame(rafId);
			}
		};
	}, [contain, clearance]);

	return (
		<span
			ref={ref}
			aria-hidden
			className={cn(
				"pointer-events-none absolute z-20 p-3 sm:p-4",
				// Slow glide between corners; the fade only covers first placement.
				// motion-reduce drops the glide but KEEPS the reposition — the
				// dodge is functional, so it must still happen, just instantly.
				"[transition:opacity_200ms_ease,transform_600ms_ease] motion-reduce:transition-none",
				placement.ready ? "opacity-100" : "opacity-0",
				className,
			)}
			style={{
				left: placement.x,
				bottom: placement.y + clearance,
				transform: `translate(${corner.cx * placement.driftX}px, ${
					-corner.cy * placement.driftY
				}px)`,
			}}
		>
			<NextImage
				src={LOGO_SRC}
				alt=""
				width={128}
				height={128}
				sizes="96px"
				className="size-14 object-contain opacity-90 drop-shadow-[0_2px_6px_rgba(0,0,0,0.45)] sm:size-20"
			/>
		</span>
	);
}
