"use client";

import { useCallback, useMemo, useRef, useState } from "react";
import { spreadStartPage } from "@/lib/writing/pdf-page-range";
import { cn } from "@/lib/utils";

const MAX_DOTS = 96;

function buildScrubberPages(numPages: number): number[] {
	if (numPages <= MAX_DOTS) {
		return Array.from({ length: numPages }, (_, index) => index + 1);
	}

	return Array.from({ length: MAX_DOTS }, (_, index) =>
		Math.min(
			Math.round(1 + (index / (MAX_DOTS - 1)) * (numPages - 1)),
			numPages,
		),
	);
}

type PdfPageScrubberProps = {
	pageNumber: number;
	numPages: number;
	twoPageSpread: boolean;
	onSelectPage: (page: number) => void;
	labels: {
		navLabel: string;
		pageOf: (page: number, total: number) => string;
		pagesRemaining: (count: number) => string;
	};
	className?: string;
};

export function PdfPageScrubber({
	pageNumber,
	numPages,
	twoPageSpread,
	onSelectPage,
	labels,
	className,
}: PdfPageScrubberProps) {
	const trackRef = useRef<HTMLDivElement>(null);
	const [isDragging, setIsDragging] = useState(false);
	const [previewPage, setPreviewPage] = useState<number | null>(null);

	const scrubberPages = useMemo(
		() => buildScrubberPages(numPages),
		[numPages],
	);

	const displayPage = previewPage ?? pageNumber;

	const pagesRemaining = Math.max(
		numPages - displayPage - (twoPageSpread ? 1 : 0),
		0,
	);

	const resolvePageFromClientX = useCallback(
		(clientX: number) => {
			const track = trackRef.current;
			if (!track || numPages <= 1) {
				return pageNumber;
			}

			const rect = track.getBoundingClientRect();
			const ratio = Math.min(
				Math.max((clientX - rect.left) / rect.width, 0),
				1,
			);
			const page = Math.round(ratio * (numPages - 1)) + 1;
			return spreadStartPage(page, twoPageSpread);
		},
		[numPages, pageNumber, twoPageSpread],
	);

	const handlePointerDown = useCallback(
		(event: React.PointerEvent<HTMLDivElement>) => {
			if (event.button !== 0) {
				return;
			}
			event.preventDefault();
			setIsDragging(true);
			event.currentTarget.setPointerCapture(event.pointerId);
			setPreviewPage(resolvePageFromClientX(event.clientX));
		},
		[resolvePageFromClientX],
	);

	const handlePointerMove = useCallback(
		(event: React.PointerEvent<HTMLDivElement>) => {
			if (!isDragging) {
				return;
			}
			setPreviewPage(resolvePageFromClientX(event.clientX));
		},
		[isDragging, resolvePageFromClientX],
	);

	const commitPreview = useCallback(
		(event: React.PointerEvent<HTMLDivElement>) => {
			if (!isDragging) {
				return;
			}
			const nextPage = previewPage ?? pageNumber;
			setIsDragging(false);
			setPreviewPage(null);
			event.currentTarget.releasePointerCapture(event.pointerId);
			if (nextPage !== pageNumber) {
				onSelectPage(nextPage);
			}
		},
		[isDragging, onSelectPage, pageNumber, previewPage],
	);

	const handlePointerEnd = useCallback(
		(event: React.PointerEvent<HTMLDivElement>) => {
			commitPreview(event);
		},
		[commitPreview],
	);

	if (numPages <= 1) {
		return null;
	}

	return (
		<div
			className={cn(
				"shrink-0 border-t border-border bg-background px-4 py-3 sm:px-6 sm:py-4",
				className,
			)}
		>
			<div
				ref={trackRef}
				role="slider"
				aria-label={labels.navLabel}
				aria-valuemin={1}
				aria-valuemax={numPages}
				aria-valuenow={displayPage}
				aria-valuetext={labels.pageOf(displayPage, numPages)}
				tabIndex={0}
				onKeyDown={(event) => {
					const step = twoPageSpread ? 2 : 1;
					if (event.key === "ArrowRight" || event.key === "ArrowDown") {
						event.preventDefault();
						onSelectPage(
							spreadStartPage(
								Math.min(pageNumber + step, numPages),
								twoPageSpread,
							),
						);
					}
					if (event.key === "ArrowLeft" || event.key === "ArrowUp") {
						event.preventDefault();
						onSelectPage(
							spreadStartPage(
								Math.max(pageNumber - step, 1),
								twoPageSpread,
							),
						);
					}
				}}
				onPointerDown={handlePointerDown}
				onPointerMove={handlePointerMove}
				onPointerUp={handlePointerEnd}
				onPointerCancel={handlePointerEnd}
				className={cn(
					"writing-pdf-scrubber__track",
					isDragging && "writing-pdf-scrubber__track--dragging",
				)}
			>
				{scrubberPages.map((page) => {
					const isActive =
						page === displayPage ||
						(twoPageSpread && page === displayPage + 1);
					const isPassed = page < displayPage;

					return (
						<button
							key={page}
							type="button"
							tabIndex={-1}
							aria-label={labels.pageOf(page, numPages)}
							onPointerDown={(event) => event.stopPropagation()}
							onClick={(event) => {
								event.stopPropagation();
								setPreviewPage(null);
								onSelectPage(page);
							}}
							className={cn(
								"writing-pdf-scrubber__dot",
								isPassed && "writing-pdf-scrubber__dot--passed",
								isActive && "writing-pdf-scrubber__dot--active",
								isDragging &&
									previewPage === page &&
									"writing-pdf-scrubber__dot--preview",
							)}
						/>
					);
				})}
			</div>

			<div className="mt-2.5 flex items-center justify-between gap-4 text-small text-muted">
				<p
					className={cn(
						"label font-medium tabular-nums text-foreground uppercase",
						isDragging && "text-muted",
					)}
				>
					{labels.pageOf(displayPage, numPages)}
				</p>
				<p className="label tabular-nums uppercase">
					{labels.pagesRemaining(pagesRemaining)}
				</p>
			</div>
		</div>
	);
}
