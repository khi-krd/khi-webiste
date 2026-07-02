"use client";

import {
	FilmIcon,
	MusicalNoteIcon,
	PlayIcon,
} from "@heroicons/react/24/solid";
import { useCallback, useRef, useState } from "react";
import { NewsMediaModal } from "@/components/news/news-media-modal";
import { Image } from "@/components/ui/image";
import type { MediaItem } from "@/types/media";
import { cn } from "@/lib/utils";

type NewsMediaGalleryProps = {
	items: MediaItem[];
	title: string;
	articleTitle: string;
	closeLabel: string;
	previousLabel: string;
	nextLabel: string;
};

function frameNo(index: number): string {
	return String(index + 1).padStart(2, "0");
}

function thumbnailSrc(item: MediaItem): string {
	if (item.kind === "IMAGE") {
		return item.url;
	}

	return item.thumbnailUrl ?? (item.kind === "AUDIO" ? "/menu/5.jpg" : item.url);
}

function MediaKindBadge({ kind }: { kind: MediaItem["kind"] }) {
	if (kind === "IMAGE") return null;

	return (
		<span className="pointer-events-none absolute inset-0 flex items-center justify-center bg-foreground/28">
			<span className="inline-flex size-8 items-center justify-center border border-border/80 bg-background/90 text-foreground">
				{kind === "VIDEO" ? (
					<PlayIcon className="size-4" aria-hidden />
				) : (
					<MusicalNoteIcon className="size-3.5" aria-hidden />
				)}
			</span>
		</span>
	);
}

export function NewsMediaGallery({
	items,
	title,
	articleTitle,
	closeLabel,
	previousLabel,
	nextLabel,
}: NewsMediaGalleryProps) {
	const dialogRef = useRef<HTMLDialogElement>(null);
	const [activeIndex, setActiveIndex] = useState<number | null>(null);

	const open = useCallback((index: number) => {
		setActiveIndex(index);
		dialogRef.current?.showModal();
	}, []);

	if (items.length === 0) return null;

	return (
		<>
			<div className="pt-10 sm:pt-12">
				<header className="flex items-baseline justify-between gap-4 border-b border-border pb-4">
					<h2 className="label font-medium text-foreground">
						<span aria-hidden="true" className="me-2">
							{"//"}
						</span>
						{title}
					</h2>
					<p className="label text-muted" aria-hidden="true">
						{frameNo(items.length)}
					</p>
				</header>

				<ul className="mt-5 flex flex-wrap gap-2.5 sm:mt-6 sm:gap-3">
					{items.map((item, index) => {
						const label =
							item.caption ?? `${articleTitle} — ${frameNo(index)}`;

						return (
							<li key={`${item.kind}-${item.url}-${item.sortOrder}`}>
								<button
									type="button"
									onClick={() => open(index)}
									aria-label={label}
									className={cn(
										"group relative block w-56 overflow-hidden border border-border bg-sunken sm:w-60",
										"cursor-pointer transition-colors fine-hover:border-border-strong",
									)}
								>
									{item.kind === "IMAGE" || item.thumbnailUrl ? (
										<Image
											src={thumbnailSrc(item)}
											alt=""
											aspectRatio="square"
											sizes="240px"
											className="border-0"
											imageClassName={cn(
												"brightness-[0.94] saturate-[0.9] transition-[filter,transform] duration-500",
												"group-fine:scale-[1.04] group-fine:brightness-100 group-fine:saturate-100",
											)}
										/>
									) : (
										<div className="relative flex aspect-square items-center justify-center bg-foreground text-background">
											{item.kind === "VIDEO" ? (
												<FilmIcon className="size-5" aria-hidden />
											) : (
												<MusicalNoteIcon className="size-5" aria-hidden />
											)}
										</div>
									)}
									<MediaKindBadge kind={item.kind} />
								</button>
							</li>
						);
					})}
				</ul>
			</div>

			<NewsMediaModal
				items={items}
				activeIndex={activeIndex}
				onActiveIndexChange={setActiveIndex}
				dialogRef={dialogRef}
				articleTitle={articleTitle}
				closeLabel={closeLabel}
				previousLabel={previousLabel}
				nextLabel={nextLabel}
			/>
		</>
	);
}
