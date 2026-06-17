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
import { DirectionalIcon } from "@/components/ui/directional-icon";

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

function frameNo(index: number): string {
	return String(index + 1).padStart(2, "0");
}

const navButtonClass =
	"inline-flex size-9 items-center justify-center border border-border-strong text-foreground transition-colors fine-hover:bg-sunken";

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
			<dt className="label font-medium text-foreground">{label}</dt>
			<dd className="text-small text-muted sm:text-end">{children}</dd>
		</div>
	);
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

	useEffect(() => {
		if (activeIndex === null) return;
		const previous = document.body.style.overflow;
		document.body.style.overflow = "hidden";
		return () => {
			document.body.style.overflow = previous;
		};
	}, [activeIndex]);

	const onDialogKeyDown = (event: React.KeyboardEvent<HTMLDialogElement>) => {
		const rtl = document.documentElement.dir === "rtl";
		if (event.key === (rtl ? "ArrowLeft" : "ArrowRight")) step(1);
		if (event.key === (rtl ? "ArrowRight" : "ArrowLeft")) step(-1);
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

	return (
		// biome-ignore lint/a11y/noStaticElementInteractions: keyboard nav on the dialog container (focus is trapped inside it)
		<dialog
			ref={dialogRef}
			onClose={() => onActiveIndexChange(null)}
			onKeyDown={onDialogKeyDown}
			aria-label={headline}
			className="m-auto max-h-[98svh] w-[min(98vw,180rem)] border border-border bg-background text-foreground backdrop:bg-foreground/85"
		>
			{item && (
				<div className="grid max-h-[inherit] grid-rows-[minmax(0,1fr)_auto] lg:grid-cols-[minmax(0,1fr)_22rem] lg:grid-rows-1">
					<div className="relative h-[62svh] bg-sunken sm:h-[68svh] lg:h-[min(90svh,100%)] lg:min-h-[85svh]">
						{item.imageUrl ? (
							<NextImage
								key={item.id}
								src={item.imageUrl}
								alt={
									item.alt ??
									item.caption ??
									`${collectionTitle} — ${frameNo(activeIndex ?? 0)}`
								}
								fill
								sizes="(max-width: 1023px) 98vw, 90vw"
								className="object-contain"
							/>
						) : item.embedUrl ? (
							<iframe
								title={item.caption ?? collectionTitle}
								src={item.embedUrl}
								className="absolute inset-0 size-full border-0"
								allowFullScreen
							/>
						) : (
							<div className="flex size-full items-center justify-center p-6 text-center text-small text-muted">
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
					</div>

					<div className="flex min-h-0 flex-col gap-5 overflow-y-auto border-t border-border p-5 lg:border-t-0 lg:border-s lg:p-6">
						<div className="flex items-center justify-between gap-3">
							<p className="label font-medium">
								{frameNo(activeIndex ?? 0)}
								<span className="text-muted">
									{" "}
									/ {frameNo(items.length - 1)}
								</span>
							</p>
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
							<p className="text-small leading-relaxed text-muted">
								{item.description}
							</p>
						)}

						{hasMetadataRows(item) && (
							<dl className="border-y border-border divide-y divide-border">
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

						{showContext && <p className="label text-muted">{item.context}</p>}

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
				</div>
			)}
		</dialog>
	);
}
