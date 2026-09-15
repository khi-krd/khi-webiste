"use client";

import NextImage from "next/image";
import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

/** Bundled brand mark — always present, unlike the CMS logo record. */
const LOGO_SRC = "/logo.png";

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
	/**
	 * The viewer's current zoom level. The mark scales by 1/zoom, floored at
	 * 60%: zooming INTO the artwork shrinks the mark a little, and combined
	 * with `viewportRef` it stays pinned to the VISIBLE corner of the picture
	 * instead of scrolling out of the frame.
	 */
	zoom?: number;
	/**
	 * The `overflow-auto` scroll box the picture zooms inside. When given, the
	 * mark must be rendered as a child of the positioned FRAME that contains
	 * the scroll box (not inside the scrolled child), and its measured corner
	 * is clamped to what the scroll box currently shows — so the logo never
	 * scrolls out of view at 2–3×.
	 */
	viewportRef?: React.RefObject<HTMLElement | null>;
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
 * The mark anchors to the bottom-left of the picture — or, while the picture
 * is zoomed inside a scroll box (`viewportRef` prop), the bottom-left of the
 * part currently in view, so panning can never carry it off-screen. Zooming
 * also shrinks it a little (`zoom` prop, scale 1/zoom floored at 60%) so it
 * stops covering the enlarged artwork; zooming back out restores it.
 */
export function ImageWatermark({
	contain,
	clearance = 0,
	zoom = 1,
	viewportRef,
	className,
}: ImageWatermarkProps) {
	const ref = useRef<HTMLSpanElement>(null);
	// The scroll listener and the zoom-prop effect re-run the same measure.
	const measureRef = useRef<(() => void) | null>(null);
	const [placement, setPlacement] = useState<{
		x: number;
		y: number;
		ready: boolean;
	}>({ x: 0, y: 0, ready: false });

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
		setPlacement((current) => ({ ...current, ready: false }));

		const measure = () => {
			if (cancelled) {
				return;
			}
			const hostRect = host.getBoundingClientRect();
			if (hostRect.width <= 0 || hostRect.height <= 0) {
				return;
			}

			// getBoundingClientRect reports POST-transform pixels, but the inline
			// offsets below are applied inside the same transform (a host may be
			// transform-scaled). Normalising by the host's own scale keeps the
			// mark on the artwork at every zoom level.
			const scale =
				host.offsetWidth > 0 ? hostRect.width / host.offsetWidth : 1;
			const safeScale = scale > 0 ? scale : 1;

			let left = 0;
			let top = 0;
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
			} else {
				left = hostRect.left;
				top = hostRect.top;
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
					return;
				}
				const wide = width / height > ratio;
				const shownWidth = wide ? height * ratio : width;
				const shownHeight = wide ? height : width / ratio;
				left += (width - shownWidth) / 2;
				top += (height - shownHeight) / 2;
				width = shownWidth;
				height = shownHeight;
			}

			// left/top/width/height are viewport-client coordinates here. While
			// the picture zooms inside a scroll box, clamp them to what that box
			// actually shows so the mark rides the visible corner.
			const viewport = viewportRef?.current;
			if (viewport) {
				const viewportRect = viewport.getBoundingClientRect();
				const interLeft = Math.max(left, viewportRect.left);
				const interTop = Math.max(top, viewportRect.top);
				const interRight = Math.min(left + width, viewportRect.right);
				const interBottom = Math.min(top + height, viewportRect.bottom);
				if (interRight > interLeft && interBottom > interTop) {
					left = interLeft;
					top = interTop;
					width = interRight - interLeft;
					height = interBottom - interTop;
				} else {
					left = viewportRect.left;
					top = viewportRect.top;
					width = viewportRect.width;
					height = viewportRect.height;
				}
			}

			setPlacement({
				x: Math.max(0, (left - hostRect.left) / safeScale),
				y: Math.max(0, (hostRect.bottom - (top + height)) / safeScale),
				ready: true,
			});
		};

		measureRef.current = measure;
		measure();

		const observer = new ResizeObserver(measure);
		observer.observe(host);
		if (picture) {
			observer.observe(picture);
			// naturalWidth is 0 until the bytes arrive; re-measure once they do.
			picture.addEventListener("load", measure);
		}
		const viewport = viewportRef?.current;
		viewport?.addEventListener("scroll", measure, { passive: true });

		return () => {
			cancelled = true;
			observer.disconnect();
			picture?.removeEventListener("load", measure);
			viewport?.removeEventListener("scroll", measure);
		};
	}, [contain, viewportRef]);

	// The zoom level itself is not a measure input — the resize/scroll
	// listeners fire as the layout shifts — but a fresh `zoom` prop is a
	// cheap re-check, and it is the re-measure trigger, not a dependency.
	// biome-ignore lint/correctness/useExhaustiveDependencies: zoom is the re-measure trigger, not an input.
	useEffect(() => {
		measureRef.current?.();
	}, [zoom]);

	// Shrink with the zoom, from the mark's own anchored corner; never above
	// natural size and never below 60% so it stays legible while zoomed. The
	// 300ms transform ease matches the zoom glide, so wheel steps and
	// double-click glides both read as one smooth resize.
	const markScale = Math.max(0.6, Math.min(1, 1 / Math.max(1, zoom)));

	return (
		<span
			ref={ref}
			aria-hidden
			className={cn(
				"pointer-events-none absolute z-10 p-3 sm:p-4",
				"origin-bottom-left [transition:opacity_200ms_ease,transform_300ms_ease] motion-reduce:[transition:opacity_200ms_ease]",
				placement.ready ? "opacity-100" : "opacity-0",
				className,
			)}
			style={{
				left: placement.x,
				bottom: placement.y + clearance,
				transform: `scale(${markScale})`,
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
