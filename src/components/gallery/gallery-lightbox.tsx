"use client";

import {
	ChevronLeftIcon,
	ChevronRightIcon,
	XMarkIcon,
} from "@heroicons/react/24/outline";
import NextImage from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import {
	formatAspectRatio,
	formatFileSizeBytes,
	type GalleryAlbumMetadataLabels,
	type GalleryLightboxItem,
} from "@/components/gallery/gallery-album-item";
import { prefersReducedMotion } from "@/components/motion/scroll-reveal";
import { DirectionalIcon } from "@/components/ui/directional-icon";
import { ImageWatermark } from "@/components/ui/image-watermark";
import { useScrollLock } from "@/lib/use-scroll-lock";
import { cn } from "@/lib/utils";

export type { GalleryLightboxItem };

type GalleryLightboxProps = {
	items: GalleryLightboxItem[];
	activeIndex: number | null;
	onActiveIndexChange: (index: number | null) => void;
	dialogRef: React.RefObject<HTMLDialogElement | null>;
	closeLabel: string;
	previousLabel: string;
	nextLabel: string;
	metadataLabels: GalleryAlbumMetadataLabels;
	fallbackTitle?: string;
};

const navButtonClass =
	"inline-flex size-9 items-center justify-center border border-primary-foreground/25 bg-primary text-primary-foreground transition-[opacity,transform] fine-hover:opacity-90 active:scale-95";

/**
 * Lightbox zoom — gesture-driven, no buttons: double-click/double-tap glides
 * between the fitted size and MAX, ctrl/cmd + wheel (what a trackpad pinch
 * emits) lands anywhere in between. MIN 1 keeps the fitted size (shrinking
 * below fit is pointless here).
 */
const MIN_ZOOM = 1;
const MAX_ZOOM = 2;
/** Divisor for wheel deltaY — higher means a gentler ctrl+wheel zoom. */
const WHEEL_ZOOM_EASE = 200;

function hasDimensions(item: GalleryLightboxItem): boolean {
	return item.widthPx != null && item.heightPx != null;
}

function hasMetadataRows(item: GalleryLightboxItem): boolean {
	return (
		hasDimensions(item) ||
		item.humanReadableSize != null ||
		item.fileSizeBytes != null ||
		item.mimeType != null ||
		item.aspectRatio != null ||
		item.sortOrder != null ||
		item.externalUrl != null ||
		item.embedUrl != null
	);
}

function MetadataRow({
	label,
	children,
}: {
	label: string;
	children: React.ReactNode;
}) {
	return (
		<div className="flex flex-col gap-1 py-2.5 sm:flex-row sm:items-baseline sm:justify-between sm:gap-3">
			<dt className="label font-medium text-background">{label}</dt>
			<dd className="text-small text-background/65 sm:text-end">{children}</dd>
		</div>
	);
}

function thumbSrc(item: GalleryLightboxItem): string | null {
	return item.imageUrl ?? null;
}

export function useGalleryLightbox() {
	const dialogRef = useRef<HTMLDialogElement>(null);
	const [activeIndex, setActiveIndex] = useState<number | null>(null);

	const open = useCallback((index: number) => {
		setActiveIndex(index);
		dialogRef.current?.showModal();
	}, []);

	const close = useCallback(() => {
		dialogRef.current?.close();
	}, []);

	return { dialogRef, activeIndex, setActiveIndex, open, close };
}

/**
 * Native <dialog> lightbox for album `ImageItemDto` records — every API field
 * is listed when present; absent fields are omitted.
 */
export function GalleryLightbox({
	items,
	activeIndex,
	onActiveIndexChange,
	dialogRef,
	closeLabel,
	previousLabel,
	nextLabel,
	metadataLabels,
	fallbackTitle,
}: GalleryLightboxProps) {
	const step = useCallback(
		(delta: number) => {
			onActiveIndexChange(
				activeIndex === null
					? activeIndex
					: (activeIndex + delta + items.length) % items.length,
			);
		},
		[activeIndex, items.length, onActiveIndexChange],
	);

	const [zoomLevel, setZoomLevel] = useState(1);
	const zoomViewportRef = useRef<HTMLDivElement>(null);
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
		const viewport = zoomViewportRef.current;
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
	// to the target, matching the old behavior.
	const animateZoomTo = useCallback(
		(target: number, clientX: number, clientY: number) => {
			stopZoomTween();
			const anchor = computeZoomAnchor(clientX, clientY);
			const from = zoomLevelRef.current;
			if (!anchor || prefersReducedMotion() || Math.abs(target - from) < 0.01) {
				zoomAnchorRef.current = anchor;
				setZoomLevel(target);
				return;
			}
			const started = performance.now();
			const durationMs = 300;
			const tick = (now: number) => {
				const progress = Math.min(1, (now - started) / durationMs);
				const eased = 1 - (1 - progress) ** 3;
				zoomAnchorRef.current = { ...anchor };
				setZoomLevel(from + (target - from) * eased);
				zoomTweenRef.current =
					progress < 1 ? requestAnimationFrame(tick) : null;
			};
			zoomTweenRef.current = requestAnimationFrame(tick);
		},
		[computeZoomAnchor, stopZoomTween],
	);

	// Every page opens at the fitted size — zoom never carries across pages.
	// biome-ignore lint/correctness/useExhaustiveDependencies: activeIndex is the reset trigger, not an input.
	useEffect(() => {
		stopZoomTween();
		zoomAnchorRef.current = null;
		setZoomLevel(1);
	}, [activeIndex]);

	// Keep the gesture's anchor point — or, with no gesture, the middle of the
	// page — in view on each zoom change; the old center-origin `scale()` did
	// the centering implicitly, and the edges are what the scroll box adds.
	// In RTL the horizontal scroll range runs 0 → negative.
	// biome-ignore lint/correctness/useExhaustiveDependencies: zoomLevel is the re-scroll trigger; the scroll metrics it resizes are read off the DOM.
	useEffect(() => {
		const viewport = zoomViewportRef.current;
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

	// ctrl/cmd + wheel — what a trackpad pinch emits — zooms smoothly; plain
	// wheel falls through and keeps scrolling/panning the zoomed image. A
	// native non-passive listener because React registers wheel handlers
	// passively, and zooming must preventDefault so the browser doesn't zoom
	// the whole page.
	// biome-ignore lint/correctness/useExhaustiveDependencies: activeIndex re-binds the listener when a page (re)mounts the viewport node.
	useEffect(() => {
		const viewport = zoomViewportRef.current;
		if (!viewport) return;
		const onWheel = (event: WheelEvent) => {
			if (!event.ctrlKey && !event.metaKey) return;
			event.preventDefault();
			stopZoomTween();
			setZoomAnchor(event.clientX, event.clientY);
			setZoomLevel((level) =>
				Math.min(
					MAX_ZOOM,
					Math.max(MIN_ZOOM, level * Math.exp(-event.deltaY / WHEEL_ZOOM_EASE)),
				),
			);
		};
		viewport.addEventListener("wheel", onWheel, { passive: false });
		return () => viewport.removeEventListener("wheel", onWheel);
	}, [setZoomAnchor, stopZoomTween, activeIndex]);

	// The thumbnail rail follows the arrows/keys: whichever page becomes
	// active, its thumb glides into view instead of drifting off the strip.
	const thumbListRef = useRef<HTMLUListElement>(null);
	useEffect(() => {
		if (activeIndex === null) return;
		const active = thumbListRef.current?.querySelector('[aria-pressed="true"]');
		active?.scrollIntoView({
			behavior: prefersReducedMotion() ? "auto" : "smooth",
			block: "nearest",
			inline: "nearest",
		});
	}, [activeIndex]);

	// Double-click / double-tap glides fitted ↔ MAX, anchored at the gesture.
	const onZoomViewportDoubleClick = (
		event: React.MouseEvent<HTMLDivElement>,
	) => {
		animateZoomTo(
			zoomLevelRef.current > MIN_ZOOM ? MIN_ZOOM : MAX_ZOOM,
			event.clientX,
			event.clientY,
		);
	};

	useScrollLock(activeIndex !== null);

	const onDialogKeyDown = (event: React.KeyboardEvent<HTMLDialogElement>) => {
		const rtl = document.documentElement.dir === "rtl";
		if (event.key === (rtl ? "ArrowLeft" : "ArrowRight")) step(1);
		if (event.key === (rtl ? "ArrowRight" : "ArrowLeft")) step(-1);
	};

	// Backdrop clicks dispatch with the <dialog> itself as target; clicks on the
	// content hit inner elements — so this closes only clicks outside the card.
	const onDialogClick = (event: React.MouseEvent<HTMLDialogElement>) => {
		if (event.target === dialogRef.current) dialogRef.current?.close();
	};

	const item = activeIndex === null ? null : items[activeIndex];
	const collectionTitle = fallbackTitle ?? "";
	const headline = item?.caption ?? collectionTitle;
	const showDescription =
		Boolean(item?.description) && item?.description !== item?.caption;
	const showContext = Boolean(
		item?.context &&
			item.context !== headline &&
			(item.caption != null || item.context !== collectionTitle),
	);
	const showThumbs = items.length > 1 && items.some((entry) => thumbSrc(entry));
	// The side panel only earns its place when the item carries real
	// information; a bare caption (e.g. a brochure page number) renders as an
	// overlay on the media instead.
	const showPanel = Boolean(
		item && (hasMetadataRows(item) || showDescription || showContext),
	);
	const showNav = items.length > 1;

	return (
		<dialog
			ref={dialogRef}
			onClose={() => onActiveIndexChange(null)}
			onKeyDown={onDialogKeyDown}
			onClick={onDialogClick}
			aria-label={headline}
			className="m-auto max-h-[98svh] w-[min(98vw,180rem)] border border-background/15 bg-foreground/60 text-background backdrop-blur-xl backdrop:bg-foreground/70 backdrop:backdrop-blur-sm"
		>
			{item && activeIndex !== null && (
				<div
					className={cn(
						"max-h-[inherit]",
						showPanel
							? "grid grid-rows-[minmax(0,1fr)_auto] lg:grid-cols-[minmax(0,1fr)_22rem] lg:grid-rows-1"
							: "flex flex-col",
					)}
				>
					<div className="flex min-h-0 flex-col">
						<div
							className={cn(
								"relative overflow-hidden",
								showPanel
									? "h-[52svh] sm:h-[58svh] lg:h-[min(78svh,100%)] lg:min-h-[70svh]"
									: "h-[60svh] sm:h-[70svh] lg:h-[78svh]",
							)}
						>
							{item.imageUrl ? (
								<>
									{/* Ambient fill behind the letterboxed image. */}
									<NextImage
										key={`ambient-${item.id}`}
										src={item.imageUrl}
										alt=""
										aria-hidden
										fill
										sizes="96px"
										className="scale-110 object-cover opacity-40 blur-2xl"
										draggable={false}
									/>
									{/* Zoom scroll box: its child grows with the zoom level and
									    `fill` re-anchors to that child, so the picture and its
									    watermark scale together while every edge stays reachable
									    by scrolling — the ambient blur behind them stays outside
									    at 1×. Sized rather than transform-scaled so the scroll
									    range is real and already settled when the re-center
									    effect runs; the double-click glide re-runs that effect
									    every frame, which is what keeps it anchored. */}
									{/* biome-ignore lint/a11y/noStaticElementInteractions: Double-click zoom is a pointer-only enhancement over a scroll box — every page stays fully reachable without it, so no role or keyboard handler is warranted. */}
									<div
										ref={zoomViewportRef}
										onDoubleClick={onZoomViewportDoubleClick}
										className={cn(
											"absolute inset-0 overflow-auto",
											zoomLevel > MIN_ZOOM
												? "cursor-zoom-out"
												: "cursor-zoom-in",
										)}
									>
										<div
											className="relative"
											style={{
												width: `${zoomLevel * 100}%`,
												height: `${zoomLevel * 100}%`,
											}}
										>
											<NextImage
												key={item.id}
												src={item.imageUrl}
												alt={item.alt ?? item.caption ?? collectionTitle}
												fill
												sizes="(max-width: 1023px) 98vw, 90vw"
												className="object-contain"
											/>
											{/* Lifted clear of the caption strip when that strip is
											    the one rendered over the media. */}
											<ImageWatermark
												contain={item.imageUrl}
												clearance={showPanel ? 0 : 40}
											/>
										</div>
									</div>
								</>
							) : item.embedUrl ? (
								<iframe
									title={item.caption ?? collectionTitle}
									src={item.embedUrl}
									className="absolute inset-0 size-full border-0"
									allowFullScreen
								/>
							) : (
								<div className="flex size-full items-center justify-center p-6 text-center text-small text-background/70">
									{item.externalUrl ? (
										<a
											href={item.externalUrl}
											target="_blank"
											rel="noopener noreferrer"
											className="underline underline-offset-2"
										>
											{item.externalUrl}
										</a>
									) : null}
								</div>
							)}

							{!showPanel && (
								<>
									<button
										type="button"
										onClick={() => dialogRef.current?.close()}
										aria-label={closeLabel}
										className={cn(navButtonClass, "absolute top-3 end-3 z-10")}
									>
										<XMarkIcon aria-hidden="true" className="size-4" />
									</button>

									{showNav && (
										<>
											<button
												type="button"
												onClick={() => step(-1)}
												aria-label={previousLabel}
												className={cn(
													navButtonClass,
													"absolute start-3 top-1/2 z-10 -translate-y-1/2",
												)}
											>
												<DirectionalIcon
													icon={ChevronLeftIcon}
													className="size-4"
												/>
											</button>
											<button
												type="button"
												onClick={() => step(1)}
												aria-label={nextLabel}
												className={cn(
													navButtonClass,
													"absolute end-3 top-1/2 z-10 -translate-y-1/2",
												)}
											>
												<DirectionalIcon
													icon={ChevronRightIcon}
													className="size-4"
												/>
											</button>
										</>
									)}

									{(headline || showNav) && (
										<div className="pointer-events-none absolute inset-x-0 bottom-0 flex items-end justify-between gap-3 bg-linear-to-t from-foreground/80 to-transparent px-4 pt-10 pb-3">
											<p className="truncate text-small text-background/90">
												{headline}
											</p>
											{showNav && (
												<span
													dir="ltr"
													className="shrink-0 text-label text-background/70 tabular-nums"
													aria-live="polite"
													aria-atomic="true"
												>
													{activeIndex + 1} / {items.length}
												</span>
											)}
										</div>
									)}
								</>
							)}
						</div>

						{showThumbs ? (
							<ul
								ref={thumbListRef}
								className="flex gap-2 overflow-x-auto border-t border-background/15 px-3 py-2.5 scrollbar-none sm:px-4"
							>
								{items.map((thumb, index) => {
									const src = thumbSrc(thumb);
									if (!src) return null;
									const isActive = index === activeIndex;

									return (
										<li key={thumb.id} className="w-16 shrink-0 sm:w-20">
											<button
												type="button"
												onClick={() => onActiveIndexChange(index)}
												aria-pressed={isActive}
												aria-label={thumb.caption ?? collectionTitle}
												className={cn(
													"relative block aspect-4/3 w-full overflow-hidden border transition-[border-color,opacity] duration-200",
													isActive
														? "border-background opacity-100"
														: "border-background/25 opacity-70 fine-hover:border-background/60 fine-hover:opacity-100",
												)}
											>
												<NextImage
													src={src}
													alt=""
													fill
													sizes="80px"
													className="object-cover"
												/>
											</button>
										</li>
									);
								})}
							</ul>
						) : null}
					</div>

					{showPanel && (
						<div className="flex min-h-0 flex-col gap-5 overflow-y-auto border-t border-background/15 p-5 lg:border-t-0 lg:border-s lg:p-6">
							<div className="flex items-center justify-end gap-3">
								<button
									type="button"
									onClick={() => dialogRef.current?.close()}
									aria-label={closeLabel}
									className={navButtonClass}
								>
									<XMarkIcon aria-hidden="true" className="size-4" />
								</button>
							</div>

							{headline && (
								<p className="font-heading text-h3 leading-snug font-bold text-balance">
									{headline}
								</p>
							)}

							{showDescription && (
								<p className="text-justify text-small leading-relaxed text-background/70">
									{item.description}
								</p>
							)}

							{hasMetadataRows(item) && (
								<dl className="border-y border-background/15 divide-y divide-background/15">
									{item.sortOrder != null && (
										<MetadataRow label={metadataLabels.sortOrder}>
											{item.sortOrder}
										</MetadataRow>
									)}
									{hasDimensions(item) && (
										<MetadataRow label={metadataLabels.dimensions}>
											{item.widthPx} × {item.heightPx}
										</MetadataRow>
									)}
									{item.aspectRatio != null && (
										<MetadataRow label={metadataLabels.aspectRatio}>
											{formatAspectRatio(item.aspectRatio)}
										</MetadataRow>
									)}
									{item.humanReadableSize && (
										<MetadataRow label={metadataLabels.fileSize}>
											{item.humanReadableSize}
										</MetadataRow>
									)}
									{item.fileSizeBytes != null && (
										<MetadataRow label={metadataLabels.fileSizeBytes}>
											{formatFileSizeBytes(item.fileSizeBytes)}
										</MetadataRow>
									)}
									{item.mimeType && (
										<MetadataRow label={metadataLabels.mimeType}>
											{item.mimeType}
										</MetadataRow>
									)}
									{item.externalUrl && (
										<MetadataRow label={metadataLabels.externalUrl}>
											<a
												href={item.externalUrl}
												target="_blank"
												rel="noopener noreferrer"
												className="break-all underline underline-offset-2"
											>
												{item.externalUrl}
											</a>
										</MetadataRow>
									)}
									{item.embedUrl && (
										<MetadataRow label={metadataLabels.embedUrl}>
											<a
												href={item.embedUrl}
												target="_blank"
												rel="noopener noreferrer"
												className="break-all underline underline-offset-2"
											>
												{item.embedUrl}
											</a>
										</MetadataRow>
									)}
								</dl>
							)}

							{showContext && (
								<p className="label text-background/65">{item.context}</p>
							)}

							<div className="mt-auto flex items-center gap-2 pt-2">
								<button
									type="button"
									onClick={() => step(-1)}
									aria-label={previousLabel}
									className={navButtonClass}
								>
									<DirectionalIcon icon={ChevronLeftIcon} className="size-4" />
								</button>
								<button
									type="button"
									onClick={() => step(1)}
									aria-label={nextLabel}
									className={navButtonClass}
								>
									<DirectionalIcon icon={ChevronRightIcon} className="size-4" />
								</button>
							</div>
						</div>
					)}
				</div>
			)}
		</dialog>
	);
}
