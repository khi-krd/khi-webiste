"use client";

import { ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/24/outline";
import { DirectionalIcon } from "@/components/ui/directional-icon";
import { cn } from "@/lib/utils";

const navButtonClass =
	"inline-flex size-9 shrink-0 items-center justify-center border border-border-strong text-foreground transition-colors fine-hover:bg-sunken disabled:pointer-events-none disabled:opacity-40";

type PdfPageScrubberProps = {
	pageNumber: number;
	numPages: number;
	twoPageSpread: boolean;
	onSelectPage: (page: number) => void;
	onPrevious: () => void;
	onNext: () => void;
	isMobile?: boolean;
	labels: {
		navLabel: string;
		previousPage: string;
		nextPage: string;
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
	onPrevious,
	onNext,
	isMobile = false,
	labels,
	className,
}: PdfPageScrubberProps) {
	const canGoPrevious = pageNumber > 1;
	const canGoNext = pageNumber < numPages;

	const pagesRemaining = Math.max(
		numPages - pageNumber - (twoPageSpread ? 1 : 0),
		0,
	);

	const touchNavButtonClass = isMobile
		? "inline-flex size-11 shrink-0 items-center justify-center border border-border-strong text-foreground transition-colors fine-hover:bg-sunken disabled:pointer-events-none disabled:opacity-40"
		: navButtonClass;

	if (numPages <= 1) {
		return null;
	}

	return (
		<div
			className={cn(
				"shrink-0 border-t border-border bg-background px-3 py-3 sm:px-6 sm:py-4",
				className,
			)}
		>
			<div className="flex items-center gap-2 sm:gap-3">
				<button
					type="button"
					className={touchNavButtonClass}
					onClick={onPrevious}
					disabled={!canGoPrevious}
					aria-label={labels.previousPage}
				>
					<DirectionalIcon icon={ChevronLeftIcon} className="size-4" />
				</button>

				<input
					type="range"
					min={1}
					max={numPages}
					step={1}
					value={pageNumber}
					aria-label={labels.navLabel}
					aria-valuetext={labels.pageOf(pageNumber, numPages)}
					onChange={(event) => {
						onSelectPage(Number(event.currentTarget.value));
					}}
					className="writing-pdf-scrubber__range min-w-0 flex-1"
				/>

				<button
					type="button"
					className={touchNavButtonClass}
					onClick={onNext}
					disabled={!canGoNext}
					aria-label={labels.nextPage}
				>
					<DirectionalIcon icon={ChevronRightIcon} className="size-4" />
				</button>
			</div>

			<div className="mt-2.5 flex items-center justify-between gap-4 text-small text-muted">
				<p className="label font-medium tabular-nums text-foreground uppercase">
					{labels.pageOf(pageNumber, numPages)}
				</p>
				<p className="label tabular-nums uppercase">
					{labels.pagesRemaining(pagesRemaining)}
				</p>
			</div>
		</div>
	);
}
