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
	 * The viewer's current zoom level. The mark scales by 1/zoom, capped at its
	 * natural size: zooming INTO the artwork shrinks the mark out of the way,
	 * zooming back out grows it back — but never beyond its own size, and it
	 * NEVER changes corner (user request: shrink in place, no relocating).
	 */
	zoom?: number;
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
 * The mark STAYS in that corner. Zooming shrinks it in place (`zoom` prop,
 * scale 1/zoom from its own corner) so it stops covering the enlarged
 * artwork; zooming out restores it to — at most — its natural size. It never
 * drifts and never dodges to another corner (user request).
 */
export function ImageWatermark({
	contain,
	clearance = 0,
	zoom = 1,
	className,
}: ImageWatermarkProps) {
	const ref = useRef<HTMLSpanElement>(null);
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
					left = rect.left - hostRect.left;
					top = rect.top - hostRect.top;
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

			setPlacement({
				x: Math.max(0, left / safeScale),
				y: Math.max(0, (hostRect.height - (top + height)) / safeScale),
				ready: true,
			});
		};

		measure();

		const observer = new ResizeObserver(measure);
		observer.observe(host);
		if (picture) {
			observer.observe(picture);
			// naturalWidth is 0 until the bytes arrive; re-measure once they do.
			picture.addEventListener("load", measure);
		}

		return () => {
			cancelled = true;
			observer.disconnect();
			picture?.removeEventListener("load", measure);
		};
	}, [contain]);

	// Shrink with the zoom, from the mark's own anchored corner; never above
	// natural size. The 300ms transform ease matches the zoom glide, so wheel
	// steps and double-click glides both read as one smooth resize.
	const markScale = Math.min(1, 1 / Math.max(1, zoom));

	return (
		<span
			ref={ref}
			aria-hidden
			className={cn(
				"pointer-events-none absolute z-20 p-3 sm:p-4",
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
