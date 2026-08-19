"use client";

import { XMarkIcon } from "@heroicons/react/24/outline";
import NextImage from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import { ImageWatermark } from "@/components/ui/image-watermark";
import { useScrollLock } from "@/lib/use-scroll-lock";
import { cn } from "@/lib/utils";

/** Same dead-URL fallback the cover components use (CMS media can 404). */
const FALLBACK = "/menu/1.jpg";

function isRemoteSrc(src: string): boolean {
	return src.startsWith("http://") || src.startsWith("https://");
}

type CoverLightboxProps = {
	/** Full-resolution image shown inside the lightbox card. */
	src: string;
	alt: string;
	closeLabel: string;
	/**
	 * Accessible name for the trigger button. Defaults to `alt` — override for
	 * icon-only triggers where the cover itself is not the click target.
	 */
	triggerLabel?: string;
	/** Optional caption strip under the enlarged image. */
	caption?: string | null;
	/**
	 * Intrinsic size hint for the dialog's pre-load layout. Pass a portrait
	 * hint (e.g. 1200×1600) for book covers so the card doesn't snap from a
	 * landscape placeholder once the image arrives.
	 */
	intrinsicWidth?: number;
	intrinsicHeight?: number;
	/** Classes for the trigger button (the in-page cover). */
	className?: string;
	/** The cover exactly as rendered on the page — becomes the click target. */
	children: React.ReactNode;
};

/**
 * Click-to-enlarge for detail-page cover images. The in-page cover (children)
 * becomes a button; clicking it opens a native <dialog> card that shrink-wraps
 * the image at its natural fit (object-contain, capped to the viewport).
 * Clicking the backdrop — anywhere outside the card — closes it, as does Esc
 * and the corner close button.
 */
export function CoverLightbox({
	src,
	alt,
	closeLabel,
	triggerLabel,
	caption,
	intrinsicWidth = 1920,
	intrinsicHeight = 1280,
	className,
	children,
}: CoverLightboxProps) {
	const dialogRef = useRef<HTMLDialogElement>(null);
	const [open, setOpen] = useState(false);
	const [currentSrc, setCurrentSrc] = useState(src);

	useEffect(() => {
		setCurrentSrc(src);
	}, [src]);

	useScrollLock(open);

	const show = useCallback(() => {
		setOpen(true);
		dialogRef.current?.showModal();
	}, []);

	const close = useCallback(() => {
		dialogRef.current?.close();
	}, []);

	// Backdrop clicks dispatch with the <dialog> itself as target; clicks on the
	// image/caption target those elements instead — so this closes only when the
	// user clicks outside the card.
	const onDialogClick = useCallback(
		(event: React.MouseEvent<HTMLDialogElement>) => {
			if (event.target === dialogRef.current) close();
		},
		[close],
	);

	return (
		<>
			<button
				type="button"
				onClick={show}
				aria-label={triggerLabel ?? alt}
				aria-haspopup="dialog"
				className={cn(
					"group/zoom block w-full cursor-zoom-in text-start",
					"transition-opacity fine-hover:opacity-95",
					className,
				)}
			>
				{children}
			</button>

			{/* biome-ignore lint/a11y/useKeyWithClickEvents: backdrop click-to-close is a pointer-only convenience; keyboard users close the native <dialog> with Esc. */}
			<dialog
				ref={dialogRef}
				onClose={() => setOpen(false)}
				onClick={onDialogClick}
				aria-label={alt}
				className="m-auto max-h-[92svh] max-w-[min(94vw,80rem)] bg-background p-0 text-foreground backdrop:bg-foreground/85"
			>
				{open ? (
					<div className="relative flex max-h-[inherit] flex-col">
						{/* `w-fit` shrink-wraps the picture rather than letting the flex
						    column stretch it to the dialog width (a long caption widens
						    the card); `mx-auto` then keeps it centred in both
						    directions. */}
						<div className="relative mx-auto w-fit">
							<NextImage
								src={currentSrc}
								alt={alt}
								width={intrinsicWidth}
								height={intrinsicHeight}
								sizes="94vw"
								unoptimized={isRemoteSrc(currentSrc)}
								className="h-auto max-h-[82svh] w-auto max-w-full object-contain"
								onError={() => {
									if (currentSrc !== FALLBACK) {
										setCurrentSrc(FALLBACK);
									}
								}}
								priority
							/>
							<ImageWatermark />
						</div>

						<button
							type="button"
							onClick={close}
							aria-label={closeLabel}
							className="absolute end-3 top-3 inline-flex size-9 items-center justify-center border border-border/80 bg-background/90 text-foreground transition-colors fine-hover:bg-background"
						>
							<XMarkIcon aria-hidden="true" className="size-4" />
						</button>

						{caption ? (
							<p className="border-t border-border px-4 py-3 text-small leading-relaxed text-muted">
								{caption}
							</p>
						) : null}
					</div>
				) : null}
			</dialog>
		</>
	);
}
