"use client";

import {
	ChevronLeftIcon,
	ChevronRightIcon,
	XMarkIcon,
} from "@heroicons/react/24/outline";
import { PlayIcon } from "@heroicons/react/24/solid";
import NextImage from "next/image";
import { useCallback } from "react";
import { ProjectCoverMedia } from "@/components/projects/project-cover-media";
import { DirectionalIcon } from "@/components/ui/directional-icon";
import { ImageWatermark } from "@/components/ui/image-watermark";
import { VideoPlayer } from "@/components/ui/video-player";
import { useScrollLock } from "@/lib/use-scroll-lock";
import { cn } from "@/lib/utils";
import type { MediaItem } from "@/types/media";

type NewsMediaModalProps = {
	items: MediaItem[];
	activeIndex: number | null;
	onActiveIndexChange: (index: number | null) => void;
	dialogRef: React.RefObject<HTMLDialogElement | null>;
	articleTitle: string;
	closeLabel: string;
	previousLabel: string;
	nextLabel: string;
};

const navButtonClass =
	"inline-flex size-9 items-center justify-center border border-primary-foreground/25 bg-primary text-primary-foreground transition-opacity fine-hover:opacity-90";

function isRemoteSrc(src: string): boolean {
	return src.startsWith("http://") || src.startsWith("https://");
}

function thumbPreview(item: MediaItem): string | null {
	if (item.thumbnailUrl) return item.thumbnailUrl;
	if (item.kind === "IMAGE") return item.url;
	return null;
}

function ModalMedia({
	item,
	articleTitle,
}: {
	item: MediaItem;
	articleTitle: string;
}) {
	const label = item.caption ?? articleTitle;

	if (item.kind === "IMAGE") {
		return (
			<div className="relative min-h-[min(52svh,36rem)] w-full overflow-hidden">
				{/* Ambient fill behind the letterboxed image. */}
				<NextImage
					src={item.url}
					alt=""
					aria-hidden
					fill
					sizes="96px"
					unoptimized={isRemoteSrc(item.url)}
					className="scale-110 object-cover opacity-40 blur-2xl"
					draggable={false}
				/>
				<NextImage
					src={item.url}
					alt={label}
					fill
					sizes="(max-width: 1023px) 98vw, 90vw"
					unoptimized={isRemoteSrc(item.url)}
					className="object-contain"
					priority
				/>
				<ImageWatermark contain={item.url} />
			</div>
		);
	}

	if (item.kind === "VIDEO") {
		return (
			<div className="bg-foreground">
				<VideoPlayer
					src={item.url}
					title={label}
					poster={item.thumbnailUrl ?? undefined}
					posterAlt={label}
					variant="minimal"
					className="aspect-video w-full max-h-[min(72svh,48rem)]"
				/>
			</div>
		);
	}

	return (
		<ProjectCoverMedia
			url={item.url}
			alt={label}
			kind="AUDIO"
			posterUrl={item.thumbnailUrl ?? "/menu/5.jpg"}
			className="min-h-64 w-full sm:min-h-72"
			sizes="(max-width: 1023px) 98vw, 70vw"
		/>
	);
}

export function NewsMediaModal({
	items,
	activeIndex,
	onActiveIndexChange,
	dialogRef,
	articleTitle,
	closeLabel,
	previousLabel,
	nextLabel,
}: NewsMediaModalProps) {
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
	const showThumbs =
		items.length > 1 && items.some((entry) => thumbPreview(entry));

	return (
		<dialog
			ref={dialogRef}
			onClose={() => onActiveIndexChange(null)}
			onKeyDown={onDialogKeyDown}
			onClick={onDialogClick}
			aria-label={item?.caption ?? articleTitle}
			className="m-auto max-h-[98svh] w-[min(98vw,72rem)] border border-background/15 bg-foreground/60 p-0 text-background backdrop-blur-xl backdrop:bg-foreground/70 backdrop:backdrop-blur-sm"
		>
			{item && activeIndex !== null ? (
				<div className="flex max-h-[inherit] flex-col">
					<div className="flex items-center justify-end gap-3 border-b border-background/15 px-4 py-3 sm:px-5">
						<button
							type="button"
							onClick={() => dialogRef.current?.close()}
							aria-label={closeLabel}
							className={navButtonClass}
						>
							<XMarkIcon aria-hidden="true" className="size-4" />
						</button>
					</div>

					<div className="min-h-0 flex-1 overflow-y-auto">
						<ModalMedia item={item} articleTitle={articleTitle} />

						{showThumbs ? (
							<ul className="flex gap-2 overflow-x-auto border-t border-background/15 px-3 py-2.5 scrollbar-none sm:px-4">
								{items.map((thumb, index) => {
									const src = thumbPreview(thumb);
									if (!src) return null;
									const isActive = index === activeIndex;

									return (
										<li
											// biome-ignore lint/suspicious/noArrayIndexKey: the same media URL can legitimately appear twice in one article's gallery, so the index is needed to disambiguate; the list is render-order-stable and never reordered.
											key={`${thumb.url}-${index}`}
											className="w-16 shrink-0 sm:w-20"
										>
											<button
												type="button"
												onClick={() => onActiveIndexChange(index)}
												aria-pressed={isActive}
												aria-label={thumb.caption ?? articleTitle}
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
													unoptimized={isRemoteSrc(src)}
													className="object-cover"
												/>
												{thumb.kind === "VIDEO" ? (
													<span className="pointer-events-none absolute inset-0 flex items-center justify-center bg-foreground/25">
														<span className="inline-flex size-6 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-[0_12px_32px_-10px_rgb(0_0_0/0.55)] ring-1 ring-primary-foreground/30">
															<PlayIcon
																className="size-3 translate-x-px"
																aria-hidden
															/>
														</span>
													</span>
												) : null}
											</button>
										</li>
									);
								})}
							</ul>
						) : null}
					</div>

					{(item.caption || items.length > 1) && (
						<div className="flex flex-col gap-4 border-t border-background/15 px-4 py-4 sm:px-5">
							{item.caption ? (
								<p className="text-justify text-small leading-relaxed text-background/75">
									{item.caption}
								</p>
							) : null}

							{items.length > 1 ? (
								<div className="flex items-center gap-2">
									<button
										type="button"
										onClick={() => step(-1)}
										aria-label={previousLabel}
										className={navButtonClass}
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
										className={navButtonClass}
									>
										<DirectionalIcon
											icon={ChevronRightIcon}
											className="size-4"
										/>
									</button>
								</div>
							) : null}
						</div>
					)}
				</div>
			) : null}
		</dialog>
	);
}
